import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { Lich, TaiKhoan, GoiDichVu } from "../../types";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import html2canvas from "html2canvas";

function chuyenTienVeSo(value: string) { 
  return Number(value.replace(/\./g, "")); 
}

interface TabLichProps {
  homNay: () => string;
  dangSua: string | null;
  ngay: string; setNgay: (val: string) => void;
  gio: string; setGio: (val: string) => void;
  tenKhach: string; setTenKhach: (val: string) => void;
  soDienThoai: string; setSoDienThoai: (val: string) => void;
  soDienThoai2: string; setSoDienThoai2: (val: string) => void;
  theLoai: string; setTheLoai: (val: string) => void;
  theLoaiKhac: string; setTheLoaiKhac: (val: string) => void;
  goiChup: string; setGoiChup: (val: string) => void;
  giaTien: string; setGiaTien: (val: string) => void;
  formatTienInput: (val: string) => string;
  themHoacSuaLich: () => Promise<void>;
  resetForm: () => void;
  lichTheoNgay: Record<string, Lich[]>;
  suaLich: (item: Lich) => void;
  capNhatTrangThai: (id: string, trangThai: string) => Promise<void>;
  hoSoCuaToi: TaiKhoan | null;
  themThuHuong: (uid: string, email: string, hoTen: string, ngay: string, moTa: string, soTien: string) => Promise<void>;
  laAdmin: boolean;
  xoaLich: (id: string) => Promise<void>;
  lichLamViec: Lich[];
}

export default function TabLich({
  homNay, dangSua, ngay, setNgay, gio, setGio, tenKhach, setTenKhach, soDienThoai, setSoDienThoai, soDienThoai2, setSoDienThoai2,
  theLoai, setTheLoai, theLoaiKhac, setTheLoaiKhac, goiChup, setGoiChup, giaTien, setGiaTien, formatTienInput,
  themHoacSuaLich, resetForm, lichTheoNgay, suaLich, capNhatTrangThai,
  hoSoCuaToi, themThuHuong, laAdmin, xoaLich, lichLamViec
}: TabLichProps) {
  
  const getLocalToday = () => {
    const d = new Date(); const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 10);
  };

  const localToday = getLocalToday();
  const [selectedDate, setSelectedDate] = useState(localToday);
  const [currentMonth, setCurrentMonth] = useState(new Date(localToday));
  
  const [showModal, setShowModal] = useState(false);
  const [showHoaHongModal, setShowHoaHongModal] = useState(false);
  const [lichDangChon, setLichDangChon] = useState<Lich | null>(null);
  const [tienHoaHong, setTienHoaHong] = useState("");
  const [vaiTro, setVaiTro] = useState("Chụp ảnh");
  const [tuKhoa, setTuKhoa] = useState(""); 
  
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [tienCoc, setTienCoc] = useState("");
  
  const [danhSachGoiDichVu, setDanhSachGoiDichVu] = useState<GoiDichVu[]>([]);
  const [showGoiModal, setShowGoiModal] = useState(false);
  const [tenGoiMoi, setTenGoiMoi] = useState("");
  const [chiTietGoiMoi, setChiTietGoiMoi] = useState("");
  const [giaGoiMoi, setGiaGoiMoi] = useState("");
  const [dangSuaGoi, setDangSuaGoi] = useState<string | null>(null);
  const [hoaDonData, setHoaDonData] = useState<Lich | null>(null);
  const [hdDiaChi, setHdDiaChi] = useState("");
  
  const [dangIn, setDangIn] = useState(false);

  // CHẶN SCROLL NỀN KHI MỞ BẢNG (Giữ nguyên khả năng cuộn bên trong bảng)
  useEffect(() => {
    if (showModal || showGoiModal || showHoaHongModal || hoaDonData) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showModal, showGoiModal, showHoaHongModal, hoaDonData]);

  useEffect(() => {
    const unsubGoi = onSnapshot(collection(db, "goiDichVu"), (snap) => {
      setDanhSachGoiDichVu(snap.docs.map(d => ({ id: d.id, ...d.data() })) as GoiDichVu[]);
    });
    return () => unsubGoi();
  }, []);

  const year = currentMonth.getFullYear(); const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1); const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7; 

  const daysArray: (string | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) { daysArray.push(null); }
  for (let i = 1; i <= daysInMonth; i++) { daysArray.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`); }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToToday = () => { setCurrentMonth(new Date(localToday)); setSelectedDate(localToday); setTuKhoa(""); };

  const xacNhanNhanTien = () => {
    if (!tienHoaHong) { toast.error("Vui lòng nhập số tiền!"); return; }
    if (!hoSoCuaToi) { toast.error("Không tìm thấy thông tin tài khoản!"); return; }
    if (!lichDangChon) return;
    const moTaJob = `[${vaiTro}] KH: ${lichDangChon.tenKhach} (${lichDangChon.theLoai})`;
    themThuHuong(hoSoCuaToi.id, hoSoCuaToi.email, hoSoCuaToi.hoTen || "", lichDangChon.ngay, moTaJob, tienHoaHong);
    setShowHoaHongModal(false); setTienHoaHong(""); setVaiTro("Chụp ảnh");
  };

  const copyNhacLich = (item: Lich) => {
    const ngayChup = item.ngay.split('-').reverse().join('/');
    const text = `Dạ Suri Wedding chào anh/chị ${item.tenKhach || ""}.\n\nEm nhắn tin báo mình có lịch hẹn (${item.theLoai} - ${item.goiChup || ""}) vào lúc ⏰ ${item.gio} ngày ${ngayChup}.\n\nAnh/chị nhớ sắp xếp thời gian đến đúng giờ để có những bức ảnh đẹp nhất nhé. Em cảm ơn ạ!`;
    navigator.clipboard.writeText(text); toast.success("Đã copy tin nhắn nhắc khách!");
  };

  const openAddModal = () => { 
    resetForm(); setNgay(selectedDate); setTienCoc(""); setErrors({}); setShowModal(true); 
  };
  const suaLichNangCao = (item: Lich) => { 
    suaLich(item); setTienCoc(formatTienInput(String(item.tienCoc || 0))); setErrors({}); setShowModal(true); 
  };

  const handleLuuLichThongMinh = async () => {
    const newErrors: Record<string, boolean> = {};
    if (!ngay) newErrors.ngay = true; 
    if (!gio) newErrors.gio = true;
    if (!tenKhach) newErrors.tenKhach = true; 
    
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!soDienThoai || !phoneRegex.test(soDienThoai.replace(/\s/g, ""))) newErrors.soDienThoai = true;
    if (soDienThoai2 && !phoneRegex.test(soDienThoai2.replace(/\s/g, ""))) newErrors.soDienThoai2 = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vui lòng điền đủ thông tin và Số điện thoại (10-11 số)!");
      return; 
    }

    setErrors({}); 

    const lichCungNgay = lichLamViec.filter((item) => item.ngay === ngay && item.id !== dangSua);
    const [h1, m1] = gio.split(":").map(Number);
    const thoiGianMoi = h1 * 60 + m1;

    const biTrung = lichCungNgay.find((item) => {
      const [h2, m2] = item.gio.split(":").map(Number);
      const thoiGianCu = h2 * 60 + m2;
      return Math.abs(thoiGianMoi - thoiGianCu) < 120;
    });

    if (biTrung) {
      const dongY = confirm(`⚠️ CẢNH BÁO OVERBOOK:\nCa chụp này quá sát giờ với khách "${biTrung.tenKhach}" lúc ${biTrung.gio}.\n\nBạn có chắc chắn nhận lịch không?`);
      if (!dongY) return;
    }

    const theLoaiCuoi = theLoai === "Khác" ? theLoaiKhac.trim() : (theLoai || goiChup || "Chụp ảnh");
    const duLieuLich = { 
      ngay, gio, tenKhach, soDienThoai, soDienThoai2, 
      theLoai: theLoaiCuoi, goiChup, 
      giaTien: chuyenTienVeSo(giaTien) || 0, 
      tienCoc: chuyenTienVeSo(tienCoc) || 0, 
      trangThai: "Chưa liên hệ" 
    };

    try {
      if (dangSua) { 
        await updateDoc(doc(db, "lichStudio", dangSua), duLieuLich); 
        toast.success("Đã lưu thay đổi!"); 
      } else { 
        await addDoc(collection(db, "lichStudio"), duLieuLich); 
        toast.success("Đã thêm lịch!"); 
      } 
      setShowModal(false); resetForm(); setTienCoc("");
    } catch (error) { toast.error("Có lỗi mạng"); }
  };

  const luuGoiDichVu = async () => {
    if (!tenGoiMoi || !giaGoiMoi) return toast.error("Vui lòng nhập tên gói và giá!");
    try {
      if (dangSuaGoi) { 
        await updateDoc(doc(db, "goiDichVu", dangSuaGoi), { tenGoi: tenGoiMoi, chiTiet: chiTietGoiMoi, giaTien: chuyenTienVeSo(giaGoiMoi) || 0 }); 
        toast.success("Cập nhật gói thành công!"); 
        setDangSuaGoi(null); 
      } else { 
        await addDoc(collection(db, "goiDichVu"), { tenGoi: tenGoiMoi, chiTiet: chiTietGoiMoi, giaTien: chuyenTienVeSo(giaGoiMoi) || 0 }); 
        toast.success("Thêm gói thành công!"); 
      }
      setTenGoiMoi(""); setChiTietGoiMoi(""); setGiaGoiMoi("");
    } catch(e) { toast.error("Lỗi mạng!"); }
  };
  const xoaGoiDichVu = async (id: string) => { if (confirm("Chắc chắn xóa gói chụp mẫu này?")) await deleteDoc(doc(db, "goiDichVu", id)); };

  const xuLyChiaSeAnh = async () => {
    if (!hoaDonData) return;
    const captureElement = document.getElementById("invoice-capture");
    if (!captureElement) return;

    setDangIn(true);
    toast.loading("Đang chuẩn bị ảnh chia sẻ...", { id: "print-toast" });

    try {
      const canvas = await html2canvas(captureElement, {
        scale: 3, 
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Lỗi tạo ảnh");
        const file = new File([blob], `Hoa_Don_${hoaDonData.tenKhach.replace(/\s+/g, "_")}.png`, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Hóa Đơn - Suri Wedding",
          });
          toast.success("Mở chia sẻ thành công!", { id: "print-toast" });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Hoa_Don_${hoaDonData.tenKhach}.png`;
          a.click();
          toast.success("Đã tải ảnh xuống máy!", { id: "print-toast" });
        }
        setDangIn(false);
      }, "image/png");
      
    } catch (error) {
      toast.error("Có lỗi khi tạo Ảnh!", { id: "print-toast" });
      setDangIn(false);
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
                  <button onClick={() => setSelectedDate(dateStr)} className={`relative w-10 h-10 flex items-center justify-center rounded-2xl text-sm transition-all ${isSelected ? "bg-blue-600 text-white font-black shadow-lg shadow-blue-200 scale-105" : isToday ? "bg-blue-50 text-blue-700 font-black" : "hover:bg-gray-50 text-gray-700 font-bold"}`}>{parseInt(dateStr.split('-')[2])}</button>
                  <div className="mt-1 flex gap-1 h-1.5 absolute bottom-[-4px]">{hasLich && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-300" : "bg-blue-500 shadow-sm shadow-blue-200"}`}></span>}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mb-4 flex justify-between items-end px-1 mt-6">
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
            const trangThaiColors: Record<string, string> = { "Chưa liên hệ": "bg-slate-100 text-slate-600", "Đã gọi - Chờ": "bg-amber-100 text-amber-700", "Đã chốt lịch": "bg-blue-100 text-blue-700", "Đã chụp xong": "bg-emerald-100 text-emerald-700", "Hủy lịch": "bg-rose-100 text-rose-600" };
            const tienNo = (item.giaTien || 0) - (item.tienCoc || 0);

            return (
              <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md group relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-500"></div>
                <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4 ml-2">
                  <div className="pr-2">
                    <div className="flex items-center gap-2 mb-2"><span className="bg-blue-50 text-blue-600 text-xs font-black px-2.5 py-1 rounded-lg">⏰ {item.gio}</span><span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${trangThaiColors[item.trangThai || "Chưa liên hệ"]}`}>{item.trangThai || "Chưa liên hệ"}</span></div>
                    <div className="text-lg font-black text-slate-900">{item.tenKhach}</div>
                    <div className="text-sm font-bold text-slate-500 mt-1">{item.theLoai} - {item.goiChup}</div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex gap-2">
                      {laAdmin && item.id && (<button onClick={() => xoaLich(item.id as string)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-full font-bold transition-all shadow-sm">🗑</button>)}
                      <button onClick={() => suaLichNangCao(item)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-full font-bold transition-all shadow-sm">✏️</button>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-emerald-600 whitespace-nowrap">{formatTienInput(String(item.giaTien || 0))}đ</div>
                      {tienNo > 0 ? (
                        <div className="text-xs font-bold text-red-500 mt-0.5 bg-red-50 px-1.5 py-0.5 rounded text-right w-fit ml-auto">Còn nợ: {formatTienInput(String(tienNo))}đ</div>
                      ) : item.giaTien && item.giaTien > 0 ? (
                        <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 text-right w-fit ml-auto">Đã thu đủ</div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 text-sm ml-2">
                  {item.soDienThoai && (<div className="text-slate-500 font-medium flex items-center gap-2">SĐT 1: <a href={`tel:${item.soDienThoai}`} className="font-bold text-blue-600 hover:underline">{item.soDienThoai}</a></div>)}
                </div>

                <div className="flex flex-wrap gap-2 mt-4 ml-2">
                  <select value={item.trangThai || "Chưa liên hệ"} onChange={(e) => item.id && capNhatTrangThai(item.id, e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-2 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none min-w-[110px]">
                    <option value="Chưa liên hệ">Chưa liên hệ</option><option value="Đã gọi - Chờ">Đã gọi - Chờ</option><option value="Đã chốt lịch">Đã chốt lịch</option><option value="Đã chụp xong">Đã chụp xong</option><option value="Hủy lịch">Hủy lịch</option>
                  </select>
                  <button onClick={() => { setHoaDonData(item); setHdDiaChi(""); }} className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm">🧾 Hóa Đơn</button>
                  <button onClick={() => copyNhacLich(item)} className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm">💬 Nhắc khách</button>
                  {/* NÚT BÁO CÁO (THỤ HƯỞNG) ĐÃ ĐƯỢC KHÔI PHỤC */}
                  <button onClick={() => { setLichDangChon(item); setTienHoaHong(""); setVaiTro("Chụp ảnh"); setShowHoaHongModal(true); }} className="flex-1 bg-blue-50 text-blue-700 text-xs font-bold px-2 py-2.5 rounded-xl hover:bg-blue-100 transition-colors shadow-sm min-w-[100px]">🙋‍♂️ Báo cáo</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button onClick={openAddModal} className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-200/50 flex items-center justify-center text-3xl z-40 hover:scale-110 active:scale-90 transition-all">+</button>

      {/* MODAL THÊM LỊCH */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <h2 className="text-2xl font-black mb-6 text-slate-900">{dangSua ? "✏️ Cập nhật Lịch" : "✨ Thêm Lịch Mới"}</h2>
            <div className="grid gap-4 w-full">
              
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 mb-2">
                <div className="flex justify-between items-end mb-1.5">
                  <label className="text-[10px] text-blue-700 font-black ml-2 block uppercase">Chọn Nhanh Gói Dịch Vụ</label>
                  {laAdmin && <button onClick={() => setShowGoiModal(true)} className="text-[10px] text-blue-600 font-bold bg-white px-2 py-1 rounded shadow-sm">⚙️ Cài đặt</button>}
                </div>
                <select 
                  onChange={(e) => {
                    if (!e.target.value) { setGoiChup(""); setGiaTien(""); return; }
                    const goi = danhSachGoiDichVu.find(g => g.id === e.target.value);
                    if (goi) { setGoiChup(goi.chiTiet); setGiaTien(formatTienInput(String(goi.giaTien))); setTheLoai(goi.tenGoi); }
                  }}
                  className="bg-white p-3.5 rounded-xl w-full text-blue-700 font-bold outline-none transition-all shadow-sm"
                >
                  <option value="">-- Chọn để tự động điền --</option>
                  {danhSachGoiDichVu.map(g => (<option key={g.id} value={g.id}>{g.tenGoi} - {formatTienInput(String(g.giaTien))}đ</option>))}
                </select>
              </div>

              <div className="flex gap-3 w-full">
                <div className="flex-1 min-w-0"><label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Ngày chụp</label><input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} className={`bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none ${errors.ngay ? "border-2 border-red-500 bg-red-50" : "border border-transparent"}`} /></div>
                <div className="flex-1 min-w-0"><label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Giờ chụp</label><input type="time" value={gio} onChange={(e) => setGio(e.target.value)} className={`bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none ${errors.gio ? "border-2 border-red-500 bg-red-50" : "border border-transparent"}`} /></div>
              </div>
              
              <div><label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Tên Khách</label><input type="text" placeholder="Nhập tên..." value={tenKhach} onChange={(e) => setTenKhach(e.target.value)} className={`bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none ${errors.tenKhach ? "border-2 border-red-500 bg-red-50" : "border border-transparent"}`} /></div>
              
              <div className="flex gap-3 w-full">
                <div className="flex-1 min-w-0"><label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">SĐT 1</label><input type="text" placeholder="0987..." value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} className={`bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none transition-all ${errors.soDienThoai ? "border-2 border-red-500 bg-red-50" : "border border-transparent"}`} /></div>
                <div className="flex-1 min-w-0"><label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">SĐT 2</label><input type="text" placeholder="Dự phòng..." value={soDienThoai2} onChange={(e) => setSoDienThoai2(e.target.value)} className={`bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none transition-all ${errors.soDienThoai2 ? "border-2 border-red-500 bg-red-50" : "border border-transparent"}`} /></div>
              </div>

              <div className="flex gap-3 w-full">
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Thể loại</label>
                  <select value={theLoai} onChange={(e) => setTheLoai(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold border border-transparent outline-none">
                    <option value="">- Chọn -</option><option value="Chụp Cưới">💍 Chụp Cưới</option><option value="Chụp Sự kiện">🎉 Sự kiện</option><option value="Chụp Chân dung">👤 Chân dung</option><option value="Chụp Gia đình">👨‍👩‍👧‍👦 Gia đình</option><option value="Chụp Kỷ yếu">🎓 Kỷ yếu</option><option value="Khác">✨ Khác</option>
                  </select>
                </div>
                {theLoai === "Khác" && (
                   <div className="flex-1 min-w-0"><label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Nhập loại khác</label><input type="text" placeholder="Nhập..." value={theLoaiKhac} onChange={(e) => setTheLoaiKhac(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold border border-transparent outline-none" /></div>
                )}
              </div>
              
              <div><label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Ghi chú chi tiết váy/vest</label><input type="text" placeholder="VD: 2 váy, 1 vest..." value={goiChup} onChange={(e) => setGoiChup(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold border border-transparent outline-none" /></div>
              
              <div className="flex gap-3 w-full">
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Giá Hợp Đồng</label>
                  <div className="relative">
                    <input type="text" inputMode="numeric" placeholder="0" value={giaTien} onChange={(e) => setGiaTien(formatTienInput(e.target.value))} className={`bg-slate-50 p-4 rounded-2xl w-full pr-8 text-emerald-600 font-black text-xl outline-none ${errors.giaTien ? "border-2 border-red-500 bg-red-50" : "border border-transparent"}`} />
                    <span className="absolute right-3 top-5 text-slate-400 font-bold">đ</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Khách Đã Cọc</label>
                  <div className="relative">
                    <input type="text" inputMode="numeric" placeholder="0" value={tienCoc} onChange={(e) => setTienCoc(formatTienInput(e.target.value))} className="bg-slate-50 p-4 rounded-2xl w-full pr-8 text-orange-600 font-black text-xl border border-transparent outline-none" />
                    <span className="absolute right-3 top-5 text-slate-400 font-bold">đ</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={handleLuuLichThongMinh} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 active:scale-95 transition-all">💾 Lưu Lịch</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 active:scale-95 transition-all">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QUẢN LÝ GÓI DỊCH VỤ (CHỈ DÀNH CHO ADMIN) */}
      {showGoiModal && laAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black mb-4 text-slate-900">⚙️ Quản lý Gói Dịch Vụ Mẫu</h2>
            <div className="bg-blue-50/50 p-4 rounded-xl mb-5 border border-blue-100 w-full">
              <h3 className="font-bold text-sm mb-3 text-blue-800">{dangSuaGoi ? "Sửa thông tin gói" : "Tạo gói mới"}</h3>
              <input type="text" placeholder="Tên gói (VD: Gói Cưới Premium)" value={tenGoiMoi} onChange={(e) => setTenGoiMoi(e.target.value)} className="w-full mb-3 p-3 rounded-xl border border-blue-200 font-bold outline-none focus:ring-2 focus:ring-blue-300" />
              <textarea placeholder="Chi tiết gồm những gì? (VD: 2 Váy, 1 Vest...)" value={chiTietGoiMoi} onChange={(e) => setChiTietGoiMoi(e.target.value)} className="w-full mb-3 p-3 rounded-xl border border-blue-200 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-300" rows={3}></textarea>
              <div className="relative mb-4 w-full">
                <input type="text" inputMode="numeric" placeholder="Giá tiền mặc định" value={giaGoiMoi} onChange={(e) => setGiaGoiMoi(formatTienInput(e.target.value))} className="w-full p-3 rounded-xl border border-blue-200 font-black text-emerald-600 text-lg outline-none focus:ring-2 focus:ring-blue-300 pr-10" />
                <span className="absolute right-4 top-4 text-slate-400 font-bold">VNĐ</span>
              </div>
              <div className="flex gap-2">
                <button onClick={luuGoiDichVu} className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl shadow-md">{dangSuaGoi ? "LƯU CẬP NHẬT" : "TẠO GÓI MỚI"}</button>
                {dangSuaGoi && <button onClick={() => {setDangSuaGoi(null); setTenGoiMoi(""); setChiTietGoiMoi(""); setGiaGoiMoi("")}} className="px-5 bg-slate-200 font-bold text-slate-700 rounded-xl">Hủy</button>}
              </div>
            </div>

            <div className="space-y-3 w-full">
              <h4 className="font-bold text-slate-600 text-sm mb-2">Danh sách Gói đang có:</h4>
              {danhSachGoiDichVu.map(g => (
                <div key={g.id} className="flex justify-between items-center p-4 border border-slate-100 bg-slate-50 rounded-xl">
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-800 break-words">{g.tenGoi} <span className="text-emerald-600 text-sm ml-2 font-black">{formatTienInput(String(g.giaTien))}đ</span></div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{g.chiTiet}</div>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-1">
                    <button onClick={() => {setDangSuaGoi(g.id!); setTenGoiMoi(g.tenGoi); setChiTietGoiMoi(g.chiTiet); setGiaGoiMoi(formatTienInput(String(g.giaTien)))}} className="text-blue-600 font-bold text-sm px-3 py-2 bg-blue-100 rounded-lg">Sửa</button>
                    <button onClick={() => xoaGoiDichVu(g.id!)} className="text-red-500 font-bold text-sm px-3 py-2 bg-red-100 rounded-lg">Xóa</button>
                  </div>
                </div>
              ))}
              {danhSachGoiDichVu.length === 0 && <div className="text-center text-sm text-slate-400 py-4 italic">Chưa có gói dịch vụ nào</div>}
            </div>
            <button onClick={() => setShowGoiModal(false)} className="w-full mt-6 bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-200">ĐÓNG BẢNG</button>
          </div>
        </div>
      )}

      {/* MODAL NHẬN HOA HỒNG */}
      {showHoaHongModal && lichDangChon && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl animate-fade-in border border-white">
            <h3 className="text-2xl font-black mb-2 text-blue-600 text-center tracking-tight">Hoàn Thành!</h3>
            <p className="text-xs text-slate-500 mb-6 text-center font-medium">Báo cáo công đoạn bạn đã làm để nhận lương.</p>
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-5">
              <div className="text-[10px] text-blue-500 font-black mb-1.5 uppercase tracking-wide">{lichDangChon.theLoai}</div>
              <div className="font-black text-slate-900 text-base">{lichDangChon.tenKhach}</div>
            </div>
            <div className="grid gap-4 w-full">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 block mb-1.5">Công đoạn của bạn</label>
                <select value={vaiTro} onChange={(e) => setVaiTro(e.target.value)} className="bg-white border border-blue-200 p-4 rounded-2xl w-full font-black text-slate-700 text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all">
                  <option value="Make-up">💄 Make-up</option><option value="Chụp ảnh">📸 Chụp ảnh</option><option value="Chỉnh sửa (Photoshop)">💻 Chỉnh sửa (Photoshop)</option><option value="Tư vấn / Hỗ trợ">🙋‍♂️ Tư vấn / Hỗ trợ</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 block mb-1.5">Tiền công / Hoa hồng</label>
                <div className="relative w-full">
                  <input type="text" inputMode="numeric" placeholder="VD: 300.000" value={tienHoaHong} onChange={(e) => setTienHoaHong(formatTienInput(e.target.value))} className="bg-white border border-blue-200 p-4 rounded-2xl w-full pr-10 font-black text-blue-700 text-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-blue-200" />
                  <span className="absolute right-5 top-5 text-blue-600 font-black">đ</span>
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={xacNhanNhanTien} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all">💰 Báo Cáo</button>
                <button onClick={() => setShowHoaHongModal(false)} className="px-6 py-4 bg-slate-100 font-bold text-slate-600 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BIÊN LAI MOOLA */}
      {hoaDonData && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-gray-100 rounded-[2rem] w-full max-w-md max-h-[95vh] overflow-y-auto p-4 shadow-2xl relative">
            
            <div className="mb-4 bg-white p-3 rounded-xl border border-gray-200 w-full shadow-sm shrink-0">
              <h3 className="font-bold text-blue-600 mb-2 text-[11px] uppercase tracking-wide">Thông tin bổ sung</h3>
              <input type="text" placeholder="Nhập địa chỉ Khách hàng..." value={hdDiaChi} onChange={(e) => setHdDiaChi(e.target.value)} className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg w-full font-medium text-xs outline-none focus:border-blue-400" />
            </div>

            <div id="invoice-capture" className="w-full bg-white p-5 rounded-xl shadow-sm text-gray-900">
              <div className="flex justify-between items-start mb-4 border-b border-gray-300 pb-3">
                <div>
                  <h1 className="text-sm font-black uppercase text-gray-800">ẢNH VIỆN SURI WEDDING</h1>
                  <p className="text-[10px] text-gray-600 mt-1">Đ/c: Thuận Châu, Sơn La</p>
                  <p className="text-[10px] text-gray-600">SĐT: 0967.185.505 - 0379.777.819</p>
                </div>
                <div className="text-right text-[10px] text-gray-600">
                  <p>HĐ: {hoaDonData.id?.slice(-6).toUpperCase()}</p>
                  <p>Ngày: {homNay().split('-').reverse().join('/')}</p>
                </div>
              </div>

              <h2 className="text-base font-black text-center uppercase mb-4 text-gray-800 tracking-wide">Hợp Đồng Dịch Vụ</h2>

              <div className="text-[11px] mb-4 space-y-1">
                <p><span className="font-semibold text-gray-600 w-16 inline-block">Khách hàng:</span> <span className="font-black text-gray-800">{hoaDonData.tenKhach}</span></p>
                <p><span className="font-semibold text-gray-600 w-16 inline-block">Điện thoại:</span> <span className="font-bold text-gray-800">{hoaDonData.soDienThoai}</span></p>
                <p><span className="font-semibold text-gray-600 w-16 inline-block">Địa chỉ:</span> <span className="font-bold text-gray-800">{hdDiaChi || "..........................................................."}</span></p>
              </div>

              <table className="w-full border-collapse border border-gray-800 text-[10px] mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-800 p-1.5 text-center w-8">STT</th>
                    <th className="border border-gray-800 p-1.5 text-left">MÔ TẢ DỊCH VỤ</th>
                    <th className="border border-gray-800 p-1.5 text-center w-8">SL</th>
                    <th className="border border-gray-800 p-1.5 text-right whitespace-nowrap">ĐƠN GIÁ</th>
                    <th className="border border-gray-800 p-1.5 text-right whitespace-nowrap">THÀNH TIỀN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-800 p-1.5 text-center">1</td>
                    <td className="border border-gray-800 p-1.5 font-bold">{hoaDonData.theLoai}</td>
                    <td className="border border-gray-800 p-1.5 text-center">1</td>
                    <td className="border border-gray-800 p-1.5 text-right whitespace-nowrap">{formatTienInput(String(hoaDonData.giaTien || 0))}</td>
                    <td className="border border-gray-800 p-1.5 text-right whitespace-nowrap">{formatTienInput(String(hoaDonData.giaTien || 0))}</td>
                  </tr>
                  {hoaDonData.goiChup && (
                    <tr>
                      <td className="border border-gray-800 p-1.5 text-center"></td>
                      <td className="border border-gray-800 p-1.5 whitespace-pre-wrap text-gray-700 italic" colSpan={4}>Chi tiết: {hoaDonData.goiChup}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="flex justify-end mb-6">
                <table className="w-3/4 border-collapse border border-gray-800 text-[10px]">
                  <tbody>
                    <tr>
                      <td className="border border-gray-800 p-1.5 font-bold bg-gray-50">Tổng thanh toán</td>
                      <td className="border border-gray-800 p-1.5 text-right font-black">{formatTienInput(String(hoaDonData.giaTien || 0))}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-800 p-1.5 font-bold bg-gray-50">Khách đã cọc</td>
                      <td className="border border-gray-800 p-1.5 text-right font-black">{formatTienInput(String(hoaDonData.tienCoc || 0))}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-800 p-1.5 font-bold text-gray-900 uppercase">Còn phải thu</td>
                      <td className="border border-gray-800 p-1.5 text-right font-black text-gray-900 text-xs">{formatTienInput(String((hoaDonData.giaTien || 0) - (hoaDonData.tienCoc || 0)))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-start text-center text-[10px]">
                <div className="w-1/2">
                  <p className="font-bold mb-10 text-gray-800">Khách hàng</p>
                  <p className="font-bold text-gray-800">{hoaDonData.tenKhach}</p>
                </div>
                <div className="w-1/2">
                  <p className="italic text-gray-500 mb-1">Sơn La, Ngày {homNay().split('-')[2]} tháng {homNay().split('-')[1]} năm {homNay().split('-')[0]}</p>
                  <p className="font-bold text-gray-800 mb-10">Đại diện Cửa hàng</p>
                  <p className="font-bold text-gray-800">SURI WEDDING</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2 shrink-0">
              <button onClick={xuLyChiaSeAnh} disabled={dangIn} className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-black shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center text-sm">
                {dangIn ? "⏳ ĐANG XỬ LÝ..." : "📤 CHIA SẺ ẢNH MƯỢT MÀ"}
              </button>
              <button onClick={() => setHoaDonData(null)} className="px-6 py-3.5 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 active:scale-95 transition-all text-sm">
                Đóng
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}