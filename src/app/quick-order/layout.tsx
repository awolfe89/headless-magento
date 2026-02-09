import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quick Order",
  robots: { index: false, follow: false },
};

export default function QuickOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
