import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "../lib/firebase"; 
import { Lich, PhatSinh, ChamCong, ThuHuong, TaiKhoan, GoiDichVu } from "../types";

export const useAppData = (user: User | null, laAdmin: boolean) => {
  const [lichLamViec, setLichLamViec] = useState<Lich[]>([]);
  const [danhSachPhatSinh, setDanhSachPhatSinh] = useState<PhatSinh[]>([]);
  const [danhSachChamCong, setDanhSachChamCong] = useState<ChamCong[]>([]);
  const [danhSachThuHuong, setDanhSachThuHuong] = useState<ThuHuong[]>([]);
  const [danhSachTaiKhoan, setDanhSachTaiKhoan] = useState<TaiKhoan[]>([]);
  const [danhSachGoiDichVu, setDanhSachGoiDichVu] = useState<GoiDichVu[]>([]); 

  // Fix 4: Đồng bộ Múi giờ Việt Nam cho mốc thời gian tải dữ liệu (6 tháng)
  const mocThoiGian = useMemo(() => {
    const d = new Date(); 
    d.setMonth(d.getMonth() - 6);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 10);
  }, []);

  useEffect(() => {
    if (!user) return;

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

    return () => {
      unsubLich(); unsubPhatSinh(); unsubChamCong(); unsubThuHuong(); unsubGoiDichVu();
    };
  }, [user, mocThoiGian]);

  useEffect(() => {
    if (!laAdmin) return;
    const unsubTK = onSnapshot(collection(db, "users"), 
      (snapshot) => setDanhSachTaiKhoan(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as TaiKhoan[])
    );
    return () => unsubTK();
  }, [laAdmin]);

  return { lichLamViec, danhSachPhatSinh, danhSachChamCong, danhSachThuHuong, danhSachTaiKhoan, danhSachGoiDichVu }; 
};