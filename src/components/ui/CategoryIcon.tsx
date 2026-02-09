/**
 * Returns a colored SVG icon for a category based on keyword matching.
 * Falls back to a tinted grid icon if no keyword matches.
 */

interface IconDef {
  keywords: string[];
  bg: string;
  fg: string;
  path: React.ReactNode;
}

const ICONS: IconDef[] = [
  {
    keywords: ["solder", "rework", "iron", "desoldering"],
    bg: "bg-orange-100",
    fg: "text-orange-600",
    path: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 001.399-7.237 1.5 1.5 0 01-.898-1.37V2.572" />
      </>
    ),
  },
  {
    keywords: ["esd", "static", "antistatic", "grounding", "discharge"],
    bg: "bg-yellow-100",
    fg: "text-yellow-600",
    path: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />,
  },
  {
    keywords: ["clean", "wipe", "swab", "ipa", "chemical"],
    bg: "bg-cyan-100",
    fg: "text-cyan-600",
    path: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M5 14.5l-1.456 1.456a1.5 1.5 0 001.06 2.544h14.792a1.5 1.5 0 001.06-2.544L19 14.5M5 14.5h14" />
      </>
    ),
  },
  {
    keywords: ["label", "tag", "marking", "print", "ribbon", "tape"],
    bg: "bg-violet-100",
    fg: "text-violet-600",
    path: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </>
    ),
  },
  {
    keywords: ["packag", "shipping", "box", "mailer", "wrap", "cushion", "void fill"],
    bg: "bg-amber-100",
    fg: "text-amber-600",
    path: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </>
    ),
  },
  {
    keywords: ["tool", "hand tool", "cutter", "plier", "tweezer", "screwdriver"],
    bg: "bg-slate-100",
    fg: "text-slate-600",
    path: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.66 5.66a2.12 2.12 0 01-3-3l5.66-5.66m2.12 2.12a3 3 0 104.24-4.24l-1.77-1.77a3 3 0 00-4.24 0L6.34 10.65" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 3l-5.25 5.25M15 3h6v6" />
      </>
    ),
  },
  {
    keywords: ["storage", "bin", "shelf", "rack", "organiz", "cabinet", "drawer"],
    bg: "bg-blue-100",
    fg: "text-blue-600",
    path: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
      </>
    ),
  },
  {
    keywords: ["brand", "manufacturer", "shop by"],
    bg: "bg-rose-100",
    fg: "text-rose-600",
    path: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </>
    ),
  },
  {
    keywords: ["hobby", "craft", "model", "miniature"],
    bg: "bg-emerald-100",
    fg: "text-emerald-600",
    path: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </>
    ),
  },
  {
    keywords: ["adhesive", "glue", "epoxy", "bond", "sealant"],
    bg: "bg-pink-100",
    fg: "text-pink-600",
    path: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48a4.53 4.53 0 01-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
      </>
    ),
  },
  {
    keywords: ["dispens", "syringe", "needle", "tip", "nozzle"],
    bg: "bg-teal-100",
    fg: "text-teal-600",
    path: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </>
    ),
  },
  {
    keywords: ["magnif", "inspect", "microscop", "loupe", "lamp", "light"],
    bg: "bg-indigo-100",
    fg: "text-indigo-600",
    path: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    ),
  },
  {
    keywords: ["wire", "cable", "connector", "terminal", "harness"],
    bg: "bg-red-100",
    fg: "text-red-500",
    path: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    ),
  },
  {
    keywords: ["safety", "protect", "glove", "glass", "ppe", "garment", "coat", "smock"],
    bg: "bg-green-100",
    fg: "text-green-600",
    path: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    ),
  },
  {
    keywords: ["flux", "paste", "cream", "tin", "alloy"],
    bg: "bg-lime-100",
    fg: "text-lime-600",
    path: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M5 14.5l-1.456 1.456a1.5 1.5 0 001.06 2.544h14.792a1.5 1.5 0 001.06-2.544L19 14.5M5 14.5h14" />
      </>
    ),
  },
  {
    keywords: ["mat", "bench", "workstation", "surface", "table"],
    bg: "bg-stone-100",
    fg: "text-stone-500",
    path: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </>
    ),
  },
];

// Fallback icon: subtle colored grid
const FALLBACK: Pick<IconDef, "bg" | "fg" | "path"> = {
  bg: "bg-gray-100",
  fg: "text-gray-400",
  path: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </>
  ),
};

export function CategoryIcon({
  name,
  className = "h-10 w-10",
}: {
  name: string;
  className?: string;
}) {
  const lower = name.toLowerCase();
  const match = ICONS.find((icon) =>
    icon.keywords.some((kw) => lower.includes(kw)),
  ) || FALLBACK;

  return (
    <div className={`flex shrink-0 items-center justify-center rounded ${match.bg} ${className}`}>
      <svg
        className={`h-5 w-5 ${match.fg}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
      >
        {match.path}
      </svg>
    </div>
  );
}
