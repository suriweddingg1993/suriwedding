import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Lich, TaiKhoan, GoiDichVu, PhatSinh, ThuHuong } from "../../types";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

// Nhập Component đã tách
import ModalHoaDon from "./ModalHoaDon";
import ModalThemLich from "./ModalThemLich";
import ModalQuanLyGoi from "./ModalQuanLyGoi";
import ModalBaoCao from "./ModalBaoCao";
import NutCopy from "./NutCopy"; 

function chuyenTienVeSo(value: string) { 
  return Number(value.replace(/\./g, "")); 
}

interface TabLichProps {
  homNay: () => string; dangSua: string | null; ngay: string; setNgay: (val: string) => void;
  ngayCuoi: string; setNgayCuoi: (val: string) => void;
  gio: string; setGio: (val: string) => void; tenKhach: string; setTenKhach: (val: string) => void;
  soDienThoai: string; setSoDienThoai: (val: string) => void; soDienThoai2: string; setSoDienThoai2: (val: string) => void;
  theLoai: string; setTheLoai: (val: string) => void; theLoaiKhac: string; setTheLoaiKhac: (val: string) => void;
  goiChup: string; setGoiChup: (val: string) => void; giaTien: string; setGiaTien: (val: string) => void;
  formatTienInput: (val: string) => string; themHoacSuaLich: () => Promise<void>; resetForm: () => void;
  lichTheoNgay: Record<string, Lich[]>; suaLich: (item: Lich) => void;
  capNhatTrangThai: (id: string, trangThai: string) => Promise<void>; hoSoCuaToi: TaiKhoan | null;
  themThuHuong: (uid: string, email: string, hoTen: string, ngay: string, moTa: string, soTien: string) => Promise<void>;
  laAdmin: boolean; xoaLich: (id: string) => Promise<void>; lichLamViec: Lich[]; 
  danhSachPhatSinh: PhatSinh[]; danhSachThuHuong: ThuHuong[];
}

export default function TabLich({
  homNay, dangSua, ngay, setNgay, ngayCuoi, setNgayCuoi, gio, setGio, tenKhach, setTenKhach, soDienThoai, setSoDienThoai, soDienThoai2, setSoDienThoai2,
  theLoai, setTheLoai, theLoaiKhac, setTheLoaiKhac, goiChup, setGoiChup, giaTien, setGiaTien, formatTienInput,
  themHoacSuaLich, resetForm, lichTheoNgay, suaLich, capNhatTrangThai,
  hoSoCuaToi, themThuHuong, laAdmin, xoaLich, lichLamViec, danhSachPhatSinh, danhSachThuHuong
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
  const [dichVuThem, setDichVuThem] = useState("");
  const [tienDichVuThem, setTienDichVuThem] = useState("");
  
  const [danhSachGoiDichVu, setDanhSachGoiDichVu] = useState<GoiDichVu[]>([]);
  const [showGoiModal, setShowGoiModal] = useState(false);
  const [tenGoiMoi, setTenGoiMoi] = useState("");
  const [chiTietGoiMoi, setChiTietGoiMoi] = useState("");
  const [giaGoiMoi, setGiaGoiMoi] = useState("");
  const [dangSuaGoi, setDangSuaGoi] = useState<string | null>(null);
  
  const [hoaDonData, setHoaDonData] = useState<Lich | null>(null);
  const [hdDiaChi, setHdDiaChi] = useState("");

  const danhSachLichRef = useRef<HTMLDivElement>(null);

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

  const chonNgayVaCuon = (dateStr: string) => {
    setSelectedDate(dateStr);
    setTimeout(() => {
      danhSachLichRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150); 
  };

  const xacNhanNhanTien = () => {
    if (!tienHoaHong) { toast.error("Vui lòng nhập số tiền!"); return; }
    if (!hoSoCuaToi) { toast.error("Không tìm thấy thông tin tài khoản!"); return; }
    if (!lichDangChon) return;
    const moTaJob = `[${vaiTro}] KH: ${lichDangChon.tenKhach} (${lichDangChon.theLoai})`;
    
    // LOGIC CHỐNG GIAN LẬN: Kiểm tra xem đã báo cáo Job này chưa
    const daBaoCao = danhSachThuHuong.some(th => th.uid === hoSoCuaToi.id && th.moTa === moTaJob);
    if (daBaoCao) {
      toast.error("Bạn đã nhận hoa hồng cho công đoạn này rồi!");
      return;
    }

    themThuHuong(hoSoCuaToi.id, hoSoCuaToi.email, hoSoCuaToi.hoTen || "", lichDangChon.ngay, moTaJob, tienHoaHong);
    setShowHoaHongModal(false); setTienHoaHong(""); setVaiTro("Chụp ảnh");
  };

  const copyNhacLich = (item: Lich) => {
    const ngayChup = item.ngay.split('-').reverse().join('/');
    const text = `Dạ Suri Wedding chào anh/chị ${item.tenKhach || ""}.\n\nEm nhắn tin báo mình có lịch hẹn (${item.theLoai}) vào lúc ⏰ ${item.gio} ngày ${ngayChup}.\n\nAnh/chị nhớ sắp xếp thời gian đến đúng giờ để có những bức ảnh đẹp nhất nhé. Em cảm ơn ạ!`;
    navigator.clipboard.writeText(text); toast.success("Đã copy tin nhắn nhắc khách!");
  };

  const openAddModal = () => { 
    resetForm(); 
    setNgay(selectedDate); 
    setNgayCuoi(""); 
    setTienCoc(""); 
    setDichVuThem(""); 
    setTienDichVuThem(""); 
    setErrors({}); 
    setShowModal(true); 
  };

  const suaLichNangCao = (item: any) => { 
    suaLich(item); 
    setNgayCuoi(item.ngayCuoi || ""); 
    setTienCoc(formatTienInput(String(item.tienCoc || 0))); 
    setDichVuThem(item.dichVuThem || ""); 
    setTienDichVuThem(formatTienInput(String(item.tienDichVuThem || 0))); 
    setErrors({}); 
    setShowModal(true); 
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
      setErrors(newErrors); toast.error("Vui lòng điền đủ thông tin và Số điện thoại (10-11 số)!"); return; 
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
    
    const duLieuLich: any = { 
      ngay, gio, tenKhach, soDienThoai, soDienThoai2, 
      theLoai: theLoaiCuoi, goiChup, 
      giaTien: chuyenTienVeSo(giaTien) || 0, 
      tienCoc: chuyenTienVeSo(tienCoc) || 0,
      dichVuThem,
      tienDichVuThem: chuyenTienVeSo(tienDichVuThem) || 0,
      ngayCuoi
    };

    if (!dangSua) {
      duLieuLich.trangThai = "Đã chốt lịch";
    }

    try {
      if (dangSua) { await updateDoc(doc(db, "lichStudio", dangSua), duLieuLich); toast.success("Đã lưu thay đổi!"); } 
      else { await addDoc(collection(db, "lichStudio"), duLieuLich); toast.success("Đã thêm lịch!"); } 
      setShowModal(false); resetForm(); setTienCoc(""); setDichVuThem(""); setTienDichVuThem(""); setNgayCuoi("");
    } catch (error) { toast.error("Có lỗi mạng"); }
  };

  const luuGoiDichVu = async () => {
    if (!tenGoiMoi || !giaGoiMoi) { toast.error("Vui lòng nhập tên gói và giá!"); return; }
    try {
      if (dangSuaGoi) { 
        await updateDoc(doc(db, "goiDichVu", dangSuaGoi), { tenGoi: tenGoiMoi, chiTiet: chiTietGoiMoi, giaTien: chuyenTienVeSo(giaGoiMoi) || 0 }); 
        toast.success("Cập nhật gói thành công!"); setDangSuaGoi(null); 
      } else { 
        await addDoc(collection(db, "goiDichVu"), { tenGoi: tenGoiMoi, chiTiet: chiTietGoiMoi, giaTien: chuyenTienVeSo(giaGoiMoi) || 0 }); 
        toast.success("Thêm gói thành công!"); 
      }
      setTenGoiMoi(""); setChiTietGoiMoi(""); setGiaGoiMoi("");
    } catch(e) { toast.error("Lỗi mạng!"); }
  };

  const xoaGoiDichVu = async (id: string) => { if (confirm("Chắc chắn xóa gói chụp mẫu này?")) await deleteDoc(doc(db, "goiDichVu", id)); };

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
              "Chưa liên hệ": "bg-slate-100 text-slate-600",
              "Đã chốt lịch": "bg-blue-100 text-blue-700",
              "Đã nhắc lịch": "bg-amber-100 text-amber-700",
              "Đã chụp xong": "bg-purple-100 text-purple-700",
              "Hoàn thành": "bg-emerald-100 text-emerald-700",
              "Hủy lịch": "bg-rose-100 text-rose-600" 
            };
            
            const tongTienCaLich = (item.giaTien || 0) + ((item as any).tienDichVuThem || 0);
            const tienNo = tongTienCaLich - (item.tienCoc || 0);
            
            const currentTrangThai = item.trangThai || "Đã chốt lịch";

            const laThangCu = item.ngay.substring(0, 7) < localToday.substring(0, 7);
            const daHoanThanh = currentTrangThai === "Hoàn thành";
            const biKhoaVoiNhanVien = (laThangCu || daHoanThanh) && !laAdmin;

            return (
              <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md group relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-500"></div>
                <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4 ml-2">
                  <div className="pr-2">
                    <div className="flex items-center gap-2 mb-2"><span className="bg-blue-50 text-blue-600 text-xs font-black px-2.5 py-1 rounded-lg">⏰ {item.gio}</span><span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${trangThaiColors[currentTrangThai] || trangThaiColors["Đã chốt lịch"]}`}>{currentTrangThai}</span></div>
                    <div className="text-lg font-black text-slate-900">{item.tenKhach}</div>
                    <div className="text-sm font-bold text-slate-500 mt-1">{item.theLoai}</div>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex gap-2">
                      {laAdmin && item.id && (<button onClick={() => xoaLich(item.id as string)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-full font-bold transition-all shadow-sm">🗑</button>)}
                      
                      {!biKhoaVoiNhanVien && (
                        <button onClick={() => suaLichNangCao(item)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-full font-bold transition-all shadow-sm">✏️</button>
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

      <ModalHoaDon hoaDonData={hoaDonData} setHoaDonData={setHoaDonData} hdDiaChi={hdDiaChi} setHdDiaChi={setHdDiaChi} homNay={homNay} formatTienInput={formatTienInput} danhSachPhatSinh={danhSachPhatSinh} />
      
      <ModalThemLich showModal={showModal} setShowModal={setShowModal} dangSua={dangSua} ngay={ngay} setNgay={setNgay} ngayCuoi={ngayCuoi} setNgayCuoi={setNgayCuoi} gio={gio} setGio={setGio} tenKhach={tenKhach} setTenKhach={setTenKhach} soDienThoai={soDienThoai} setSoDienThoai={setSoDienThoai} soDienThoai2={soDienThoai2} setSoDienThoai2={setSoDienThoai2} theLoai={theLoai} setTheLoai={setTheLoai} theLoaiKhac={theLoaiKhac} setTheLoaiKhac={setTheLoaiKhac} goiChup={goiChup} setGoiChup={setGoiChup} giaTien={giaTien} setGiaTien={setGiaTien} tienCoc={tienCoc} setTienCoc={setTienCoc} dichVuThem={dichVuThem} setDichVuThem={setDichVuThem} tienDichVuThem={tienDichVuThem} setTienDichVuThem={setTienDichVuThem} errors={errors} formatTienInput={formatTienInput} handleLuuLichThongMinh={handleLuuLichThongMinh} danhSachGoiDichVu={danhSachGoiDichVu} laAdmin={laAdmin} setShowGoiModal={setShowGoiModal} />
      
      <ModalQuanLyGoi showGoiModal={showGoiModal} setShowGoiModal={setShowGoiModal} dangSuaGoi={dangSuaGoi} setDangSuaGoi={setDangSuaGoi} tenGoiMoi={tenGoiMoi} setTenGoiMoi={setTenGoiMoi} chiTietGoiMoi={chiTietGoiMoi} setChiTietGoiMoi={setChiTietGoiMoi} giaGoiMoi={giaGoiMoi} setGiaGoiMoi={setGiaGoiMoi} formatTienInput={formatTienInput} luuGoiDichVu={luuGoiDichVu} danhSachGoiDichVu={danhSachGoiDichVu} xoaGoiDichVu={xoaGoiDichVu} laAdmin={laAdmin} />
      
      <ModalBaoCao showHoaHongModal={showHoaHongModal} setShowHoaHongModal={setShowHoaHongModal} lichDangChon={lichDangChon} vaiTro={vaiTro} setVaiTro={setVaiTro} tienHoaHong={tienHoaHong} setTienHoaHong={setTienHoaHong} formatTienInput={formatTienInput} xacNhanNhanTien={xacNhanNhanTien} />

    </div>
  );
}