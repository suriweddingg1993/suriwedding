import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { PhatSinh, TaiKhoan, Lich } from "../../types"; // Thêm Lich

// Import các Modal vừa tách
import ModalThemPhatSinh from "./ModalThemPhatSinh";
import ModalHoaHongPhatSinh from "./ModalHoaHongPhatSinh";

function chuyenTienVeSo(value: string) { return Number(value.replace(/\./g, "")); }

interface TabPhatSinhProps {
  psNgay: string; setPsNgay: (val: string) => void;
  psTenKhach: string; setPsTenKhach: (val: string) => void;
  psSoDienThoai: string; setPsSoDienThoai: (val: string) => void;
  psLoai: string; setPsLoai: (val: string) => void;
  psNgayTra: string; setPsNgayTra: (val: string) => void;
  psSoTien: string; setPsSoTien: (val: string) => void;
  psGhiChu: string; setPsGhiChu: (val: string) => void;
  formatTienInput: (val: string) => string;
  themPhatSinh: () => Promise<void>;
  danhSachPhatSinh: PhatSinh[];
  laAdmin: boolean;
  xoaPhatSinh: (id: string) => Promise<void>;
  hoSoCuaToi: TaiKhoan | null;
  themThuHuong: (uid: string, email: string, hoTen: string, ngay: string, moTa: string, soTien: string) => Promise<void>;
  danhDauDaTraDo: (id: string) => Promise<void>;
  lichLamViec: Lich[]; // BẮT BUỘC THÊM PROP NÀY TỪ COMPONENT CHA (App.tsx)
}

export default function TabPhatSinh({
  psNgay, setPsNgay, psTenKhach, setPsTenKhach, psSoDienThoai, setPsSoDienThoai, 
  psLoai, setPsLoai, psNgayTra, setPsNgayTra, psSoTien, setPsSoTien, psGhiChu, setPsGhiChu, 
  formatTienInput, themPhatSinh, danhSachPhatSinh, laAdmin, xoaPhatSinh,
  hoSoCuaToi, themThuHuong, danhDauDaTraDo, lichLamViec
}: TabPhatSinhProps) {

  const getLocalToday = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 10);
  };

  const localToday = getLocalToday();

  const [selectedDate, setSelectedDate] = useState(localToday);
  const [currentMonth, setCurrentMonth] = useState(new Date(localToday));
  const [activeFilter, setActiveFilter] = useState("Tất cả"); // TẤT CẢ | ĐỒ THUÊ | LẺ

  const [showModal, setShowModal] = useState(false);
  const [showHoaHongModal, setShowHoaHongModal] = useState(false);
  const [phatSinhDangChon, setPhatSinhDangChon] = useState<PhatSinh | null>(null);
  const [tienHoaHong, setTienHoaHong] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (showModal || showHoaHongModal) { document.body.style.overflow = "hidden"; } 
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [showModal, showHoaHongModal]);

  const isThueDo = (loai: string) => (loai || "").toLowerCase().includes("thuê");

  const phatSinhTheoNgay = danhSachPhatSinh.reduce((acc: Record<string, PhatSinh[]>, item) => {
    if (!acc[item.ngay]) acc[item.ngay] = [];
    acc[item.ngay].push(item);
    return acc;
  }, {});

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7; 

  const daysArray: (string | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) { daysArray.push(null); }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToToday = () => { setCurrentMonth(new Date(localToday)); setSelectedDate(localToday); setTuKhoa(""); };

  const xacNhanNhanTien = () => {
    if (!tienHoaHong) { toast.error("Vui lòng nhập số tiền hoa hồng!"); return; }
    if (!hoSoCuaToi) { toast.error("Không tìm thấy thông tin tài khoản!"); return; }
    if (!phatSinhDangChon) return; 

    const moTaJob = `[Tư vấn ${phatSinhDangChon.loai}] KH: ${phatSinhDangChon.tenKhach || "Khách vãng lai"}`;
    themThuHuong(hoSoCuaToi.id, hoSoCuaToi.email, hoSoCuaToi.hoTen || "", phatSinhDangChon.ngay, moTaJob, tienHoaHong);
    setShowHoaHongModal(false); setTienHoaHong("");
  };

  const copyNhacTraDo = (item: PhatSinh) => {
    const ngayTra = item.ngayTra ? item.ngayTra.split('-').reverse().join('/') : "";
    const text = `Dạ Suri Wedding chào anh/chị ${item.tenKhach || ""}.\n\nEm nhắn tin báo mình có lịch hẹn trả đồ (${item.loai}) vào ngày hôm nay (${ngayTra}).\n\nAnh/chị nhớ sắp xếp thời gian gửi lại đồ cho studio giúp em nhé. Em cảm ơn ạ!`;
    navigator.clipboard.writeText(text); toast.success("Đã copy tin nhắn nhắc trả đồ!");
  };

  const clearForm = () => {
    setPsNgay(selectedDate);
    setPsTenKhach(""); setPsSoDienThoai(""); setPsLoai(""); setPsNgayTra(""); setPsSoTien(""); setPsGhiChu("");
    setErrors({});
  };

  const handleThemPhatSinh = async () => {
    const newErrors: Record<string, boolean> = {};
    if (!psNgay) newErrors.psNgay = true;
    if (!psLoai) newErrors.psLoai = true;
    if (!psSoTien || chuyenTienVeSo(psSoTien) <= 0) newErrors.psSoTien = true;
    if (isThueDo(psLoai) && !psNgayTra) newErrors.psNgayTra = true;
    if (psSoDienThoai && !/^[0-9]{10,11}$/.test(psSoDienThoai.replace(/\s/g, ""))) { newErrors.psSoDienThoai = true; }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); toast.error("Vui lòng điền đủ thông tin bôi đỏ!"); return;
    }

    setErrors({}); await themPhatSinh(); setShowModal(false);
  };

  // Xác định dữ liệu ngày hiện tại
  let dsGiaoDichNgayNay = tuKhoa.trim() 
    ? (danhSachPhatSinh || []).filter((item: PhatSinh) => (item.tenKhach || "").toLowerCase().includes(tuKhoa.toLowerCase().trim()) || (item.soDienThoai || "").includes(tuKhoa.trim()) || (item.ghiChu || "").toLowerCase().includes(tuKhoa.toLowerCase().trim()))
    : (phatSinhTheoNgay[selectedDate] || []);

  // Lọc theo Tab (Đồ thuê / Dịch vụ lẻ)
  if (activeFilter === "Đồ Thuê") dsGiaoDichNgayNay = dsGiaoDichNgayNay.filter(item => isThueDo(item.loai));
  if (activeFilter === "Lẻ") dsGiaoDichNgayNay = dsGiaoDichNgayNay.filter(item => !isThueDo(item.loai));

  // Thống kê Doanh Thu
  const tongThuNgayNay = (phatSinhTheoNgay[selectedDate] || []).reduce((sum, item) => sum + (item.soTien || 0), 0);
  const dsTraDoNgayNay = danhSachPhatSinh.filter((ps: PhatSinh) => isThueDo(ps.loai) && ps.ngayTra === selectedDate);

  return (
    <div className="pb-24 px-2 pt-2">
      
      <div className="mb-4">
        <input type="text" placeholder="🔍 Tìm bằng Tên, SĐT, Ghi chú..." value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} className="w-full bg-white border border-gray-200 p-4 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-700 transition-all" />
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
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
              <div key={d} className="text-[10px] font-black text-gray-400 uppercase mb-2">{d}</div>
            ))}
            
            {daysArray.map((dateStr, idx) => {
              if (!dateStr) return <div key={idx} className="p-2"></div>;
              const isToday = dateStr === localToday;
              const isSelected = dateStr === selectedDate;
              const hasGiaoDich = (phatSinhTheoNgay[dateStr] || []).length > 0;
              const hasTraDo = danhSachPhatSinh.some((ps: PhatSinh) => isThueDo(ps.loai) && ps.ngayTra === dateStr && !ps.daTraDo);
              
              return (
                <div key={dateStr} className="flex flex-col items-center justify-start h-12 relative group">
                  <button onClick={() => setSelectedDate(dateStr)} className={`relative w-10 h-10 flex items-center justify-center rounded-2xl text-sm transition-all ${isSelected ? "bg-blue-600 text-white font-black shadow-lg shadow-blue-200 scale-105" : isToday ? "bg-blue-50 text-blue-700 font-black" : "hover:bg-gray-50 text-gray-700 font-bold"}`}>
                    {parseInt(dateStr.split('-')[2])}
                  </button>
                  <div className="mt-1 flex gap-1 h-1.5 absolute bottom-[-4px]">
                    {hasGiaoDich && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-300" : "bg-emerald-400"}`}></span>}
                    {hasTraDo && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-amber-300" : "bg-orange-500 shadow-sm shadow-orange-200"}`}></span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* HIỂN THỊ KHÁCH TRẢ ĐỒ HÔM NAY */}
      {dsTraDoNgayNay.length > 0 && !tuKhoa.trim() && (
        <div className="mb-8 animate-fade-in">
          <h3 className="font-black text-gray-800 text-lg mb-3 flex items-center gap-2 px-1"><span className="text-xl">🛎️</span> Trả đồ hôm nay</h3>
          <div className="space-y-3">
            {dsTraDoNgayNay.map((item: PhatSinh) => (
              <div key={`tra-${item.id}`} className={`p-5 rounded-3xl border shadow-sm transition-all ${item.daTraDo ? "bg-gray-50/50 border-gray-200 opacity-60" : "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 hover:shadow-md"}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-black text-gray-900 text-lg">{item.tenKhach || "Khách lẻ"}</div>
                    <div className="text-xs font-bold text-orange-700 bg-orange-100/50 px-2 py-1 rounded-md w-fit mt-1">{item.loai}</div>
                    {item.soDienThoai && (
                      <div className="flex items-center gap-2 mt-2">
                        <a href={`tel:${item.soDienThoai}`} className="text-sm text-blue-600 font-bold hover:underline">{item.soDienThoai}</a>
                        <a href={`tel:${item.soDienThoai}`} className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 shadow-sm">📞</a>
                      </div>
                    )}
                  </div>
                  {item.daTraDo ? (<span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-lg">ĐÃ TRẢ ĐỒ</span>) : (<span className="bg-red-500 text-white shadow-sm shadow-red-200 text-[10px] font-black px-3 py-1.5 rounded-lg animate-pulse">CHƯA TRẢ</span>)}
                </div>
                {!item.daTraDo && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-orange-200/50">
                    <button onClick={() => copyNhacTraDo(item)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95">💬 Nhắc khách</button>
                    <button onClick={() => item.id && danhDauDaTraDo(item.id)} className="flex-1 py-2 bg-green-500 text-white hover:bg-green-600 rounded-xl text-sm font-black transition-all shadow-md shadow-green-200 active:scale-95">✅ Đã nhận lại đồ</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VÙNG THỐNG KÊ DOANH THU & FILTER */}
      {!tuKhoa.trim() && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-3xl mb-6 shadow-sm">
          <div>
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wide mb-1">Tổng thu ngày</div>
            <div className="text-2xl font-black text-emerald-700">{formatTienInput(String(tongThuNgayNay))} đ</div>
          </div>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm text-emerald-500">💰</div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 hide-scrollbar px-1">
        {['Tất cả', 'Đồ Thuê', 'Lẻ'].map(tab => (
          <button key={tab} onClick={() => setActiveFilter(tab)} className={`shrink-0 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${activeFilter === tab ? "bg-slate-800 text-white shadow-md" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* DANH SÁCH GIAO DỊCH */}
      <div className="space-y-4">
        {dsGiaoDichNgayNay.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4 opacity-50 grayscale">🧾</div>
            <h4 className="text-gray-600 font-bold text-base">{tuKhoa.trim() ? "Không có kết quả" : "Sổ quỹ trống"}</h4>
            <p className="text-xs text-gray-400 mt-2">Chưa có khoản thu nào được ghi chép.</p>
          </div>
        ) : (
          [...dsGiaoDichNgayNay].reverse().map((item: PhatSinh) => {
            const isThue = isThueDo(item.loai);

            return (
              <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md group relative overflow-hidden">
                {/* Viền trái: Đồ thuê màu Cam, Dịch vụ màu Xanh */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isThue ? "bg-orange-500" : "bg-blue-500"}`}></div>
                
                <div className="flex justify-between items-start pb-4 border-b border-gray-100 mb-4 ml-2">
                  <div>
                    {/* Tag nhãn: Trả lại thiết kế và màu y như bản gốc */}
                    <div className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase w-fit mb-2 ${
                      isThue ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      {item.loai}
                    </div>
                    {item.tenKhach && <div className="text-base font-black text-gray-900">{item.tenKhach}</div>}
                    {tuKhoa.trim() && <div className="text-xs font-bold text-blue-600 mt-1">📅 Thu ngày: {item.ngay.split("-").reverse().join("/")}</div>}
                  </div>
                  <div className="text-xl font-black text-green-600">
                    +{formatTienInput(String(item.soTien || 0))}
                  </div>
                </div>

                <div className="grid gap-2 text-sm ml-2">
                  {item.soDienThoai && (
                    <div className="text-gray-500 font-medium flex items-center gap-2">
                      SĐT: 
                      <a href={`tel:${item.soDienThoai}`} className="font-bold text-blue-600 hover:underline">{item.soDienThoai}</a>
                      <a href={`tel:${item.soDienThoai}`} className="w-7 h-7 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 shadow-sm ml-1" title="Gọi ngay">📞</a>
                    </div>
                  )}
                  {item.ghiChu && <div className="text-gray-600 italic bg-slate-50 p-3 rounded-xl text-xs border border-gray-100 mt-1">" {item.ghiChu} "</div>}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-gray-200 ml-2">
                  {isThue ? (
                    <button onClick={() => { setPhatSinhDangChon(item); setTienHoaHong(""); setShowHoaHongModal(true); }} className="bg-blue-50 text-blue-700 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-colors shadow-sm active:scale-95">
                      🙋‍♂️ Nhận Hoa hồng
                    </button>
                  ) : <div></div>}

                  {laAdmin && item.id && (
                    <button onClick={() => xoaPhatSinh(item.id as string)} className="w-9 h-9 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl font-bold transition-all opacity-50 group-hover:opacity-100">
                      🗑
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <button onClick={() => { clearForm(); setShowModal(true); }} className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-200/50 flex items-center justify-center text-3xl z-40 hover:scale-110 active:scale-90 transition-all">+</button>

      {/* RENDER MODAL */}
      <ModalThemPhatSinh
        showModal={showModal} setShowModal={setShowModal}
        psNgay={psNgay} setPsNgay={setPsNgay} psLoai={psLoai} setPsLoai={setPsLoai}
        psTenKhach={psTenKhach} setPsTenKhach={setPsTenKhach} psSoDienThoai={psSoDienThoai} setPsSoDienThoai={setPsSoDienThoai}
        psNgayTra={psNgayTra} setPsNgayTra={setPsNgayTra} psSoTien={psSoTien} setPsSoTien={setPsSoTien}
        psGhiChu={psGhiChu} setPsGhiChu={setPsGhiChu} errors={errors} formatTienInput={formatTienInput}
        handleThemPhatSinh={handleThemPhatSinh} isThueDo={isThueDo} lichLamViec={lichLamViec}
      />

      <ModalHoaHongPhatSinh
        showHoaHongModal={showHoaHongModal} setShowHoaHongModal={setShowHoaHongModal} phatSinhDangChon={phatSinhDangChon}
        tienHoaHong={tienHoaHong} setTienHoaHong={setTienHoaHong} formatTienInput={formatTienInput} xacNhanNhanTien={xacNhanNhanTien}
      />
    </div>
  );
}