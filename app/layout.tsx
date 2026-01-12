import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import AccentColorLoader from "@/components/AccentColorLoader";

export const metadata: Metadata = {
  title: "Zeen",
  description: "Track the countries you've zeen",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Zeen",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <AccentColorLoader />
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
