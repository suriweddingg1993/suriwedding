import { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { Lich, TaiKhoan, GoiDichVu, PhatSinh, ThuHuong, KhachHang } from "../../types";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, increment } from "firebase/firestore";
import { db } from "../../lib/firebase";

import ModalHoaDon from "./ModalHoaDon";
import ModalBaoCao from "./ModalBaoCao";
import ModalPhanCong from "./ModalPhanCong"; 
import NutCopy from "./NutCopy"; 
import { CalendarDays, Plus, Phone, Search, Clock, Edit, Trash2, CheckCircle2, UserCheck, ChevronDown, HandCoins, Landmark } from "lucide-react";

function chuyenTienVeSo(value: string) { 
  if (!value) return 0;
  return Number(value.toString().replace(/\./g, "")); 
}

// Hàm này giúp đồng bộ những tên gói cũ lúc trước nhân viên nhập sai 
const chuanHoaTheLoai = (loai: string) => {
    if (!loai) return "Khác";
    if (loai === "Phóng sự cưới") return "Chụp phóng sự cưới";
    if (loai === "Chụp em bé") return "Chụp trẻ em";
    if (loai === "Chụp thời trang") return "Chụp beauty";
    return loai;
};

interface TabLichProps {
  homNay: () => string;
  formatTienInput: (val: string) => string;
  hoSoCuaToi: TaiKhoan | null;
  themThuHuong: (uid: string, email: string, hoTen: string, ngay: string, moTa: string, soTien: string) => Promise<void>;
  laAdmin: boolean;
  lichLamViec: Lich[]; 
  danhSachPhatSinh: PhatSinh[]; 
  danhSachThuHuong: ThuHuong[];
  danhSachKhachHang: KhachHang[]; 
  danhSachSanPham?: any[]; 
  lichChuyenTuHome?: Lich | null;
  clearLichChuyenTuHome?: () => void;
}

export default function TabLich({
  homNay, formatTienInput, hoSoCuaToi, themThuHuong, laAdmin, 
  lichLamViec, danhSachPhatSinh, danhSachThuHuong, danhSachKhachHang,
  danhSachSanPham = [], lichChuyenTuHome, clearLichChuyenTuHome
}: TabLichProps) {
  
  const localToday = homNay();
  const [selectedDate, setSelectedDate] = useState(localToday);
  const [currentMonth, setCurrentMonth] = useState(new Date(localToday));
  
  const [dangSua, setDangSua] = useState<string | null>(null);
  const [khachHangId, setKhachHangId] = useState<string | null>(null);
  const [ngay, setNgay] = useState(localToday);
  const [ngayCuoi, setNgayCuoi] = useState("");
  const [gio, setGio] = useState("08:00");
  const [tenKhach, setTenKhach] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [soDienThoai2, setSoDienThoai2] = useState("");
  
  const [goiChup, setGoiChup] = useState("");
  const [chiTietGoi, setChiTietGoi] = useState("");
  const [giaTien, setGiaTien] = useState("");
  
  const [theLoaiDaChon, setTheLoaiDaChon] = useState(""); 
  const [theLoaiKhac, setTheLoaiKhac] = useState("");
  
  const [danhSachThanhToan, setDanhSachThanhToan] = useState<{idStr: string, soTien: string, phuongThuc: "Tiền mặt" | "Chuyển khoản", ngay: string, daNopTien: boolean}[]>([]);

  const [danhSachDichVuThem, setDanhSachDichVuThem] = useState<{idStr: string, ten: string, gia: string}[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [showHoaHongModal, setShowHoaHongModal] = useState(false);
  const [showPhanCongModal, setShowPhanCongModal] = useState(false); 
  const [lichDangChon, setLichDangChon] = useState<Lich | null>(null);
  
  const [tienHoaHong, setTienHoaHong] = useState("");
  const [vaiTro, setVaiTro] = useState("Chụp ảnh");
  const [tuKhoa, setTuKhoa] = useState(""); 
  
  const [danhSachGoiDichVu, setDanhSachGoiDichVu] = useState<GoiDichVu[]>([]);
  
  const [hoaDonData, setHoaDonData] = useState<Lich | null>(null);
  const [hdDiaChi, setHdDiaChi] = useState("");

  const danhSachLichRef = useRef<HTMLDivElement>(null);

  const lichTheoNgay = useMemo(() => {
    return lichLamViec.reduce((acc: Record<string, Lich[]>, item) => {
      if (!acc[item.ngay]) acc[item.ngay] = [];
      acc[item.ngay].push(item);
      return acc;
    }, {});
  }, [lichLamViec]);

  useEffect(() => {
    if (showModal || showHoaHongModal || showPhanCongModal || hoaDonData) { document.body.style.overflow = "hidden"; } 
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [showModal, showHoaHongModal, showPhanCongModal, hoaDonData]);

  useEffect(() => {
    const unsubGoi = onSnapshot(collection(db, "goiDichVu"), (snap) => { setDanhSachGoiDichVu(snap.docs.map(d => ({ id: d.id, ...d.data() })) as GoiDichVu[]); });
    return () => unsubGoi();
  }, []);

  useEffect(() => {
    if (!dangSua && soDienThoai.length >= 9) {
      const matches = danhSachKhachHang.filter(kh => kh.soDienThoai === soDienThoai);
      if (matches.length === 1 && khachHangId !== "NEW") {
        setKhachHangId(matches[0].id!); setTenKhach(matches[0].tenKhach);
        if (matches[0].soDienThoai2) setSoDienThoai2(matches[0].soDienThoai2);
      } else if (matches.length === 0) {
        setKhachHangId(null);
      }
    } else if (soDienThoai.length < 9) { 
      setKhachHangId(null); 
    }
  }, [soDienThoai, danhSachKhachHang, dangSua]);

  const year = currentMonth.getFullYear(); const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1); const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7; 
  const daysArray: (string | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) { daysArray.push(null); }
  for (let i = 1; i <= daysInMonth; i++) { daysArray.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`); }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToToday = () => { setCurrentMonth(new Date(localToday)); setSelectedDate(localToday); setTuKhoa(""); };
  const chonNgayVaCuon = (dateStr: string) => { setSelectedDate(dateStr); setTimeout(() => { danhSachLichRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150); };

  const xacNhanNhanTien = () => {
    if (!tienHoaHong) { toast.error("Vui lòng nhập số tiền!"); return; }
    if (!hoSoCuaToi) { toast.error("Không tìm thấy thông tin tài khoản!"); return; }
    if (!lichDangChon) return;
    const moTaJob = `[${vaiTro}] KH: ${lichDangChon.tenKhach} (${lichDangChon.theLoai})`;
    const daBaoCao = danhSachThuHuong.some(th => th.uid === hoSoCuaToi.id && th.moTa === moTaJob);
    if (daBaoCao) { toast.error("Bạn đã nhận hoa hồng cho công đoạn này rồi!"); return; }
    themThuHuong(hoSoCuaToi.id, hoSoCuaToi.email, hoSoCuaToi.hoTen || "", lichDangChon.ngay, moTaJob, tienHoaHong);
    setShowHoaHongModal(false); setTienHoaHong(""); setVaiTro("Chụp ảnh");
  };

  const copyNhacLich = (item: Lich) => {
    const ngayChup = item.ngay.split('-').reverse().join('/');
    const text = `Dạ Suri Wedding chào anh/chị ${item.tenKhach || ""}.\n\nEm nhắn tin báo mình có lịch hẹn (${item.theLoai}) vào lúc ⏰ ${item.gio} ngày ${ngayChup}.\n\nAnh/chị nhớ sắp xếp thời gian đến đúng giờ để có những bức ảnh đẹp nhất nhé. Em cảm ơn ạ!`;
    navigator.clipboard.writeText(text); toast.success("Đã copy tin nhắn nhắc khách!");
  };

  const resetForm = () => { 
    setDangSua(null); setKhachHangId(null); setNgay(selectedDate); setNgayCuoi(""); setGio("08:00"); 
    setTenKhach(""); setSoDienThoai(""); setSoDienThoai2(""); 
    setGoiChup(""); setChiTietGoi(""); setGiaTien(""); 
    setTheLoaiDaChon(""); setTheLoaiKhac(""); 
    setDanhSachThanhToan([]); 
    setDanhSachDichVuThem([]); 
  };

  const openAddModal = () => { resetForm(); setShowModal(true); };

  const suaLich = (item: any) => { 
    setNgay(item.ngay); setGio(item.gio); setTenKhach(item.tenKhach); setSoDienThoai(item.soDienThoai || ""); 
    setSoDienThoai2(item.soDienThoai2 || ""); 
    setGoiChup(item.goiChup || item.theLoai || ""); setChiTietGoi(item.chiTietGoi || ""); setGiaTien(formatTienInput(String(item.giaTien || ""))); 
    
    const standardTypes = ["Chụp ảnh cưới", "Chụp phóng sự cưới", "Chụp gia đình", "Chụp trẻ em", "Chụp beauty", "Chụp sự kiện", "Chụp chân dung", "Chụp kỷ yếu"];
    const loaiItem = item.theLoai || "";
    if (standardTypes.includes(loaiItem)) {
      setTheLoaiDaChon(loaiItem);
      setTheLoaiKhac("");
    } else {
      setTheLoaiDaChon("Khác");
      setTheLoaiKhac(loaiItem === "Khác" ? "" : loaiItem);
    }

    setNgayCuoi(item.ngayCuoi || ""); 

    let arrThanhToan = [];
    if (item.danhSachThanhToan && item.danhSachThanhToan.length > 0) {
        arrThanhToan = item.danhSachThanhToan.map((t: any) => ({
            idStr: t.idStr || Date.now().toString() + Math.random(),
            soTien: formatTienInput(String(t.soTien)),
            phuongThuc: t.phuongThuc || "Chuyển khoản",
            ngay: t.ngay || item.ngay,
            daNopTien: t.daNopTien || false
        }));
    } else {
        if (item.tienCoc > 0) {
            arrThanhToan.push({ idStr: "legacy_coc", soTien: formatTienInput(String(item.tienCoc)), phuongThuc: item.phuongThucCoc || "Chuyển khoản", ngay: item.ngayGhiNhanCoc || item.ngay, daNopTien: item.daNopTienCoc || false });
        }
        if (item.tienThanhToanThem > 0) {
            arrThanhToan.push({ idStr: "legacy_them", soTien: formatTienInput(String(item.tienThanhToanThem)), phuongThuc: item.phuongThucThanhToanThem || "Chuyển khoản", ngay: item.ngayThanhToanThem || item.ngay, daNopTien: item.daNopTienThanhToanThem || false });
        }
    }
    setDanhSachThanhToan(arrThanhToan as any);

    if (item.chiTietDichVuThem && Array.isArray(item.chiTietDichVuThem)) {
      setDanhSachDichVuThem(item.chiTietDichVuThem.map((d: any, idx: number) => ({ idStr: idx.toString(), ten: d.ten, gia: formatTienInput(String(d.gia)) })));
    } else if (item.dichVuThem) {
      setDanhSachDichVuThem([{ idStr: "old", ten: item.dichVuThem, gia: formatTienInput(String(item.tienDichVuThem || 0)) }]);
    } else {
      setDanhSachDichVuThem([]);
    }

    setDangSua(item.id || null); setKhachHangId(item.khachHangId || null);
    setShowModal(true); 
  };

  useEffect(() => {
    if (lichChuyenTuHome) {
      setSelectedDate(lichChuyenTuHome.ngay);
      setCurrentMonth(new Date(lichChuyenTuHome.ngay));
      suaLich(lichChuyenTuHome);
      if (clearLichChuyenTuHome) clearLichChuyenTuHome();
    }
  }, [lichChuyenTuHome]);

  const xoaLich = async (id: string) => { 
    if (!laAdmin) { toast.error("Chỉ admin mới được xóa lịch"); return; } 
    if (!confirm("Xóa lịch này?")) return; 
    
    const oldLich = lichLamViec.find(l => l.id === id);
    if (oldLich && oldLich.khachHangId) {
        const tongTienCu = (Number(oldLich.giaTien || 0)) + (Number((oldLich as any).tienDichVuThem || 0));
        try { await updateDoc(doc(db, "khachHang", oldLich.khachHangId), { tongChiTieu: increment(-tongTienCu), soLanDen: increment(-1) }); } catch(e){}
    }

    await deleteDoc(doc(db, "lichStudio", id)); toast.success("Đã xóa"); 
  };
  
  const capNhatTrangThai = async (id: string, trangThai: string) => { try { await updateDoc(doc(db, "lichStudio", id), { trangThai }); toast.success("Đã cập nhật"); } catch (error) { toast.error("Lỗi cập nhật"); } };

  const capNhatDichVuPhu = (idStr: string, field: 'ten' | 'gia', val: string) => {
    const newDs = danhSachDichVuThem.map(d => {
       if(d.idStr !== idStr) return d;
       let updated = { ...d, [field]: val };
       if (field === 'ten') {
          const sp = danhSachSanPham.find(s => s.tenSanPham === val);
          if (sp) updated.gia = formatTienInput(String(sp.giaTien));
       }
       return updated;
    });
    setDanhSachDichVuThem(newDs);
  };

  const capNhatThanhToan = (idStr: string, field: 'soTien' | 'phuongThuc' | 'ngay', val: string) => {
    setDanhSachThanhToan(danhSachThanhToan.map(tt => tt.idStr === idStr ? { ...tt, [field]: val } : tt));
  }

  const handleLuuLichThongMinh = async () => {
    if (!ngay || !gio || !tenKhach || !soDienThoai) { 
      toast.error("Vui lòng điền đủ Ngày, Giờ, SĐT và Tên khách hàng!"); return; 
    }

    const lichCungNgay = lichLamViec.filter((item) => item.ngay === ngay && item.id !== dangSua);
    const [h1, m1] = gio.split(":").map(Number);
    const thoiGianMoi = h1 * 60 + m1;

    const biTrung = lichCungNgay.find((item) => {
      const [h2, m2] = item.gio.split(":").map(Number);
      const thoiGianCu = h2 * 60 + m2;
      return Math.abs(thoiGianMoi - thoiGianCu) < 120;
    });

    if (biTrung) {
      const dongY = confirm(`⚠️ CẢNH BÁO: Ca chụp này quá sát giờ với khách "${biTrung.tenKhach}" lúc ${biTrung.gio}.\n\nBạn có chắc chắn nhận lịch không?`);
      if (!dongY) return;
    }

    const tongTienDichVuPhu = danhSachDichVuThem.reduce((acc, curr) => acc + chuyenTienVeSo(curr.gia), 0);
    const chuoiDichVuPhu = danhSachDichVuThem.map(d => d.ten).filter(Boolean).join(", ");
    
    let finalKhId = khachHangId === "NEW" ? null : khachHangId;
    const tongTienMoi = chuyenTienVeSo(giaTien) + tongTienDichVuPhu;

    const finalTheLoai = theLoaiDaChon === "Khác" && theLoaiKhac.trim() !== "" ? theLoaiKhac.trim() : (theLoaiDaChon || "Khác");
    const isKhongCanNgayCuoi = ["Chụp gia đình", "Chụp trẻ em", "Chụp beauty", "Chụp sự kiện", "Chụp chân dung", "Chụp kỷ yếu"].includes(finalTheLoai);

    try {
      if (!finalKhId && !dangSua) {
        try {
          const khRef = await addDoc(collection(db, "khachHang"), {
            tenKhach: tenKhach || "", soDienThoai: soDienThoai || "", soDienThoai2: soDienThoai2 || "", nguonKhach: "Tự động tạo từ Lịch", ngayTao: new Date().toISOString(),
            tongChiTieu: tongTienMoi, soLanDen: 1 
          });
          finalKhId = khRef.id;
        } catch (crmError) { console.warn("⚠️ Bỏ qua lỗi CRM:", crmError); }
      }
      
      const oldItem = dangSua ? lichLamViec.find(l => l.id === dangSua) : null;
      
      const duLieuLich: any = { 
        khachHangId: finalKhId || null, ngay: ngay || "", gio: gio || "", tenKhach: tenKhach || "", soDienThoai: soDienThoai || "", soDienThoai2: soDienThoai2 || "", 
        theLoai: finalTheLoai, goiChup: goiChup || "", chiTietGoi: chiTietGoi || "", 
        giaTien: chuyenTienVeSo(giaTien) || 0, 
        
        tienCoc: 0, 
        tienThanhToanThem: 0, 
        danhSachThanhToan: danhSachThanhToan.map(t => ({
            idStr: t.idStr,
            soTien: chuyenTienVeSo(t.soTien),
            phuongThuc: t.phuongThuc,
            ngay: t.ngay,
            daNopTien: t.daNopTien
        })),

        dichVuThem: chuoiDichVuPhu, tienDichVuThem: tongTienDichVuPhu, 
        chiTietDichVuThem: danhSachDichVuThem.map(d => ({ ten: d.ten, gia: chuyenTienVeSo(d.gia) })), 
        ngayCuoi: isKhongCanNgayCuoi ? "" : (ngayCuoi || "") 
      };

      if (!dangSua) { 
        duLieuLich.trangThai = "Đã chốt lịch"; 
        await addDoc(collection(db, "lichStudio"), duLieuLich); 
        if (finalKhId && khachHangId !== "NEW") {
            try { await updateDoc(doc(db, "khachHang", finalKhId), { tongChiTieu: increment(tongTienMoi), soLanDen: increment(1) }); } catch(e){}
        }
        toast.success("Đã thêm lịch thành công!"); 
      } 
      else { 
        const tongTienCu = (Number(oldItem?.giaTien || 0)) + (Number((oldItem as any)?.tienDichVuThem || 0));
        const chenhLech = tongTienMoi - tongTienCu;

        await updateDoc(doc(db, "lichStudio", dangSua), duLieuLich); 
        if (finalKhId && chenhLech !== 0) {
            try { await updateDoc(doc(db, "khachHang", finalKhId), { tongChiTieu: increment(chenhLech) }); } catch(e){}
        }
        toast.success("Đã lưu thay đổi!"); 
      } 
      setShowModal(false); resetForm();
    } catch (error: any) { toast.error("Lỗi: " + (error?.message || "Không xác định")); }
  };

  // ĐÃ SỬA: Lọc danh sách gói chụp theo đúng thể loại đang được chọn (Phiên dịch các gói cũ)
  const danhSachGoiLocTheoTheLoai = danhSachGoiDichVu.filter(goi => {
     if (goiChup && goi.tenGoi === goiChup) return true;
     if (!theLoaiDaChon) return true;
     
     const loaiGoi = chuanHoaTheLoai((goi as any).theLoai);
     if (theLoaiDaChon === "Khác") return loaiGoi === "Khác";
     return loaiGoi === theLoaiDaChon;
  });

  const groupedPackagesLich = danhSachGoiLocTheoTheLoai.reduce((acc, goi) => {
    const loai = chuanHoaTheLoai((goi as any).theLoai);
    if (!acc[loai]) acc[loai] = [];
    acc[loai].push(goi);
    return acc;
  }, {} as Record<string, GoiDichVu[]>);

  let dsLichNgayNay: Lich[] = [];
  if (tuKhoa.trim()) {
     const kw = tuKhoa.toLowerCase().trim();
     dsLichNgayNay = (lichLamViec || []).filter((item: Lich) => (item.tenKhach || "").toLowerCase().includes(kw) || (item.soDienThoai || "").includes(kw) || (item.soDienThoai2 || "").includes(kw));
  } else { dsLichNgayNay = lichTheoNgay[selectedDate] || []; }

  const hienNgayCuoi = !["Chụp gia đình", "Chụp trẻ em", "Chụp beauty", "Chụp sự kiện", "Chụp chân dung", "Chụp kỷ yếu"].includes(theLoaiDaChon);

  return (
    <div className="pb-24 px-2 pt-2">
      <div className="mb-4">
        <input type="text" placeholder="🔍 Tìm nhanh Tên khách hoặc Số điện thoại..." value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} className="w-full bg-white border border-gray-200 p-4 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-700 transition-all" />
      </div>

      {!tuKhoa.trim() && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <button onClick={goToToday} className="text-xs font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-xl active:scale-95 transition-all">Hôm nay</button>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl hover:bg-gray-100 text-gray-600 font-bold active:scale-90 transition-all">◀</button>
              <div className="font-black text-gray-800 text-sm uppercase tracking-wide w-28 text-center">Th {month + 1}, {year}</div>
              <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl hover:bg-gray-100 text-gray-600 font-bold active:scale-90 transition-all">▶</button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (<div key={d} className="text-[10px] font-black text-gray-400 uppercase mb-2">{d}</div>))}
            {daysArray.map((dateStr, idx) => {
              if (!dateStr) return <div key={idx} className="p-2"></div>;
              const isToday = dateStr === localToday; const isSelected = dateStr === selectedDate; const hasLich = (lichTheoNgay[dateStr] || []).length > 0;
              return (
                <div key={dateStr} className="flex flex-col items-center justify-start h-12 relative group">
                  <button onClick={() => chonNgayVaCuon(dateStr)} className={`relative w-10 h-10 flex items-center justify-center rounded-2xl text-sm transition-all ${isSelected ? "bg-blue-600 text-white font-black shadow-lg shadow-blue-200 scale-105" : isToday ? "bg-blue-50 text-blue-700 font-black" : "hover:bg-gray-50 text-gray-700 font-bold"}`}>{parseInt(dateStr.split('-')[2])}</button>
                  <div className="mt-1 flex gap-1 h-1.5 absolute bottom-[-4px]">{hasLich && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-300" : "bg-blue-500 shadow-sm shadow-blue-200"}`}></span>}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div ref={danhSachLichRef} className="mb-4 flex justify-between items-end px-1 mt-6 scroll-mt-4">
        <div><h3 className="font-black text-gray-800 text-lg">{tuKhoa.trim() ? "Kết quả tìm kiếm" : "Lịch chụp Studio"}</h3><p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">{tuKhoa.trim() ? `Từ khóa: "${tuKhoa}"` : `Ngày ${selectedDate.split("-").reverse().join("/")}`}</p></div>
        <div className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">{dsLichNgayNay.length} Kết quả</div>
      </div>

      <div className="space-y-4">
        {dsLichNgayNay.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4 opacity-50 grayscale">😴</div>
            <h4 className="text-gray-600 font-bold text-base">{tuKhoa.trim() ? "Không tìm thấy khách hàng" : "Lịch trống"}</h4>
          </div>
        ) : (
          [...dsLichNgayNay].sort((a, b) => a.gio.localeCompare(b.gio)).map((item: Lich) => {
            
            const trangThaiColors: Record<string, string> = { 
              "Chưa liên hệ": "bg-slate-100 text-slate-600", "Đã chốt lịch": "bg-blue-100 text-blue-700",
              "Đã nhắc lịch": "bg-amber-100 text-amber-700", "Đã chụp xong": "bg-purple-100 text-purple-700",
              "Hoàn thành": "bg-emerald-100 text-emerald-700", "Hủy lịch": "bg-rose-100 text-rose-600" 
            };
            
            const tongTienCaLich = (item.giaTien || 0) + ((item as any).tienDichVuThem || 0);
            
            const tienDaThu = (item.danhSachThanhToan && item.danhSachThanhToan.length > 0) 
                ? item.danhSachThanhToan.reduce((a, b) => a + (b.soTien || 0), 0) 
                : (item.tienCoc || 0) + (item.tienThanhToanThem || 0);

            const tienNo = tongTienCaLich - tienDaThu;
            const currentTrangThai = item.trangThai || "Đã chốt lịch";

            const laThangCu = item.ngay.substring(0, 7) < localToday.substring(0, 7);
            const daHoanThanh = currentTrangThai === "Hoàn thành";
            
            const biKhoaVoiNhanVien = laThangCu && !laAdmin && tienNo <= 0;
            
            const phanCongData = (item as any).phanCong;

            return (
              <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md group relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-500"></div>
                <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4 ml-2">
                  <div className="pr-2">
                    <div className="flex items-center gap-2 mb-2"><span className="bg-blue-50 text-blue-600 text-xs font-black px-2.5 py-1 rounded-lg">⏰ {item.gio}</span><span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${trangThaiColors[currentTrangThai] || trangThaiColors["Đã chốt lịch"]}`}>{currentTrangThai}</span></div>
                    
                    <div className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                      {item.tenKhach} {item.khachHangId && <span title="Đã có Hồ sơ CRM"><UserCheck size={16} className="text-emerald-500"/></span>}
                    </div>
                    <div className="text-sm font-bold text-slate-500 mt-1">{item.theLoai}</div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex gap-2">
                      {laAdmin && item.id && (<button onClick={() => xoaLich(item.id as string)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-full font-bold transition-all shadow-sm">🗑</button>)}
                      {!biKhoaVoiNhanVien && (
                        <button onClick={() => suaLich(item)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-full font-bold transition-all shadow-sm">✏️</button>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-emerald-600 whitespace-nowrap">{formatTienInput(String(tongTienCaLich))}đ</div>
                      {tienNo > 0 ? (
                        <div className="text-xs font-bold text-red-500 mt-0.5 bg-red-50 px-1.5 py-0.5 rounded text-right w-fit ml-auto">Còn nợ: {formatTienInput(String(tienNo))}đ</div>
                      ) : tongTienCaLich > 0 ? (
                        <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 text-right w-fit ml-auto">Đã thu đủ</div>
                      ) : null}
                      
                      {item.danhSachThanhToan && item.danhSachThanhToan.map(tt => (
                         <div key={tt.idStr} className={`text-[9px] mt-1 font-bold px-1.5 py-0.5 rounded text-right w-fit ml-auto ${tt.phuongThuc === 'Tiền mặt' ? (tt.daNopTien ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100') : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                             {tt.ngay.split('-').reverse().join('/')}: +{formatTienInput(String(tt.soTien))} ({tt.phuongThuc === 'Tiền mặt' ? (tt.daNopTien ? 'TM-Đã nộp sếp' : 'TM-Chờ ký') : 'CK'})
                         </div>
                      ))}
                      {(!item.danhSachThanhToan || item.danhSachThanhToan.length === 0) && item.tienCoc && (
                         <div className="text-[9px] mt-1 font-bold px-1.5 py-0.5 rounded text-right w-fit ml-auto bg-slate-50 text-slate-500 border border-slate-200">Đã cọc: {formatTienInput(String(item.tienCoc))}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 text-sm ml-2 mt-1">
                  {(item as any).ngayCuoi && (
                    <div className="text-rose-600 font-bold bg-rose-50 px-3 py-1.5 rounded-xl mb-1 text-xs w-fit border border-rose-100 flex items-center gap-1.5 shadow-sm">💍 Ngày Cưới: {(item as any).ngayCuoi.split('-').reverse().join('/')}</div>
                  )}
                  {item.soDienThoai && (
                    <div className="text-slate-500 font-medium flex items-center gap-2">SĐT 1: <a href={`tel:${item.soDienThoai}`} className="font-bold text-blue-600 hover:underline">{item.soDienThoai}</a><NutCopy textCanCopy={item.soDienThoai} /></div>
                  )}
                  {(item as any).dichVuThem && (
                    <div className="text-orange-600 font-bold bg-orange-50 px-3 py-2 rounded-xl mt-1 text-xs leading-relaxed">🔥 Phát sinh: {(item as any).dichVuThem} (+{formatTienInput(String((item as any).tienDichVuThem || 0))}đ)</div>
                  )}
                </div>

                {phanCongData && Object.keys(phanCongData).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 ml-2">
                    {Object.entries(phanCongData).map(([role, name]) => name ? (<span key={role} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded-lg border border-slate-200 font-medium shadow-sm"><strong className="text-slate-800">{role}:</strong> {name as string}</span>) : null)}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4 ml-2">
                  <select disabled={biKhoaVoiNhanVien} value={currentTrangThai} onChange={(e) => item.id && capNhatTrangThai(item.id, e.target.value)} className={`flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-2 py-2.5 rounded-xl outline-none min-w-[110px] ${biKhoaVoiNhanVien ? "opacity-60 cursor-not-allowed bg-slate-100" : "focus:ring-2 focus:ring-blue-200"}`}>
                    <option value="Đã chốt lịch">Đã chốt lịch</option><option value="Đã nhắc lịch">Đã nhắc lịch</option><option value="Đã chụp xong">Đã chụp xong</option><option value="Hoàn thành">Hoàn thành</option><option value="Hủy lịch">Hủy lịch</option>
                  </select>
                  <button onClick={() => { setLichDangChon(item); setShowPhanCongModal(true); }} className="bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm">👥 Phân công</button>
                  <button onClick={() => { setHoaDonData(item); setHdDiaChi(""); }} className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm">🧾 Hóa Đơn</button>
                  <button onClick={() => copyNhacLich(item)} className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm">💬 Nhắc khách</button>
                  <button onClick={() => { setLichDangChon(item); setTienHoaHong(""); setVaiTro("Chụp ảnh"); setShowHoaHongModal(true); }} className="flex-1 bg-blue-50 text-blue-700 text-xs font-bold px-2 py-2.5 rounded-xl hover:bg-blue-100 transition-colors shadow-sm min-w-[100px]">🙋‍♂️ Báo cáo</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button onClick={openAddModal} className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-200/50 flex items-center justify-center text-3xl z-40 hover:scale-110 active:scale-90 transition-all">+</button>

      <ModalPhanCong showModal={showPhanCongModal} setShowModal={setShowPhanCongModal} lichDangChon={lichDangChon} hoSoCuaToi={hoSoCuaToi} laAdmin={laAdmin} />
      <ModalHoaDon hoaDonData={hoaDonData} setHoaDonData={setHoaDonData} hdDiaChi={hdDiaChi} setHdDiaChi={setHdDiaChi} homNay={homNay} formatTienInput={formatTienInput} danhSachPhatSinh={danhSachPhatSinh} lichLamViec={lichLamViec} />
      <ModalBaoCao showHoaHongModal={showHoaHongModal} setShowHoaHongModal={setShowHoaHongModal} lichDangChon={lichDangChon} vaiTro={vaiTro} setVaiTro={setVaiTro} tienHoaHong={tienHoaHong} setTienHoaHong={setTienHoaHong} formatTienInput={formatTienInput} xacNhanNhanTien={xacNhanNhanTien} />

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-[100] sm:p-4 overscroll-none touch-none">
          <div className="bg-white w-full sm:max-w-md h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in touch-auto border border-white">
            
            <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-200 shrink-0 shadow-sm z-10">
              <button onClick={() => setShowModal(false)} className="text-slate-500 font-bold px-4 py-2 hover:bg-slate-200 rounded-xl transition-all">Hủy</button>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">{dangSua ? "✏️ Cập nhật" : "✨ Đặt lịch mới"}</h3>
              <button onClick={handleLuuLichThongMinh} className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-black px-4 py-2 rounded-xl transition-all">LƯU</button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 pb-12 overscroll-contain">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Ngày (*)</label>
                  <input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-indigo-700 font-black outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Giờ (*)</label>
                  <input type="time" value={gio} onChange={(e) => setGio(e.target.value)} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-indigo-700 font-black outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">SĐT Khách Hàng (*)</label>
                <div className="relative">
                  <input type="tel" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} placeholder="Nhập SĐT..." className={`bg-slate-50 border p-3.5 rounded-2xl w-full text-slate-900 font-black outline-none focus:ring-4 transition-all pr-24 ${khachHangId && khachHangId !== "NEW" ? "border-emerald-200 focus:ring-emerald-50 bg-emerald-50/30" : "border-slate-100 focus:ring-indigo-50"}`} />
                  {khachHangId && khachHangId !== "NEW" && <span className="absolute right-3 top-3.5 text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12}/> Khách cũ</span>}
                  {(!khachHangId || khachHangId === "NEW") && soDienThoai.length >= 9 && <span className="absolute right-3 top-3.5 text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-lg uppercase tracking-wider">✨ Tạo mới</span>}
                </div>
              </div>

              {!dangSua && soDienThoai.length >= 9 && danhSachKhachHang.filter(kh => kh.soDienThoai === soDienThoai).length > 0 && (
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl mt-1 animate-fade-in">
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1"><Search size={12}/> Chọn người dùng số này:</div>
                  <div className="flex flex-wrap gap-2">
                    {danhSachKhachHang.filter(kh => kh.soDienThoai === soDienThoai).map(kh => (
                      <button key={kh.id} onClick={(e) => { e.preventDefault(); setKhachHangId(kh.id!); setTenKhach(kh.tenKhach); if(kh.soDienThoai2) setSoDienThoai2(kh.soDienThoai2); }} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${khachHangId === kh.id ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50"}`}>
                        👤 {kh.tenKhach}
                      </button>
                    ))}
                    <button onClick={(e) => { e.preventDefault(); setKhachHangId("NEW"); setTenKhach(""); setSoDienThoai2(""); }} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${khachHangId === "NEW" ? "bg-emerald-600 text-white border-emerald-600 shadow-md" : "bg-white text-emerald-700 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"}`}>
                      ✨ Tạo người mới
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                 <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5 flex justify-between">Tên Khách Hàng (*)</label>
                  <input type="text" value={tenKhach} onChange={(e) => setTenKhach(e.target.value)} placeholder="Tên chú rể & cô dâu..." className={`border p-3.5 rounded-2xl w-full font-bold outline-none focus:ring-4 transition-all ${khachHangId && khachHangId !== "NEW" ? "bg-emerald-50/30 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-100 text-slate-900 focus:ring-indigo-50"}`} />
                 </div>
                 <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">SĐT Phụ (Tùy chọn)</label>
                    <input type="tel" value={soDienThoai2} onChange={(e) => setSoDienThoai2(e.target.value)} placeholder="098..." className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                 </div>

                 <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Thể loại chụp ảnh (*)</label>
                    <div className="relative">
                      <select 
                        value={theLoaiDaChon} 
                        onChange={(e) => {
                           setTheLoaiDaChon(e.target.value);
                           setGoiChup("");
                           setChiTietGoi("");
                           setGiaTien("");
                        }} 
                        className="appearance-none bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all pr-8"
                      >
                        <option value="">- Chọn thể loại -</option>
                        <option value="Chụp ảnh cưới">💍 Chụp ảnh cưới</option>
                        <option value="Chụp phóng sự cưới">💒 Chụp phóng sự cưới</option>
                        <option value="Chụp gia đình">👨‍👩‍👧‍👦 Chụp gia đình</option>
                        <option value="Chụp trẻ em">👶 Chụp trẻ em</option>
                        <option value="Chụp beauty">💄 Chụp beauty</option>
                        <option value="Chụp sự kiện">🎉 Chụp sự kiện</option>
                        <option value="Chụp chân dung">👤 Chụp chân dung</option>
                        <option value="Chụp kỷ yếu">🎓 Chụp kỷ yếu</option>
                        <option value="Khác">✨ Khác...</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-4 text-slate-400 pointer-events-none" />
                    </div>
                 </div>

                 {theLoaiDaChon === "Khác" && (
                   <div className="col-span-2 sm:col-span-1 animate-fade-in">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Nhập thể loại khác (*)</label>
                     <input type="text" value={theLoaiKhac} onChange={(e) => setTheLoaiKhac(e.target.value)} placeholder="VD: Chụp sản phẩm..." className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                   </div>
                 )}
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Chọn gói chụp</label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="relative">
                    <select 
                      value={danhSachGoiLocTheoTheLoai.some(g => g.tenGoi === goiChup) ? goiChup : (goiChup ? "Khác" : "")}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Khác") { setGoiChup(""); setChiTietGoi(""); } 
                        else {
                          setGoiChup(val); const goi = danhSachGoiLocTheoTheLoai.find(g => g.tenGoi === val);
                          if (goi) { 
                             setGiaTien(formatTienInput(String(goi.giaTien))); 
                             setChiTietGoi(goi.chiTiet || ""); 
                          }
                        }
                      }}
                      className="appearance-none bg-white border border-slate-200 p-3.5 rounded-xl w-full text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all pr-8"
                    >
                      <option value="">-- Chọn từ danh sách gói --</option>
                      {Object.entries(groupedPackagesLich).map(([loai, gois]) => (
                        <optgroup key={loai} label={`📍 ${loai.toUpperCase()}`}>
                          {gois.map(g => (<option key={g.id} value={g.tenGoi}>{g.tenGoi} - ({formatTienInput(String(g.giaTien))}đ)</option>))}
                        </optgroup>
                      ))}
                      <option value="Khác">✨ Khác (Nhập tay...)</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-4 text-slate-400 pointer-events-none" />
                  </div>

                  {(!danhSachGoiLocTheoTheLoai.some(g => g.tenGoi === goiChup) && goiChup !== "") && (
                    <input type="text" value={goiChup} onChange={(e) => setGoiChup(e.target.value)} placeholder="Nhập tên gói chụp tùy chỉnh..." className="bg-white border border-slate-200 p-3.5 rounded-xl w-full text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all animate-fade-in" />
                  )}

                  <div className="mt-1">
                    <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest ml-1 block mb-1.5 flex justify-between">Thông tin sản phẩm gói</label>
                    <textarea value={chiTietGoi} onChange={(e) => setChiTietGoi(e.target.value)} placeholder="Các sản phẩm khách nhận được (VD: 1 Ảnh cổng, 1 Album...)" className="bg-white border border-indigo-100 p-3.5 rounded-xl w-full text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all" rows={2}></textarea>
                  </div>

                  <div className="relative mt-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Giá tiền gói</label>
                    <input type="text" value={giaTien} onChange={(e) => setGiaTien(formatTienInput(e.target.value))} placeholder="5.000.000" className="bg-white border border-slate-200 p-3.5 rounded-xl w-full text-indigo-700 font-black outline-none focus:ring-2 focus:ring-indigo-100 transition-all pr-8" />
                    <span className="absolute right-3 top-[36px] text-slate-400 font-black">đ</span>
                  </div>
                </div>
              </div>

              {hienNgayCuoi && (
                <div className="animate-fade-in mt-1 ml-1 mb-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Ngày cưới (Nếu có)</label>
                  <input type="date" value={ngayCuoi} onChange={(e) => setNgayCuoi(e.target.value)} className="bg-white border border-slate-200 p-3.5 rounded-2xl w-full text-rose-600 font-bold outline-none focus:ring-2 focus:ring-rose-100" />
                </div>
              )}

              <div className="col-span-2 mt-2 pt-1">
                  <div className="flex justify-between items-center mb-2 ml-1">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lịch sử thanh toán / Cọc</label>
                     <button type="button" onClick={() => setDanhSachThanhToan([...danhSachThanhToan, {idStr: Date.now().toString(), soTien: "", phuongThuc: "Chuyển khoản", ngay: homNay(), daNopTien: false}])} className="bg-emerald-100 text-emerald-600 hover:bg-emerald-200 px-3 py-1.5 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 uppercase tracking-widest shadow-sm"><Plus size={12}/> Thêm Cọc</button>
                  </div>
                  
                  {danhSachThanhToan.map((tt, idx) => (
                     <div key={tt.idStr} className="flex flex-wrap gap-2 mb-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl relative animate-fade-in">
                        <input type="date" value={tt.ngay} onChange={(e) => capNhatThanhToan(tt.idStr, 'ngay', e.target.value)} className="bg-white border border-slate-200 p-2.5 rounded-lg text-slate-700 font-bold outline-none focus:ring-2 focus:ring-emerald-100 w-full sm:w-auto" />
                        <div className="relative flex-1 min-w-[120px]">
                           <input type="text" value={tt.soTien} onChange={(e) => capNhatThanhToan(tt.idStr, 'soTien', formatTienInput(e.target.value))} placeholder="Số tiền..." className="bg-white border border-slate-200 p-2.5 rounded-lg w-full text-emerald-600 font-black outline-none focus:ring-2 focus:ring-emerald-100 pr-6" />
                           <span className="absolute right-2 top-3 text-slate-400 text-xs font-bold">đ</span>
                        </div>
                        <div className="flex gap-1 w-full sm:w-auto">
                             <button type="button" onClick={() => capNhatThanhToan(tt.idStr, 'phuongThuc', 'Tiền mặt')} className={`flex-1 sm:w-16 py-2.5 flex items-center justify-center gap-1 rounded-lg text-[10px] font-black border transition-all ${tt.phuongThuc === 'Tiền mặt' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}><HandCoins size={14}/> TM</button>
                             <button type="button" onClick={() => capNhatThanhToan(tt.idStr, 'phuongThuc', 'Chuyển khoản')} className={`flex-1 sm:w-16 py-2.5 flex items-center justify-center gap-1 rounded-lg text-[10px] font-black border transition-all ${tt.phuongThuc === 'Chuyển khoản' ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}><Landmark size={14}/> CK</button>
                             <button type="button" onClick={() => setDanhSachThanhToan(danhSachThanhToan.filter(x => x.idStr !== tt.idStr))} className="w-10 flex items-center justify-center bg-white border border-slate-200 text-rose-500 rounded-lg hover:bg-rose-50 transition-all"><Trash2 size={14}/></button>
                        </div>
                        {tt.phuongThuc === "Tiền mặt" && (
                            <div className="absolute -top-2 -right-2">
                               {tt.daNopTien ? <span className="bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">Sếp ký</span> : <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">Chờ ký</span>}
                            </div>
                        )}
                     </div>
                  ))}
                  {danhSachThanhToan.length === 0 && (
                     <div className="text-[10px] font-bold text-slate-400 italic mb-2 text-center py-3 bg-white rounded-xl border border-dashed border-slate-200">Bấm thêm cọc để ghi nhận tiền khách trả</div>
                  )}
              </div>

              <div className="col-span-2 mt-1 pt-1">
                  <div className="flex justify-between items-center mb-2 ml-1">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dịch vụ in ấn / Phát sinh</label>
                     <button type="button" onClick={() => setDanhSachDichVuThem([...danhSachDichVuThem, {idStr: Date.now().toString(), ten: "", gia: ""}])} className="bg-orange-100 text-orange-600 hover:bg-orange-200 px-3 py-1.5 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 uppercase tracking-widest shadow-sm"><Plus size={12}/> Thêm SP</button>
                  </div>
                  
                  {danhSachDichVuThem.map((dv, idx) => (
                     <div key={dv.idStr} className="flex gap-2 mb-2 animate-fade-in relative">
                        <div className="flex-1 relative">
                           <input type="text" value={dv.ten} onChange={(e) => capNhatDichVuPhu(dv.idStr, 'ten', e.target.value)} placeholder="Tên dịch vụ..." className="bg-slate-50 border border-slate-200 p-3 rounded-xl w-full text-slate-700 font-medium outline-none focus:ring-2 focus:ring-orange-100 pr-8" list={`san-pham-list-${dv.idStr}`} />
                           <datalist id={`san-pham-list-${dv.idStr}`}>
                              {danhSachSanPham.map(sp => <option key={sp.id} value={sp.tenSanPham} />)}
                           </datalist>
                        </div>
                        <div className="relative w-28 sm:w-32 shrink-0">
                           <input type="text" value={dv.gia} onChange={(e) => capNhatDichVuPhu(dv.idStr, 'gia', formatTienInput(e.target.value))} placeholder="Giá..." className="bg-slate-50 border border-slate-200 p-3 rounded-xl w-full text-orange-600 font-black outline-none focus:ring-2 focus:ring-orange-100 pr-6" />
                           <span className="absolute right-2 top-3 text-slate-400 text-xs font-bold">đ</span>
                        </div>
                        <button type="button" onClick={() => setDanhSachDichVuThem(danhSachDichVuThem.filter(d => d.idStr !== dv.idStr))} className="w-10 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all"><Trash2 size={16}/></button>
                     </div>
                  ))}
                  {danhSachDichVuThem.length === 0 && (
                     <div className="text-[10px] font-bold text-slate-400 italic mb-2 text-center py-2 bg-slate-100 rounded-xl border border-dashed border-slate-200">Không có dịch vụ thêm</div>
                  )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}