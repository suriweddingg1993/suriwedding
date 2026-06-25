import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// 1. Font cho Tiêu đề sang trọng
const cormorant = Cormorant_Garamond({
  subsets: ["vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

// 2. Font cho Văn bản hiện đại, gọn gàng
const montserrat = Montserrat({
  subsets: ["vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Suri Studio | Quản trị không gian",
  description: "Hệ thống quản lý studio cao cấp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      {/* Khai báo cả 2 font vào body, set màu nền nude nhẹ (#FAFAFA) */}
      <body className={`${montserrat.variable} ${cormorant.variable} font-sans bg-[#FAFAFA] text-zinc-900 antialiased selection:bg-zinc-200`}>
        {/* Tối ưu lại giao diện của Toaster cho sang trọng */}
        <Toaster 
          position="top-center" 
          reverseOrder={false} 
          toastOptions={{
            style: {
              background: '#18181b', // zinc-900
              color: '#fff',
              borderRadius: '1rem',
              fontSize: '13px',
              fontWeight: '500',
              padding: '12px 20px',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)',
            }
          }} 
        />
        {children}
      </body>
    </html>
  );
}