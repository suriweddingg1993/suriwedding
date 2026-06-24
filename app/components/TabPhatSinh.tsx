import { useState } from "react";
import toast from "react-hot-toast";
import { PhatSinh, TaiKhoan } from "../../types";

// ĐỊNH NGHĨA KIỂU DỮ LIỆU ĐỂ BẢO VỆ FORM THU CHI
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
}

export default function TabPhatSinh({
  psNgay, setPsNgay, psTenKhach, setPsTenKhach, psSoDienThoai, setPsSoDienThoai, 
  psLoai, setPsLoai, psNgayTra, setPsNgayTra, psSoTien, setPsSoTien, psGhiChu, setPsGhiChu, 
  formatTienInput, themPhatSinh, danhSachPhatSinh, laAdmin, xoaPhatSinh,
  hoSoCuaToi, themThuHuong, danhDauDaTraDo
}: TabPhatSinhProps) {

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
  const [phatSinhDangChon, setPhatSinhDangChon] = useState<PhatSinh | null>(null);
  const [tienHoaHong, setTienHoaHong] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");

  const isThueDo = (loai: string) => (loai || "").toLowerCase().includes("thuê");

  // Gom nhóm dữ liệu theo ngày với Type rõ ràng
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
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    daysArray.push(dStr);
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToToday = () => {
    setCurrentMonth(new Date(localToday));
    setSelectedDate(localToday);
    setTuKhoa("");
  };

  const xacNhanNhanTien = () => {
    if (!tienHoaHong) { toast.error("Vui lòng nhập số tiền hoa hồng!"); return; }
    if (!hoSoCuaToi) { toast.error("Không tìm thấy thông tin tài khoản!"); return; }
    if (!phatSinhDangChon) return; 

    const moTaJob = `[Tư vấn ${phatSinhDangChon.loai}] KH: ${phatSinhDangChon.tenKhach || "Khách vãng lai"}`;
    themThuHuong(hoSoCuaToi.id, hoSoCuaToi.email, hoSoCuaToi.hoTen || "", phatSinhDangChon.ngay, moTaJob, tienHoaHong);
    setShowHoaHongModal(false);
    setTienHoaHong("");
  };

  const copyNhacTraDo = (item: PhatSinh) => {
    const ngayTra = item.ngayTra ? item.ngayTra.split('-').reverse().join('/') : "";
    const text = `Dạ Suri Wedding chào anh/chị ${item.tenKhach || ""}.\n\nEm nhắn tin báo mình có lịch trả đồ (${item.loai}) vào ngày hôm nay (${ngayTra}).\n\nAnh/chị nhớ sắp xếp thời gian gửi lại đồ cho studio giúp em nhé. Em cảm ơn ạ!`;
    navigator.clipboard.writeText(text);
    toast.success("Đã copy tin nhắn nhắc trả đồ!");
  };

  const clearForm = () => {
    setPsNgay(selectedDate);
    setPsTenKhach(""); setPsSoDienThoai(""); setPsLoai(""); setPsNgayTra(""); setPsSoTien(""); setPsGhiChu("");
  };

  let dsGiaoDichNgayNay: PhatSinh[] = [];
  if (tuKhoa.trim()) {
     const kw = tuKhoa.toLowerCase().trim();
     dsGiaoDichNgayNay = (danhSachPhatSinh || []).filter((item: PhatSinh) =>
        (item.tenKhach || "").toLowerCase().includes(kw) ||
        (item.soDienThoai || "").includes(kw) ||
        (item.ghiChu || "").toLowerCase().includes(kw)
     );
  } else {
     dsGiaoDichNgayNay = phatSinhTheoNgay[selectedDate] || [];
  }

  const dsTraDoNgayNay = danhSachPhatSinh.filter((ps: PhatSinh) => isThueDo(ps.loai) && ps.ngayTra === selectedDate);

  return (
    <div className="pb-24 px-2 pt-2">
      
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="🔍 Tìm giao dịch bằng Tên, SĐT, Ghi chú..." 
          value={tuKhoa} 
          onChange={(e) => setTuKhoa(e.target.value)} 
          className="w-full bg-white border border-gray-200 p-4 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-700 transition-all" 
        />
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
              
              const dsGiaoDich = phatSinhTheoNgay[dateStr] || [];
              const hasGiaoDich = dsGiaoDich.length > 0;
              const hasTraDo = danhSachPhatSinh.some((ps: PhatSinh) => isThueDo(ps.loai) && ps.ngayTra === dateStr && !ps.daTraDo);
              
              return (
                <div key={dateStr} className="flex flex-col items-center justify-start h-12 relative group">
                  <button 
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative w-10 h-10 flex items-center justify-center rounded-2xl text-sm transition-all
                      ${isSelected ? "bg-blue-600 text-white font-black shadow-lg shadow-blue-200 scale-105" : 
                        isToday ? "bg-blue-50 text-blue-700 font-black" : 
                        "hover:bg-gray-50 text-gray-700 font-bold"}
                    `}
                  >
                    {parseInt(dateStr.split('-')[2])}
                  </button>

                  <div className="mt-1 flex gap-1 h-1.5 absolute bottom-[-4px]">
                    {hasGiaoDich && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-300" : "bg-blue-400"}`}></span>}
                    {hasTraDo && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-amber-300" : "bg-orange-500 shadow-sm shadow-orange-200"}`}></span>}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex gap-5 justify-center mt-6 pt-4 border-t border-gray-100 text-[11px] font-bold text-gray-500">
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Thu / Chi</div>
            <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Cần thu hồi đồ</div>
          </div>
        </div>
      )}

      {dsTraDoNgayNay.length > 0 && !tuKhoa.trim() && (
        <div className="mb-8 animate-fade-in">
          <h3 className="font-black text-gray-800 text-lg mb-3 flex items-center gap-2 px-1">
            <span className="text-xl">🛎️</span> Trả đồ hôm nay
          </h3>
          <div className="space-y-3">
            {dsTraDoNgayNay.map((item: PhatSinh) => (
              <div key={`tra-${item.id}`} className={`p-5 rounded-3xl border shadow-sm transition-all ${item.daTraDo ? "bg-gray-50/50 border-gray-200 opacity-60" : "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 hover:shadow-md"}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-black text-gray-900 text-lg">{item.tenKhach || "Khách lẻ"}</div>
                    <div className="text-xs font-bold text-orange-700 bg-orange-100/50 px-2 py-1 rounded-md w-fit mt-1">{item.loai}</div>
                    {item.soDienThoai && <a href={`tel:${item.soDienThoai}`} className="text-sm text-blue-600 font-bold inline-block mt-2">📞 {item.soDienThoai}</a>}
                  </div>
                  {item.daTraDo ? (
                    <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-lg">ĐÃ TRẢ ĐỒ</span>
                  ) : (
                    <span className="bg-red-500 text-white shadow-sm shadow-red-200 text-[10px] font-black px-3 py-1.5 rounded-lg animate-pulse">CHƯA TRẢ</span>
                  )}
                </div>
                
                {!item.daTraDo && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-orange-200/50">
                    <button onClick={() => copyNhacTraDo(item)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95">
                      💬 Nhắc khách
                    </button>
                    <button onClick={() => item.id && danhDauDaTraDo(item.id)} className="flex-1 py-2 bg-green-500 text-white hover:bg-green-600 rounded-xl text-sm font-black transition-all shadow-md shadow-green-200 active:scale-95">
                      ✅ Đã nhận lại đồ
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4 flex justify-between items-end px-1 mt-6">
        <div>
          <h3 className="font-black text-gray-800 text-lg">{tuKhoa.trim() ? "Kết quả tìm kiếm" : "Giao dịch phát sinh"}</h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">
             {tuKhoa.trim() ? `Từ khóa: "${tuKhoa}"` : `Ngày ${selectedDate.split("-").reverse().join("/")}`}
          </p>
        </div>
        <div className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
          {dsGiaoDichNgayNay.length} Bản ghi
        </div>
      </div>

      <div className="space-y-4">
        {dsGiaoDichNgayNay.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4 opacity-50 grayscale">🧾</div>
            <h4 className="text-gray-600 font-bold text-base">{tuKhoa.trim() ? "Không có kết quả" : "Sổ quỹ trống"}</h4>
            <p className="text-xs text-gray-400 mt-2">{tuKhoa.trim() ? "Thử tìm bằng SĐT hoặc Tên khác nhé." : "Không có khoản Thu / Chi nào trong ngày."}</p>
          </div>
        ) : (
          [...dsGiaoDichNgayNay].reverse().map((item: PhatSinh) => {
            const isChi = item.loai?.includes("Chi");
            const isThue = isThueDo(item.loai);

            return (
              <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md group relative overflow-hidden">
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isChi ? "bg-red-500" : isThue ? "bg-orange-500" : "bg-blue-500"}`}></div>
                
                <div className="flex justify-between items-start pb-4 border-b border-gray-100 mb-4 ml-2">
                  <div>
                    <div className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase w-fit mb-2 ${
                      isChi ? "bg-red-50 text-red-600" : isThue ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                    }`}>
                      {item.loai}
                    </div>
                    {item.tenKhach && <div className="text-base font-black text-gray-900">{item.tenKhach}</div>}
                    {tuKhoa.trim() && <div className="text-xs font-bold text-blue-600 mt-1">📅 Ngày tạo giao dịch: {item.ngay.split("-").reverse().join("/")}</div>}
                  </div>
                  <div className={`text-xl font-black ${isChi ? "text-red-500" : "text-green-600"}`}>
                    {isChi ? "-" : "+"}{formatTienInput(String(item.soTien || 0))}
                  </div>
                </div>

                <div className="grid gap-2 text-sm ml-2">
                  {item.soDienThoai && <div className="text-gray-500 font-medium flex items-center gap-2">SĐT: <span className="font-bold text-gray-800">{item.soDienThoai}</span></div>}
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

      <button onClick={() => { clearForm(); setShowModal(true); }} className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-200/50 flex items-center justify-center text-3xl z-40 hover:scale-110 active:scale-90 transition-all">
        +
      </button>

      {/* FORM THÊM GIAO DỊCH PREMIUM */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in border border-white">
            <h2 className="text-2xl font-black mb-6 text-gray-900">✨ Ghi chép mới</h2>
            
            <div className="grid gap-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Ngày ghi</label>
                  <input type="date" value={psNgay} onChange={(e) => setPsNgay(e.target.value)} className="bg-slate-50 border border-transparent p-4 rounded-2xl w-full text-gray-900 font-bold focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Loại giao dịch</label>
                  <select value={psLoai} onChange={(e) => setPsLoai(e.target.value)} className="bg-slate-50 border border-transparent p-4 rounded-2xl w-full text-gray-900 font-bold focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all">
                    <option value="">- Chọn -</option>
                    <option value="Thuê váy">👗 Thuê Váy / Áo dài</option>
                    <option value="Thuê vest">👔 Thuê Vest</option>
                    <option value="Thuê phụ kiện">💍 Thuê Phụ kiện</option>
                    <option value="Thu - Dịch vụ lẻ">💵 Thu - Lẻ</option>
                    <option value="Chi - Mua sắm đồ">🛒 Chi - Mua sắm</option>
                    <option value="Chi - Khác">📉 Chi - Khác</option>
                  </select>
                </div>
              </div>

              <div><label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Tên Khách / Đối tác</label><input type="text" placeholder="Nhập tên..." value={psTenKhach} onChange={(e) => setPsTenKhach(e.target.value)} className="bg-slate-50 border border-transparent p-4 rounded-2xl w-full text-gray-900 font-bold focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all" /></div>
              <div><label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Số điện thoại</label><input type="text" placeholder="0987..." value={psSoDienThoai} onChange={(e) => setPsSoDienThoai(e.target.value)} className="bg-slate-50 border border-transparent p-4 rounded-2xl w-full text-gray-900 font-bold focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all" /></div>

              {isThueDo(psLoai) && (
                <div className="bg-orange-50/50 border border-orange-200 p-4 rounded-2xl">
                  <label className="text-[10px] font-black text-orange-700 uppercase ml-2 mb-1.5 block tracking-wide">📅 Ngày hẹn trả đồ</label>
                  <input type="date" value={psNgayTra} onChange={(e) => setPsNgayTra(e.target.value)} className="border border-orange-200 p-4 rounded-xl w-full bg-white font-black text-orange-800 focus:ring-4 focus:ring-orange-100 outline-none transition-all" />
                </div>
              )}

              <div>
                <label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Số tiền (VNĐ)</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" placeholder="VD: 500.000" value={psSoTien} onChange={(e) => setPsSoTien(formatTienInput(e.target.value))} className="bg-slate-50 border border-transparent p-4 rounded-2xl w-full pr-12 text-blue-700 font-black text-xl focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                  <span className="absolute right-5 top-5 text-gray-400 font-bold">đ</span>
                </div>
              </div>

              <div><label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Ghi chú chi tiết</label><input type="text" placeholder="Tên váy, tình trạng đồ..." value={psGhiChu} onChange={(e) => setPsGhiChu(e.target.value)} className="bg-slate-50 border border-transparent p-4 rounded-2xl w-full text-gray-900 font-bold focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all" /></div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => { themPhatSinh(); setShowModal(false); }} className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black shadow-lg shadow-gray-200 hover:bg-black active:scale-95 transition-all">Lưu Giao Dịch</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 active:scale-95 transition-all">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM NHẬN HOA HỒNG */}
      {showHoaHongModal && phatSinhDangChon && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl animate-fade-in border border-white">
            <h3 className="text-2xl font-black mb-2 text-blue-600 text-center tracking-tight">Chốt Đơn!</h3>
            <p className="text-xs text-gray-500 mb-6 text-center font-medium">Khai báo hoa hồng cho tư vấn dịch vụ này.</p>
            
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-5">
              <div className="text-[10px] text-blue-500 font-black mb-1.5 uppercase tracking-wide">{phatSinhDangChon.loai}</div>
              <div className="font-black text-gray-900 text-base">{phatSinhDangChon.tenKhach || "Khách lẻ"}</div>
              <div className="text-sm text-green-600 font-black mt-1.5">Giá trị: {formatTienInput(String(phatSinhDangChon.soTien || 0))} đ</div>
            </div>
            
            <div className="grid gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-2 block mb-1.5">Tiền hoa hồng (Sếp chia)</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" placeholder="VD: 50.000" value={tienHoaHong} onChange={(e) => setTienHoaHong(formatTienInput(e.target.value))} className="bg-white border border-blue-200 p-4 rounded-2xl w-full pr-10 font-black text-blue-700 text-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-blue-200" autoFocus />
                  <span className="absolute right-5 top-5 text-blue-600 font-black">đ</span>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={xacNhanNhanTien} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">💰 Nhận Tiền</button>
                <button onClick={() => setShowHoaHongModal(false)} className="px-6 py-4 bg-gray-100 font-bold text-gray-600 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}