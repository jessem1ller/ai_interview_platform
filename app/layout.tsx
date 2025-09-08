import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";
import "./globals.css";

const monaSans = Mona_Sans();

export const metadata: Metadata = { title: "AI Interview Platform" };

export default function RootLayout({
  children,
}: Readonly<{

  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>
          <div className={`${monaSans.className} antialiased pattern`}>
            <Header />
            {children}
            <Toaster />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}