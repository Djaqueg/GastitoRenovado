import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { PWARegister } from "@/components/PWARegister";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GAStito — Finanzas del Hogar",
  description: "Gestión financiera familiar con Google Sheets",
  applicationName: "GAStito",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GAStito",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1b4332" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1110" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
