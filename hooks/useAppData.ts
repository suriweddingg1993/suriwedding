import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "../lib/firebase"; 
// ĐÃ THÊM: Import KhachHang
import { Lich, PhatSinh, ChamCong, ThuHuong, TaiKhoan, GoiDichVu, KhachHang } from "../types";

export const useAppData = (user: User | null, laAdmin: boolean) => {
  const [lichLamViec, setLichLamViec] = useState<Lich[]>([]);
  const [danhSachPhatSinh, setDanhSachPhatSinh] = useState<PhatSinh[]>([]);
  const [danhSachChamCong, setDanhSachChamCong] = useState<ChamCong[]>([]);
  const [danhSachThuHuong, setDanhSachThuHuong] = useState<ThuHuong[]>([]);
  const [danhSachTaiKhoan, setDanhSachTaiKhoan] = useState<TaiKhoan[]>([]);
  const [danhSachGoiDichVu, setDanhSachGoiDichVu] = useState<GoiDichVu[]>([]); 
  // ĐÃ THÊM: State cho Khách Hàng
  const [danhSachKhachHang, setDanhSachKhachHang] = useState<KhachHang[]>([]);

  // GIỚI HẠN DỮ LIỆU: Chỉ tải 6 tháng gần nhất để chống lag[cite: 5]
  const mocThoiGian = useMemo(() => {
    const d = new Date(); 
    d.setMonth(d.getMonth() - 6);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 10);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Áp dụng Query where("ngay", ">=", mocThoiGian) cho tất cả các bảng dữ liệu lớn[cite: 5]
    const unsubLich = onSnapshot(query(collection(db, "lichStudio"), where("ngay", ">=", mocThoiGian)), 
      (snapshot) => setLichLamViec(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Lich[])
    );

    const unsubPhatSinh = onSnapshot(query(collection(db, "phatSinh"), where("ngay", ">=", mocThoiGian)), 
      (snapshot) => setDanhSachPhatSinh(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as PhatSinh[])
    );

    const unsubChamCong = onSnapshot(query(collection(db, "chamCong"), where("ngay", ">=", mocThoiGian)), 
      (snapshot) => setDanhSachChamCong(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ChamCong[])
    );

    const unsubThuHuong = onSnapshot(query(collection(db, "thuHuong"), where("ngay", ">=", mocThoiGian)), 
      (snapshot) => setDanhSachThuHuong(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ThuHuong[])
    );

    const unsubGoiDichVu = onSnapshot(collection(db, "goiDichVu"), 
      (snapshot) => setDanhSachGoiDichVu(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as GoiDichVu[])
    );

    // ĐÃ THÊM: Tải toàn bộ danh sách Khách Hàng (Không giới hạn thời gian để lưu data vĩnh viễn)
    const unsubKhachHang = onSnapshot(collection(db, "khachHang"), 
      (snapshot) => setDanhSachKhachHang(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as KhachHang[])
    );

    return () => {
      unsubLich(); unsubPhatSinh(); unsubChamCong(); unsubThuHuong(); unsubGoiDichVu(); unsubKhachHang();
    };
  }, [user, mocThoiGian]);

  // Tài khoản load riêng cho Admin[cite: 5]
  useEffect(() => {
    if (!laAdmin) return;
    const unsubTK = onSnapshot(collection(db, "users"), 
      (snapshot) => setDanhSachTaiKhoan(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as TaiKhoan[])
    );
    return () => unsubTK();
  }, [laAdmin]);

  // ĐÃ THÊM: Trả về danhSachKhachHang ra ngoài
  return { lichLamViec, danhSachPhatSinh, danhSachChamCong, danhSachThuHuong, danhSachTaiKhoan, danhSachGoiDichVu, danhSachKhachHang }; 
};