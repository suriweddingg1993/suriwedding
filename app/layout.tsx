import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast"; // <-- KHAI BÁO THÔNG BÁO

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Suri Wedding",
  description: "Ứng dụng quản lý studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        {/* CỤC PHÁT SÓNG THÔNG BÁO HIỂN THỊ Ở TRÊN CÙNG Ở GIỮA */}
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}