import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { User } from "firebase/auth";

// Import file firebase (đường dẫn này mình lấy giống y hệt file page.tsx của bạn)
import { db } from "../lib/firebase"; 

// Import cái từ điển mình vừa tạo ở Bước 2
import { Lich, PhatSinh, ChamCong, ThuHuong, TaiKhoan } from "../types";

export const useAppData = (user: User | null, laAdmin: boolean) => {
  const [lichLamViec, setLichLamViec] = useState<Lich[]>([]);
  const [danhSachPhatSinh, setDanhSachPhatSinh] = useState<PhatSinh[]>([]);
  const [danhSachChamCong, setDanhSachChamCong] = useState<ChamCong[]>([]);
  const [danhSachThuHuong, setDanhSachThuHuong] = useState<ThuHuong[]>([]);
  const [danhSachTaiKhoan, setDanhSachTaiKhoan] = useState<TaiKhoan[]>([]);

  // Giới hạn tải dữ liệu trong 6 tháng để app chạy nhẹ nhàng, không bị đơ
  const mocThoiGian = useMemo(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 6);
    return d.toISOString().slice(0, 10);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Kéo dữ liệu Lịch
    const unsubLich = onSnapshot(query(collection(db, "lichStudio"), where("ngay", ">=", mocThoiGian)), 
      (snapshot) => setLichLamViec(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Lich[])
    );

    // Kéo dữ liệu Phát Sinh
    const unsubPhatSinh = onSnapshot(query(collection(db, "phatSinh"), where("ngay", ">=", mocThoiGian)), 
      (snapshot) => setDanhSachPhatSinh(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as PhatSinh[])
    );

    // Kéo dữ liệu Chấm Công
    const unsubChamCong = onSnapshot(query(collection(db, "chamCong"), where("ngay", ">=", mocThoiGian)), 
      (snapshot) => setDanhSachChamCong(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ChamCong[])
    );

    // Kéo dữ liệu Hoa Hồng
    const unsubThuHuong = onSnapshot(query(collection(db, "thuHuong"), where("ngay", ">=", mocThoiGian)), 
      (snapshot) => setDanhSachThuHuong(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ThuHuong[])
    );

    return () => {
      unsubLich(); unsubPhatSinh(); unsubChamCong(); unsubThuHuong();
    };
  }, [user, mocThoiGian]);

  // Kéo danh sách nhân sự (Chỉ load nếu người đăng nhập là Sếp/Admin)
  useEffect(() => {
    if (!user || !laAdmin) return;
    const unsubTaiKhoan = onSnapshot(collection(db, "users"), 
      (snapshot) => setDanhSachTaiKhoan(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as TaiKhoan[])
    );
    return () => unsubTaiKhoan();
  }, [user, laAdmin]);

  // Bơm dữ liệu này ra ngoài để file page.tsx dùng
  return {
    lichLamViec, danhSachPhatSinh, danhSachChamCong, danhSachThuHuong, danhSachTaiKhoan, mocThoiGian
  };
};