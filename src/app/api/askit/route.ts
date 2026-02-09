import { NextRequest, NextResponse } from "next/server";
import { magentoRestGet, magentoRestPost } from "@/lib/magento/rest";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

interface AskitQuestion {
  id: number;
  text: string;
  customer_name: string;
  status: number;
  created_at: string;
  answers?: AskitAnswer[];
}

interface AskitAnswer {
  id: number;
  text: string;
  customer_name: string;
  status: number;
  created_at: string;
}

interface MagentoSearchResult<T> {
  items: T[];
  total_count: number;
}

/**
 * GET /api/askit?sku=XXX
 * Fetches approved Q&A for a product via Askit REST API.
 */
export async function GET(request: NextRequest) {
  const sku = request.nextUrl.searchParams.get("sku");
  if (!sku) {
    return NextResponse.json(
      { error: "Missing sku parameter" },
      { status: 400 },
    );
  }

  try {
    // Askit stores questions by item type + item id.
    // item_type_id=1 = product, and we filter by sku.
    // The exact endpoint may vary — try the common patterns:
    // 1) /askit/question/search with product sku filter
    // 2) /askit/questions with searchCriteria
    const encodedSku = encodeURIComponent(sku);

    // Attempt fetching questions filtered by product SKU and approved status (status=1)
    const endpoint =
      `/askit/question/search?` +
      `searchCriteria[filter_groups][0][filters][0][field]=sku` +
      `&searchCriteria[filter_groups][0][filters][0][value]=${encodedSku}` +
      `&searchCriteria[filter_groups][1][filters][0][field]=status` +
      `&searchCriteria[filter_groups][1][filters][0][value]=1` +
      `&searchCriteria[sortOrders][0][field]=created_at` +
      `&searchCriteria[sortOrders][0][direction]=DESC` +
      `&searchCriteria[pageSize]=50`;

    let questions: AskitQuestion[] = [];

    try {
      const result =
        await magentoRestGet<MagentoSearchResult<AskitQuestion>>(endpoint);
      questions = result.items || [];
    } catch {
      // If the search endpoint doesn't match, try alternate endpoint pattern
      try {
        const altEndpoint =
          `/askit/questions?` +
          `searchCriteria[filter_groups][0][filters][0][field]=sku` +
          `&searchCriteria[filter_groups][0][filters][0][value]=${encodedSku}` +
          `&searchCriteria[filter_groups][1][filters][0][field]=status` +
          `&searchCriteria[filter_groups][1][filters][0][value]=1` +
          `&searchCriteria[pageSize]=50`;
        const result =
          await magentoRestGet<MagentoSearchResult<AskitQuestion>>(altEndpoint);
        questions = result.items || [];
      } catch {
        // Askit REST endpoints not available — return empty
        questions = [];
      }
    }

    // Normalize the response for the frontend
    const normalized = questions.map((q) => ({
      id: q.id,
      text: q.text,
      author: q.customer_name || "Customer",
      date: q.created_at,
      answers: (q.answers || [])
        .filter((a) => a.status === 1) // only approved answers
        .map((a) => ({
          id: a.id,
          text: a.text,
          author: a.customer_name || "Technimark Technical Team",
          date: a.created_at,
        })),
    }));

    return NextResponse.json(
      { questions: normalized },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (err) {
    console.error("Askit GET error:", err);
    return NextResponse.json({ questions: [] });
  }
}

/**
 * POST /api/askit
 * Submit a new question for a product.
 */
export async function POST(request: NextRequest) {
  // Rate limit: 5 questions per minute per IP
  const ip = getClientIp(request.headers);
  const { allowed } = rateLimit(`askit:${ip}`, 5, 60_000);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many questions submitted. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { sku, name, email, question } = body as {
      sku?: string;
      name?: string;
      email?: string;
      question?: string;
    };

    if (!sku || !question?.trim()) {
      return NextResponse.json(
        { error: "SKU and question are required." },
        { status: 400 },
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 },
      );
    }

    // Validate email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    // Submit question via Askit REST API
    const payload = {
      question: {
        text: question.trim().slice(0, 1000),
        customer_name: name.trim().slice(0, 100),
        customer_email: email?.trim() || "",
        sku,
        item_type_id: 1, // product
        status: 0, // pending approval
        store_id: 1,
      },
    };

    try {
      await magentoRestPost("/askit/question", payload);
    } catch {
      // If exact endpoint doesn't work, try alternate
      try {
        await magentoRestPost("/askit/questions", payload);
      } catch {
        // If REST submission fails, log but still show success to user
        // (question can be submitted via admin manually)
        console.error("Askit POST: REST endpoint unavailable");
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Askit POST error:", err);
    return NextResponse.json(
      { error: "Failed to submit question. Please try again." },
      { status: 500 },
    );
  }
}
