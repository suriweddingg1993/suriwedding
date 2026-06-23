import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function TabLich({
  dangSua, ngay, setNgay, gio, setGio, tenKhach, setTenKhach, soDienThoai, setSoDienThoai, soDienThoai2, setSoDienThoai2,
  theLoai, setTheLoai, theLoaiKhac, setTheLoaiKhac, goiChup, setGoiChup, giaTien, setGiaTien, 
  formatTienInput, themHoacSuaLich, resetForm, lichTheoNgay, suaLich, capNhatTrangThai,
  hoSoCuaToi, themThuHuong
}: any) {
  
  // Lấy ngày hiện tại theo giờ Việt Nam
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
  const [showHoanThanhModal, setShowHoanThanhModal] = useState(false);
  const [lichDangChon, setLichDangChon] = useState<any>(null);
  const [tienHoaHong, setTienHoaHong] = useState("");
  const [vaiTroJob, setVaiTroJob] = useState("");

  const TRANG_THAI_PIPELINE = [
    "Chờ chụp",
    "Đã chụp - Chờ Edit",
    "Đã Edit - Chờ giao khách",
    "Hoàn tất (Đóng Job)"
  ];

  // ==========================================
  // LOGIC TẠO BẢNG LỊCH THÁNG
  // ==========================================
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Tính thứ của ngày đầu tiên (T2 = 0, CN = 6)
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
  // HÀM CHỨC NĂNG CỦA LỊCH
  // ==========================================
  const copyNhacLich = (item: any) => {
    const ngayFormat = item.ngay.split("-").reverse().join("/");
    const dichVu = item.goiChup || item.theLoai;
    const text = `Dạ Suri Wedding chào anh/chị ${item.tenKhach}.\n\nEm nhắn tin nhắc mình có lịch ${dichVu} vào lúc ${item.gio} ngày ${ngayFormat}.\n\nAnh/chị nhớ sắp xếp thời gian qua studio đúng giờ giúp em để ekip chuẩn bị chu đáo nhất nhé!\n\nCần hỗ trợ thêm anh/chị cứ nhắn em ạ.`;
    navigator.clipboard.writeText(text);
    toast.success("Đã copy tin nhắn nhắc lịch!");
  };

  const xacNhanNhanTienKhauCuaToi = () => {
    if (!vaiTroJob) { toast.error("Vui lòng chọn khâu bạn phụ trách!"); return; }
    if (!tienHoaHong) { toast.error("Vui lòng nhập số tiền hoa hồng!"); return; }
    if (!hoSoCuaToi) { toast.error("Không tìm thấy thông tin tài khoản!"); return; }

    const moTaJob = `[${vaiTroJob}] ${lichDangChon.goiChup || lichDangChon.theLoai} - KH: ${lichDangChon.tenKhach}`;
    
    themThuHuong(
      hoSoCuaToi.id, 
      hoSoCuaToi.email, 
      hoSoCuaToi.hoTen, 
      lichDangChon.ngay, 
      moTaJob, 
      tienHoaHong
    );

    setShowHoanThanhModal(false);
    setTienHoaHong("");
    setVaiTroJob("");
  };

  // Lấy danh sách lịch của NGÀY ĐANG CHỌN
  const dsLichHomNay = lichTheoNgay[selectedDate] || [];

  return (
    <div className="pb-24 px-2 pt-2">
      
      {/* ========================================== */}
      {/* KHU VỰC 1: BẢNG LỊCH THÁNG (CALENDAR GRID) */}
      {/* ========================================== */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-6">
        {/* Header Lịch */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={goToToday} className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg active:scale-95 transition-all border border-blue-100">Hôm nay</button>
          
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 text-gray-600 font-bold active:scale-90 transition-all">◀</button>
            <div className="font-black text-gray-800 text-base uppercase tracking-wide w-28 text-center">Tháng {month + 1}, {year}</div>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 text-gray-600 font-bold active:scale-90 transition-all">▶</button>
          </div>
        </div>

        {/* Lưới Lịch */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
            <div key={d} className="text-[10px] font-black text-gray-400 uppercase mb-2">{d}</div>
          ))}
          
          {daysArray.map((dateStr, idx) => {
            if (!dateStr) return <div key={idx} className="p-2"></div>;
            
            const isToday = dateStr === localToday;
            const isSelected = dateStr === selectedDate;
            const dsLichNgayNay = lichTheoNgay[dateStr] || [];
            const hasEvent = dsLichNgayNay.length > 0;
            
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

                {/* Dấu chấm đỏ báo hiệu có lịch */}
                <div className="mt-1 h-1.5 flex gap-0.5">
                  {hasEvent && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-600" : "bg-red-500"}`}></span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ========================================== */}
      {/* KHU VỰC 2: DANH SÁCH LỊCH TRONG NGÀY ĐANG CHỌN */}
      {/* ========================================== */}
      <div className="mb-4 flex justify-between items-end px-1">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Lịch trình chi tiết</h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">Ngày {selectedDate.split("-").reverse().join("/")}</p>
        </div>
        <div className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
          {dsLichHomNay.length} Lịch
        </div>
      </div>

      <div className="space-y-4">
        {dsLichHomNay.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center shadow-sm">
            <div className="text-4xl mb-3 opacity-50">🏝️</div>
            <h4 className="text-gray-500 font-bold text-sm">Không có lịch trình</h4>
            <p className="text-xs text-gray-400 mt-1">Ngày này đang trống, bạn có thể nhận thêm khách.</p>
          </div>
        ) : (
          [...dsLichHomNay].sort((a, b) => a.gio.localeCompare(b.gio)).map((item: any) => {
            const isHoanTat = item.trangThai === "Hoàn tất (Đóng Job)";
            const currentStatus = item.trangThai && TRANG_THAI_PIPELINE.includes(item.trangThai) ? item.trangThai : "Chờ chụp";

            return (
              <div key={item.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${isHoanTat ? "border-l-gray-300 opacity-70 bg-gray-50" : currentStatus.includes("Edit") ? "border-l-purple-500" : "border-l-blue-500"} border-y border-r border-gray-100 transition-colors animate-fade-in`}>
                
                {/* DẢI TRẠNG THÁI PIPELINE */}
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                  <select 
                    value={currentStatus}
                    onChange={(e) => capNhatTrangThai(item.id, e.target.value)}
                    className={`text-xs font-bold px-2 py-1 rounded-md outline-none cursor-pointer border ${
                      currentStatus === "Chờ chụp" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      currentStatus === "Đã chụp - Chờ Edit" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      currentStatus === "Đã Edit - Chờ giao khách" ? "bg-orange-50 text-orange-700 border-orange-200" :
                      "bg-gray-200 text-gray-600 border-gray-300"
                    }`}
                  >
                    {TRANG_THAI_PIPELINE.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>

                  <div className="flex gap-2">
                    {!isHoanTat && <button onClick={() => copyNhacLich(item)} className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors">💬 Nhắc lịch</button>}
                    <button onClick={() => { suaLich(item); setShowModal(true); }} className="px-2 py-1 bg-gray-50 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg text-xs font-bold transition-colors">✏️ Sửa</button>
                  </div>
                </div>

                {/* THÔNG TIN KHÁCH HÀNG */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center min-w-[50px]">
                    <span className={`text-xl font-black leading-none ${isHoanTat ? "text-gray-400" : "text-gray-800"}`}>{item.gio}</span>
                  </div>
                  <div className="border-l pl-4 border-gray-100 flex-1">
                    <div className="font-bold text-gray-800 text-[15px]">{item.tenKhach}</div>
                    <div className="text-[13px] text-gray-500 font-medium">{item.goiChup || item.theLoai}</div>
                    
                    {/* Hiển thị SĐT 1 và SĐT 2 */}
                    <div className="text-[12px] text-gray-500 mt-0.5 flex flex-wrap gap-1">
                      <span>📞</span> 
                      <a href={`tel:${item.soDienThoai}`} className="text-blue-600 font-semibold">{item.soDienThoai}</a>
                      {item.soDienThoai2 && (
                        <span className="ml-1"> - <a href={`tel:${item.soDienThoai2}`} className="text-blue-600 font-semibold">{item.soDienThoai2}</a></span>
                      )}
                    </div>

                    <div className="text-[13px] font-bold text-blue-800 mt-0.5">
                      {Number(item.giaTien || 0).toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                </div>

                {/* NÚT KHAI BÁO CÔNG VIỆC CÁ NHÂN */}
                {!isHoanTat && (
                  <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                    <button 
                      onClick={() => {
                        setLichDangChon(item);
                        setTienHoaHong("");
                        setVaiTroJob("");
                        setShowHoanThanhModal(true);
                      }}
                      className="w-full bg-green-50 text-green-700 font-bold py-2.5 rounded-lg hover:bg-green-100 border border-green-200 shadow-sm transition-all flex justify-center items-center gap-2"
                    >
                      🙋‍♂️ Báo cáo khâu của tôi (Nhận hoa hồng)
                    </button>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Nút thêm mới - Kế thừa tự động lấy ngày đang chọn */}
      <button onClick={() => { resetForm(); setNgay(selectedDate); setShowModal(true); }} className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl z-40 hover:scale-105 active:scale-95 transition-all">+</button>

      {/* ============================================== */}
      {/* MODAL 1: BÁO CÁO CÔNG VIỆC CÁ NHÂN (NHẬN TIỀN) */}
      {/* ============================================== */}
      {showHoanThanhModal && lichDangChon && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
            <h3 className="text-xl font-black mb-1 text-green-600 text-center">🎯 Báo cáo Job</h3>
            <p className="text-[11px] text-gray-500 mb-5 text-center font-medium">Nhiều người có thể cùng nhận tiền trên 1 Job này.</p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
              <div className="font-bold text-gray-800 text-sm">KH: {lichDangChon.tenKhach}</div>
              <div className="text-xs text-blue-700 font-semibold">{lichDangChon.goiChup || lichDangChon.theLoai}</div>
            </div>
            
            <div className="grid gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase ml-1 block mb-1">Khâu bạn phụ trách</label>
                <select value={vaiTroJob} onChange={(e) => setVaiTroJob(e.target.value)} className="border border-gray-200 p-3 rounded-xl w-full bg-white text-gray-900 font-bold focus:ring-2 focus:ring-blue-400 outline-none">
                  <option value="">-- Chọn vai trò --</option>
                  <option value="Makeup">💄 Makeup / Làm tóc</option>
                  <option value="Chụp chính">📸 Thợ Chụp chính</option>
                  <option value="Quay phim">🎥 Thợ Quay phim</option>
                  <option value="Phụ đèn">💡 Phụ đèn / Hắt sáng</option>
                  <option value="Photoshop">💻 Edit / Photoshop</option>
                  <option value="Sale">🗣 Tư vấn (Sale)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase ml-1 block mb-1">Hoa hồng được chia</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" placeholder="VD: 300.000" value={tienHoaHong} onChange={(e) => setTienHoaHong(formatTienInput(e.target.value))} className="border border-green-300 bg-green-50 p-3 rounded-xl w-full pr-8 font-black text-green-700 text-xl focus:ring-2 focus:ring-green-500 outline-none placeholder:text-green-300" />
                  <span className="absolute right-4 top-4 text-green-600 font-bold">đ</span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button onClick={xacNhanNhanTienKhauCuaToi} className="flex-1 bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200/50 active:scale-95 transition-all">💰 Nhận tiền</button>
                <button onClick={() => setShowHoanThanhModal(false)} className="px-5 py-3.5 bg-gray-100 font-bold text-gray-600 rounded-xl hover:bg-gray-200 active:scale-95 transition-all">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* MODAL 2: THÊM / SỬA LỊCH */}
      {/* ============================================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{dangSua ? "✏️ Sửa lịch" : "✨ Thêm lịch mới"}</h2>
            <div className="grid gap-3">
              <div className="flex gap-2">
                <div className="flex-1"><label className="text-[11px] text-gray-500 font-bold ml-1 mb-1 block uppercase">Ngày hẹn</label><input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} className="border p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none" /></div>
                <div className="flex-1"><label className="text-[11px] text-gray-500 font-bold ml-1 mb-1 block uppercase">Giờ hẹn</label><input type="time" value={gio} onChange={(e) => setGio(e.target.value)} className="border p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none" /></div>
              </div>
              <div><label className="text-[11px] text-gray-500 font-bold ml-1 mb-1 block uppercase">Tên khách hàng</label><input type="text" placeholder="VD: Cô dâu Thu Thủy" value={tenKhach} onChange={(e) => setTenKhach(e.target.value)} className="border p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none" /></div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[11px] text-gray-500 font-bold ml-1 mb-1 block uppercase">SĐT 1 (Bắt buộc)</label>
                  <input type="text" placeholder="0987..." value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} className="border p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none" />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] text-gray-500 font-bold ml-1 mb-1 block uppercase">SĐT 2 (Tùy chọn)</label>
                  <input type="text" placeholder="Số phụ..." value={soDienThoai2} onChange={(e) => setSoDienThoai2(e.target.value)} className="border p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none" />
                </div>
              </div>

              <div><label className="text-[11px] text-gray-500 font-bold ml-1 mb-1 block uppercase">Dịch vụ (Gói chụp)</label><input type="text" placeholder="VD: Phóng sự cưới, Album Studio..." value={goiChup} onChange={(e) => setGoiChup(e.target.value)} className="border p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none" /></div>
              <div>
                 <label className="text-[11px] text-gray-500 font-bold ml-1 mb-1 block uppercase">Tổng giá trị hợp đồng</label>
                 <div className="relative">
                   <input type="text" inputMode="numeric" placeholder="VD: 5.000.000" value={giaTien} onChange={(e) => setGiaTien(formatTienInput(e.target.value))} className="border p-3 rounded-xl w-full pr-10 bg-white text-blue-700 font-bold text-lg focus:ring-2 focus:ring-blue-400 outline-none" />
                   <span className="absolute right-4 top-3.5 text-gray-400 font-medium">đ</span>
                 </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-100 mt-2">
                <button onClick={() => { themHoacSuaLich(); setShowModal(false); }} className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200/50 hover:bg-blue-700 active:scale-95 transition-all">Lưu lịch</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 active:scale-95 transition-all">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}