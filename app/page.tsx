"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { db, auth } from "../lib/firebase";
import dynamic from "next/dynamic";
import { useAppData } from "../hooks/useAppData";
import { Role, TabType, TaiKhoan, Lich, GoiDichVu } from "../types";
import { Home, CalendarDays, Wallet, Clock, FileSpreadsheet, Users, UserCheck, BarChart3, ClipboardList, LogOut, RefreshCw, AlertCircle, Banknote, ChevronDown, ChevronUp, Camera, Layers, DollarSign, Lock } from "lucide-react";

const TabLuong = dynamic(() => import("./components/TabLuong"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });
const TabTinhTrangKH = dynamic(() => import("./components/TabTinhTrangKH"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });
const TabThongKe = dynamic(() => import("./components/TabThongKe"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });
const TabNhanVien = dynamic(() => import("./components/TabNhanVien"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });
const TabPhatSinh = dynamic(() => import("./components/TabPhatSinh"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });
const TabLich = dynamic(() => import("./components/TabLich"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });
const TabChamCong = dynamic(() => import("./components/TabChamCong"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });
const TabKhachHang = dynamic(() => import("./components/TabKhachHang"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });
const TabChiPhi = dynamic(() => import("./components/TabChiPhi"), { loading: () => <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Đang tải...</div> });

const ADMIN_CHINH_EMAIL = "dangngocan93@gmail.com";
const APP_VERSION = "v1.0.8"; 

function homNay() { 
  const d = new Date(); 
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10); 
}
function ngayMai() { 
  const d = new Date(); 
  d.setDate(d.getDate() + 1);
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
  const [tab, setTab] = useState<TabType | "chiPhi">("home");
  const [coBanCapNhat, setCoBanCapNhat] = useState(false);
  const [hoSoCuaToi, setHoSoCuaToi] = useState<TaiKhoan | null>(null);

  const [showKhachNo, setShowKhachNo] = useState(false);
  const [tabViecCuaToi, setTabViecCuaToi] = useState<"homNay" | "ngayMai">("homNay");
  const [thangThongKe, setThangThongKe] = useState("");
  
  const [subTabNhanSu, setSubTabNhanSu] = useState<"chamCong" | "danhSach">("chamCong");
  const [subTabKhoDo, setSubTabKhoDo] = useState<"traDo" | "goiChup">("traDo");

  // MẬT KHẨU MỚI: 10012026 (8 SỐ)
  const [isChiPhiUnlocked, setIsChiPhiUnlocked] = useState(false);
  const [maPin, setMaPin] = useState("");

  const [tenGoiMoi, setTenGoiMoi] = useState("");
  const [theLoaiGoiMoi, setTheLoaiGoiMoi] = useState("Chụp ảnh cưới");
  const [chiTietGoiMoi, setChiTietGoiMoi] = useState("");
  const [giaGoiMoi, setGiaGoiMoi] = useState("");
  const [dangSuaGoi, setDangSuaGoi] = useState<string | null>(null);

  const laAdmin = role === "admin";
  const { lichLamViec, danhSachPhatSinh, danhSachChamCong, danhSachThuHuong, danhSachTaiKhoan, danhSachKhachHang, danhSachGoiDichVu } = useAppData(user, laAdmin);

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

  const ngayHomNayStr = homNay();
  const ngayMaiStr = ngayMai(); 
  const isThueDoCheck = (loai: string) => loai && loai.toLowerCase().includes("thuê");
  
  const canTraHomNay = danhSachPhatSinh.filter((ps) => !ps.daTraDo && isThueDoCheck(ps.loai) && ps.ngayTra === ngayHomNayStr);
  const quaHan = danhSachPhatSinh.filter((ps) => !ps.daTraDo && isThueDoCheck(ps.loai) && ps.ngayTra && ps.ngayTra < ngayHomNayStr);
  const dangThue = danhSachPhatSinh.filter((ps) => !ps.daTraDo && isThueDoCheck(ps.loai) && ps.ngayTra && ps.ngayTra > ngayHomNayStr);
  
  const danhDauDaTraDo = async (id: string) => { try { await updateDoc(doc(db, "phatSinh", id), { daTraDo: true }); toast.success("Đã xác nhận trả đồ"); } catch (error) { toast.error("Lỗi"); } };

  const khachNoTien = lichLamViec.filter((item) => {
    const tongTien = Number(item.giaTien || 0) + Number((item as any).tienDichVuThem || 0);
    const tienNo = tongTien - Number(item.tienCoc || 0);
    if (tienNo <= 0) return false;
    const ngayMocSoSanh = (item as any).ngayCuoi ? (item as any).ngayCuoi : item.ngay;
    return ngayMocSoSanh < ngayHomNayStr;
  });

  const xacNhanThuDuTien = async (item: Lich) => {
    if (!laAdmin) { toast.error("Chỉ Admin mới được xác nhận tiền!"); return; }
    if (!confirm(`Xác nhận đã thu đủ số tiền còn nợ của khách: ${item.tenKhach}?`)) return;
    const tongTien = Number(item.giaTien || 0) + Number((item as any).tienDichVuThem || 0);
    try {
      await updateDoc(doc(db, "lichStudio", item.id!), { tienCoc: tongTien });
      toast.success("✅ Đã tất toán nợ thành công!");
      if (khachNoTien.length <= 1) setShowKhachNo(false);
    } catch (error) { toast.error("Lỗi hệ thống khi cập nhật!"); }
  };

  const luuGoiDichVu = async () => {
    if (!tenGoiMoi || !giaGoiMoi) { toast.error("Vui lòng nhập tên gói và giá!"); return; }
    try {
      const dataToSave = { tenGoi: tenGoiMoi, theLoai: theLoaiGoiMoi, chiTiet: chiTietGoiMoi, giaTien: chuyenTienVeSo(giaGoiMoi) || 0 };
      if (dangSuaGoi) { 
        await updateDoc(doc(db, "goiDichVu", dangSuaGoi), dataToSave); 
        toast.success("Cập nhật thành công!"); setDangSuaGoi(null); 
      } else { 
        await addDoc(collection(db, "goiDichVu"), dataToSave); 
        toast.success("Thêm gói thành công!"); 
      }
      setTenGoiMoi(""); setChiTietGoiMoi(""); setGiaGoiMoi(""); setTheLoaiGoiMoi("Chụp ảnh cưới");
    } catch(e) { toast.error("Lỗi mạng!"); }
  };

  const xoaGoiDichVu = async (id: string) => { 
    if (confirm("Chắc chắn xóa gói chụp mẫu này?")) await deleteDoc(doc(db, "goiDichVu", id)); 
  };

  const tenCuaToi = hoSoCuaToi?.hoTen || hoSoCuaToi?.email?.split('@')[0] || "";
  
  const viecCuaToiHomNay = lichLamViec.filter(lich => {
    if (lich.ngay !== ngayHomNayStr) return false;
    const phanCong = (lich as any).phanCong;
    if (!phanCong) return false;
    return Object.values(phanCong).includes(tenCuaToi);
  }).sort((a, b) => a.gio.localeCompare(b.gio));

  const viecCuaToiNgayMai = lichLamViec.filter(lich => {
    if (lich.ngay !== ngayMaiStr) return false;
    const phanCong = (lich as any).phanCong;
    if (!phanCong) return false;
    return Object.values(phanCong).includes(tenCuaToi);
  }).sort((a, b) => a.gio.localeCompare(b.gio));

  const danhSachViecHienThi = tabViecCuaToi === "homNay" ? viecCuaToiHomNay : viecCuaToiNgayMai;

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
            <button onClick={dangNhap} className="bg-blue-600 text-white p-4 rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all mt-2">Đăng Nhập</button>
          </div>
        </div>
      </div> 
    ); 
  }

  const nutMenu = [
    { key: "home", icon: Home, label: "Trang chủ", color: "text-blue-600", bg: "bg-blue-50", adminOnly: false },
    { key: "lich", icon: CalendarDays, label: "Lịch chụp", color: "text-indigo-600", bg: "bg-indigo-50", adminOnly: false },
    { key: "phatSinh", icon: Wallet, label: "Dịch vụ phát sinh", color: "text-emerald-600", bg: "bg-emerald-50", adminOnly: false },
    { key: "tinhTrangKH", icon: Layers, label: "Kho & Gói chụp", color: "text-amber-600", bg: "bg-amber-50", adminOnly: false },
    { key: "chamCong", icon: Users, label: "Nhân sự", color: "text-teal-600", bg: "bg-teal-50", adminOnly: false },
    { key: "luong", icon: FileSpreadsheet, label: "Bảng Lương", color: "text-violet-600", bg: "bg-violet-50", adminOnly: false },
    { key: "chiPhi", icon: DollarSign, label: "Chi phí vận hành", color: "text-rose-600", bg: "bg-rose-50", adminOnly: true },
    { key: "khachHang", icon: UserCheck, label: "Khách hàng", color: "text-amber-600", bg: "bg-amber-50", adminOnly: true },
    { key: "thongKe", icon: BarChart3, label: "Thống kê", color: "text-rose-600", bg: "bg-rose-50", adminOnly: true },
  ] as const;

  const goiDichVuĐaNhom = danhSachGoiDichVu.reduce((acc, goi) => {
    const loai = (goi as any).theLoai || "Khác";
    if (!acc[loai]) acc[loai] = [];
    acc[loai].push(goi);
    return acc;
  }, {} as Record<string, GoiDichVu[]>);

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

      <div className="flex justify-between items-center gap-4 mb-6">
        <div><h1 className="text-2xl font-black text-slate-900 tracking-tight">Suri Wedding</h1><p className="text-xs font-bold text-slate-500 mt-1">{tenCuaToi} • {laAdmin ? "Admin" : "Nhân viên"}</p></div>
        <button onClick={dangXuat} className="bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm"><LogOut size={18} strokeWidth={2.5} /></button>
      </div>

      {tab === "home" && (
        <div className="animate-fade-in space-y-6">

          {(viecCuaToiHomNay.length > 0 || viecCuaToiNgayMai.length > 0) ? (
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-5 shadow-lg shadow-blue-200 text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-8xl opacity-10 pointer-events-none">🎯</div>
              
              <div className="flex gap-2 mb-4 relative z-10 bg-black/10 p-1.5 rounded-xl w-fit">
                <button onClick={() => setTabViecCuaToi("homNay")} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${tabViecCuaToi === 'homNay' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/80 hover:text-white'}`}>
                  Hôm nay ({viecCuaToiHomNay.length})
                </button>
                <button onClick={() => setTabViecCuaToi("ngayMai")} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${tabViecCuaToi === 'ngayMai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/80 hover:text-white'}`}>
                  Ngày mai ({viecCuaToiNgayMai.length})
                </button>
              </div>
              
              <div className="flex flex-col gap-3 relative z-10">
                {danhSachViecHienThi.length > 0 ? danhSachViecHienThi.map(lich => {
                  const phanCong = (lich as any).phanCong || {};
                  const nhiemVuCuaToi = Object.entries(phanCong).filter(([role, name]) => name === tenCuaToi).map(([role]) => role); 
                  return (
                    <div key={lich.id} className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-start"><span className="bg-white text-blue-700 text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">⏰ {lich.gio}</span><span className="text-[10px] font-bold bg-black/20 px-2 py-1 rounded-md uppercase text-blue-50">{lich.theLoai}</span></div>
                      <div className="font-black text-xl leading-tight drop-shadow-sm">{lich.tenKhach}</div>
                      <div className="text-xs font-medium text-blue-50 flex items-center gap-1.5 flex-wrap mt-1"><span className="opacity-80">Nhiệm vụ:</span> <span className="font-bold text-white bg-white/20 border border-white/20 px-2 py-0.5 rounded-md">{nhiemVuCuaToi.join(", ")}</span></div>
                    </div>
                  )
                }) : (
                  <div className="text-center py-6 bg-white/10 rounded-2xl border border-white/20"><div className="text-3xl mb-2 opacity-50">🏝️</div><div className="text-xs font-medium text-blue-100">Chưa có phân công.</div></div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center text-2xl shrink-0">🏝️</div>
              <div><div className="font-black text-slate-800 text-sm">Không có ca phân công</div><div className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">Hôm nay và ngày mai bạn chưa có lịch làm việc nào!</div></div>
            </div>
          )}

          {khachNoTien.length > 0 && (
            <div className="bg-white border-2 border-rose-200 p-4 rounded-3xl shadow-sm relative overflow-hidden transition-all duration-300">
              <div className="absolute right-[-10px] top-[-20px] text-8xl opacity-5 pointer-events-none">💸</div>
              <button onClick={() => setShowKhachNo(!showKhachNo)} className="w-full flex justify-between items-center relative z-10 text-left outline-none"><h2 className="font-black text-lg text-rose-600 tracking-tight flex items-center gap-2"><Banknote size={24} /> Báo Động Nợ ({khachNoTien.length})</h2><div className="bg-rose-50 text-rose-600 p-1.5 rounded-full transition-transform">{showKhachNo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div></button>
              {showKhachNo && (
                <div className="flex flex-col gap-3 relative z-10 mt-4 animate-fade-in">
                  {khachNoTien.map(item => {
                    const tongTien = Number(item.giaTien || 0) + Number((item as any).tienDichVuThem || 0); const tienNo = tongTien - Number(item.tienCoc || 0); const ngayMoc = (item as any).ngayCuoi ? (item as any).ngayCuoi : item.ngay; const loaiMoc = (item as any).ngayCuoi ? 'Cưới' : 'Chụp';
                    return (
                      <div key={item.id} className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex justify-between items-center transition-all hover:shadow-md">
                        <div className="min-w-0 pr-2">
                          <div className="font-black text-slate-900 leading-tight break-words">{item.tenKhach} <span className="text-xs text-slate-500 font-bold ml-1 block sm:inline">({item.soDienThoai})</span></div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1.5"><span className="text-[10px] font-bold text-slate-500 bg-white w-fit px-2 py-0.5 rounded-md border border-slate-200">Qua ngày {loaiMoc}: {ngayMoc.split('-').reverse().join('/')}</span><span className="text-sm font-black text-rose-600 w-fit">Nợ: {formatTienInput(String(tienNo))}đ</span></div>
                        </div>
                        {laAdmin && (
                          <button onClick={() => xacNhanThuDuTien(item)} className="bg-rose-600 text-white text-xs font-black px-4 py-3 rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all whitespace-nowrap shrink-0">Đã Thu</button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3 px-1"><h2 className="font-black text-lg text-slate-800 tracking-tight">Tình trạng hôm nay</h2></div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-2 flex items-center justify-between">
              <button onClick={() => { setTab("lich"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex-1 flex flex-col items-center p-3 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 group"><div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"><CalendarDays size={20} strokeWidth={2} /></div><div className="text-2xl font-black text-slate-800 leading-none mb-1">{lichLamViec.filter((item) => item.ngay === homNay()).length}</div><div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">Lịch Chụp</div></button>
              <div className="w-[1px] h-12 bg-slate-100"></div>
              <button onClick={() => { setTab("tinhTrangKH"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex-1 flex flex-col items-center p-3 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 group relative">{canTraHomNay.length > 0 && <span className="absolute top-2 right-4 w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>}<div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${canTraHomNay.length > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400"}`}><ClipboardList size={20} strokeWidth={2} /></div><div className={`text-2xl font-black leading-none mb-1 ${canTraHomNay.length > 0 ? "text-amber-600" : "text-slate-800"}`}>{canTraHomNay.length}</div><div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">Trả đồ</div></button>
              <div className="w-[1px] h-12 bg-slate-100"></div>
              <button onClick={() => { setTab("tinhTrangKH"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex-1 flex flex-col items-center p-3 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 group relative">{quaHan.length > 0 && <span className="absolute top-2 right-4 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>}<div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${quaHan.length > 0 ? "bg-rose-100 text-rose-600" : "bg-slate-50 text-slate-400"}`}><AlertCircle size={20} strokeWidth={2} /></div><div className={`text-2xl font-black leading-none mb-1 ${quaHan.length > 0 ? "text-rose-600" : "text-slate-800"}`}>{quaHan.length}</div><div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">Quá hạn</div></button>
            </div>
          </div>

          <div>
            <h2 className="font-black text-lg mb-3 text-slate-800 ml-1 tracking-tight">Tính năng quản lý</h2>
            <div className="grid grid-cols-2 gap-3">
              {nutMenu.filter((item) => item.key !== "home").filter((item) => !item.adminOnly || laAdmin).map((item) => {
                  const IconComponent = item.icon;
                  return ( 
                    <button key={item.key} onClick={() => { setTab(item.key as any); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex items-center gap-3 transition-all hover:shadow-md hover:border-slate-200 active:scale-95 group"><div className={`p-2.5 rounded-xl bg-slate-50 group-hover:${item.bg} ${item.color} transition-colors duration-300 shrink-0`}><IconComponent size={20} strokeWidth={2} /></div><div className="font-bold text-sm text-slate-700 text-left leading-tight">{item.label}</div></button> 
                  );
              })}
            </div>
          </div>
        </div>
      )}

      <div id="noi-dung-tab" className="mt-2">
        {tab === "lich" && (
          <TabLich 
            homNay={homNay} formatTienInput={formatTienInput} hoSoCuaToi={hoSoCuaToi} 
            themThuHuong={themThuHuong} laAdmin={laAdmin} lichLamViec={lichLamViec} 
            danhSachPhatSinh={danhSachPhatSinh} danhSachThuHuong={danhSachThuHuong} danhSachKhachHang={danhSachKhachHang}
          />
        )}
        
        {tab === "phatSinh" && (
          <TabPhatSinh 
            formatTienInput={formatTienInput} danhSachPhatSinh={danhSachPhatSinh} laAdmin={laAdmin} 
            hoSoCuaToi={hoSoCuaToi} themThuHuong={themThuHuong} danhDauDaTraDo={danhDauDaTraDo} 
            lichLamViec={lichLamViec} danhSachKhachHang={danhSachKhachHang} danhSachThuHuong={danhSachThuHuong}
          />
        )}

        {tab === "chiPhi" && laAdmin && (
          <div className="animate-fade-in">
            {!isChiPhiUnlocked ? (
              <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[2rem] shadow-xl border border-slate-100 max-w-sm mx-auto mt-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-rose-500"></div>
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-inner"><Lock size={40} strokeWidth={2.5}/></div>
                <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Vùng Bảo Mật</h2>
                <p className="text-sm text-slate-500 font-bold mb-6 text-center">Vui lòng nhập mã PIN Admin (8 số) để xem chi phí.</p>
                
                <input 
                  type="password" 
                  maxLength={8}
                  placeholder="Nhập mã PIN..." 
                  value={maPin} 
                  onChange={(e) => setMaPin(e.target.value)} 
                  className="w-full text-center tracking-widest text-2xl font-black bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 mb-4 transition-all" 
                />
                
                <button 
                  onClick={() => { 
                    if (maPin === "10012026") { setIsChiPhiUnlocked(true); setMaPin(""); } 
                    else { toast.error("Sai mã PIN!"); setMaPin(""); } 
                  }} 
                  className="w-full bg-rose-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-rose-200 active:scale-95 transition-all text-lg"
                >
                  MỞ KHÓA
                </button>
                <p className="text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-wider">Mật khẩu: 10012026</p>
              </div>
            ) : (
              <TabChiPhi formatTienInput={formatTienInput} />
            )}
          </div>
        )}

        {tab === "chamCong" && (
          <div className="animate-fade-in">
            {laAdmin && (
              <div className="flex bg-slate-200/60 p-1.5 rounded-2xl mb-4 max-w-md mx-auto shadow-sm">
                <button onClick={() => setSubTabNhanSu("chamCong")} className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${subTabNhanSu === "chamCong" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>🕒 Chấm công</button>
                <button onClick={() => setSubTabNhanSu("danhSach")} className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${subTabNhanSu === "danhSach" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>👥 Hồ sơ nhân sự</button>
              </div>
            )}
            {(!laAdmin || subTabNhanSu === "chamCong") && (<TabChamCong homNay={homNay} hoSoCuaToi={hoSoCuaToi} laAdmin={laAdmin} danhSachChamCong={danhSachChamCong} danhSachTaiKhoan={danhSachTaiKhoan} />)}
            {(laAdmin && subTabNhanSu === "danhSach") && (<TabNhanVien danhSachTaiKhoan={danhSachTaiKhoan} laAdmin={laAdmin} formatTienInput={formatTienInput} />)}
          </div>
        )}
        
        {tab === "luong" && <TabLuong homNay={homNay} uidCuaToi={user?.uid} hoSoCuaToi={hoSoCuaToi} laAdmin={laAdmin} danhSachTaiKhoan={danhSachTaiKhoan} danhSachChamCong={danhSachChamCong} danhSachThuHuong={danhSachThuHuong} themThuHuong={themThuHuong} xoaThuHuong={xoaThuHuong} formatTienInput={formatTienInput} />}

        {tab === "tinhTrangKH" && (
          <div className="animate-fade-in">
            {laAdmin && (
              <div className="flex bg-slate-200/60 p-1.5 rounded-2xl mb-4 max-w-md mx-auto shadow-sm">
                <button onClick={() => setSubTabKhoDo("traDo")} className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${subTabKhoDo === "traDo" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>👗 Kho đồ & Váy</button>
                <button onClick={() => setSubTabKhoDo("goiChup")} className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${subTabKhoDo === "goiChup" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>📸 Gói dịch vụ</button>
              </div>
            )}

            {(!laAdmin || subTabKhoDo === "traDo") && (<TabTinhTrangKH quaHan={quaHan} canTraHomNay={canTraHomNay} dangThue={dangThue} danhDauDaTraDo={danhDauDaTraDo} />)}

            {(laAdmin && subTabKhoDo === "goiChup") && (
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 max-w-3xl mx-auto animate-fade-in">
                <h2 className="font-black text-xl text-slate-800 mb-6 flex items-center gap-2"><Camera size={24} className="text-amber-500"/> Quản lý Thư viện Gói</h2>
                
                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 mb-8 shadow-inner">
                  <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    {dangSuaGoi ? "✏️ Cập nhật gói" : "✨ Thêm gói mới"}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-amber-700 uppercase tracking-widest ml-1 block mb-1.5">Loại hình chụp (*)</label>
                      <select value={theLoaiGoiMoi} onChange={(e) => setTheLoaiGoiMoi(e.target.value)} className="bg-white border border-transparent p-3.5 rounded-xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-amber-200 transition-all shadow-sm">
                        <option value="Chụp ảnh cưới">Chụp ảnh cưới</option>
                        <option value="Phóng sự cưới">Phóng sự cưới</option>
                        <option value="Chụp gia đình">Chụp gia đình</option>
                        <option value="Chụp em bé">Chụp em bé</option>
                        <option value="Chụp thời trang">Chụp thời trang</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-amber-700 uppercase tracking-widest ml-1 block mb-1.5">Tên gói (*)</label>
                      <input type="text" value={tenGoiMoi} onChange={(e) => setTenGoiMoi(e.target.value)} placeholder="Nhập tên gói..." className="bg-white border border-transparent p-3.5 rounded-xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-amber-200 transition-all shadow-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-amber-700 uppercase tracking-widest ml-1 block mb-1.5">Chi tiết sản phẩm</label>
                      <textarea value={chiTietGoiMoi} onChange={(e) => setChiTietGoiMoi(e.target.value)} placeholder="Các sản phẩm khách nhận được..." className="bg-white border border-transparent p-3.5 rounded-xl w-full text-slate-700 font-medium outline-none focus:ring-4 focus:ring-amber-200 transition-all shadow-sm" rows={3}></textarea>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-amber-700 uppercase tracking-widest ml-1 block mb-1.5">Giá tiền mặc định (*)</label>
                      <div className="relative">
                        <input type="text" value={giaGoiMoi} onChange={(e) => setGiaGoiMoi(formatTienInput(e.target.value))} placeholder="0" className="bg-white border border-transparent p-3.5 rounded-xl w-full text-amber-700 font-black outline-none focus:ring-4 focus:ring-amber-200 transition-all shadow-sm pr-8 text-lg" />
                        <span className="absolute right-4 top-4 text-slate-400 font-bold">đ</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    {dangSuaGoi && (
                      <button onClick={() => { setDangSuaGoi(null); setTenGoiMoi(""); setChiTietGoiMoi(""); setGiaGoiMoi(""); setTheLoaiGoiMoi("Chụp ảnh cưới"); }} className="px-6 py-4 bg-white text-slate-500 font-bold rounded-xl active:scale-95 transition-all shadow-sm">Hủy</button>
                    )}
                    <button onClick={luuGoiDichVu} className="flex-1 bg-amber-500 text-white font-black py-4 rounded-xl shadow-lg shadow-amber-200 hover:bg-amber-600 active:scale-95 transition-all">
                      {dangSuaGoi ? "CẬP NHẬT GÓI" : "LƯU VÀO THƯ VIỆN"}
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 ml-1">Kho Gói Chụp ({danhSachGoiDichVu.length})</h3>
                <div>
                  {danhSachGoiDichVu.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm bg-slate-50">Chưa có gói nào được lưu.</div>
                  ) : (
                    Object.entries(goiDichVuĐaNhom).map(([loai, gois]) => (
                      <div key={loai} className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                           <div className="px-3 py-1 bg-slate-800 text-white text-xs font-black uppercase rounded-lg shadow-sm">{loai}</div>
                           <div className="h-px bg-slate-200 flex-1"></div>
                        </div>
                        <div className="grid gap-3">
                          {gois.map(goi => (
                            <div key={goi.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-black text-slate-900 text-base">{goi.tenGoi}</div>
                                <div className="font-black text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg text-xs">{formatTienInput(String(goi.giaTien))}đ</div>
                              </div>
                              {goi.chiTiet && <div className="text-[11px] text-slate-600 font-medium whitespace-pre-line mb-3 bg-slate-50 p-2.5 rounded-xl leading-relaxed">{goi.chiTiet}</div>}
                              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                                <button onClick={() => { setDangSuaGoi(goi.id!); setTenGoiMoi(goi.tenGoi); setTheLoaiGoiMoi((goi as any).theLoai || "Chụp ảnh cưới"); setChiTietGoiMoi(goi.chiTiet || ""); setGiaGoiMoi(formatTienInput(String(goi.giaTien))); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-[10px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-xl active:scale-95 transition-all">✏️ Sửa</button>
                                <button onClick={() => xoaGoiDichVu(goi.id!)} className="text-[10px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-2 rounded-xl active:scale-95 transition-all">🗑 Xóa</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {tab === "khachHang" && laAdmin && (
          <TabKhachHang danhSachKhachHang={danhSachKhachHang} lichLamViec={lichLamViec} danhSachPhatSinh={danhSachPhatSinh} laAdmin={laAdmin} formatTienInput={formatTienInput} />
        )}

        {tab === "thongKe" && laAdmin && (
          <TabThongKe homNay={homNay} thangThongKe={thangThongKe} setThangThongKe={setThangThongKe} lichLamViec={lichLamViec} danhSachPhatSinh={danhSachPhatSinh} danhSachTaiKhoan={danhSachTaiKhoan} danhSachChamCong={danhSachChamCong} danhSachThuHuong={danhSachThuHuong} />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200/50 flex justify-around items-end pt-2 pb-6 md:pb-4 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)] z-40">
        {[
          { key: "home", icon: Home, label: "Trang chủ" }, { key: "lich", icon: CalendarDays, label: "Lịch chụp" },
          { key: "phatSinh", icon: Wallet, label: "Phát sinh" }, { key: "luong", icon: FileSpreadsheet, label: "Quản lý" },
        ].map((nav) => {
          const IconComponent = nav.icon;
          const isActive = tab === nav.key || (nav.key === "luong" && (tab === "chamCong" || tab === "luong" || tab === "thongKe" || tab === "tinhTrangKH" || tab === "khachHang" || tab === "chiPhi"));
          return (
            <button key={nav.key} onClick={() => { setTab(nav.key === "luong" ? "luong" : (nav.key as any)); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex flex-col items-center p-2 w-1/4 relative group transition-all duration-300">
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