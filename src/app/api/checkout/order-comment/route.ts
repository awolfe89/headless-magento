import { NextRequest, NextResponse } from "next/server";
import { magentoRestGet, magentoRestPost } from "@/lib/magento/rest";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

interface OrderSearchResult {
  items: { entity_id: number; increment_id: string }[];
}

/**
 * POST /api/checkout/order-comment
 * Posts a structured comment to an order (PO number, carrier info, etc.)
 *
 * Body: { orderNumber: string; comment: string }
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const { allowed } = rateLimit(`order-comment:${ip}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { orderNumber: string; comment: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { orderNumber, comment } = body;
  if (!orderNumber || !comment) {
    return NextResponse.json(
      { error: "orderNumber and comment are required" },
      { status: 400 },
    );
  }

  try {
    // Look up entity ID by increment_id
    const searchResult = await magentoRestGet<OrderSearchResult>(
      `/orders?searchCriteria[filterGroups][0][filters][0][field]=increment_id&searchCriteria[filterGroups][0][filters][0][value]=${encodeURIComponent(orderNumber)}&searchCriteria[filterGroups][0][filters][0][conditionType]=eq`,
    );

    if (!searchResult.items?.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const entityId = searchResult.items[0].entity_id;

    // Post comment
    await magentoRestPost(`/orders/${entityId}/comments`, {
      statusHistory: {
        comment,
        is_customer_notified: 0,
        is_visible_on_front: 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Order comment error:", err);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
