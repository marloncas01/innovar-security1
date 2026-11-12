import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

import AdminLayout from "@/components/layout/AdminLayout";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
