import ClientLayout from "@/components/layout/ClientLayout";

export default function CitasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
