"use client";

import { useState } from "react";
import { sanitizeHtml } from "@/lib/cms/parseDirectives";

interface Tab {
  id: string;
  label: string;
  content?: string;
  component?: React.ReactNode;
  type?: "html" | "specs" | "empty" | "component";
}

interface ProductTabsProps {
  tabs: Tab[];
}

export function ProductTabs({ tabs }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");

  if (tabs.length === 0) return null;

  const current = tabs.find((t) => t.id === activeTab);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      {/* Tab navigation - dark bar */}
      <div className="flex overflow-x-auto bg-gray-900">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 border-b-2 px-6 py-3.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? "border-red-600 bg-white/[0.04] text-white"
                : "border-transparent text-gray-500 hover:bg-white/[0.03] hover:text-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white p-6 md:p-8">
        {current && current.type === "component" && current.component ? (
          current.component
        ) : current && current.type === "specs" ? (
          <div
            className="overflow-hidden rounded-lg border border-gray-100"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(current.content || "") }}
          />
        ) : current && current.type === "empty" ? (
          <p className="text-sm text-gray-400">{current.content}</p>
        ) : current ? (
          <div
            className="prose prose-gray max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-h3:text-lg prose-p:leading-relaxed prose-p:text-gray-600 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-li:text-gray-600 prose-li:marker:text-red-600 prose-img:rounded-lg prose-table:text-sm prose-td:py-2.5 prose-td:px-4 prose-th:py-2.5 prose-th:px-4 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900 even:prose-tr:bg-gray-50/60"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(current.content || "") }}
          />
        ) : null}
      </div>
    </div>
  );
}
