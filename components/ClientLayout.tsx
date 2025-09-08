"use client";

import { Toaster } from "sonner";
import { Mona_Sans } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className={`${monaSans.className} antialiased pattern`}>
        <Header />
        {children}
        <Toaster />
      </div>
    </AuthProvider>
  );
}