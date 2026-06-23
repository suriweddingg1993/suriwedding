import { useState } from "react";
import toast from "react-hot-toast";

export default function TabPhatSinh({
  psNgay, setPsNgay, psTenKhach, setPsTenKhach, psSoDienThoai, setPsSoDienThoai, 
  psLoai, setPsLoai, psNgayTra, setPsNgayTra, psSoTien, setPsSoTien, psGhiChu, setPsGhiChu, 
  formatTienInput, themPhatSinh, danhSachPhatSinh, laAdmin, xoaPhatSinh,
  hoSoCuaToi, themThuHuong, danhDauDaTraDo
}: any) {

  // Lấy ngày hiện tại
  const getLocalToday = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 10);
  };

  const localToday = getLocalToday();

  // State Quản lý Lịch
  const [selectedDate, setSelectedDate] = useState(localToday);
  const [currentMonth, setCurrentMonth] = useState(new Date(localToday));

  // State Modals
  const [showModal, setShowModal] = useState(false);
  const [showHoaHongModal, setShowHoaHongModal] = useState(false);
  const [phatSinhDangChon, setPhatSinhDangChon] = useState<any>(null);
  const [tienHoaHong, setTienHoaHong] = useState("");

  const isThueDo = (loai: string) => loai === "Thuê váy" || loai === "Thuê vest";

  // Nhóm dữ liệu giao dịch theo ngày tạo
  const phatSinhTheoNgay = danhSachPhatSinh.reduce((acc: any, item: any) => {
    if (!acc[item.ngay]) acc[item.ngay] = [];
    acc[item.ngay].push(item);
    return acc;
  }, {});

  // ==========================================
  // LOGIC BẢNG LỊCH THÁNG
  // ==========================================
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7; 

  const daysArray = [];
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
  };

  // ==========================================
  // HÀM CHỨC NĂNG
  // ==========================================
  const xacNhanNhanTien = () => {
    if (!tienHoaHong) { toast.error("Vui lòng nhập số tiền hoa hồng!"); return; }
    if (!hoSoCuaToi) { toast.error("Không tìm thấy thông tin tài khoản!"); return; }

    const moTaJob = `[Tư vấn ${phatSinhDangChon.loai}] KH: ${phatSinhDangChon.tenKhach || "Khách vãng lai"}`;
    themThuHuong(hoSoCuaToi.id, hoSoCuaToi.email, hoSoCuaToi.hoTen, phatSinhDangChon.ngay, moTaJob, tienHoaHong);
    setShowHoaHongModal(false);
    setTienHoaHong("");
  };

  const copyNhacTraDo = (item: any) => {
    const text = `Dạ Suri Wedding chào anh/chị ${item.tenKhach || ""}.\n\nEm nhắn tin báo mình có lịch trả đồ (${item.loai}) vào ngày hôm nay (${item.ngayTra.split('-').reverse().join('/')}).\n\nAnh/chị nhớ sắp xếp thời gian gửi lại đồ cho studio giúp em nhé. Em cảm ơn ạ!`;
    navigator.clipboard.writeText(text);
    toast.success("Đã copy tin nhắn nhắc trả đồ!");
  };

  const clearForm = () => {
    setPsNgay(selectedDate); // Tự động điền ngày đang chọn trên lịch
    setPsTenKhach(""); setPsSoDienThoai(""); setPsLoai(""); setPsNgayTra(""); setPsSoTien(""); setPsGhiChu("");
  };

  // Lọc dữ liệu cho NGÀY ĐANG CHỌN
  const dsGiaoDichNgayNay = phatSinhTheoNgay[selectedDate] || [];
  
  // Tìm những món đồ CẦN TRẢ trong ngày đang chọn
  const dsTraDoNgayNay = danhSachPhatSinh.filter((ps: any) => isThueDo(ps.loai) && ps.ngayTra === selectedDate);

  return (
    <div className="pb-24 px-2 pt-2">
      
      {/* KHU VỰC 1: BẢNG LỊCH THÁNG */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex justify-between items-center mb-6">
          <button onClick={goToToday} className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg active:scale-95 transition-all border border-blue-100">Hôm nay</button>
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 text-gray-600 font-bold active:scale-90 transition-all">◀</button>
            <div className="font-black text-gray-800 text-base uppercase tracking-wide w-28 text-center">Tháng {month + 1}, {year}</div>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 text-gray-600 font-bold active:scale-90 transition-all">▶</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
            <div key={d} className="text-[10px] font-black text-gray-400 uppercase mb-2">{d}</div>
          ))}
          
          {daysArray.map((dateStr, idx) => {
            if (!dateStr) return <div key={idx} className="p-2"></div>;
            
            const isToday = dateStr === localToday;
            const isSelected = dateStr === selectedDate;
            
            // Logic báo chấm màu
            const dsGiaoDich = phatSinhTheoNgay[dateStr] || [];
            const hasGiaoDich = dsGiaoDich.length > 0;
            const hasTraDo = danhSachPhatSinh.some((ps: any) => isThueDo(ps.loai) && ps.ngayTra === dateStr && !ps.daTraDo);
            
            return (
              <div key={dateStr} className="flex flex-col items-center justify-start h-12">
                <button 
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative w-9 h-9 flex items-center justify-center rounded-full text-sm transition-all
                    ${isSelected ? "bg-blue-600 text-white font-black shadow-md shadow-blue-200" : 
                      isToday ? "bg-blue-50 text-blue-700 font-black border border-blue-200" : 
                      "hover:bg-gray-100 text-gray-700 font-medium"}
                  `}
                >
                  {parseInt(dateStr.split('-')[2])}
                </button>

                {/* Dấu chấm: Xanh/Đỏ = Giao dịch, Cam = Lịch trả đồ */}
                <div className="mt-1 flex gap-1 h-1.5">
                  {hasGiaoDich && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-600" : "bg-blue-400"}`}></span>}
                  {hasTraDo && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-orange-500" : "bg-orange-400"}`}></span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Chú thích màu */}
        <div className="flex gap-4 justify-center mt-4 pt-4 border-t border-gray-100 text-[10px] font-bold text-gray-400">
           <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Có giao dịch</div>
           <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Cần thu hồi đồ</div>
        </div>
      </div>

      {/* ========================================== */}
      {/* KHU VỰC 2: NỘI DUNG TRONG NGÀY ĐANG CHỌN */}
      {/* ========================================== */}
      
      {/* --- MỤC A: LỊCH TRẢ ĐỒ --- */}
      {dsTraDoNgayNay.length > 0 && (
        <div className="mb-6 animate-fade-in">
          <h3 className="font-bold text-orange-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="text-xl">🛎️</span> Lịch trả đồ hôm nay
          </h3>
          <div className="space-y-3">
            {dsTraDoNgayNay.map((item: any) => (
              <div key={`tra-${item.id}`} className={`p-4 rounded-xl border border-orange-200 shadow-sm transition-colors ${item.daTraDo ? "bg-gray-50 border-gray-200 opacity-60" : "bg-orange-50/50"}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-black text-gray-800">{item.tenKhach || "Khách lẻ"}</div>
                    <div className="text-xs font-bold text-orange-600">{item.loai}</div>
                    {item.soDienThoai && <a href={`tel:${item.soDienThoai}`} className="text-xs text-blue-600 font-semibold inline-block mt-1">📞 {item.soDienThoai}</a>}
                  </div>
                  {item.daTraDo ? (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">ĐÃ TRẢ</span>
                  ) : (
                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded animate-pulse">CHƯA TRẢ</span>
                  )}
                </div>
                
                {!item.daTraDo && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-orange-100 border-dashed">
                    <button onClick={() => copyNhacTraDo(item)} className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors shadow-sm">
                      💬 Copy tin nhắn nhắc
                    </button>
                    <button onClick={() => danhDauDaTraDo(item.id)} className="flex-1 py-1.5 bg-green-500 text-white hover:bg-green-600 rounded-lg text-xs font-bold transition-colors shadow-sm">
                      ✅ Xác nhận đã thu đồ
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MỤC B: LỊCH SỬ GIAO DỊCH (THU/CHI) --- */}
      <div className="mb-4 flex justify-between items-end px-1 mt-6">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Giao dịch phát sinh</h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">Ngày {selectedDate.split("-").reverse().join("/")}</p>
        </div>
        <div className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
          {dsGiaoDichNgayNay.length} Bản ghi
        </div>
      </div>

      <div className="space-y-4">
        {dsGiaoDichNgayNay.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="text-4xl mb-3 opacity-50">💰</div>
            <h4 className="text-gray-500 font-bold text-sm">Không có giao dịch</h4>
            <p className="text-xs text-gray-400 mt-1">Không có khoản Thu/Chi nào tạo trong ngày này.</p>
          </div>
        ) : (
          [...dsGiaoDichNgayNay].reverse().map((item: any) => {
            const isChi = item.loai?.includes("Chi");
            const isThue = isThueDo(item.loai);

            return (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-y border-r border-gray-100 transition-colors hover:border-blue-200" style={{ borderLeftColor: isChi ? "#ef4444" : isThue ? "#f97316" : "#3b82f6" }}>
                <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-3">
                  <div>
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase w-fit mb-1 ${
                      isChi ? "bg-red-50 text-red-600 border border-red-100" : 
                      isThue ? "bg-orange-50 text-orange-600 border border-orange-100" : 
                      "bg-blue-50 text-blue-600 border border-blue-100"
                    }`}>
                      {item.loai}
                    </div>
                    {item.tenKhach && <div className="text-sm font-bold text-gray-800">{item.tenKhach}</div>}
                  </div>
                  <div className={`text-lg font-black ${isChi ? "text-red-500" : "text-green-600"}`}>
                    {isChi ? "-" : "+"}{formatTienInput(String(item.soTien || 0))}đ
                  </div>
                </div>

                <div className="grid gap-1 text-xs mb-3 text-gray-600">
                  {item.soDienThoai && <div>SĐT: <span className="font-semibold">{item.soDienThoai}</span></div>}
                  {item.ghiChu && <div className="italic bg-gray-50 p-2 rounded mt-1">" {item.ghiChu} "</div>}
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-200">
                  {isThue ? (
                    <button onClick={() => { setPhatSinhDangChon(item); setTienHoaHong(""); setShowHoaHongModal(true); }} className="bg-blue-50 text-blue-700 text-[11px] font-bold px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors shadow-sm">
                      🙋‍♂️ Nhận Hoa hồng Tư vấn
                    </button>
                  ) : <div></div>}

                  {laAdmin && (
                    <button onClick={() => xoaPhatSinh(item.id)} className="px-2 py-1 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg text-xs font-bold transition-colors">
                      🗑 Xóa
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Nút thêm mới FAB */}
      <button onClick={() => { clearForm(); setShowModal(true); }} className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl z-40 hover:scale-105 active:scale-95 transition-all">
        +
      </button>

      {/* ============================================== */}
      {/* MODAL 1: THÊM GIAO DỊCH MỚI */}
      {/* ============================================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-gray-800">✨ Thêm Thu / Chi</h2>
            
            <div className="grid gap-3">
              <div className="flex gap-2">
                <div className="flex-1"><label className="text-[11px] text-gray-500 font-bold ml-1 mb-1 block uppercase">Ngày ghi</label><input type="date" value={psNgay} onChange={(e) => setPsNgay(e.target.value)} className="border p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none" /></div>
                <div className="flex-1">
                  <label className="text-[11px] text-gray-500 font-bold ml-1 mb-1 block uppercase">Loại</label>
                  <select value={psLoai} onChange={(e) => setPsLoai(e.target.value)} className="border p-3 rounded-xl w-full bg-white text-gray-900 font-bold focus:ring-2 focus:ring-blue-400 outline-none">
                    <option value="">- Chọn -</option>
                    <option value="Thuê váy">👗 Thuê Váy</option>
                    <option value="Thuê vest">👔 Thuê Vest</option>
                    <option value="Thu - Dịch vụ lẻ">💵 Thu - Lẻ</option>
                    <option value="Chi - Mua sắm đồ">🛒 Chi - Mua sắm</option>
                    <option value="Chi - Khác">📉 Chi - Khác</option>
                  </select>
                </div>
              </div>

              <div><label className="text-[11px] text-gray-500 font-bold ml-1 mb-1 block uppercase">Tên Khách / Người nhận</label><input type="text" placeholder="Nguyễn Văn A..." value={psTenKhach} onChange={(e) => setPsTenKhach(e.target.value)} className="border p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none" /></div>
              <div><label className="text-[11px] text-gray-500 font-bold ml-1 mb-1 block uppercase">Số điện thoại</label><input type="text" placeholder="0987..." value={psSoDienThoai} onChange={(e) => setPsSoDienThoai(e.target.value)} className="border p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none" /></div>

              {isThueDo(psLoai) && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl">
                  <label className="text-[11px] font-bold text-orange-700 uppercase ml-1 block mb-1">📅 Hẹn ngày trả đồ</label>
                  <input type="date" value={psNgayTra} onChange={(e) => setPsNgayTra(e.target.value)} className="border border-orange-300 p-3 rounded-xl w-full bg-white font-bold text-orange-800 focus:ring-2 focus:ring-orange-400 outline-none" />
                </div>
              )}

              <div>
                <label className="text-[11px] text-gray-500 font-bold ml-1 mb-1 block uppercase">Số tiền (VNĐ)</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" placeholder="VD: 500.000" value={psSoTien} onChange={(e) => setPsSoTien(formatTienInput(e.target.value))} className="border p-3 rounded-xl w-full pr-10 bg-white text-blue-700 font-black text-xl focus:ring-2 focus:ring-blue-400 outline-none" />
                  <span className="absolute right-4 top-4 text-gray-400 font-bold">đ</span>
                </div>
              </div>

              <div><label className="text-[11px] text-gray-500 font-bold ml-1 mb-1 block uppercase">Ghi chú thêm</label><input type="text" placeholder="Tên váy, tình trạng đồ..." value={psGhiChu} onChange={(e) => setPsGhiChu(e.target.value)} className="border p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none" /></div>

              <div className="flex gap-2 pt-4 border-t border-gray-100 mt-2">
                <button onClick={() => { themPhatSinh(); setShowModal(false); }} className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200/50 hover:bg-blue-700 active:scale-95 transition-all">💾 Lưu lại</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 active:scale-95 transition-all">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* MODAL 2: BÁO CÁO HOA HỒNG TƯ VẤN THUÊ ĐỒ */}
      {/* ============================================== */}
      {showHoaHongModal && phatSinhDangChon && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
            <h3 className="text-xl font-black mb-1 text-blue-600 text-center">👗 Chốt Đơn!</h3>
            <p className="text-[11px] text-gray-500 mb-5 text-center font-medium">Bạn xứng đáng nhận hoa hồng cho tư vấn này.</p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
              <div className="text-xs text-gray-500 font-bold mb-1 uppercase">{phatSinhDangChon.loai}</div>
              <div className="font-bold text-gray-800 text-sm">KH: {phatSinhDangChon.tenKhach || "Khách lẻ"}</div>
              <div className="text-sm text-green-600 font-black mt-1">Hợp đồng: {formatTienInput(String(phatSinhDangChon.soTien || 0))}đ</div>
            </div>
            
            <div className="grid gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase ml-1 block mb-1">Hoa hồng được Sếp chia</label>
                <div className="relative">
                  <input 
                    type="text" 
                    inputMode="numeric" 
                    placeholder="VD: 50.000" 
                    value={tienHoaHong} 
                    onChange={(e) => setTienHoaHong(formatTienInput(e.target.value))} 
                    className="border border-blue-300 bg-blue-50 p-3 rounded-xl w-full pr-8 font-black text-blue-700 text-xl focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-blue-300" 
                    autoFocus
                  />
                  <span className="absolute right-4 top-4 text-blue-600 font-bold">đ</span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button onClick={xacNhanNhanTien} className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200/50 active:scale-95 transition-all">
                  💰 Nhận tiền
                </button>
                <button onClick={() => setShowHoaHongModal(false)} className="px-5 py-3.5 bg-gray-100 font-bold text-gray-600 rounded-xl hover:bg-gray-200 active:scale-95 transition-all">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
