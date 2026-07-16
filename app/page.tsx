"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { db, auth } from "../lib/firebase";
import dynamic from "next/dynamic";
import { useAppData } from "../hooks/useAppData";
import { Role, TabType, TaiKhoan } from "../types";
import { Home, CalendarDays, Wallet, Clock, FileSpreadsheet, Users, BarChart3, ClipboardList, LogOut, RefreshCw, AlertCircle } from "lucide-react";

const TabLuong = dynamic(() => import("./components/TabLuong"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });
const TabTinhTrangKH = dynamic(() => import("./components/TabTinhTrangKH"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });
const TabThongKe = dynamic(() => import("./components/TabThongKe"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });
const TabNhanVien = dynamic(() => import("./components/TabNhanVien"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });
const TabPhatSinh = dynamic(() => import("./components/TabPhatSinh"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });
const TabLich = dynamic(() => import("./components/TabLich"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });
const TabChamCong = dynamic(() => import("./components/TabChamCong"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });

const ADMIN_CHINH_EMAIL = "dangngocan93@gmail.com";
const APP_VERSION = "v1.0.8"; 

function homNay() { 
  const d = new Date(); 
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10); 
}
function formatTienInput(value: string) { const so = value.replace(/\D/g, ""); return so.replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function chuyenTienVeSo(value: string) { return Number(value.replace(/\./g, "")); }

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
  const [ngayCuoi, setNgayCuoi] = useState(""); 
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

  const themThuHuong = async (uid: string, email: string, hoTen: string, ngayThuHuong: string, moTa: string, soTienStr: string) => {
    if (!ngayThuHuong || !moTa || !soTienStr) { toast.error("Nhập đủ thông tin"); return; }
    try { await addDoc(collection(db, "thuHuong"), { uid, email, hoTen, ngay: ngayThuHuong, moTa, soTien: chuyenTienVeSo(soTienStr) }); toast.success("Đã lưu báo cáo!"); } catch (error) { toast.error("Lỗi lưu thụ hưởng"); }
  };

  const xoaThuHuong = async (id: string) => { if (!confirm("Xóa khoản tiền này?")) return; await deleteDoc(doc(db, "thuHuong", id)); toast.success("Đã xóa khoản thụ hưởng"); };
  const dangNhap = async () => { if (!email || !matKhau) { toast.error("Nhập email và mật khẩu"); return; } try { await signInWithEmailAndPassword(auth, email, matKhau); } catch (error) { toast.error("Sai email hoặc mật khẩu"); } };
  const dangXuat = async () => { await signOut(auth); };
  
  const resetForm = () => { setNgay(""); setNgayCuoi(""); setGio(""); setTenKhach(""); setSoDienThoai(""); setSoDienThoai2(""); setTheLoai(""); setTheLoaiKhac(""); setGoiChup(""); setGiaTien(""); setDangSua(null); };

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
  const suaLich = (item: any) => { setNgay(item.ngay); setGio(item.gio); setTenKhach(item.tenKhach); setSoDienThoai(item.soDienThoai || ""); setSoDienThoai2(item.soDienThoai2 || ""); setTheLoai(item.theLoai || ""); setTheLoaiKhac(""); setGoiChup(item.goiChup || ""); setGiaTien(formatTienInput(String(item.giaTien || ""))); setDangSua(item.id || null); setTab("lich"); window.scrollTo({ top: 0, behavior: "smooth" }); };
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

  const danhSachHienThi = lichLamViec.filter((item) => { 
    const dungNgay = timNgay ? item.ngay === timNgay : true; 
    const keyword = tuKhoa.toLowerCase().trim(); 
    const dungTuKhoa = keyword ? (item.tenKhach || "").toLowerCase().includes(keyword) || (item.soDienThoai || "").includes(keyword) : true; 
    return dungNgay && dungTuKhoa; 
  });
  const lichTheoNgay = danhSachHienThi.reduce((acc: Record<string, any[]>, item) => { if (!acc[item.ngay]) acc[item.ngay] = []; acc[item.ngay].push(item); return acc; }, {});
  const lichTrongThang = thangThongKe ? lichLamViec.filter((item) => item.ngay.startsWith(thangThongKe)) : [];
  const phatSinhTrongThang = thangThongKe ? danhSachPhatSinh.filter((item) => item.ngay.startsWith(thangThongKe)) : [];
  const tongThuNhapLich = lichTrongThang.reduce((sum, item) => sum + Number(item.giaTien || 0), 0);
  const tongThuNhapPhatSinh = phatSinhTrongThang.reduce((sum, item) => sum + Number(item.soTien || 0), 0);
  const tongThuNhap = tongThuNhapLich + tongThuNhapPhatSinh;
  
  const ngayHomNay = homNay();
  const isThueDoCheck = (loai: string) => loai && loai.toLowerCase().includes("thuê");
  const canTraHomNay = danhSachPhatSinh.filter((ps) => !ps.daTraDo && isThueDoCheck(ps.loai) && ps.ngayTra === ngayHomNay);
  const quaHan = danhSachPhatSinh.filter((ps) => !ps.daTraDo && isThueDoCheck(ps.loai) && ps.ngayTra && ps.ngayTra < ngayHomNay);
  const dangThue = danhSachPhatSinh.filter((ps) => !ps.daTraDo && isThueDoCheck(ps.loai) && ps.ngayTra && ps.ngayTra > ngayHomNay);
  const danhDauDaTraDo = async (id: string) => { try { await updateDoc(doc(db, "phatSinh", id), { daTraDo: true }); toast.success("Đã xác nhận trả đồ"); } catch (error) { toast.error("Lỗi"); } };

  if (dangTai) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-500">Đang tải dữ liệu...</div>;
  if (!user) { 
    return ( 
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-100/50 p-8 w-full max-w-sm border border-white">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><Users size={32} strokeWidth={2} /></div>
          <h1 className="text-2xl font-black mb-2 text-center text-slate-800 tracking-tight">Suri Wedding</h1>
          <p className="text-slate-500 text-sm font-medium text-center mb-8">Đăng nhập hệ thống quản lý</p>
          <div className="grid gap-4">
            <div><label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide ml-1 mb-1.5 block">Email</label><input type="email" placeholder="Nhập email..." value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-50 border border-transparent p-4 rounded-xl w-full text-slate-900 font-bold focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all" /></div>
            <div><label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide ml-1 mb-1.5 block">Mật khẩu</label><input type="password" placeholder="Nhập mật khẩu..." value={matKhau} onChange={(e) => setMatKhau(e.target.value)} className="bg-slate-50 border border-transparent p-4 rounded-xl w-full text-slate-900 font-bold focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all" /></div>
            <button onClick={dangNhap} className="bg-blue-600 text-white p-4 rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all mt-2">ĐĂNG NHẬP</button>
          </div>
        </div>
      </div> 
    ); 
  }

  const nutMenu = [
    { key: "home", icon: Home, label: "Trang chủ", color: "text-blue-600", bg: "bg-blue-50", adminOnly: false },
    { key: "lich", icon: CalendarDays, label: "Lịch chụp", color: "text-indigo-600", bg: "bg-indigo-50", adminOnly: false },
    { key: "phatSinh", icon: Wallet, label: "Thu / Chi", color: "text-emerald-600", bg: "bg-emerald-50", adminOnly: false },
    { key: "tinhTrangKH", icon: ClipboardList, label: "Kho đồ", color: "text-amber-600", bg: "bg-amber-50", adminOnly: false },
    { key: "chamCong", icon: Clock, label: "Chấm công", color: "text-teal-600", bg: "bg-teal-50", adminOnly: false },
    { key: "luong", icon: FileSpreadsheet, label: "Bảng Lương", color: "text-violet-600", bg: "bg-violet-50", adminOnly: false },
    { key: "nhanVien", icon: Users, label: "Nhân sự", color: "text-pink-600", bg: "bg-pink-50", adminOnly: true },
    { key: "thongKe", icon: BarChart3, label: "Thống kê", color: "text-rose-600", bg: "bg-rose-50", adminOnly: true },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-28 font-sans">
      {coBanCapNhat && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 p-4 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm z-50 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center animate-pulse"><RefreshCw size={24} /></div> 
            <div><div className="font-black text-amber-800 text-lg">App có bản cập nhật mới!</div><div className="text-sm text-amber-700 font-medium mt-0.5">Vui lòng cập nhật ngay để app hoạt động chuẩn xác nhất.</div></div>
          </div>
          <div className="flex gap-2">
            {laAdmin && (<button onClick={xacNhanPhatHanh} className="flex-1 md:flex-none bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-700 active:scale-95 transition-all">Phát hành bản này</button>)}
            <button onClick={() => window.location.reload()} className="flex-1 md:flex-none bg-amber-500 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-amber-600 active:scale-95 transition-all">Cập nhật ngay</button>
          </div>
        </div>
      )}

      {/* HEADER TỐI GIẢN */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <div><h1 className="text-2xl font-black text-slate-900 tracking-tight">Suri Wedding</h1><p className="text-xs font-bold text-slate-500 mt-1">{user.email?.split('@')[0]} • {laAdmin ? "Admin" : "Nhân viên"}</p></div>
        <button onClick={dangXuat} className="bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm"><LogOut size={18} strokeWidth={2.5} /></button>
      </div>

      {tab === "home" && (
        <div className="animate-fade-in space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3 px-1"><h2 className="font-black text-lg text-slate-800 tracking-tight">Tình trạng công việc</h2></div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setTab("lich"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="col-span-2 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-between group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-l-3xl"></div>
                <div className="flex items-center gap-4 ml-2">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"><CalendarDays size={28} strokeWidth={1.5} /></div>
                  <div className="text-left">
                    <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Lịch chụp hôm nay</div>
                    <div className="text-2xl font-black text-slate-800 leading-none">
                      {lichLamViec.filter((item) => item.ngay === homNay()).length > 0 ? <span className="text-indigo-600">{lichLamViec.filter((item) => item.ngay === homNay()).length} <span className="text-lg text-slate-600 font-semibold tracking-tight">khách hàng</span></span> : <span className="text-slate-400 text-lg tracking-tight">Lịch trống</span>}
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>
              </button>

              <button onClick={() => { setTab("tinhTrangKH"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`p-5 rounded-3xl border shadow-sm transition-all active:scale-95 flex flex-col gap-4 ${canTraHomNay.length > 0 ? "bg-gradient-to-b from-amber-50 to-orange-50 border-amber-200" : "bg-white border-slate-100"}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${canTraHomNay.length > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400"}`}><ClipboardList size={24} strokeWidth={2} /></div>
                <div className="text-left">
                  <div className={`text-3xl font-black leading-none mb-1.5 ${canTraHomNay.length > 0 ? "text-amber-700" : "text-slate-800"}`}>{canTraHomNay.length}</div>
                  <div className={`text-[11px] font-bold uppercase tracking-wider ${canTraHomNay.length > 0 ? "text-amber-600" : "text-slate-400"}`}>Trả đồ hôm nay</div>
                </div>
              </button>

              <button onClick={() => { setTab("tinhTrangKH"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className={`p-5 rounded-3xl border shadow-sm transition-all active:scale-95 flex flex-col gap-4 ${quaHan.length > 0 ? "bg-gradient-to-b from-rose-50 to-red-50 border-rose-200" : "bg-white border-slate-100"}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${quaHan.length > 0 ? "bg-rose-100 text-rose-600 animate-pulse" : "bg-slate-50 text-slate-400"}`}><AlertCircle size={24} strokeWidth={2} /></div>
                <div className="text-left">
                  <div className={`text-3xl font-black leading-none mb-1.5 ${quaHan.length > 0 ? "text-rose-700" : "text-slate-800"}`}>{quaHan.length}</div>
                  <div className={`text-[11px] font-bold uppercase tracking-wider ${quaHan.length > 0 ? "text-rose-600" : "text-slate-400"}`}>Quá hạn trả</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <h2 className="font-black text-lg mb-3 text-slate-800 ml-1 tracking-tight">Tính năng quản lý</h2>
            <div className="grid grid-cols-2 gap-3">
              {nutMenu.filter((item) => item.key !== "home").filter((item) => !item.adminOnly || laAdmin).map((item) => {
                  const IconComponent = item.icon;
                  return ( 
                    <button key={item.key} onClick={() => { setTab(item.key as TabType); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex items-center gap-3 transition-all hover:shadow-md hover:border-slate-200 active:scale-95 group">
                      <div className={`p-2.5 rounded-xl bg-slate-50 group-hover:${item.bg} ${item.color} transition-colors duration-300 shrink-0`}><IconComponent size={20} strokeWidth={2} /></div>
                      <div className="font-bold text-sm text-slate-700 text-left leading-tight">{item.label}</div>
                    </button> 
                  );
              })}
            </div>
          </div>
        </div>
      )}

      <div id="noi-dung-tab" className="mt-2">
        {/* TRUYỀN ĐẦY ĐỦ CÁC PROPS CHO TAB LỊCH */}
        {tab === "lich" && <TabLich homNay={homNay} dangSua={dangSua} ngay={ngay} setNgay={setNgay} ngayCuoi={ngayCuoi} setNgayCuoi={setNgayCuoi} gio={gio} setGio={setGio} tenKhach={tenKhach} setTenKhach={setTenKhach} soDienThoai={soDienThoai} setSoDienThoai={setSoDienThoai} soDienThoai2={soDienThoai2} setSoDienThoai2={setSoDienThoai2} theLoai={theLoai} setTheLoai={setTheLoai} theLoaiKhac={theLoaiKhac} setTheLoaiKhac={setTheLoaiKhac} goiChup={goiChup} setGoiChup={setGoiChup} giaTien={giaTien} setGiaTien={setGiaTien} formatTienInput={formatTienInput} themHoacSuaLich={themHoacSuaLich} resetForm={resetForm} lichTheoNgay={lichTheoNgay} suaLich={suaLich} capNhatTrangThai={capNhatTrangThai} hoSoCuaToi={hoSoCuaToi} themThuHuong={themThuHuong} laAdmin={laAdmin} xoaLich={xoaLich} lichLamViec={lichLamViec} danhSachPhatSinh={danhSachPhatSinh} danhSachThuHuong={danhSachThuHuong} />}
        {tab === "phatSinh" && <TabPhatSinh psNgay={psNgay} setPsNgay={setPsNgay} psTenKhach={psTenKhach} setPsTenKhach={setPsTenKhach} psSoDienThoai={psSoDienThoai} setPsSoDienThoai={setPsSoDienThoai} psLoai={psLoai} setPsLoai={setPsLoai} psNgayTra={psNgayTra} setPsNgayTra={setPsNgayTra} psSoTien={psSoTien} setPsSoTien={setPsSoTien} psGhiChu={psGhiChu} setPsGhiChu={setPsGhiChu} formatTienInput={formatTienInput} themPhatSinh={themPhatSinh} danhSachPhatSinh={danhSachPhatSinh} laAdmin={laAdmin} xoaPhatSinh={xoaPhatSinh} hoSoCuaToi={hoSoCuaToi} themThuHuong={themThuHuong} danhDauDaTraDo={danhDauDaTraDo} lichLamViec={lichLamViec} />}
        {tab === "chamCong" && <TabChamCong homNay={homNay} hoSoCuaToi={hoSoCuaToi} laAdmin={laAdmin} danhSachChamCong={danhSachChamCong} danhSachTaiKhoan={danhSachTaiKhoan} />}
        {tab === "luong" && <TabLuong homNay={homNay} uidCuaToi={user?.uid} hoSoCuaToi={hoSoCuaToi} laAdmin={laAdmin} danhSachTaiKhoan={danhSachTaiKhoan} danhSachChamCong={danhSachChamCong} danhSachThuHuong={danhSachThuHuong} themThuHuong={themThuHuong} xoaThuHuong={xoaThuHuong} formatTienInput={formatTienInput} />}
        {tab === "nhanVien" && laAdmin && <TabNhanVien uidNhanVien={uidNhanVien} setUidNhanVien={setUidNhanVien} emailNhanVien={emailNhanVien} setEmailNhanVien={setEmailNhanVien} hoTenNhanVien={hoTenNhanVien} setHoTenNhanVien={setHoTenNhanVien} soDienThoaiNhanVien={soDienThoaiNhanVien} setSoDienThoaiNhanVien={setSoDienThoaiNhanVien} luongCungNhanVien={luongCungNhanVien} setLuongCungNhanVien={setLuongCungNhanVien} thuongChuyenCanNhanVien={thuongChuyenCanNhanVien} setThuongChuyenCanNhanVien={setThuongChuyenCanNhanVien} quyenNhanVien={quyenNhanVien} setQuyenNhanVien={setQuyenNhanVien} taoHoSoNhanVien={taoHoSoNhanVien} dangSuaNhanVien={dangSuaNhanVien} danhSachTaiKhoan={danhSachTaiKhoan} laAdmin={laAdmin} suaHoSoNhanVien={suaHoSoNhanVien} formatTienInput={formatTienInput} />}
        {tab === "tinhTrangKH" && <TabTinhTrangKH quaHan={quaHan} canTraHomNay={canTraHomNay} dangThue={dangThue} danhDauDaTraDo={danhDauDaTraDo} />}
        {tab === "thongKe" && laAdmin && <TabThongKe thangThongKe={thangThongKe} setThangThongKe={setThangThongKe} lichTrongThang={lichTrongThang} tongThuNhapLich={tongThuNhapLich} tongThuNhapPhatSinh={tongThuNhapPhatSinh} tongThuNhap={tongThuNhap} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200/50 flex justify-around items-end pt-2 pb-6 md:pb-4 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)] z-40">
        {[
          { key: "home", icon: Home, label: "Trang chủ" },
          { key: "lich", icon: CalendarDays, label: "Lịch chụp" },
          { key: "phatSinh", icon: Wallet, label: "Thu / Chi" },
          { key: "luong", icon: FileSpreadsheet, label: "Quản lý" },
        ].map((nav) => {
          const IconComponent = nav.icon;
          const isActive = tab === nav.key || (nav.key === "luong" && (tab === "chamCong" || tab === "luong" || tab === "nhanVien" || tab === "thongKe" || tab === "tinhTrangKH"));
          return (
            <button key={nav.key} onClick={() => { setTab(nav.key === "luong" ? "luong" : (nav.key as TabType)); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex flex-col items-center p-2 w-1/4 relative group transition-all duration-300">
              {isActive && <span className="absolute -top-3 w-1.5 h-1.5 bg-blue-600 rounded-full animate-fade-in shadow-sm shadow-blue-300"></span>}
              <div className={`transition-all duration-300 ${isActive ? "-translate-y-1" : "group-hover:-translate-y-0.5"}`}><IconComponent size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"} /></div>
              <span className={`text-[10px] mt-1.5 transition-all duration-300 ${isActive ? "font-bold text-blue-600" : "font-semibold text-slate-400 group-hover:text-slate-600"}`}>{nav.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  );
}