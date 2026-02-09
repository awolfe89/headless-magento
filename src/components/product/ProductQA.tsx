"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

interface Answer {
  id: number;
  text: string;
  author: string;
  date: string;
}

interface Question {
  id: number;
  text: string;
  author: string;
  date: string;
  answers: Answer[];
}

interface ProductQAProps {
  sku: string;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function ProductQA({ sku }: ProductQAProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch(`/api/askit?sku=${encodeURIComponent(sku)}`);
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch {
        // Silently fail — show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [sku]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!questionText.trim()) {
      setError("Please enter your question.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/askit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          name: name.trim(),
          email: email.trim(),
          question: questionText.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit question.");
      }

      addToast(
        "Question submitted! It will appear after review by our team.",
        "success",
      );
      setShowForm(false);
      setName("");
      setEmail("");
      setQuestionText("");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit question.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header with count and ask button */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {loading
              ? "Loading questions..."
              : questions.length > 0
                ? `${questions.length} question${questions.length !== 1 ? "s" : ""}`
                : "No questions yet"}
          </p>
          <p className="mt-0.5 text-xs italic text-gray-400">
            Questions are answered by our technical team.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 active:scale-[0.98]"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Ask a Question
        </button>
      </div>

      {/* Ask Question Form */}
      {showForm && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Ask a Question
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Your Question <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                placeholder="What would you like to know about this product?"
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-red-600">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Question"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-100 p-5"
            >
              <div className="mb-3 h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="mt-1 h-3 w-2/3 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : questions.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {questions.map((q) => (
            <div key={q.id} className="py-5 first:pt-0 last:pb-0">
              {/* Question */}
              <div className="mb-2 flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">
                  Q
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {q.text}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Asked by {q.author} &middot; {formatDate(q.date)}
                  </p>
                </div>
              </div>

              {/* Answers */}
              {q.answers.map((a) => (
                <div key={a.id} className="ml-7 mt-3">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0 rounded bg-green-600 px-2 py-0.5 text-[11px] font-bold text-white">
                      A
                    </span>
                    <div>
                      <p className="text-sm leading-relaxed text-gray-600">
                        {a.text}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {a.author} &middot; {formatDate(a.date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Unanswered state */}
              {q.answers.length === 0 && (
                <div className="ml-7 mt-2">
                  <p className="text-xs italic text-gray-400">
                    Awaiting response from our technical team.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !showForm ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
          <svg
            className="mx-auto mb-3 h-10 w-10 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-gray-400">
            No questions yet. Be the first to ask about this product!
          </p>
        </div>
      ) : null}
    </div>
  );
}
