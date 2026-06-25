import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Suri Wedding",
  description: "Ứng dụng quản lý studio",
  // Thêm file manifest nếu bạn đã cấu hình PWA
  manifest: "/manifest.json", 
};

// ĐÂY LÀ CHÌA KHÓA: Khóa Zoom hoàn toàn trên mọi điện thoại
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Đổi màu nền của thanh trạng thái (cục pin, sóng) cho tiệp màu với App
  themeColor: "#f8fafc", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      {/* Thêm class antialiased để chữ nét hơn giống App thật */}
      <body className={`${inter.className} antialiased`}>
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}