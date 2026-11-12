import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-provider";
import { siteUrl } from "@/lib/site";
import QuickContact from "@/components/common/QuickContact";
import CookieBanner from "@/components/common/CookieBanner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Innovar Security - Cámaras de Seguridad Profesionales",
    template: "%s | Innovar Security",
  },
  description: "Innovar Security - Protección profesional para tu hogar o negocio. Servicios de instalación, mantenimiento y asesoría de cámaras de seguridad en Fómeque, Cundinamarca.",
  keywords: ["cámaras de seguridad", "instalación de cámaras", "seguridad", "Fómeque", "Cundinamarca", "innovar security", "videovigilancia"],
  authors: [{ name: "Innovar Security" }],
  creator: "Innovar Security",
  publisher: "Innovar Security",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: siteUrl,
    siteName: "Innovar Security",
    title: "Innovar Security - Cámaras de Seguridad Profesionales",
    description: "Protección profesional para tu hogar o negocio. Servicios de instalación y mantenimiento de cámaras de seguridad.",
    images: [
      {
        url: "/images/social-preview.png",
        width: 1200,
        height: 630,
        alt: "Innovar Security - Cámaras de Seguridad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Innovar Security",
    description: "Protección profesional para tu hogar o negocio.",
    images: ["/images/social-preview.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO" className={inter.className} suppressHydrationWarning>
      <body className="antialiased font-sans bg-black text-white overflow-x-hidden">
        <AuthProvider>
          {children}
          <QuickContact />
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
