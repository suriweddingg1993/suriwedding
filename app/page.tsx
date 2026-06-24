"use client";

import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";

import {
  collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDoc, setDoc
} from "firebase/firestore";

import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut, User,
} from "firebase/auth";

import { db, auth } from "../lib/firebase";
import dynamic from "next/dynamic";

// 1. IMPORT HOOK VÀ TYPES CHÚNG TA VỪA TẠO
import { useAppData } from "../hooks/useAppData";
import { Role, TabType, Lich, TaiKhoan, PhatSinh, ChamCong, ThuHuong } from "../types";

// Lazy Load các Tab
const TabLuong = dynamic(() => import("./components/TabLuong"), { loading: () => <div className="p-10 text-center text-gray-400 font-bold animate-pulse">Đang tải chức năng...</div> });
const TabTinhTrangKH = dynamic(() => import("./components/TabTinhTrangKH"), { loading: () => <div className="p-10 text-center text-gray-400 font-bold animate-pulse">Đang tải chức năng...</div> });
const TabThongKe = dynamic(() => import("./components/TabThongKe"), { loading: () => <div className="p-10 text-center text-gray-400 font-bold animate-pulse">Đang tải chức năng...</div> });
const TabNhanVien = dynamic(() => import("./components/TabNhanVien"), { loading: () => <div className="p-10 text-center text-gray-400 font-bold animate-pulse">Đang tải chức năng...</div> });
const TabPhatSinh = dynamic(() => import("./components/TabPhatSinh"), { loading: () => <div className="p-10 text-center text-gray-400 font-bold animate-pulse">Đang tải chức năng...</div> });
const TabLich = dynamic(() => import("./components/TabLich"), { loading: () => <div className="p-10 text-center text-gray-400 font-bold animate-pulse">Đang tải chức năng...</div> });
const TabChamCong = dynamic(() => import("./components/TabChamCong"), { loading: () => <div className="p-10 text-center text-gray-400 font-bold animate-pulse">Đang tải chức năng...</div> });

const ADMIN_CHINH_EMAIL = "dangngocan93@gmail.com";
const CUA_HANG_LAT = 21.436897313370316;
const CUA_HANG_LNG = 103.68803473004635;
const BAN_KINH_CHO_PHEP = 500;
const APP_VERSION = "v1.0.4";

// CÁC HÀM TIỆN ÍCH
function homNay() { return new Date().toISOString().slice(0, 10); }
function gioHienTai() { return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
function formatTienInput(value: string) { const so = value.replace(/\D/g, ""); return so.replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function chuyenTienVeSo(value: string) { return Number(value.replace(/\./g, "")); }

function tinhKhoangCachMet(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [tab, setTab] = useState<TabType>("home");
  const [coBanCapNhat, setCoBanCapNhat] = useState(false);
  const [hoSoCuaToi, setHoSoCuaToi] = useState<TaiKhoan | null>(null);

  const laAdmin = role === "admin";

  // 2. SỬ DỤNG TRẠM BƠM DỮ LIỆU ĐÃ TẠO (Thay thế cho 6 cái useEffect cũ)
  const { lichLamViec, danhSachPhatSinh, danhSachChamCong, danhSachThuHuong, danhSachTaiKhoan } = useAppData(user, laAdmin);

  // States quản lý Form
  const [ngay, setNgay] = useState("");
  const [gio, setGio] = useState("");
  const [tenKhach, setTenKhach] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [soDienThoai2, setSoDienThoai2] = useState("");
  const [theLoai, setTheLoai] = useState("");
  const [theLoaiKhac, setTheLoaiKhac] = useState("");
  const [goiChup, setGoiChup] = useState("");
  const [giaTien, setGiaTien] = useState("");
  const [timNgay, setTimNgay] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [thangThongKe, setThangThongKe] = useState("");
  const [dangSua, setDangSua] = useState<string | null>(null);

  const [uidNhanVien, setUidNhanVien] = useState("");
  const [emailNhanVien, setEmailNhanVien] = useState("");
  const [hoTenNhanVien, setHoTenNhanVien] = useState("");
  const [soDienThoaiNhanVien, setSoDienThoaiNhanVien] = useState("");
  const [quyenNhanVien, setQuyenNhanVien] = useState<Role>("staff");
  const [dangSuaNhanVien, setDangSuaNhanVien] = useState<string | null>(null);
  const [luongCungNhanVien, setLuongCungNhanVien] = useState("3.000.000");
  const [thuongChuyenCanNhanVien, setThuongChuyenCanNhanVien] = useState("300.000");

  const [psNgay, setPsNgay] = useState(homNay());
  const [psTenKhach, setPsTenKhach] = useState("");
  const [psSoDienThoai, setPsSoDienThoai] = useState("");
  const [psLoai, setPsLoai] = useState("");
  const [psNgayTra, setPsNgayTra] = useState("");
  const [psSoTien, setPsSoTien] = useState("");
  const [psGhiChu, setPsGhiChu] = useState("");

  const [dangLayViTri, setDangLayViTri] = useState(false);
  const [khoangCach, setKhoangCach] = useState<number | null>(null);

  // Lắng nghe cập nhật phiên bản App
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "system", "appVersion"), (snap) => {
      if (snap.exists()) {
        const liveVersion = snap.data().version;
        if (liveVersion && liveVersion !== APP_VERSION) {
          setCoBanCapNhat(true);
        } else {
          setCoBanCapNhat(false);
        }
      } else if (laAdmin) {
        setDoc(doc(db, "system", "appVersion"), { version: APP_VERSION }).catch(e => console.log(e));
      }
    });
    return () => unsub();
  }, [laAdmin]);

  const xacNhanPhatHanh = async () => {
    try {
      await setDoc(doc(db, "system", "appVersion"), { version: APP_VERSION });
      toast.success("Đã phát lệnh ép toàn bộ nhân viên cập nhật app!");
    } catch (error) {
      toast.error("Lỗi khi phát hành cập nhật");
    }
  };

  // Logic xác thực người dùng
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);
          if (currentUser.email === ADMIN_CHINH_EMAIL) {
            try {
              await setDoc(userRef, { email: currentUser.email, role: "admin" }, { merge: true });
            } catch (e) {
              console.warn("Chưa tạo được role trên Firebase, đang duyệt thẳng vào Admin...");
            }
            const adminSnap = await getDoc(userRef);
            const adminData = adminSnap.exists() ? adminSnap.data() : {};
            setHoSoCuaToi({ id: currentUser.uid, email: currentUser.email || "", hoTen: adminData.hoTen || "", soDienThoai: adminData.soDienThoai || "", luongCung: adminData.luongCung || 0, thuongChuyenCan: adminData.thuongChuyenCan || 0, role: "admin" });
            setRole("admin");
          } else {
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const data = userSnap.data();
              setHoSoCuaToi({ id: currentUser.uid, email: data.email || currentUser.email || "", hoTen: data.hoTen || "", soDienThoai: data.soDienThoai || "", luongCung: data.luongCung || 0, thuongChuyenCan: data.thuongChuyenCan || 0, role: data.role === "admin" ? "admin" : "staff" });
              setRole(data.role === "admin" ? "admin" : "staff");
            } else { setHoSoCuaToi(null); setRole("staff"); }
          }
        } else { setHoSoCuaToi(null); setRole("staff"); }
      } catch (error) {
        toast.error("Có lỗi đường truyền mạng. Vẫn đang tải giao diện!");
      } finally {
        setDangTai(false);
      }
    });
    return () => unsub();
  }, []);

  const guiGiaiTrinh = async (ngayGiaiTrinh: string, loai: string, lyDo: string) => {
    if (!user) return;
    const record = danhSachChamCong.find(cc => cc.uid === user.uid && cc.ngay === ngayGiaiTrinh);
    try {
      if (record && record.id) {
        await updateDoc(doc(db, "chamCong", record.id), { loaiGiaiTrinh: loai, lyDoGiaiTrinh: lyDo, trangThaiGiaiTrinh: "Chờ duyệt" });
      } else {
        await addDoc(collection(db, "chamCong"), { uid: user.uid, email: user.email, ngay: ngayGiaiTrinh, loaiGiaiTrinh: loai, lyDoGiaiTrinh: lyDo, trangThaiGiaiTrinh: "Chờ duyệt" });
      }
      toast.success("Đã gửi đơn giải trình thành công!");
    } catch (e) { toast.error("Có lỗi xảy ra khi gửi đơn."); }
  };

  const duyetGiaiTrinh = async (id: string, isApproved: boolean) => {
    try {
      await updateDoc(doc(db, "chamCong", id), { trangThaiGiaiTrinh: isApproved ? "Đã duyệt" : "Từ chối" });
      toast.success(isApproved ? "Đã duyệt đơn!" : "Đã từ chối đơn!");
    } catch (e) { toast.error("Không thể xử lý thao tác."); }
  };

  const themThuHuong = async (uid: string, email: string, hoTen: string, ngayThuHuong: string, moTa: string, soTienStr: string) => {
    if (!ngayThuHuong || !moTa || !soTienStr) { toast.error("Vui lòng nhập đủ thông tin"); return; }
    try {
      await addDoc(collection(db, "thuHuong"), { uid, email, hoTen, ngay: ngayThuHuong, moTa, soTien: chuyenTienVeSo(soTienStr) });
      toast.success(laAdmin ? "Đã cộng tiền cho nhân viên!" : "Đã gửi báo cáo Job thành công!");
    } catch (error) { toast.error("Lỗi hệ thống khi lưu thụ hưởng"); }
  };

  const xoaThuHuong = async (id: string) => {
    if (!confirm("Xóa khoản tiền này khỏi bảng lương?")) return;
    await deleteDoc(doc(db, "thuHuong", id));
    toast.success("Đã xóa khoản thụ hưởng");
  };

  const dangNhap = async () => {
    if (!email || !matKhau) { toast.error("Vui lòng nhập email và mật khẩu"); return; }
    try { await signInWithEmailAndPassword(auth, email, matKhau); toast.success("Đăng nhập thành công!"); } catch (error) { toast.error("Sai email hoặc mật khẩu"); }
  };

  const dangXuat = async () => { await signOut(auth); };

  const resetForm = () => { setNgay(""); setGio(""); setTenKhach(""); setSoDienThoai(""); setSoDienThoai2(""); setTheLoai(""); setTheLoaiKhac(""); setGoiChup(""); setGiaTien(""); setDangSua(null); };

  const themHoacSuaLich = async () => {
    const theLoaiCuoi = theLoai === "Khác" ? theLoaiKhac.trim() : (theLoai || goiChup || "Chụp ảnh");
    if (!ngay || !gio || !tenKhach || !soDienThoai || !goiChup || !giaTien) { toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc"); return; }
    const trungLich = lichLamViec.some((item) => item.ngay === ngay && item.gio === gio && item.id !== dangSua);
    if (trungLich) { toast.error("Khung giờ này đã có lịch"); return; }
    const duLieuLich = { ngay, gio, tenKhach, soDienThoai, soDienThoai2, theLoai: theLoaiCuoi, goiChup, giaTien: chuyenTienVeSo(giaTien), trangThai: "Chưa liên hệ" };
    try {
      if (dangSua) { await updateDoc(doc(db, "lichStudio", dangSua), duLieuLich); toast.success("Đã lưu thay đổi lịch!"); } 
      else { await addDoc(collection(db, "lichStudio"), duLieuLich); toast.success("Đã thêm lịch mới!"); }
      resetForm();
    } catch (error) { toast.error("Có lỗi xảy ra, vui lòng thử lại"); }
  };

  const xoaLich = async (id?: string) => {
    if (!id) return; if (!laAdmin) { toast.error("Chỉ admin mới được xóa lịch"); return; }
    if (!confirm("Bạn có chắc muốn xóa lịch này không?")) return;
    await deleteDoc(doc(db, "lichStudio", id)); toast.success("Đã xóa lịch");
  };

  const suaLich = (item: Lich) => {
    setNgay(item.ngay); setGio(item.gio); setTenKhach(item.tenKhach); setSoDienThoai(item.soDienThoai || ""); setSoDienThoai2(item.soDienThoai2 || ""); setTheLoai(item.theLoai || ""); setTheLoaiKhac(""); setGoiChup(item.goiChup || ""); setGiaTien(formatTienInput(String(item.giaTien || ""))); setDangSua(item.id || null); setTab("lich"); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const capNhatTrangThai = async (id?: string, trangThai?: string) => {
    if (!id || !trangThai) return;
    try { await updateDoc(doc(db, "lichStudio", id), { trangThai }); toast.success("Đã cập nhật trạng thái"); } catch (error) { toast.error("Không cập nhật được trạng thái"); }
  };

  const taoHoSoNhanVien = async () => {
    if (!laAdmin) { toast.error("Chỉ admin mới được quản lý tài khoản"); return; }
    if (!uidNhanVien || !emailNhanVien) { toast.error("Vui lòng nhập UID và email nhân viên"); return; }
    if (emailNhanVien === ADMIN_CHINH_EMAIL && quyenNhanVien !== "admin") { toast.error("Admin chính luôn phải là admin"); return; }
    try {
      await setDoc(doc(db, "users", uidNhanVien), { email: emailNhanVien, hoTen: hoTenNhanVien, soDienThoai: soDienThoaiNhanVien, luongCung: chuyenTienVeSo(luongCungNhanVien), thuongChuyenCan: chuyenTienVeSo(thuongChuyenCanNhanVien), role: emailNhanVien === ADMIN_CHINH_EMAIL ? "admin" : quyenNhanVien }, { merge: true });
      setUidNhanVien(""); setEmailNhanVien(""); setHoTenNhanVien(""); setSoDienThoaiNhanVien(""); setLuongCungNhanVien("3.000.000"); setThuongChuyenCanNhanVien("300.000"); setQuyenNhanVien("staff"); setDangSuaNhanVien(null);
      toast.success(dangSuaNhanVien ? "Đã cập nhật hồ sơ nhân viên" : "Đã tạo hồ sơ tài khoản");
    } catch (error) { toast.error("Không lưu được hồ sơ tài khoản"); }
  };

  const suaHoSoNhanVien = (tk: TaiKhoan) => {
    setDangSuaNhanVien(tk.id); setUidNhanVien(tk.id); setEmailNhanVien(tk.email || ""); setHoTenNhanVien(tk.hoTen || ""); setSoDienThoaiNhanVien(tk.soDienThoai || ""); setLuongCungNhanVien(formatTienInput(String(tk.luongCung || 3000000))); setThuongChuyenCanNhanVien(formatTienInput(String(tk.thuongChuyenCan || 300000))); setQuyenNhanVien(tk.role || "staff"); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const themPhatSinh = async () => {
    if (!psNgay || !psLoai || !psSoTien) { toast.error("Vui lòng nhập ngày, loại phát sinh và số tiền"); return; }
    try {
      await addDoc(collection(db, "phatSinh"), { ngay: psNgay, tenKhach: psTenKhach, soDienThoai: psSoDienThoai, loai: psLoai, ngayTra: psNgayTra, soTien: chuyenTienVeSo(psSoTien), nguoiGhi: user?.email || "", ghiChu: psGhiChu });
      setPsNgay(homNay()); setPsTenKhach(""); setPsSoDienThoai(""); setPsLoai(""); setPsNgayTra(""); setPsSoTien(""); setPsGhiChu(""); toast.success("Đã thêm khoản phát sinh");
    } catch (error) { toast.error("Không thêm được phát sinh"); }
  };

  const xoaPhatSinh = async (id?: string) => {
    if (!id) return; if (!laAdmin) { toast.error("Chỉ admin mới được xóa phát sinh"); return; }
    if (!confirm("Bạn có chắc muốn xóa khoản phát sinh này không?")) return;
    await deleteDoc(doc(db, "phatSinh", id)); toast.success("Đã xóa phát sinh");
  };

  const layViTri = () => {
    return new Promise<{ lat: number; lng: number; distance: number }>((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error("Thiết bị không hỗ trợ lấy vị trí")); return; }
      navigator.geolocation.getCurrentPosition(
        (position) => { const lat = position.coords.latitude; const lng = position.coords.longitude; const distance = tinhKhoangCachMet(lat, lng, CUA_HANG_LAT, CUA_HANG_LNG); resolve({ lat, lng, distance }); },
        () => { reject(new Error("Không lấy được vị trí. Hãy bật định vị.")); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };

  const chamCong = async (loai: "checkIn" | "checkOut") => {
    if (!user) return; setDangLayViTri(true);
    try {
      const viTri = await layViTri(); setKhoangCach(viTri.distance);
      if (viTri.distance > BAN_KINH_CHO_PHEP) { toast.error("Bạn đang ở quá xa studio, vui lòng đến đúng vị trí để chấm công."); return; }
      const ngayHomNay = homNay();
      const banGhiHomNay = danhSachChamCong.find((item) => item.uid === user.uid && item.ngay === ngayHomNay);
      const gioHienTaiCheckIn = gioHienTai(); const [gio, phut] = gioHienTaiCheckIn.split(":").map(Number);
      const soPhutHienTai = gio * 60 + phut; const soPhutChuan = 8 * 60;
      const soPhutMuon = Math.max(0, soPhutHienTai - soPhutChuan); const diMuon = soPhutMuon > 0;

      if (loai === "checkIn") {
        if (banGhiHomNay?.checkIn) { toast.error("Bạn đã Check In hôm nay rồi"); return; }
        if (banGhiHomNay?.id) { await updateDoc(doc(db, "chamCong", banGhiHomNay.id), { checkIn: gioHienTaiCheckIn, checkInLat: viTri.lat, checkInLng: viTri.lng, diMuon, soPhutMuon }); } 
        else { await addDoc(collection(db, "chamCong"), { uid: user.uid, email: user.email || "", ngay: ngayHomNay, checkIn: gioHienTaiCheckIn, checkInLat: viTri.lat, checkInLng: viTri.lng, diMuon, soPhutMuon }); }
        toast.success("Check In thành công!");
      }
      if (loai === "checkOut") {
        if (!banGhiHomNay?.id) { await addDoc(collection(db, "chamCong"), { uid: user.uid, email: user.email || "", ngay: ngayHomNay, checkOut: gioHienTai(), checkOutLat: viTri.lat, checkOutLng: viTri.lng }); toast.success("Check Out thành công!"); return; }
        if (banGhiHomNay.checkOut) { toast.error("Bạn đã Check Out hôm nay rồi"); return; }
        await updateDoc(doc(db, "chamCong", banGhiHomNay.id), { checkOut: gioHienTai(), checkOutLat: viTri.lat, checkOutLng: viTri.lng }); toast.success("Check Out thành công!");
      }
    } catch (error) { toast.error("Không chấm công được"); } finally { setDangLayViTri(false); }
  };

  const danhSachHienThi = lichLamViec.filter((item) => {
    const dungNgay = timNgay ? item.ngay === timNgay : true;
    const keyword = tuKhoa.toLowerCase().trim();
    const dungTuKhoa = keyword ? item.tenKhach.toLowerCase().includes(keyword) || (item.soDienThoai || "").includes(keyword) : true;
    return dungNgay && dungTuKhoa;
  });

  const lichTheoNgay = danhSachHienThi.reduce((acc: Record<string, Lich[]>, item) => {
    if (!acc[item.ngay]) acc[item.ngay] = []; acc[item.ngay].push(item); return acc;
  }, {});

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
  
  const danhDauDaTraDo = async (id: string) => { try { await updateDoc(doc(db, "phatSinh", id), { daTraDo: true }); toast.success("Đã xác nhận trả đồ"); } catch (error) { toast.error("Lỗi khi xác nhận"); } };

  if (dangTai) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Đang tải dữ liệu...</div>;
  if (!user) { 
    return ( 
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-4 text-center">Đăng nhập</h1>
          <div className="grid gap-3">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded" />
            <input type="password" placeholder="Mật khẩu" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} className="border p-2 rounded" />
            <button onClick={dangNhap} className="bg-blue-600 text-white p-2 rounded font-bold">Đăng nhập</button>
          </div>
        </div>
      </div> 
    ); 
  }

  const nutMenu = [
    { key: "home", label: "🏠 Trang chủ", adminOnly: false }, { key: "lich", label: "📅 Lịch làm việc", adminOnly: false }, { key: "phatSinh", label: "💰 Phát sinh", adminOnly: false },
    { key: "tinhTrangKH", label: "📋 Tình trạng KH", adminOnly: false }, { key: "chamCong", label: "⏰ Chấm công", adminOnly: false }, { key: "luong", label: "💰 Bảng Lương", adminOnly: false },
    { key: "nhanVien", label: "👥 Nhân sự", adminOnly: true }, { key: "thongKe", label: "📊 Thống kê", adminOnly: true },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-24">
      {coBanCapNhat && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-300 p-4 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm z-50 relative">
          <div className="flex items-center gap-3">
            <div className="text-3xl drop-shadow-sm">🔄</div> 
            <div>
              <div className="font-bold text-yellow-800 text-lg">App có bản cập nhật mới!</div>
              <div className="text-sm text-yellow-700 font-medium">Vui lòng cập nhật ngay để app hoạt động chuẩn xác nhất.</div>
            </div>
          </div>
          <div className="flex gap-2">
            {laAdmin && (
               <button onClick={xacNhanPhatHanh} className="flex-1 md:flex-none bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-green-700 active:scale-95 transition-all">
                 Phát hành bản này
               </button>
            )}
            <button onClick={() => window.location.reload()} className="flex-1 md:flex-none bg-yellow-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-yellow-600 active:scale-95 transition-all">
              Cập nhật ngay
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Suri Wedding</h1>
            <button 
              onClick={() => window.location.reload()} 
              className="w-8 h-8 bg-blue-50 text-blue-600 flex items-center justify-center rounded-full shadow-sm hover:bg-blue-100 active:scale-75 transition-all text-sm"
              title="Làm mới dữ liệu"
            >
              🔄
            </button>
          </div>
          <div className="text-sm text-gray-500 font-medium mt-1">
            {user.email} • Quyền: <span className={laAdmin ? "text-blue-600 font-bold" : "text-gray-700 font-bold"}>{laAdmin ? "Admin" : "Nhân viên"}</span>
          </div>
        </div>
        <button onClick={dangXuat} className="bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm">
          Đăng xuất
        </button>
      </div>

      {tab === "home" && (
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <h2 className="font-bold text-lg mb-4 text-gray-800">⚠️ Việc cần chú ý hôm nay</h2>
            <div className="space-y-3 text-sm">
              <button onClick={() => { setTab("tinhTrangKH"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full flex justify-between items-center p-3 bg-red-50 rounded-xl hover:bg-red-100 active:scale-[0.98] transition-all"><span className="text-red-700 font-medium">🔴 Khách quá hạn trả đồ</span><b className="text-red-700 text-lg">{quaHan.length}</b></button>
              <button onClick={() => { setTab("tinhTrangKH"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full flex justify-between items-center p-3 bg-yellow-50 rounded-xl hover:bg-yellow-100 active:scale-[0.98] transition-all"><span className="text-yellow-700 font-medium">🟡 Khách trả hôm nay</span><b className="text-yellow-700 text-lg">{canTraHomNay.length}</b></button>
              <button onClick={() => { setTab("lich"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full flex justify-between items-center p-3 bg-blue-50 rounded-xl hover:bg-blue-100 active:scale-[0.98] transition-all"><span className="text-blue-700 font-medium">📅 Lịch hôm nay</span><b className="text-blue-700 text-lg">{lichLamViec.filter((item) => item.ngay === homNay()).length}</b></button>
              <button onClick={() => { setTab("chamCong"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full flex justify-between items-center p-3 bg-green-50 rounded-xl hover:bg-green-100 active:scale-[0.98] transition-all"><span className="text-green-700 font-medium">⏰ Chấm công hôm nay</span><b className="text-green-700">{chamCongHomNay?.checkIn ? "Đã Check-in" : "Chưa Check-in"}</b></button>
            </div>
          </div>
          <h2 className="font-bold text-lg mb-3 text-gray-800 ml-1">Cửa sổ tính năng</h2>
          <div className="grid grid-cols-2 gap-4">
            {nutMenu.filter((item) => item.key !== "home").filter((item) => !item.adminOnly || laAdmin).map((item) => {
                const [icon, ...textParts] = item.label.split(" "); const text = textParts.join(" ");
                return ( <button key={item.key} onClick={() => { setTab(item.key as TabType); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center gap-3 transition hover:shadow-md active:scale-95"><div className="text-4xl mb-1 drop-shadow-sm">{icon}</div><div className="font-semibold text-center text-sm text-gray-700">{text}</div></button> );
            })}
          </div>
        </div>
      )}

      <div id="noi-dung-tab" className="mt-4">
        {tab === "lich" && <TabLich dangSua={dangSua} ngay={ngay} setNgay={setNgay} gio={gio} setGio={setGio} tenKhach={tenKhach} setTenKhach={setTenKhach} soDienThoai={soDienThoai} setSoDienThoai={setSoDienThoai} soDienThoai2={soDienThoai2} setSoDienThoai2={setSoDienThoai2} theLoai={theLoai} setTheLoai={setTheLoai} theLoaiKhac={theLoaiKhac} setTheLoaiKhac={setTheLoaiKhac} goiChup={goiChup} setGoiChup={setGoiChup} giaTien={giaTien} setGiaTien={setGiaTien} formatTienInput={formatTienInput} themHoacSuaLich={themHoacSuaLich} resetForm={resetForm} lichTheoNgay={lichTheoNgay} suaLich={suaLich} capNhatTrangThai={capNhatTrangThai} hoSoCuaToi={hoSoCuaToi} themThuHuong={themThuHuong} laAdmin={laAdmin} xoaLich={xoaLich} lichLamViec={lichLamViec} />}
        {tab === "phatSinh" && <TabPhatSinh psNgay={psNgay} setPsNgay={setPsNgay} psTenKhach={psTenKhach} setPsTenKhach={setPsTenKhach} psSoDienThoai={psSoDienThoai} setPsSoDienThoai={setPsSoDienThoai} psLoai={psLoai} setPsLoai={setPsLoai} psNgayTra={psNgayTra} setPsNgayTra={setPsNgayTra} psSoTien={psSoTien} setPsSoTien={setPsSoTien} psGhiChu={psGhiChu} setPsGhiChu={setPsGhiChu} formatTienInput={formatTienInput} themPhatSinh={themPhatSinh} danhSachPhatSinh={danhSachPhatSinh} laAdmin={laAdmin} xoaPhatSinh={xoaPhatSinh} hoSoCuaToi={hoSoCuaToi} themThuHuong={themThuHuong} danhDauDaTraDo={danhDauDaTraDo} />}
        {tab === "chamCong" && <TabChamCong homNay={homNay} BAN_KINH_CHO_PHEP={BAN_KINH_CHO_PHEP} khoangCach={khoangCach} chamCongHomNay={chamCongHomNay} chamCong={chamCong} dangLayViTri={dangLayViTri} laAdmin={laAdmin} chamCongHienThi={chamCongHienThi} guiGiaiTrinh={guiGiaiTrinh} duyetGiaiTrinh={duyetGiaiTrinh} />}
        {tab === "luong" && <TabLuong homNay={homNay} uidCuaToi={user?.uid} hoSoCuaToi={hoSoCuaToi} laAdmin={laAdmin} danhSachTaiKhoan={danhSachTaiKhoan} danhSachChamCong={danhSachChamCong} danhSachThuHuong={danhSachThuHuong} themThuHuong={themThuHuong} xoaThuHuong={xoaThuHuong} formatTienInput={formatTienInput} />}
        {tab === "nhanVien" && laAdmin && <TabNhanVien uidNhanVien={uidNhanVien} setUidNhanVien={setUidNhanVien} emailNhanVien={emailNhanVien} setEmailNhanVien={setEmailNhanVien} hoTenNhanVien={hoTenNhanVien} setHoTenNhanVien={setHoTenNhanVien} soDienThoaiNhanVien={soDienThoaiNhanVien} setSoDienThoaiNhanVien={setSoDienThoaiNhanVien} luongCungNhanVien={luongCungNhanVien} setLuongCungNhanVien={setLuongCungNhanVien} thuongChuyenCanNhanVien={thuongChuyenCanNhanVien} setThuongChuyenCanNhanVien={setThuongChuyenCanNhanVien} quyenNhanVien={quyenNhanVien} setQuyenNhanVien={setQuyenNhanVien} taoHoSoNhanVien={taoHoSoNhanVien} dangSuaNhanVien={dangSuaNhanVien} danhSachTaiKhoan={danhSachTaiKhoan} laAdmin={laAdmin} suaHoSoNhanVien={suaHoSoNhanVien} formatTienInput={formatTienInput} />}
        {tab === "tinhTrangKH" && <TabTinhTrangKH quaHan={quaHan} canTraHomNay={canTraHomNay} dangThue={dangThue} danhDauDaTraDo={danhDauDaTraDo} />}
        {tab === "thongKe" && laAdmin && <TabThongKe thangThongKe={thangThongKe} setThangThongKe={setThangThongKe} lichTrongThang={lichTrongThang} tongThuNhapLich={tongThuNhapLich} tongThuNhapPhatSinh={tongThuNhapPhatSinh} tongThuNhap={tongThuNhap} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 flex justify-around items-center pt-3 pb-6 md:pb-3 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-40">
        {[
          { key: "home", icon: "🏠", label: "Trang chủ" },
          { key: "lich", icon: "📅", label: "Lịch chụp" },
          { key: "phatSinh", icon: "💰", label: "Thu Chi" },
          { key: "chamCong", icon: "⏰", label: "Chấm công" },
        ].map((nav) => (
          <button key={nav.key} onClick={() => { setTab(nav.key as TabType); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex flex-col items-center p-2 w-1/4 relative group">
            {tab === nav.key && <div className="absolute top-0 w-8 h-1 bg-blue-600 rounded-b-full"></div>}
            <span className={`text-2xl mb-1 transition-transform ${tab === nav.key ? "scale-110 drop-shadow-md" : "group-hover:scale-110"}`}>{nav.icon}</span>
            <span className={`text-[10px] font-bold ${tab === nav.key ? "text-blue-600" : "text-gray-500"}`}>{nav.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}