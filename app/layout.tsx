import type { Metadata } from "next";
import ClientLayout from "@/components/ClientLayout"; // 1. Import the new component
import "./globals.css";

// 2. Your metadata can now be safely exported from this Server Component
export const metadata: Metadata = {
  title: "PrepWise",
  description: "An AI-powered platform for preparing for mock interviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        {/* 3. Use ClientLayout to wrap the page content */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

// "use client";

// import { Toaster } from "sonner";
// import type { Metadata } from "next";
// import { Mona_Sans } from "next/font/google";
// import { AuthProvider } from "@/components/AuthProvider";
// import Header from "@/components/Header";
// import "./globals.css";

// const monaSans = Mona_Sans();

// export const metadata: Metadata = {
//   title: "PrepWise",
//   description: "An AI-powered platform for preparing for mock interviews",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{

//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" className="dark">
//       <body>
//         <AuthProvider>
//           <div className={`${monaSans.className} antialiased pattern`}>
//             <Header />
//             {children}
//             <Toaster />
//           </div>
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }