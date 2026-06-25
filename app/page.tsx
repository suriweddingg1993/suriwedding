"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDoc, setDoc, query, where } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { db, auth } from "../lib/firebase";
import dynamic from "next/dynamic";
import { useAppData } from "../hooks/useAppData";
import { Role, TabType, Lich, TaiKhoan } from "../types";
import { Home, CalendarDays, Wallet, Clock, FileSpreadsheet, Users, BarChart3, ClipboardList, LogOut, RefreshCw, AlertCircle, CheckCircle2, ChevronRight, Camera } from "lucide-react";

const TabLuong = dynamic(() => import("./components/TabLuong"), { loading: () => <div className="p-10 text-center text-zinc-400 font-medium animate-pulse tracking-wide">Đang tải dữ liệu...</div> });
const TabTinhTrangKH = dynamic(() => import("./components/TabTinhTrangKH"), { loading: () => <div className="p-10 text-center text-zinc-400 font-medium animate-pulse tracking-wide">Đang tải dữ liệu...</div> });
const TabThongKe = dynamic(() => import("./components/TabThongKe"), { loading: () => <div className="p-10 text-center text-zinc-400 font-medium animate-pulse tracking-wide">Đang tải dữ liệu...</div> });
const TabNhanVien = dynamic(() => import("./components/TabNhanVien"), { loading: () => <div className="p-10 text-center text-zinc-400 font-medium animate-pulse tracking-wide">Đang tải dữ liệu...</div> });
const TabPhatSinh = dynamic(() => import("./components/TabPhatSinh"), { loading: () => <div className="p-10 text-center text-zinc-400 font-medium animate-pulse tracking-wide">Đang tải dữ liệu...</div> });
const TabLich = dynamic(() => import("./components/TabLich"), { loading: () => <div className="p-10 text-center text-zinc-400 font-medium animate-pulse tracking-wide">Đang tải dữ liệu...</div> });
const TabChamCong = dynamic(() => import("./components/TabChamCong"), { loading: () => <div className="p-10 text-center text-zinc-400 font-medium animate-pulse tracking-wide">Đang tải dữ liệu...</div> });

const ADMIN_CHINH_EMAIL = "dangngocan93@gmail.com";
const CUA_HANG_LAT = 21.436897313370316;
const CUA_HANG_LNG = 103.68803473004635;
const BAN_KINH_CHO_PHEP = 500;
const APP_VERSION = "v1.0.8"; 

function homNay() { return new Date().toISOString().slice(0, 10); }
function gioHienTai() { return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
function formatTienInput(value: string) { const so = value.replace(/\D/g, ""); return so.replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function chuyenTienVeSo(value: string) { return Number(value.replace(/\./g, "")); }
function tinhKhoangCachMet(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000; const dLat = ((lat2 - lat1) * Math.PI) / 180; const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return Math.round(R * c);
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [tab, setTab] = useState<TabType>("home");
  const [coBanCapNhat, setCoBanCapNhat] = useState(false);
  const [hoSoCuaToi, setHoSoCuaToi] = useState<TaiKhoan | null>(null);

  const laAdmin = role === "admin";
  const { lichLamViec, danhSachPhatSinh, danhSachChamCong, danhSachThuHuong, danhSachTaiKhoan } = useAppData(user, laAdmin);

  const [ngay, setNgay] = useState(""); const [gio, setGio] = useState(""); const [tenKhach, setTenKhach] = useState("");
  const [soDienThoai, setSoDienThoai] = useState(""); const [soDienThoai2, setSoDienThoai2] = useState("");
  const [theLoai, setTheLoai] = useState(""); const [theLoaiKhac, setTheLoaiKhac] = useState("");
  const [goiChup, setGoiChup] = useState(""); const [giaTien, setGiaTien] = useState("");
  const [tuKhoa, setTuKhoa] = useState(""); const [dangSua, setDangSua] = useState<string | null>(null);
  
  const [timNgay, setTimNgay] = useState("");
  const [thangThongKe, setThangThongKe] = useState("");

  const [uidNhanVien, setUidNhanVien] = useState(""); const [emailNhanVien, setEmailNhanVien] = useState("");
  const [hoTenNhanVien, setHoTenNhanVien] = useState(""); const [soDienThoaiNhanVien, setSoDienThoaiNhanVien] = useState("");
  const [quyenNhanVien, setQuyenNhanVien] = useState<Role>("staff"); const [dangSuaNhanVien, setDangSuaNhanVien] = useState<string | null>(null);
  const [luongCungNhanVien, setLuongCungNhanVien] = useState("3.000.000"); const [thuongChuyenCanNhanVien, setThuongChuyenCanNhanVien] = useState("300.000");

  const [psNgay, setPsNgay] = useState(homNay()); const [psTenKhach, setPsTenKhach] = useState("");
  const [psSoDienThoai, setPsSoDienThoai] = useState(""); const [psLoai, setPsLoai] = useState("");
  const [psNgayTra, setPsNgayTra] = useState(""); const [psSoTien, setPsSoTien] = useState("");
  const [psGhiChu, setPsGhiChu] = useState("");

  const [dangLayViTri, setDangLayViTri] = useState(false);
  const [khoangCach, setKhoangCach] = useState<number | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "system", "appVersion"), (snap) => {
      if (snap.exists()) {
        if (snap.data().version && snap.data().version !== APP_VERSION) setCoBanCapNhat(true); else setCoBanCapNhat(false);
      } else if (laAdmin) setDoc(doc(db, "system", "appVersion"), { version: APP_VERSION }).catch(e => console.log(e));
    });
    return () => unsub();
  }, [laAdmin]);

  const xacNhanPhatHanh = async () => { try { await setDoc(doc(db, "system", "appVersion"), { version: APP_VERSION }); toast.success("Phát hành thành công!"); } catch (error) { toast.error("Lỗi mạng"); } };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);
          if (currentUser.email === ADMIN_CHINH_EMAIL) {
            try { await setDoc(userRef, { email: currentUser.email, role: "admin" }, { merge: true }); } catch (e) { }
            const adminSnap = await getDoc(userRef); const adminData = adminSnap.exists() ? adminSnap.data() : {};
            setHoSoCuaToi({ id: currentUser.uid, email: currentUser.email || "", hoTen: adminData.hoTen || "", soDienThoai: adminData.soDienThoai || "", luongCung: adminData.luongCung || 0, thuongChuyenCan: adminData.thuongChuyenCan || 0, role: "admin" }); setRole("admin");
          } else {
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const data = userSnap.data();
              setHoSoCuaToi({ id: currentUser.uid, email: data.email || currentUser.email || "", hoTen: data.hoTen || "", soDienThoai: data.soDienThoai || "", luongCung: data.luongCung || 0, thuongChuyenCan: data.thuongChuyenCan || 0, role: data.role === "admin" ? "admin" : "staff" }); setRole(data.role === "admin" ? "admin" : "staff");
            } else { setHoSoCuaToi(null); setRole("staff"); }
          }
        } else { setHoSoCuaToi(null); setRole("staff"); }
      } catch (error) { toast.error("Có lỗi đường truyền!"); } finally { setDangTai(false); }
    });
    return () => unsub();
  }, []);

  const guiGiaiTrinh = async (ngayGiaiTrinh: string, loai: string, lyDo: string) => {
    if (!user) return; const record = danhSachChamCong.find(cc => cc.uid === user.uid && cc.ngay === ngayGiaiTrinh);
    try {
      if (record && record.id) { await updateDoc(doc(db, "chamCong", record.id), { loaiGiaiTrinh: loai, lyDoGiaiTrinh: lyDo, trangThaiGiaiTrinh: "Chờ duyệt" }); } 
      else { await addDoc(collection(db, "chamCong"), { uid: user.uid, email: user.email, ngay: ngayGiaiTrinh, loaiGiaiTrinh: loai, lyDoGiaiTrinh: lyDo, trangThaiGiaiTrinh: "Chờ duyệt" }); }
      toast.success("Đã gửi đơn giải trình!");
    } catch (e) { toast.error("Lỗi khi gửi đơn."); }
  };

  const duyetGiaiTrinh = async (id: string, isApproved: boolean) => { try { await updateDoc(doc(db, "chamCong", id), { trangThaiGiaiTrinh: isApproved ? "Đã duyệt" : "Từ chối" }); toast.success(isApproved ? "Đã duyệt đơn!" : "Đã từ chối đơn!"); } catch (e) { toast.error("Lỗi xử lý."); } };

  const themThuHuong = async (uid: string, email: string, hoTen: string, ngayThuHuong: string, moTa: string, soTienStr: string) => {
    if (!ngayThuHuong || !moTa || !soTienStr) { toast.error("Nhập đủ thông tin"); return; }
    try { await addDoc(collection(db, "thuHuong"), { uid, email, hoTen, ngay: ngayThuHuong, moTa, soTien: chuyenTienVeSo(soTienStr) }); toast.success("Đã lưu báo cáo!"); } catch (error) { toast.error("Lỗi lưu thụ hưởng"); }
  };

  const xoaThuHuong = async (id: string) => { if (!confirm("Xóa khoản tiền này?")) return; await deleteDoc(doc(db, "thuHuong", id)); toast.success("Đã xóa khoản thụ hưởng"); };
  const dangNhap = async () => { if (!email || !matKhau) { toast.error("Nhập email và mật khẩu"); return; } try { await signInWithEmailAndPassword(auth, email, matKhau); } catch (error) { toast.error("Sai email hoặc mật khẩu"); } };
  const dangXuat = async () => { await signOut(auth); };
  const resetForm = () => { setNgay(""); setGio(""); setTenKhach(""); setSoDienThoai(""); setSoDienThoai2(""); setTheLoai(""); setTheLoaiKhac(""); setGoiChup(""); setGiaTien(""); setDangSua(null); };

  const themHoacSuaLich = async () => {
    const theLoaiCuoi = theLoai === "Khác" ? theLoaiKhac.trim() : (theLoai || goiChup || "Chụp ảnh");
    if (!ngay || !gio || !tenKhach || !soDienThoai || !goiChup || !giaTien) { toast.error("Nhập đủ thông tin bắt buộc"); return; }
    const trungLich = lichLamViec.some((item) => item.ngay === ngay && item.gio === gio && item.id !== dangSua);
    if (trungLich) { toast.error("Khung giờ này đã có lịch"); return; }
    const duLieuLich = { ngay, gio, tenKhach, soDienThoai, soDienThoai2, theLoai: theLoaiCuoi, goiChup, giaTien: chuyenTienVeSo(giaTien), trangThai: "Chưa liên hệ" };
    try {
      if (dangSua) { await updateDoc(doc(db, "lichStudio", dangSua), duLieuLich); toast.success("Đã lưu thay đổi!"); } 
      else { await addDoc(collection(db, "lichStudio"), duLieuLich); toast.success("Đã thêm lịch!"); } resetForm();
    } catch (error) { toast.error("Có lỗi xảy ra"); }
  };

  const xoaLich = async (id?: string) => { if (!id) return; if (!laAdmin) { toast.error("Chỉ admin mới được xóa lịch"); return; } if (!confirm("Xóa lịch này?")) return; await deleteDoc(doc(db, "lichStudio", id)); toast.success("Đã xóa"); };
  const suaLich = (item: Lich) => { setNgay(item.ngay); setGio(item.gio); setTenKhach(item.tenKhach); setSoDienThoai(item.soDienThoai || ""); setSoDienThoai2(item.soDienThoai2 || ""); setTheLoai(item.theLoai || ""); setTheLoaiKhac(""); setGoiChup(item.goiChup || ""); setGiaTien(formatTienInput(String(item.giaTien || ""))); setDangSua(item.id || null); setTab("lich"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const capNhatTrangThai = async (id?: string, trangThai?: string) => { if (!id || !trangThai) return; try { await updateDoc(doc(db, "lichStudio", id), { trangThai }); toast.success("Đã cập nhật"); } catch (error) { toast.error("Lỗi cập nhật"); } };

  const taoHoSoNhanVien = async () => {
    if (!laAdmin) { toast.error("Chỉ admin mới được quản lý"); return; }
    if (!uidNhanVien || !emailNhanVien) { toast.error("Nhập UID và email"); return; }
    try { await setDoc(doc(db, "users", uidNhanVien), { email: emailNhanVien, hoTen: hoTenNhanVien, soDienThoai: soDienThoaiNhanVien, luongCung: chuyenTienVeSo(luongCungNhanVien), thuongChuyenCan: chuyenTienVeSo(thuongChuyenCanNhanVien), role: emailNhanVien === ADMIN_CHINH_EMAIL ? "admin" : quyenNhanVien }, { merge: true }); setUidNhanVien(""); setEmailNhanVien(""); setHoTenNhanVien(""); setSoDienThoaiNhanVien(""); setLuongCungNhanVien("3.000.000"); setThuongChuyenCanNhanVien("300.000"); setQuyenNhanVien("staff"); setDangSuaNhanVien(null); toast.success("Thành công"); } catch (error) { toast.error("Lỗi"); }
  };
  const suaHoSoNhanVien = (tk: TaiKhoan) => { setDangSuaNhanVien(tk.id); setUidNhanVien(tk.id); setEmailNhanVien(tk.email || ""); setHoTenNhanVien(tk.hoTen || ""); setSoDienThoaiNhanVien(tk.soDienThoai || ""); setLuongCungNhanVien(formatTienInput(String(tk.luongCung || 3000000))); setThuongChuyenCanNhanVien(formatTienInput(String(tk.thuongChuyenCan || 300000))); setQuyenNhanVien(tk.role || "staff"); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const themPhatSinh = async () => {
    if (!psNgay || !psLoai || !psSoTien) { toast.error("Nhập ngày, loại và số tiền"); return; }
    try { await addDoc(collection(db, "phatSinh"), { ngay: psNgay, tenKhach: psTenKhach, soDienThoai: psSoDienThoai, loai: psLoai, ngayTra: psNgayTra, soTien: chuyenTienVeSo(psSoTien), nguoiGhi: user?.email || "", ghiChu: psGhiChu }); setPsNgay(homNay()); setPsTenKhach(""); setPsSoDienThoai(""); setPsLoai(""); setPsNgayTra(""); setPsSoTien(""); setPsGhiChu(""); toast.success("Đã lưu khoản phát sinh"); } catch (error) { toast.error("Lỗi"); }
  };
  const xoaPhatSinh = async (id?: string) => { if (!id) return; if (!laAdmin) { toast.error("Chỉ admin mới được xóa"); return; } if (!confirm("Xóa khoản này?")) return; await deleteDoc(doc(db, "phatSinh", id)); toast.success("Đã xóa"); };

  const layViTri = () => { return new Promise<{ lat: number; lng: number; distance: number }>((resolve, reject) => { if (!navigator.geolocation) { reject(new Error("Không hỗ trợ GPS")); return; } navigator.geolocation.getCurrentPosition((position) => { const lat = position.coords.latitude; const lng = position.coords.longitude; const distance = tinhKhoangCachMet(lat, lng, CUA_HANG_LAT, CUA_HANG_LNG); resolve({ lat, lng, distance }); }, () => { reject(new Error("Bật định vị!")); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }); }); };
  const chamCong = async (loai: "checkIn" | "checkOut") => {
    if (!user) return; setDangLayViTri(true);
    try {
      const viTri = await layViTri(); setKhoangCach(viTri.distance);
      if (viTri.distance > BAN_KINH_CHO_PHEP) { toast.error("Bạn đang ở quá xa studio!"); return; }
      const ngayHomNay = homNay(); const banGhiHomNay = danhSachChamCong.find((item) => item.uid === user.uid && item.ngay === ngayHomNay); const gioHienTaiCheckIn = gioHienTai(); const [gio, phut] = gioHienTaiCheckIn.split(":").map(Number); const soPhutMuon = Math.max(0, (gio * 60 + phut) - 8 * 60); const diMuon = soPhutMuon > 0;
      if (loai === "checkIn") {
        if (banGhiHomNay?.checkIn) { toast.error("Đã Check-in rồi"); return; }
        if (banGhiHomNay?.id) { await updateDoc(doc(db, "chamCong", banGhiHomNay.id), { checkIn: gioHienTaiCheckIn, checkInLat: viTri.lat, checkInLng: viTri.lng, diMuon, soPhutMuon }); } 
        else { await addDoc(collection(db, "chamCong"), { uid: user.uid, email: user.email || "", ngay: ngayHomNay, checkIn: gioHienTaiCheckIn, checkInLat: viTri.lat, checkInLng: viTri.lng, diMuon, soPhutMuon }); } toast.success("Check-in thành công!");
      }
      if (loai === "checkOut") {
        if (!banGhiHomNay?.id) { await addDoc(collection(db, "chamCong"), { uid: user.uid, email: user.email || "", ngay: ngayHomNay, checkOut: gioHienTai(), checkOutLat: viTri.lat, checkOutLng: viTri.lng }); toast.success("Check-out thành công!"); return; }
        if (banGhiHomNay.checkOut) { toast.error("Đã Check-out rồi"); return; }
        await updateDoc(doc(db, "chamCong", banGhiHomNay.id), { checkOut: gioHienTai(), checkOutLat: viTri.lat, checkOutLng: viTri.lng }); toast.success("Check-out thành công!");
      }
    } catch (error) { toast.error("Không lấy được GPS"); } finally { setDangLayViTri(false); }
  };

  const danhSachHienThi = lichLamViec.filter((item) => { const dungNgay = timNgay ? item.ngay === timNgay : true; const keyword = tuKhoa.toLowerCase().trim(); const dungTuKhoa = keyword ? item.tenKhach.toLowerCase().includes(keyword) || (item.soDienThoai || "").includes(keyword) : true; return dungNgay && dungTuKhoa; });
  const lichTheoNgay = danhSachHienThi.reduce((acc: Record<string, Lich[]>, item) => { if (!acc[item.ngay]) acc[item.ngay] = []; acc[item.ngay].push(item); return acc; }, {});
  const lichTrongThang = thangThongKe ? lichLamViec.filter((item) => item.ngay.startsWith(thangThongKe)) : [];
  const phatSinhTrongThang = thangThongKe ? danhSachPhatSinh.filter((item) => item.ngay.startsWith(thangThongKe)) : [];
  const tongThuNhapLich = lichTrongThang.reduce((sum, item) => sum + Number(item.giaTien || 0), 0);
  const tongThuNhapPhatSinh = phatSinhTrongThang.reduce((sum, item) => sum + Number(item.soTien || 0), 0);
  const tongThuNhap = tongThuNhapLich + tongThuNhapPhatSinh;
  
  const chamCongHomNay = danhSachChamCong.find((item) => item.uid === user?.uid && item.ngay === homNay());
  const chamCongHienThi = laAdmin ? danhSachChamCong : danhSachChamCong.filter((item) => item.uid === user?.uid);
  
  const ngayHomNay = new Date().toISOString().split("T")[0];
  const isThueDoCheck = (loai: string) => loai && loai.toLowerCase().includes("thuê");
  const canTraHomNay = danhSachPhatSinh.filter((ps) => !ps.daTraDo && isThueDoCheck(ps.loai) && ps.ngayTra === ngayHomNay);
  const quaHan = danhSachPhatSinh.filter((ps) => !ps.daTraDo && isThueDoCheck(ps.loai) && ps.ngayTra && ps.ngayTra < ngayHomNay);
  const dangThue = danhSachPhatSinh.filter((ps) => !ps.daTraDo && isThueDoCheck(ps.loai) && ps.ngayTra && ps.ngayTra > ngayHomNay);
  const danhDauDaTraDo = async (id: string) => { try { await updateDoc(doc(db, "phatSinh", id), { daTraDo: true }); toast.success("Đã xác nhận trả đồ"); } catch (error) { toast.error("Lỗi"); } };

  if (dangTai) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-medium text-zinc-400 tracking-wide">Đang kết nối không gian...</div>;
  
  /* GIAO DIỆN LOGIN - SANG TRỌNG / TỐI GIẢN */
  if (!user) { 
    return ( 
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Họa tiết mờ trang trí */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-zinc-200/40 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-stone-200/40 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10 w-full max-w-sm border border-white/50 relative z-10">
          <div className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-zinc-200/50">
            <Camera size={28} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-extrabold mb-1.5 text-center text-zinc-900 tracking-tight">Suri Studio</h1>
          <p className="text-zinc-400 text-sm font-medium text-center mb-8 tracking-wide">Quản trị không gian cưới</p>
          
          <div className="grid gap-5">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Email</label>
              <input type="email" placeholder="Tài khoản..." value={email} onChange={(e) => setEmail(e.target.value)} className="bg-zinc-50/50 border border-zinc-100 p-4 rounded-2xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100/50 outline-none transition-all placeholder:text-zinc-300" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Mật khẩu</label>
              <input type="password" placeholder="••••••••" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} className="bg-zinc-50/50 border border-zinc-100 p-4 rounded-2xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 focus:ring-4 focus:ring-zinc-100/50 outline-none transition-all placeholder:text-zinc-300" />
            </div>
            <button onClick={dangNhap} className="bg-zinc-900 text-white p-4 rounded-2xl font-bold tracking-wide shadow-lg shadow-zinc-200 hover:bg-zinc-800 active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-2">
              Vào hệ thống <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div> 
    ); 
  }

  const nutMenu = [
    { key: "home", icon: Home, label: "Tổng quan", color: "text-zinc-900", bg: "bg-zinc-100", adminOnly: false },
    { key: "lich", icon: CalendarDays, label: "Lịch chụp", color: "text-zinc-900", bg: "bg-zinc-100", adminOnly: false },
    { key: "phatSinh", icon: Wallet, label: "Thu / Chi", color: "text-zinc-900", bg: "bg-zinc-100", adminOnly: false },
    { key: "tinhTrangKH", icon: ClipboardList, label: "Kho đồ", color: "text-zinc-900", bg: "bg-zinc-100", adminOnly: false },
    { key: "chamCong", icon: Clock, label: "Chấm công", color: "text-zinc-900", bg: "bg-zinc-100", adminOnly: false },
    { key: "luong", icon: FileSpreadsheet, label: "Bảng Lương", color: "text-zinc-900", bg: "bg-zinc-100", adminOnly: false },
    { key: "nhanVien", icon: Users, label: "Nhân sự", color: "text-zinc-900", bg: "bg-zinc-100", adminOnly: true },
    { key: "thongKe", icon: BarChart3, label: "Thống kê", color: "text-zinc-900", bg: "bg-zinc-100", adminOnly: true },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-5 md:p-10 pb-32 font-sans selection:bg-zinc-200">
      {coBanCapNhat && (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-zinc-200/50 z-50 relative">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-800 text-white rounded-full flex items-center justify-center animate-spin-slow"><RefreshCw size={18} /></div> 
            <div><div className="font-bold text-white text-sm tracking-wide">Cập nhật hệ thống</div><div className="text-xs text-zinc-400 mt-1">Phiên bản mới đã sẵn sàng.</div></div>
          </div>
          <div className="flex gap-2">
            {laAdmin && (<button onClick={xacNhanPhatHanh} className="flex-1 md:flex-none bg-white text-zinc-900 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-zinc-100 active:scale-95 transition-all">Phát hành</button>)}
            <button onClick={() => window.location.reload()} className="flex-1 md:flex-none bg-zinc-800 text-white border border-zinc-700 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-700 active:scale-95 transition-all">Tải lại</button>
          </div>
        </div>
      )}

      {/* HEADER TỐI GIẢN */}
      <div className="flex justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Suri Studio.</h1>
          <p className="text-[11px] uppercase tracking-widest font-bold text-zinc-400 mt-1.5">{user.email?.split('@')[0]} <span className="mx-1">•</span> {laAdmin ? "Quản trị viên" : "Nhân sự"}</p>
        </div>
        <button onClick={dangXuat} className="bg-white border border-zinc-100 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm"><LogOut size={18} strokeWidth={2} /></button>
      </div>

      {tab === "home" && (
        <div className="animate-fade-in space-y-8">
          {/* KHỐI TỔNG QUAN */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="font-bold text-sm uppercase tracking-widest text-zinc-400">Hôm nay</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => { setTab("lich"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="col-span-2 bg-zinc-900 p-6 rounded-[2rem] shadow-xl shadow-zinc-200/50 hover:shadow-2xl transition-all active:scale-[0.98] flex items-center justify-between group relative overflow-hidden">
                {/* Lớp phủ mờ ánh kim */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 text-white flex items-center justify-center group-hover:scale-105 transition-transform duration-500"><CalendarDays size={24} strokeWidth={1.5} /></div>
                  <div className="text-left">
                    <div className="text-zinc-400 font-medium text-[11px] uppercase tracking-[0.2em] mb-1">Lịch bấm máy</div>
                    <div className="text-2xl font-light text-white leading-none">
                      {lichLamViec.filter((item) => item.ngay === homNay()).length > 0 ? <span className="font-medium text-white">{lichLamViec.filter((item) => item.ngay === homNay()).length} <span className="text-base text-zinc-400 font-normal tracking-wide">khách</span></span> : <span className="text-zinc-500 text-lg tracking-wide">Trống lịch</span>}
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:text-zinc-900 transition-colors z-10"><ChevronRight size={20} strokeWidth={2} /></div>
              </button>

              <button onClick={() => { setTab("tinhTrangKH"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`p-6 rounded-[2rem] border transition-all active:scale-95 flex flex-col gap-4 ${canTraHomNay.length > 0 ? "bg-[#FAF5ED] border-[#F2E5D0] shadow-sm" : "bg-white border-zinc-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)]"}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${canTraHomNay.length > 0 ? "bg-[#F2E5D0] text-[#8C6B38]" : "bg-zinc-50 text-zinc-400"}`}><ClipboardList size={22} strokeWidth={1.5} /></div>
                <div className="text-left">
                  <div className={`text-3xl font-light leading-none mb-2 ${canTraHomNay.length > 0 ? "text-[#8C6B38] font-medium" : "text-zinc-800"}`}>{canTraHomNay.length}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-[0.15em] ${canTraHomNay.length > 0 ? "text-[#A88B5A]" : "text-zinc-400"}`}>Khách trả đồ</div>
                </div>
              </button>

              <button onClick={() => { setTab("tinhTrangKH"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`p-6 rounded-[2rem] border transition-all active:scale-95 flex flex-col gap-4 ${quaHan.length > 0 ? "bg-[#FCF0F0] border-[#F5DADA] shadow-sm" : "bg-white border-zinc-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)]"}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${quaHan.length > 0 ? "bg-[#F5DADA] text-[#9B4747] animate-pulse" : "bg-zinc-50 text-zinc-400"}`}><AlertCircle size={22} strokeWidth={1.5} /></div>
                <div className="text-left">
                  <div className={`text-3xl font-light leading-none mb-2 ${quaHan.length > 0 ? "text-[#9B4747] font-medium" : "text-zinc-800"}`}>{quaHan.length}</div>
                  <div className={`text-[10px] font-bold uppercase tracking-[0.15em] ${quaHan.length > 0 ? "text-[#B96A6A]" : "text-zinc-400"}`}>Quá hạn trả</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-sm uppercase tracking-widest text-zinc-400 mb-4 ml-1">Danh mục</h2>
            <div className="grid grid-cols-2 gap-3">
              {nutMenu.filter((item) => item.key !== "home").filter((item) => !item.adminOnly || laAdmin).map((item) => {
                  const IconComponent = item.icon;
                  return ( 
                    <button key={item.key} onClick={() => { setTab(item.key as TabType); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] border border-zinc-100/50 p-4 flex items-center gap-4 transition-all hover:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] hover:border-zinc-200 active:scale-95 group">
                      <div className={`p-3 rounded-2xl bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white text-zinc-500 transition-colors duration-500 shrink-0`}><IconComponent size={20} strokeWidth={1.5} /></div>
                      <div className="font-medium text-sm text-zinc-700 text-left leading-tight tracking-wide">{item.label}</div>
                    </button> 
                  );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RENDER CÁC TAB - NỘI DUNG GIỮ NGUYÊN LOGIC */}
      <div id="noi-dung-tab" className="mt-4">
        {tab === "lich" && <TabLich homNay={homNay} dangSua={dangSua} ngay={ngay} setNgay={setNgay} gio={gio} setGio={setGio} tenKhach={tenKhach} setTenKhach={setTenKhach} soDienThoai={soDienThoai} setSoDienThoai={setSoDienThoai} soDienThoai2={soDienThoai2} setSoDienThoai2={setSoDienThoai2} theLoai={theLoai} setTheLoai={setTheLoai} theLoaiKhac={theLoaiKhac} setTheLoaiKhac={setTheLoaiKhac} goiChup={goiChup} setGoiChup={setGoiChup} giaTien={giaTien} setGiaTien={setGiaTien} formatTienInput={formatTienInput} themHoacSuaLich={themHoacSuaLich} resetForm={resetForm} lichTheoNgay={lichTheoNgay} suaLich={suaLich} capNhatTrangThai={capNhatTrangThai} hoSoCuaToi={hoSoCuaToi} themThuHuong={themThuHuong} laAdmin={laAdmin} xoaLich={xoaLich} lichLamViec={lichLamViec} />}
        {tab === "phatSinh" && <TabPhatSinh psNgay={psNgay} setPsNgay={setPsNgay} psTenKhach={psTenKhach} setPsTenKhach={setPsTenKhach} psSoDienThoai={psSoDienThoai} setPsSoDienThoai={setPsSoDienThoai} psLoai={psLoai} setPsLoai={setPsLoai} psNgayTra={psNgayTra} setPsNgayTra={setPsNgayTra} psSoTien={psSoTien} setPsSoTien={setPsSoTien} psGhiChu={psGhiChu} setPsGhiChu={setPsGhiChu} formatTienInput={formatTienInput} themPhatSinh={themPhatSinh} danhSachPhatSinh={danhSachPhatSinh} laAdmin={laAdmin} xoaPhatSinh={xoaPhatSinh} hoSoCuaToi={hoSoCuaToi} themThuHuong={themThuHuong} danhDauDaTraDo={danhDauDaTraDo} />}
        {tab === "chamCong" && <TabChamCong homNay={homNay} BAN_KINH_CHO_PHEP={BAN_KINH_CHO_PHEP} khoangCach={khoangCach} chamCongHomNay={chamCongHomNay} chamCong={chamCong} dangLayViTri={dangLayViTri} laAdmin={laAdmin} chamCongHienThi={chamCongHienThi} guiGiaiTrinh={guiGiaiTrinh} duyetGiaiTrinh={duyetGiaiTrinh} />}
        {tab === "luong" && <TabLuong homNay={homNay} uidCuaToi={user?.uid} hoSoCuaToi={hoSoCuaToi} laAdmin={laAdmin} danhSachTaiKhoan={danhSachTaiKhoan} danhSachChamCong={danhSachChamCong} danhSachThuHuong={danhSachThuHuong} themThuHuong={themThuHuong} xoaThuHuong={xoaThuHuong} formatTienInput={formatTienInput} />}
        {tab === "nhanVien" && laAdmin && <TabNhanVien uidNhanVien={uidNhanVien} setUidNhanVien={setUidNhanVien} emailNhanVien={emailNhanVien} setEmailNhanVien={setEmailNhanVien} hoTenNhanVien={hoTenNhanVien} setHoTenNhanVien={setHoTenNhanVien} soDienThoaiNhanVien={soDienThoaiNhanVien} setSoDienThoaiNhanVien={setSoDienThoaiNhanVien} luongCungNhanVien={luongCungNhanVien} setLuongCungNhanVien={setLuongCungNhanVien} thuongChuyenCanNhanVien={thuongChuyenCanNhanVien} setThuongChuyenCanNhanVien={setThuongChuyenCanNhanVien} quyenNhanVien={quyenNhanVien} setQuyenNhanVien={setQuyenNhanVien} taoHoSoNhanVien={taoHoSoNhanVien} dangSuaNhanVien={dangSuaNhanVien} danhSachTaiKhoan={danhSachTaiKhoan} laAdmin={laAdmin} suaHoSoNhanVien={suaHoSoNhanVien} formatTienInput={formatTienInput} />}
        {tab === "tinhTrangKH" && <TabTinhTrangKH quaHan={quaHan} canTraHomNay={canTraHomNay} dangThue={dangThue} danhDauDaTraDo={danhDauDaTraDo} />}
        {tab === "thongKe" && laAdmin && <TabThongKe thangThongKe={thangThongKe} setThangThongKe={setThangThongKe} lichTrongThang={lichTrongThang} tongThuNhapLich={tongThuNhapLich} tongThuNhapPhatSinh={tongThuNhapPhatSinh} tongThuNhap={tongThuNhap} />}
      </div>

      {/* THANH ĐIỀU HƯỚNG DƯỚI ĐÁY (Floating Pill Bottom Nav) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-xl border border-white/50 rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] flex justify-between items-center px-2 py-2 z-40">
        {[
          { key: "home", icon: Home, label: "Tổng quan" },
          { key: "lich", icon: CalendarDays, label: "Lịch chụp" },
          { key: "phatSinh", icon: Wallet, label: "Thu Chi" },
          { key: "luong", icon: FileSpreadsheet, label: "Quản lý" },
        ].map((nav) => {
          const IconComponent = nav.icon;
          const isActive = tab === nav.key || (nav.key === "luong" && (tab === "chamCong" || tab === "luong" || tab === "nhanVien" || tab === "thongKe" || tab === "tinhTrangKH"));
          return (
            <button key={nav.key} onClick={() => { setTab(nav.key === "luong" ? "luong" : (nav.key as TabType)); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`flex items-center justify-center px-4 py-2.5 rounded-full transition-all duration-500 ease-out ${isActive ? "bg-zinc-900 text-white shadow-md" : "bg-transparent text-zinc-400 hover:text-zinc-600"}`}>
              <IconComponent size={20} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
              {/* Chữ chỉ hiện ra khi tab đang active */}
              <div className={`overflow-hidden transition-all duration-500 ease-out ${isActive ? "max-w-[100px] ml-2 opacity-100" : "max-w-0 ml-0 opacity-0"}`}>
                <span className="text-[11px] font-bold tracking-wide whitespace-nowrap">{nav.label}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
}