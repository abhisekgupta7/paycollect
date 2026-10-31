import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/sessionProvider";
import Navbar from "@/components/Utility/Navbar";
import Footer from "@/components/Utility/Footer";

const dmsans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: "PayCollect | Recover retailer payments",
  description: "Receivables and payment recovery for wholesalers.",
  applicationName: "PayCollect",
  appleWebApp: {
    capable: true,
    title: "PayCollect",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#243b64",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={` ${dmsans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
