import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/sessionProvider";
import Navbar from "@/components/Utility/Navbar";
import Footer from "@/components/Utility/Footer";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans", // Creating a CSS variable for Tailwind
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
    <html lang="en" className={` ${ibmPlexSans.variable} h-full antialiased`}>
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
