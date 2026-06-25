import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Lich, TaiKhoan } from "../../types";
import { ChevronLeft, ChevronRight, Search, Plus, Printer, Edit2, Trash2, CheckCircle2, CalendarDays, Clock } from "lucide-react";

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
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
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
  
  const [hoaDonData, setHoaDonData] = useState<Lich | null>(null);
  const [hdDiaChi, setHdDiaChi] = useState("");
  const [hdDaCoc, setHdDaCoc] = useState("");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [chuKy, setChuKy] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7; 

  const daysArray: (string | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) { daysArray.push(null); }
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    daysArray.push(dStr);
  }

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
    const text = `Suri Studio xin chào anh/chị ${item.tenKhach || ""}.\n\nStudio xin phép nhắc nhẹ lịch hẹn (${item.theLoai} - ${item.goiChup || ""}) vào lúc ⏰ ${item.gio} ngày ${ngayChup}.\n\nAnh/chị vui lòng sắp xếp thời gian đến đúng giờ để có những bức ảnh đẹp nhất nhé. Trân trọng!`;
    navigator.clipboard.writeText(text); toast.success("Đã copy tin nhắn nhắc khách!");
  };

  const openAddModal = () => {
    resetForm();
    setNgay(selectedDate);
    setShowModal(true);
  };

  const handleLuuLich = async () => { await themHoacSuaLich(); setShowModal(false); };

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const pos = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) { ctx.beginPath(); ctx.moveTo(pos.x, pos.y); }
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const pos = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#18181b"; // zinc-900
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setChuKy(canvasRef.current.toDataURL("image/png"));
    }
  };

  const xoaChuKy = () => {
    setChuKy(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  let dsLichNgayNay: Lich[] = [];
  if (tuKhoa.trim()) {
     const kw = tuKhoa.toLowerCase().trim();
     dsLichNgayNay = (lichLamViec || []).filter((item: Lich) =>
        (item.tenKhach || "").toLowerCase().includes(kw) ||
        (item.soDienThoai || "").includes(kw) ||
        (item.soDienThoai2 || "").includes(kw)
     );
  } else {
     dsLichNgayNay = lichTheoNgay[selectedDate] || [];
  }

  return (
    <div className="pb-24 pt-2">
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-content, #invoice-content * { visibility: visible; }
          #invoice-content { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      {/* THANH TÌM KIẾM */}
      <div className="mb-6">
        <div className="relative">
          <input 
            type="text" placeholder="Tìm tên khách hoặc SĐT..." 
            value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} 
            className="w-full bg-white border border-zinc-200 p-4 pl-12 rounded-[1.5rem] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] focus:ring-4 focus:ring-zinc-100 outline-none font-medium text-zinc-800 transition-all placeholder:text-zinc-300" 
          />
          <Search className="absolute left-4 top-4 text-zinc-400" size={20} strokeWidth={2} />
        </div>
      </div>

      {/* LỊCH (CALENDAR) CAO CẤP */}
      {!tuKhoa.trim() && (
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] border border-zinc-100 p-6 mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <button onClick={goToToday} className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-zinc-900 transition-all">Hôm nay</button>
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="text-zinc-400 hover:text-zinc-900 transition-colors"><ChevronLeft size={20} strokeWidth={2} /></button>
              <div className="font-serif text-lg font-medium text-zinc-900 w-28 text-center capitalize">Tháng {month + 1}, {year}</div>
              <button onClick={nextMonth} className="text-zinc-400 hover:text-zinc-900 transition-colors"><ChevronRight size={20} strokeWidth={2} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
              <div key={d} className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-2">{d}</div>
            ))}
            
            {daysArray.map((dateStr, idx) => {
              if (!dateStr) return <div key={idx} className="p-2"></div>;
              const isToday = dateStr === localToday;
              const isSelected = dateStr === selectedDate;
              const hasLich = (lichTheoNgay[dateStr] || []).length > 0;
              return (
                <div key={dateStr} className="flex flex-col items-center justify-start h-10 relative group">
                  <button 
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative w-9 h-9 flex items-center justify-center rounded-full text-sm transition-all duration-300
                      ${isSelected ? "bg-zinc-900 text-white font-semibold shadow-md" : 
                        isToday ? "bg-zinc-100 text-zinc-900 font-semibold" : "hover:bg-zinc-50 text-zinc-600 font-medium"}
                    `}
                  >
                    {parseInt(dateStr.split('-')[2])}
                  </button>
                  <div className="mt-1 flex gap-1 h-1 absolute bottom-[-6px]">
                    {hasLich && <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-zinc-400" : "bg-zinc-900"}`}></span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* DANH SÁCH LỊCH */}
      <div className="mb-4 flex justify-between items-end px-1">
        <div>
          <h3 className="font-serif text-xl font-semibold text-zinc-900">{tuKhoa.trim() ? "Kết quả tìm kiếm" : "Lịch Studio"}</h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
             {tuKhoa.trim() ? `Từ khóa: "${tuKhoa}"` : `${selectedDate.split("-").reverse().join("/")}`}
          </p>
        </div>
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 px-3 py-1.5 rounded-full">
          {dsLichNgayNay.length} Bản ghi
        </div>
      </div>

      <div className="space-y-4">
        {dsLichNgayNay.length === 0 ? (
          <div className="bg-white border border-dashed border-zinc-200 rounded-[2rem] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
              <CalendarDays size={24} />
            </div>
            <h4 className="text-zinc-900 font-medium text-base">{tuKhoa.trim() ? "Không tìm thấy khách hàng" : "Trống lịch"}</h4>
            <p className="text-xs text-zinc-400 mt-2 font-light">{tuKhoa.trim() ? "Vui lòng kiểm tra lại tên hoặc SĐT." : "Không gian đang trống trong ngày này."}</p>
          </div>
        ) : (
          [...dsLichNgayNay].sort((a, b) => a.gio.localeCompare(b.gio)).map((item: Lich) => {
            // Tông màu Nude / Neutral tinh tế
            const trangThaiColors: Record<string, string> = {
              "Chưa liên hệ": "bg-zinc-100 text-zinc-600 border-zinc-200",
              "Đã gọi - Chờ": "bg-[#FAF5ED] text-[#A88B5A] border-[#F2E5D0]",
              "Đã chốt lịch": "bg-zinc-900 text-white border-zinc-900",
              "Đã chụp xong": "bg-[#F0F5F1] text-[#4E7A5A] border-[#DCE8DF]",
              "Hủy lịch": "bg-[#FCF0F0] text-[#9B4747] border-[#F5DADA]",
            };

            return (
              <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] border border-zinc-100 transition-all hover:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] group relative">
                
                <div className="flex justify-between items-start pb-5 border-b border-zinc-100 mb-5">
                  <div className="pr-2">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-zinc-900 text-sm font-bold flex items-center gap-1.5"><Clock size={14} className="text-zinc-400"/> {item.gio}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${trangThaiColors[item.trangThai || "Chưa liên hệ"]}`}>
                        {item.trangThai || "Chưa liên hệ"}
                      </span>
                    </div>
                    <div className="text-xl font-serif font-bold text-zinc-900 leading-tight">{item.tenKhach}</div>
                    <div className="text-xs font-medium text-zinc-500 mt-1 tracking-wide">{item.theLoai} • {item.goiChup}</div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-4 shrink-0">
                    <div className="flex gap-2">
                      {laAdmin && item.id && (<button onClick={() => xoaLich(item.id as string)} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></button>)}
                      <button onClick={() => { suaLich(item); setShowModal(true); }} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors"><Edit2 size={16} /></button>
                    </div>
                    <div className="text-lg font-bold text-zinc-900">{formatTienInput(String(item.giaTien || 0))}đ</div>
                  </div>
                </div>

                <div className="grid gap-2.5 text-xs ml-1 mb-5">
                  {item.soDienThoai && (
                    <div className="text-zinc-500 flex items-center gap-2">
                      SĐT: <a href={`tel:${item.soDienThoai}`} className="font-semibold text-zinc-900 hover:underline">{item.soDienThoai}</a>
                    </div>
                  )}
                  {item.soDienThoai2 && (
                    <div className="text-zinc-500 flex items-center gap-2">
                      SĐT 2: <a href={`tel:${item.soDienThoai2}`} className="font-semibold text-zinc-900 hover:underline">{item.soDienThoai2}</a>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={item.trangThai || "Chưa liên hệ"}
                    onChange={(e) => item.id && capNhatTrangThai(item.id, e.target.value)}
                    className="flex-1 bg-zinc-50 border border-zinc-200 text-zinc-700 text-[11px] uppercase tracking-wider font-bold px-3 py-3 rounded-xl focus:ring-2 focus:ring-zinc-200 outline-none min-w-[120px]"
                  >
                    <option value="Chưa liên hệ">Chưa liên hệ</option>
                    <option value="Đã gọi - Chờ">Đã gọi - Chờ</option>
                    <option value="Đã chốt lịch">Đã chốt lịch</option>
                    <option value="Đã chụp xong">Đã chụp xong</option>
                    <option value="Hủy lịch">Hủy lịch</option>
                  </select>

                  <button onClick={() => { setHoaDonData(item); setHdDiaChi(""); setHdDaCoc(""); xoaChuKy(); }} className="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 text-[11px] uppercase tracking-wider font-bold px-4 py-3 rounded-xl transition-all">
                    Hợp đồng
                  </button>

                  <button onClick={() => copyNhacLich(item)} className="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 text-[11px] uppercase tracking-wider font-bold px-4 py-3 rounded-xl transition-all">
                    Nhắc khách
                  </button>

                  <button onClick={() => { 
                    setLichDangChon(item); setTienHoaHong(""); setVaiTro("Chụp ảnh"); setShowHoaHongModal(true); 
                  }} className="flex-1 bg-zinc-900 text-white text-[11px] uppercase tracking-wider font-bold px-3 py-3 rounded-xl hover:bg-zinc-800 transition-colors min-w-[110px]">
                    Báo cáo
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* NÚT THÊM NỔI CAO CẤP */}
      <button onClick={openAddModal} className="fixed bottom-24 right-6 w-14 h-14 bg-zinc-900 text-white rounded-full shadow-xl shadow-zinc-300/50 flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-all">
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* FORM THÊM / SỬA LỊCH */}
      {showModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in border border-white/50">
            <h2 className="text-2xl font-serif font-bold mb-8 text-zinc-900 text-center">{dangSua ? "Cập nhật không gian" : "Tạo mới lịch trình"}</h2>
            <div className="grid gap-5">
              <div className="flex gap-4">
                <div className="flex-1"><label className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase ml-1 mb-2 block">Ngày chụp</label><input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 outline-none transition-colors" /></div>
                <div className="flex-1"><label className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase ml-1 mb-2 block">Giờ chụp</label><input type="time" value={gio} onChange={(e) => setGio(e.target.value)} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 outline-none transition-colors" /></div>
              </div>
              <div><label className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase ml-1 mb-2 block">Tên Khách</label><input type="text" placeholder="Nhập tên..." value={tenKhach} onChange={(e) => setTenKhach(e.target.value)} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 outline-none transition-colors" /></div>
              <div className="flex gap-4">
                <div className="flex-1"><label className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase ml-1 mb-2 block">SĐT 1</label><input type="text" placeholder="0987..." value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 outline-none transition-colors" /></div>
                <div className="flex-1"><label className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase ml-1 mb-2 block">SĐT 2</label><input type="text" placeholder="Dự phòng..." value={soDienThoai2} onChange={(e) => setSoDienThoai2(e.target.value)} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 outline-none transition-colors" /></div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase ml-1 mb-2 block">Thể loại</label>
                  <select value={theLoai} onChange={(e) => setTheLoai(e.target.value)} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 outline-none transition-colors">
                    <option value="">- Chọn -</option><option value="Chụp Cưới">💍 Chụp Cưới</option><option value="Chụp Sự kiện">🎉 Sự kiện</option><option value="Chụp Chân dung">👤 Chân dung</option><option value="Chụp Gia đình">👨‍👩‍👧‍👦 Gia đình</option><option value="Chụp Kỷ yếu">🎓 Kỷ yếu</option><option value="Khác">✨ Khác</option>
                  </select>
                </div>
                {theLoai === "Khác" && (
                   <div className="flex-1"><label className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase ml-1 mb-2 block">Nhập loại khác</label><input type="text" placeholder="Nhập..." value={theLoaiKhac} onChange={(e) => setTheLoaiKhac(e.target.value)} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 outline-none transition-colors" /></div>
                )}
              </div>
              <div><label className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase ml-1 mb-2 block">Gói dịch vụ</label><input type="text" placeholder="Chi tiết gói..." value={goiChup} onChange={(e) => setGoiChup(e.target.value)} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 outline-none transition-colors" /></div>
              <div>
                <label className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase ml-1 mb-2 block">Giá trị (VNĐ)</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" placeholder="VD: 5.000.000" value={giaTien} onChange={(e) => setGiaTien(formatTienInput(e.target.value))} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl w-full pr-12 text-zinc-900 font-bold text-xl focus:bg-white focus:border-zinc-300 outline-none transition-colors" />
                  <span className="absolute right-5 top-5 text-zinc-400 font-medium">đ</span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleLuuLich} className="flex-1 bg-zinc-900 text-white py-4 rounded-2xl font-bold tracking-wide shadow-lg shadow-zinc-200 hover:bg-zinc-800 active:scale-[0.98] transition-all">Lưu Lịch</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-4 bg-white border border-zinc-200 text-zinc-600 rounded-2xl font-bold tracking-wide hover:bg-zinc-50 active:scale-[0.98] transition-all">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM NHẬN HOA HỒNG */}
      {showHoaHongModal && lichDangChon && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-fade-in border border-white/50">
            <h3 className="text-2xl font-serif font-bold mb-2 text-zinc-900 text-center">Báo cáo hạng mục</h3>
            <p className="text-[11px] tracking-wide text-zinc-400 mb-6 text-center">Khai báo công việc hoàn thành.</p>
            
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 mb-6 text-center">
              <div className="text-[10px] text-zinc-500 font-bold mb-2 uppercase tracking-widest">{lichDangChon.theLoai}</div>
              <div className="font-serif font-bold text-zinc-900 text-xl leading-none">{lichDangChon.tenKhach}</div>
              <div className="text-sm text-zinc-500 font-medium mt-2">Tổng HĐ: {formatTienInput(String(lichDangChon.giaTien || 0))}đ</div>
            </div>
            
            <div className="grid gap-5">
              <div>
                <label className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase ml-1 mb-2 block">Công đoạn</label>
                <select value={vaiTro} onChange={(e) => setVaiTro(e.target.value)} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 outline-none transition-colors">
                  <option value="Make-up">💄 Make-up</option>
                  <option value="Chụp ảnh">📸 Chụp ảnh</option>
                  <option value="Chỉnh sửa (Photoshop)">💻 Chỉnh sửa (Photoshop)</option>
                  <option value="Tư vấn / Hỗ trợ">🙋‍♂️ Tư vấn / Hỗ trợ</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase ml-1 mb-2 block">Chiết khấu (VNĐ)</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" placeholder="VD: 300.000" value={tienHoaHong} onChange={(e) => setTienHoaHong(formatTienInput(e.target.value))} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl w-full pr-12 text-zinc-900 font-bold text-xl focus:bg-white focus:border-zinc-300 outline-none transition-colors" />
                  <span className="absolute right-5 top-5 text-zinc-400 font-medium">đ</span>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={xacNhanNhanTien} className="flex-1 bg-zinc-900 text-white font-bold tracking-wide py-4 rounded-2xl shadow-lg shadow-zinc-200 hover:bg-zinc-800 active:scale-[0.98] transition-all">Gửi Báo Cáo</button>
                <button onClick={() => setShowHoaHongModal(false)} className="px-6 py-4 bg-white border border-zinc-200 font-bold tracking-wide text-zinc-600 rounded-2xl hover:bg-zinc-50 active:scale-[0.98] transition-all">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL HỢP ĐỒNG KÈM CHỮ KÝ THEO PHONG CÁCH TẠP CHÍ ================= */}
      {hoaDonData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-md p-4 print:bg-white print:p-0">
          
          <div className="bg-[#FAF9F6] rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative print:shadow-none print:p-0 print:max-w-full print:overflow-visible">
            
            <div className="print:hidden mb-8 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
              <h3 className="font-bold text-zinc-900 mb-4 text-xs tracking-widest uppercase">Thông tin bổ sung</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 block mb-2">Địa chỉ</label>
                  <input type="text" placeholder="VD: Thuận Châu, Sơn La" value={hdDiaChi} onChange={(e) => setHdDiaChi(e.target.value)} className="bg-zinc-50/50 border border-zinc-200 p-3 rounded-xl w-full font-medium text-sm outline-none focus:border-zinc-400" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1 block mb-2">Đã cọc</label>
                  <div className="relative">
                    <input type="text" inputMode="numeric" placeholder="0" value={hdDaCoc} onChange={(e) => setHdDaCoc(formatTienInput(e.target.value))} className="bg-zinc-50/50 border border-zinc-200 p-3 rounded-xl w-full pr-8 font-semibold text-zinc-900 text-sm outline-none focus:border-zinc-400" />
                    <span className="absolute right-3 top-3 text-zinc-400 font-medium text-sm">đ</span>
                  </div>
                </div>
                
                <div className="sm:col-span-2 mt-2">
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Khách hàng Ký tên (Ký trực tiếp lên đây)</label>
                    <button onClick={xoaChuKy} className="text-[10px] font-bold text-zinc-400 hover:text-red-500 uppercase tracking-widest">Xoá lại</button>
                  </div>
                  <canvas 
                    ref={canvasRef}
                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                    className="w-full h-32 border border-zinc-200 rounded-xl bg-white cursor-crosshair touch-none"
                    style={{ touchAction: 'none' }}
                  />
                  <script>{`if(document.querySelector('canvas')){document.querySelector('canvas').width = document.querySelector('canvas').offsetWidth; document.querySelector('canvas').height = document.querySelector('canvas').offsetHeight;}`}</script>
                </div>
              </div>
            </div>

            {/* BẢN IN HỢP ĐỒNG THEO PHONG CÁCH TỐI GIẢN CAO CẤP */}
            <div id="invoice-content" className="text-zinc-900 bg-[#FAF9F6] p-4 max-w-[21cm] mx-auto font-sans">
              {/* Header Invoice */}
              <div className="flex justify-between items-start mb-10 pb-6 border-b border-zinc-300">
                <div>
                  <h1 className="text-3xl font-serif font-bold uppercase tracking-tight text-zinc-900">Suri Studio.</h1>
                  <div className="text-[10px] mt-2 space-y-1 font-medium text-zinc-600 uppercase tracking-widest">
                    <p>Thuận Châu, Sơn La</p>
                    <p>Hotline: 09xx.xxx.xxx</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-1">Hợp Đồng Dịch Vụ</h2>
                  <div className="text-lg font-serif">Nº {hoaDonData.id?.slice(-6).toUpperCase() || "A010098"}</div>
                  <div className="text-[10px] mt-1 font-medium text-zinc-500 tracking-wider">
                    Ngày {homNay().split('-').reverse().join('.')}
                  </div>
                </div>
              </div>

              {/* Thông tin khách hàng */}
              <div className="mb-10 text-sm font-medium text-zinc-800">
                <div className="grid grid-cols-[100px_1fr] gap-y-2">
                  <div className="text-zinc-500 uppercase text-[10px] tracking-widest pt-0.5">Khách hàng</div>
                  <div className="font-serif text-lg font-bold">{hoaDonData.tenKhach}</div>
                  
                  <div className="text-zinc-500 uppercase text-[10px] tracking-widest pt-0.5">Địa chỉ</div>
                  <div className="border-b border-zinc-200 border-dashed pb-0.5">{hdDiaChi || "......................................................................................"}</div>
                  
                  <div className="text-zinc-500 uppercase text-[10px] tracking-widest pt-0.5">Điện thoại</div>
                  <div>{hoaDonData.soDienThoai}</div>
                </div>
              </div>

              {/* Bảng Dịch Vụ */}
              <table className="w-full text-sm mb-10">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-widest">
                    <th className="py-3 text-left font-semibold">Mô tả dịch vụ</th>
                    <th className="py-3 text-right font-semibold">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  <tr>
                    <td className="py-4">
                      <div className="font-bold text-zinc-900">{hoaDonData.theLoai}</div>
                      <div className="text-xs text-zinc-500 mt-1 whitespace-pre-wrap">{hoaDonData.goiChup}</div>
                    </td>
                    <td className="py-4 text-right font-serif text-lg">{formatTienInput(String(hoaDonData.giaTien || 0))} ₫</td>
                  </tr>
                </tbody>
              </table>

              {/* Tổng kết Thanh toán */}
              <div className="flex justify-end mb-16">
                <div className="w-1/2">
                  <div className="flex justify-between py-2 text-xs font-medium uppercase tracking-widest text-zinc-500 border-b border-zinc-200">
                    <span>Tổng cộng</span>
                    <span className="text-zinc-900">{formatTienInput(String(hoaDonData.giaTien || 0))} ₫</span>
                  </div>
                  <div className="flex justify-between py-2 text-xs font-medium uppercase tracking-widest text-zinc-500 border-b border-zinc-200">
                    <span>Đã đặt cọc</span>
                    <span className="text-zinc-900">{formatTienInput(String(hdDaCoc || 0))} ₫</span>
                  </div>
                  <div className="flex justify-between py-4 text-sm font-bold uppercase tracking-widest text-zinc-900">
                    <span>Cần thanh toán</span>
                    <span className="font-serif text-xl">{formatTienInput(String((hoaDonData.giaTien || 0) - chuyenTienVeSo(hdDaCoc || "0")))} ₫</span>
                  </div>
                </div>
              </div>

              {/* Chữ Ký */}
              <div className="flex justify-between items-start text-center mt-12 px-8">
                <div className="flex flex-col items-center w-1/2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Đại diện Khách hàng</p>
                  <div className="h-24 w-40 flex items-center justify-center mt-2 border-b border-zinc-200">
                    {chuKy ? <img src={chuKy} alt="Chữ ký" className="max-h-full max-w-full mix-blend-multiply" /> : <span className="text-zinc-300 italic text-xs">Chữ ký</span>}
                  </div>
                  <p className="font-serif font-bold mt-3 text-lg">{hoaDonData.tenKhach}</p>
                </div>

                <div className="flex flex-col items-center w-1/2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Đại diện Studio</p>
                  <div className="h-24 w-40 flex items-center justify-center mt-2 border-b border-zinc-200">
                    {/* Thêm ảnh chữ ký của Studio nếu có */}
                  </div>
                  <p className="font-serif font-bold mt-3 text-lg">Suri Studio</p>
                </div>
              </div>
            </div>

            {/* Các nút hành động (Sẽ ẩn khi in) */}
            <div className="print:hidden mt-8 flex gap-3">
              <button onClick={() => window.print()} className="flex-1 bg-zinc-900 text-white py-4 rounded-xl font-bold tracking-wide shadow-lg shadow-zinc-200 hover:bg-zinc-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <Printer size={18} /> In Hợp Đồng
              </button>
              <button onClick={() => setHoaDonData(null)} className="px-8 py-4 bg-white border border-zinc-200 text-zinc-600 rounded-xl font-bold tracking-wide hover:bg-zinc-50 active:scale-[0.98] transition-all">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}