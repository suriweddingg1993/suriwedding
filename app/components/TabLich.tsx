import { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { Lich, TaiKhoan, GoiDichVu, PhatSinh, ThuHuong, KhachHang } from "../../types";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

import ModalHoaDon from "./ModalHoaDon";
import ModalBaoCao from "./ModalBaoCao";
import ModalPhanCong from "./ModalPhanCong"; 
import NutCopy from "./NutCopy"; 
import { CalendarDays, Plus, Phone, Search, Clock, Edit, Trash2, CheckCircle2, UserCheck, ChevronDown } from "lucide-react";

// ĐÃ BỌC THÉP HÀM NÀY CHỐNG CRASH KHI VALUE BỊ UNDEFINED
function chuyenTienVeSo(value: string) { 
  if (!value) return 0;
  return Number(value.toString().replace(/\./g, "")); 
}

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
}

export default function TabLich({
  homNay, formatTienInput, hoSoCuaToi, themThuHuong, laAdmin, 
  lichLamViec, danhSachPhatSinh, danhSachThuHuong, danhSachKhachHang
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
  const [theLoai, setTheLoai] = useState("Chụp ảnh cưới");
  const [theLoaiKhac, setTheLoaiKhac] = useState("");
  
  const [goiChup, setGoiChup] = useState("");
  const [chiTietGoi, setChiTietGoi] = useState("");
  const [giaTien, setGiaTien] = useState("");
  
  const [tienCoc, setTienCoc] = useState("");
  const [dichVuThem, setDichVuThem] = useState("");
  const [tienDichVuThem, setTienDichVuThem] = useState("");

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

  // Load danh sách gói để cho nhân viên chọn (Logic giữ nguyên)
  useEffect(() => {
    const unsubGoi = onSnapshot(collection(db, "goiDichVu"), (snap) => { setDanhSachGoiDichVu(snap.docs.map(d => ({ id: d.id, ...d.data() })) as GoiDichVu[]); });
    return () => unsubGoi();
  }, []);

  useEffect(() => {
    if (!dangSua && soDienThoai.length >= 9) {
      const khachCu = danhSachKhachHang.find(kh => kh.soDienThoai === soDienThoai);
      if (khachCu) {
        setKhachHangId(khachCu.id!); setTenKhach(khachCu.tenKhach);
        if (khachCu.soDienThoai2) setSoDienThoai2(khachCu.soDienThoai2);
      } else { setKhachHangId(null); }
    } else if (soDienThoai.length < 9) { setKhachHangId(null); }
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

  const chonNgayVaCuon = (dateStr: string) => {
    setSelectedDate(dateStr);
    setTimeout(() => { danhSachLichRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150); 
  };

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
    setTenKhach(""); setSoDienThoai(""); setSoDienThoai2(""); setTheLoai("Chụp ảnh cưới"); setTheLoaiKhac(""); 
    setGoiChup(""); setChiTietGoi(""); setGiaTien(""); setTienCoc(""); setDichVuThem(""); setTienDichVuThem(""); 
  };

  const openAddModal = () => { resetForm(); setShowModal(true); };

  const suaLich = (item: any) => { 
    setNgay(item.ngay); setGio(item.gio); setTenKhach(item.tenKhach); setSoDienThoai(item.soDienThoai || ""); 
    setSoDienThoai2(item.soDienThoai2 || ""); setTheLoai(item.theLoai || "Chụp ảnh cưới"); setTheLoaiKhac(""); 
    setGoiChup(item.goiChup || ""); setChiTietGoi(item.chiTietGoi || ""); setGiaTien(formatTienInput(String(item.giaTien || ""))); 
    setNgayCuoi(item.ngayCuoi || ""); setTienCoc(formatTienInput(String(item.tienCoc || 0))); 
    setDichVuThem(item.dichVuThem || ""); setTienDichVuThem(formatTienInput(String(item.tienDichVuThem || 0))); 
    setDangSua(item.id || null); setKhachHangId(item.khachHangId || null);
    setShowModal(true); 
  };

  const xoaLich = async (id: string) => { 
    if (!laAdmin) { toast.error("Chỉ admin mới được xóa lịch"); return; } 
    if (!confirm("Xóa lịch này?")) return; 
    await deleteDoc(doc(db, "lichStudio", id)); toast.success("Đã xóa"); 
  };

  const capNhatTrangThai = async (id: string, trangThai: string) => { 
    try { await updateDoc(doc(db, "lichStudio", id), { trangThai }); toast.success("Đã cập nhật"); } 
    catch (error) { toast.error("Lỗi cập nhật"); } 
  };

  const handleLuuLichThongMinh = async () => {
    if (!ngay || !gio || !tenKhach || !soDienThoai || !goiChup) { 
      toast.error("Vui lòng điền đủ Ngày, Giờ, Gói chụp, SĐT và Tên!"); 
      return; 
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

    let finalKhId = khachHangId;

    try {
      if (!finalKhId && !dangSua) {
        try {
          const khRef = await addDoc(collection(db, "khachHang"), {
            tenKhach: tenKhach || "", soDienThoai: soDienThoai || "", soDienThoai2: soDienThoai2 || "", 
            nguonKhach: "Tự động tạo từ Lịch", ngayTao: new Date().toISOString()
          });
          finalKhId = khRef.id;
        } catch (crmError) {
          console.warn("⚠️ Bỏ qua lỗi CRM:", crmError);
        }
      }

      const theLoaiCuoi = theLoai === "Khác" ? theLoaiKhac.trim() : (theLoai || goiChup || "Chụp ảnh");
      
      const duLieuLich: any = { 
        khachHangId: finalKhId || null, 
        ngay: ngay || "", 
        gio: gio || "", 
        tenKhach: tenKhach || "", 
        soDienThoai: soDienThoai || "", 
        soDienThoai2: soDienThoai2 || "", 
        theLoai: theLoaiCuoi || "", 
        goiChup: goiChup || "", 
        chiTietGoi: chiTietGoi || "", 
        giaTien: chuyenTienVeSo(giaTien) || 0, 
        tienCoc: chuyenTienVeSo(tienCoc) || 0,
        dichVuThem: dichVuThem || "", 
        tienDichVuThem: chuyenTienVeSo(tienDichVuThem) || 0, 
        ngayCuoi: ngayCuoi || ""
      };

      if (!dangSua) {
        duLieuLich.trangThai = "Đã chốt lịch";
        await addDoc(collection(db, "lichStudio"), duLieuLich); 
        toast.success("Đã thêm lịch thành công!"); 
      } else { 
        await updateDoc(doc(db, "lichStudio", dangSua), duLieuLich); 
        toast.success("Đã lưu thay đổi!"); 
      } 
      setShowModal(false); 
      resetForm();
    } catch (error: any) { 
      toast.error("Lỗi: " + (error?.message || "Không xác định"));
    }
  };

  let dsLichNgayNay: Lich[] = [];
  if (tuKhoa.trim()) {
     const kw = tuKhoa.toLowerCase().trim();
     dsLichNgayNay = (lichLamViec || []).filter((item: Lich) => (item.tenKhach || "").toLowerCase().includes(kw) || (item.soDienThoai || "").includes(kw) || (item.soDienThoai2 || "").includes(kw));
  } else { dsLichNgayNay = lichTheoNgay[selectedDate] || []; }

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
            <p className="text-xs text-gray-400 mt-2">{tuKhoa.trim() ? "Vui lòng kiểm tra lại tên hoặc SĐT." : "Chưa có lịch hẹn nào được tạo trong ngày này."}</p>
          </div>
        ) : (
          [...dsLichNgayNay].sort((a, b) => a.gio.localeCompare(b.gio)).map((item: Lich) => {
            
            const trangThaiColors: Record<string, string> = { 
              "Chưa liên hệ": "bg-slate-100 text-slate-600", "Đã chốt lịch": "bg-blue-100 text-blue-700",
              "Đã nhắc lịch": "bg-amber-100 text-amber-700", "Đã chụp xong": "bg-purple-100 text-purple-700",
              "Hoàn thành": "bg-emerald-100 text-emerald-700", "Hủy lịch": "bg-rose-100 text-rose-600" 
            };
            
            const tongTienCaLich = (item.giaTien || 0) + ((item as any).tienDichVuThem || 0);
            const tienNo = tongTienCaLich - (item.tienCoc || 0);
            const currentTrangThai = item.trangThai || "Đã chốt lịch";

            const laThangCu = item.ngay.substring(0, 7) < localToday.substring(0, 7);
            const daHoanThanh = currentTrangThai === "Hoàn thành";
            const biKhoaVoiNhanVien = (laThangCu || daHoanThanh) && !laAdmin;
            const phanCongData = (item as any).phanCong;

            return (
              <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md group relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-500"></div>
                
                <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4 ml-2">
                  <div className="pr-2">
                    <div className="flex items-center gap-2 mb-2"><span className="bg-blue-50 text-blue-600 text-xs font-black px-2.5 py-1 rounded-lg">⏰ {item.gio}</span><span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${trangThaiColors[currentTrangThai] || trangThaiColors["Đã chốt lịch"]}`}>{currentTrangThai}</span></div>
                    
                    <div className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                      {item.tenKhach} 
                      {item.khachHangId && <span title="Khách hàng đã có Hồ sơ CRM"><UserCheck size={16} className="text-emerald-500"/></span>}
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
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 text-sm ml-2 mt-1">
                  {(item as any).ngayCuoi && (
                    <div className="text-rose-600 font-bold bg-rose-50 px-3 py-1.5 rounded-xl mb-1 text-xs w-fit border border-rose-100 flex items-center gap-1.5 shadow-sm">
                      💍 Ngày Cưới: {(item as any).ngayCuoi.split('-').reverse().join('/')}
                    </div>
                  )}

                  {item.soDienThoai && (
                    <div className="text-slate-500 font-medium flex items-center gap-2">
                      SĐT 1: <a href={`tel:${item.soDienThoai}`} className="font-bold text-blue-600 hover:underline">{item.soDienThoai}</a>
                      <NutCopy textCanCopy={item.soDienThoai} />
                    </div>
                  )}
                  {item.soDienThoai2 && (
                    <div className="text-slate-500 font-medium flex items-center gap-2">
                      SĐT 2: <a href={`tel:${item.soDienThoai2}`} className="font-bold text-blue-600 hover:underline">{item.soDienThoai2}</a>
                      <NutCopy textCanCopy={item.soDienThoai2} />
                    </div>
                  )}
                  
                  {(item as any).dichVuThem && (
                    <div className="text-orange-600 font-bold bg-orange-50 px-3 py-2 rounded-xl mt-1 text-xs">
                      🔥 Phát sinh: {(item as any).dichVuThem} (+{formatTienInput(String((item as any).tienDichVuThem || 0))}đ)
                    </div>
                  )}
                </div>

                {phanCongData && Object.keys(phanCongData).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4 ml-2">
                    {Object.entries(phanCongData).map(([role, name]) => name ? (
                      <span key={role} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded-lg border border-slate-200 font-medium shadow-sm">
                        <strong className="text-slate-800">{role}:</strong> {name as string}
                      </span>
                    ) : null)}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4 ml-2">
                  <select 
                    disabled={biKhoaVoiNhanVien}
                    value={currentTrangThai} 
                    onChange={(e) => item.id && capNhatTrangThai(item.id, e.target.value)} 
                    className={`flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-2 py-2.5 rounded-xl outline-none min-w-[110px] ${biKhoaVoiNhanVien ? "opacity-60 cursor-not-allowed bg-slate-100" : "focus:ring-2 focus:ring-blue-200"}`}
                  >
                    <option value="Đã chốt lịch">Đã chốt lịch</option>
                    <option value="Đã nhắc lịch">Đã nhắc lịch</option>
                    <option value="Đã chụp xong">Đã chụp xong</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Hủy lịch">Hủy lịch</option>
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
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                {dangSua ? "✏️ Cập nhật" : "✨ Đặt lịch mới"}
              </h3>
              <button onClick={handleLuuLichThongMinh} className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 font-black px-4 py-2 rounded-xl transition-all">LƯU</button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 pb-12 overscroll-contain">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Ngày (*)</label>
                  <input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-indigo-700 font-black outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Giờ (*)</label>
                  <input type="time" value={gio} onChange={(e) => setGio(e.target.value)} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-indigo-700 font-black outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">SĐT Khách Hàng (*)</label>
                <div className="relative">
                  <input type="tel" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} placeholder="Nhập SĐT để tìm kiếm tự động..." className={`bg-slate-50 border p-3.5 rounded-2xl w-full text-slate-900 font-black outline-none focus:ring-4 transition-all pr-24 ${khachHangId ? "border-emerald-200 focus:ring-emerald-50 bg-emerald-50/30" : "border-slate-100 focus:ring-indigo-50"}`} />
                  {khachHangId && <span className="absolute right-3 top-3.5 text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12}/> Khách cũ</span>}
                  {!khachHangId && soDienThoai.length >= 9 && <span className="absolute right-3 top-3.5 text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-lg uppercase tracking-wider">✨ Tạo mới</span>}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5 flex justify-between">
                  Tên Khách Hàng (*) 
                  {khachHangId && <span className="text-emerald-500 italic lowercase">(Đã tự điền)</span>}
                </label>
                <input type="text" value={tenKhach} onChange={(e) => setTenKhach(e.target.value)} placeholder="Tên chú rể & cô dâu..." className={`border p-3.5 rounded-2xl w-full font-bold outline-none focus:ring-4 transition-all ${khachHangId ? "bg-emerald-50/30 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-100 text-slate-900 focus:ring-indigo-50"}`} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Loại hình</label>
                  <select value={theLoai} onChange={(e) => setTheLoai(e.target.value)} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all">
                    <option value="Chụp ảnh cưới">Chụp ảnh cưới</option>
                    <option value="Chụp gia đình">Chụp gia đình</option>
                    <option value="Phóng sự cưới">Phóng sự cưới</option>
                    <option value="Chụp thời trang">Chụp thời trang</option>
                    <option value="Chụp em bé">Chụp em bé</option>
                    <option value="Khác">Khác...</option>
                  </select>
                </div>
                {theLoai === "Khác" ? (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Nhập thể loại</label>
                    <input type="text" value={theLoaiKhac} onChange={(e) => setTheLoaiKhac(e.target.value)} placeholder="VD: Khai trương..." className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-slate-900 font-bold outline-none" />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">SĐT Phụ (Tùy chọn)</label>
                    <input type="tel" value={soDienThoai2} onChange={(e) => setSoDienThoai2(e.target.value)} placeholder="098..." className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                  </div>
                )}
              </div>

              {/* KHU VỰC CHỌN GÓI CHỤP SẠCH SẼ - KHÔNG CÒN NÚT THÊM GÓI TẠI ĐÂY */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Chọn gói chụp (*)</label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="relative">
                    <select 
                      value={danhSachGoiDichVu.some(g => g.tenGoi === goiChup) ? goiChup : (goiChup ? "Khác" : "")}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Khác") {
                          setGoiChup(""); 
                          setChiTietGoi(""); 
                        } else {
                          setGoiChup(val);
                          const goi = danhSachGoiDichVu.find(g => g.tenGoi === val);
                          if (goi) {
                            setGiaTien(formatTienInput(String(goi.giaTien)));
                            setChiTietGoi(goi.chiTiet || ""); 
                          }
                        }
                      }}
                      className="appearance-none bg-white border border-slate-200 p-3.5 rounded-xl w-full text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all pr-8"
                    >
                      <option value="">-- Chọn từ danh sách gói --</option>
                      {danhSachGoiDichVu.map(g => (
                        <option key={g.id} value={g.tenGoi}>{g.tenGoi} - ({formatTienInput(String(g.giaTien))}đ)</option>
                      ))}
                      <option value="Khác">Nhập tay gói khác...</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-4 text-slate-400 pointer-events-none" />
                  </div>

                  {(!danhSachGoiDichVu.some(g => g.tenGoi === goiChup) && goiChup !== "") && (
                    <input 
                      type="text" 
                      value={goiChup} 
                      onChange={(e) => setGoiChup(e.target.value)} 
                      placeholder="Nhập tên gói chụp tùy chỉnh..." 
                      className="bg-white border border-slate-200 p-3.5 rounded-xl w-full text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all animate-fade-in" 
                    />
                  )}

                  <div className="mt-1">
                    <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest ml-1 block mb-1.5 flex justify-between">
                      Thông tin sản phẩm gói
                    </label>
                    <textarea 
                      value={chiTietGoi} 
                      onChange={(e) => setChiTietGoi(e.target.value)} 
                      placeholder="Các sản phẩm khách nhận được (VD: 1 Ảnh cổng, 1 Album...)" 
                      className="bg-white border border-indigo-100 p-3.5 rounded-xl w-full text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
                      rows={2}
                    ></textarea>
                  </div>

                  <div className="relative mt-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Giá tiền gói (*)</label>
                    <input type="text" value={giaTien} onChange={(e) => setGiaTien(formatTienInput(e.target.value))} placeholder="5.000.000" className="bg-white border border-slate-200 p-3.5 rounded-xl w-full text-indigo-700 font-black outline-none focus:ring-2 focus:ring-indigo-100 transition-all pr-8" />
                    <span className="absolute right-3 top-[36px] text-slate-400 font-black">đ</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl mt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Khách đã cọc</label>
                  <div className="relative">
                    <input type="text" value={tienCoc} onChange={(e) => setTienCoc(formatTienInput(e.target.value))} placeholder="0" className="bg-white border border-slate-200 p-3 rounded-xl w-full text-emerald-600 font-black outline-none focus:ring-2 focus:ring-emerald-100 pr-6" />
                    <span className="absolute right-2 top-3 text-slate-400 text-xs font-bold">đ</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Ngày cưới (Nếu có)</label>
                  <input type="date" value={ngayCuoi} onChange={(e) => setNgayCuoi(e.target.value)} className="bg-white border border-slate-200 p-3 rounded-xl w-full text-rose-600 font-bold outline-none focus:ring-2 focus:ring-rose-100" />
                </div>
                
                <div className="col-span-2 mt-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Mua/Thuê thêm dịch vụ</label>
                  <div className="flex gap-2">
                    <input type="text" value={dichVuThem} onChange={(e) => setDichVuThem(e.target.value)} placeholder="Tên dịch vụ..." className="bg-white border border-slate-200 p-3 rounded-xl flex-1 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-orange-100" />
                    <div className="relative w-32 shrink-0">
                      <input type="text" value={tienDichVuThem} onChange={(e) => setTienDichVuThem(formatTienInput(e.target.value))} placeholder="Giá..." className="bg-white border border-slate-200 p-3 rounded-xl w-full text-orange-600 font-black outline-none focus:ring-2 focus:ring-orange-100 pr-6" />
                      <span className="absolute right-2 top-3 text-slate-400 text-xs font-bold">đ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}