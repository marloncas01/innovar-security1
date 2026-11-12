import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

import ClientLayout from "@/components/layout/ClientLayout";

export default function CitasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
