import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SerwistProvider } from "@serwist/turbopack/react";
import "./globals.css";
import { migrate } from "@/services/mongodb";
import CookieConsent from "@/components/CookieConsent";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/partials/Header";
import Footer from "@/components/partials/Footer";
import { Toaster } from "@/components/ui/sonner";
await migrate();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Safe Nest",
  description:
    "A calm, secure home for your digital life — your account, wallet, and settings behind a single protected door.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SerwistProvider swUrl="/serwist/sw.js">
            <Header />
            {children}
            <Footer />
            <Toaster position="bottom-center" />
            <CookieConsent />
          </SerwistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
