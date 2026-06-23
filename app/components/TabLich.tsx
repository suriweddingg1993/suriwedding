import { useState } from "react";
import toast from "react-hot-toast";

export default function TabLich({
  dangSua, ngay, setNgay, gio, setGio, tenKhach, setTenKhach, soDienThoai, setSoDienThoai, soDienThoai2, setSoDienThoai2,
  theLoai, setTheLoai, theLoaiKhac, setTheLoaiKhac, goiChup, setGoiChup, giaTien, setGiaTien, formatTienInput,
  themHoacSuaLich, resetForm, lichTheoNgay, suaLich, capNhatTrangThai,
  hoSoCuaToi, themThuHuong, laAdmin, xoaLich, lichLamViec
}: any) {
  
  const getLocalToday = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 10);
  };

  const localToday = getLocalToday();

  const [selectedDate, setSelectedDate] = useState(localToday);
  const [currentMonth, setCurrentMonth] = useState(new Date(localToday));
  const [showModal, setShowModal] = useState(false);
  
  // States cho phần Thụ Hưởng
  const [showHoaHongModal, setShowHoaHongModal] = useState(false);
  const [lichDangChon, setLichDangChon] = useState<any>(null);
  const [tienHoaHong, setTienHoaHong] = useState("");
  const [vaiTro, setVaiTro] = useState("Chụp ảnh"); // Thêm state quản lý công đoạn
  
  const [tuKhoa, setTuKhoa] = useState(""); 

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
    setTuKhoa(""); 
  };

  const xacNhanNhanTien = () => {
    if (!tienHoaHong) { toast.error("Vui lòng nhập số tiền!"); return; }
    if (!hoSoCuaToi) { toast.error("Không tìm thấy thông tin tài khoản!"); return; }
    if (!lichDangChon) return;

    // Ghi rõ công đoạn vào mô tả job để Admin dễ kiểm soát bảng lương
    const moTaJob = `[${vaiTro}] KH: ${lichDangChon.tenKhach} (${lichDangChon.theLoai})`;
    themThuHuong(hoSoCuaToi.id, hoSoCuaToi.email, hoSoCuaToi.hoTen, lichDangChon.ngay, moTaJob, tienHoaHong);
    setShowHoaHongModal(false);
    setTienHoaHong("");
    setVaiTro("Chụp ảnh");
  };

  const copyNhacLich = (item: any) => {
    const ngayChup = item.ngay.split('-').reverse().join('/');
    const text = `Dạ Suri Wedding chào anh/chị ${item.tenKhach || ""}.\n\nEm nhắn tin báo mình có lịch hẹn (${item.theLoai} - ${item.goiChup || ""}) vào lúc ⏰ ${item.gio} ngày ${ngayChup}.\n\nAnh/chị nhớ sắp xếp thời gian đến đúng giờ để có những bức ảnh đẹp nhất nhé. Em cảm ơn ạ!`;
    navigator.clipboard.writeText(text);
    toast.success("Đã copy tin nhắn nhắc khách!");
  };

  const openAddModal = () => {
    resetForm();
    setNgay(selectedDate);
    setShowModal(true);
  };

  const handleLuuLich = async () => {
    await themHoacSuaLich();
    setShowModal(false);
  };

  let dsLichNgayNay = [];
  if (tuKhoa.trim()) {
     const kw = tuKhoa.toLowerCase().trim();
     dsLichNgayNay = (lichLamViec || []).filter((item: any) =>
        (item.tenKhach || "").toLowerCase().includes(kw) ||
        (item.soDienThoai || "").includes(kw) ||
        (item.soDienThoai2 || "").includes(kw)
     );
  } else {
     dsLichNgayNay = lichTheoNgay[selectedDate] || [];
  }

  return (
    <div className="pb-24 px-2 pt-2">
      
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="🔍 Tìm nhanh Tên khách hoặc Số điện thoại..." 
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
              const hasLich = (lichTheoNgay[dateStr] || []).length > 0;
              
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
                    {hasLich && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-300" : "bg-blue-500 shadow-sm shadow-blue-200"}`}></span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mb-4 flex justify-between items-end px-1 mt-6">
        <div>
          <h3 className="font-black text-gray-800 text-lg">{tuKhoa.trim() ? "Kết quả tìm kiếm" : "Lịch chụp Studio"}</h3>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">
             {tuKhoa.trim() ? `Từ khóa: "${tuKhoa}"` : `Ngày ${selectedDate.split("-").reverse().join("/")}`}
          </p>
        </div>
        <div className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
          {dsLichNgayNay.length} Kết quả
        </div>
      </div>

      <div className="space-y-4">
        {dsLichNgayNay.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4 opacity-50 grayscale">😴</div>
            <h4 className="text-gray-600 font-bold text-base">{tuKhoa.trim() ? "Không tìm thấy khách hàng" : "Lịch trống"}</h4>
            <p className="text-xs text-gray-400 mt-2">{tuKhoa.trim() ? "Vui lòng kiểm tra lại tên hoặc SĐT." : "Chưa có lịch hẹn nào được tạo trong ngày này."}</p>
          </div>
        ) : (
          [...dsLichNgayNay].sort((a, b) => a.gio.localeCompare(b.gio)).map((item: any) => {
            
            const trangThaiColors: Record<string, string> = {
              "Chưa liên hệ": "bg-gray-100 text-gray-600",
              "Đã gọi - Chờ": "bg-yellow-100 text-yellow-700",
              "Đã chốt lịch": "bg-blue-100 text-blue-700",
              "Đã chụp xong": "bg-green-100 text-green-700",
              "Hủy lịch": "bg-red-100 text-red-600",
            };

            return (
              <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md group relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-500"></div>
                
                <div className="flex justify-between items-start pb-4 border-b border-gray-100 mb-4 ml-2">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-50 text-blue-600 text-xs font-black px-2.5 py-1 rounded-lg">⏰ {item.gio}</span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${trangThaiColors[item.trangThai || "Chưa liên hệ"]}`}>
                        {item.trangThai || "Chưa liên hệ"}
                      </span>
                    </div>
                    <div className="text-lg font-black text-gray-900">{item.tenKhach}</div>
                    <div className="text-sm font-bold text-gray-500 mt-1">{item.theLoai} - {item.goiChup}</div>
                    {tuKhoa.trim() && <div className="text-xs font-bold text-blue-600 mt-1">📅 Ngày tạo lịch: {item.ngay.split("-").reverse().join("/")}</div>}
                  </div>
                  <div className="text-xl font-black text-green-600">
                    {formatTienInput(String(item.giaTien || 0))}
                  </div>
                </div>

                <div className="grid gap-2 text-sm ml-2">
                  <div className="text-gray-500 font-medium flex items-center gap-2">SĐT 1: <span className="font-bold text-gray-800">{item.soDienThoai}</span></div>
                  {item.soDienThoai2 && <div className="text-gray-500 font-medium flex items-center gap-2">SĐT 2: <span className="font-bold text-gray-800">{item.soDienThoai2}</span></div>}
                </div>

                <div className="flex flex-wrap gap-2 mt-4 ml-2">
                  <select
                    value={item.trangThai || "Chưa liên hệ"}
                    onChange={(e) => capNhatTrangThai(item.id, e.target.value)}
                    className="flex-1 bg-slate-50 border border-gray-200 text-gray-700 text-xs font-bold px-2 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-200 outline-none min-w-[110px]"
                  >
                    <option value="Chưa liên hệ">Chưa liên hệ</option>
                    <option value="Đã gọi - Chờ">Đã gọi - Chờ</option>
                    <option value="Đã chốt lịch">Đã chốt lịch</option>
                    <option value="Đã chụp xong">Đã chụp xong</option>
                    <option value="Hủy lịch">Hủy lịch</option>
                  </select>

                  <button onClick={() => copyNhacLich(item)} className="flex-1 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold px-2 py-2.5 rounded-xl transition-all shadow-sm min-w-[100px]">
                    💬 Nhắc lịch
                  </button>

                  <button onClick={() => { 
                    setLichDangChon(item); 
                    setTienHoaHong(""); 
                    setVaiTro("Chụp ảnh"); // Mặc định khi mở
                    setShowHoaHongModal(true); 
                  }} className="flex-1 bg-blue-50 text-blue-700 text-xs font-bold px-2 py-2.5 rounded-xl hover:bg-blue-100 transition-colors shadow-sm min-w-[100px]">
                    🙋‍♂️ Hoa hồng
                  </button>
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  {laAdmin && typeof xoaLich === 'function' && (
                    <button onClick={() => xoaLich(item.id)} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full font-bold transition-all opacity-50 group-hover:opacity-100">
                      🗑
                    </button>
                  )}
                  <button onClick={() => { suaLich(item); setShowModal(true); }} className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-full font-bold transition-all opacity-50 group-hover:opacity-100">
                    ✏️
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      <button onClick={openAddModal} className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-200/50 flex items-center justify-center text-3xl z-40 hover:scale-110 active:scale-90 transition-all">
        +
      </button>

      {/* FORM THÊM / SỬA LỊCH */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in border border-white">
            <h2 className="text-2xl font-black mb-6 text-gray-900">{dangSua ? "✏️ Cập nhật Lịch" : "✨ Thêm Lịch Mới"}</h2>
            
            <div className="grid gap-4">
              <div className="flex gap-3">
                <div className="flex-1"><label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Ngày chụp</label><input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none" /></div>
                <div className="flex-1"><label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Giờ chụp</label><input type="time" value={gio} onChange={(e) => setGio(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none" /></div>
              </div>

              <div><label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Tên Khách</label><input type="text" placeholder="Nhập tên..." value={tenKhach} onChange={(e) => setTenKhach(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none" /></div>
              
              <div className="flex gap-3">
                <div className="flex-1"><label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">SĐT 1</label><input type="text" placeholder="0987..." value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none" /></div>
                <div className="flex-1"><label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">SĐT 2</label><input type="text" placeholder="Dự phòng..." value={soDienThoai2} onChange={(e) => setSoDienThoai2(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none" /></div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Thể loại</label>
                  <select value={theLoai} onChange={(e) => setTheLoai(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none">
                    <option value="">- Chọn -</option><option value="Chụp Cưới">💍 Chụp Cưới</option><option value="Chụp Sự kiện">🎉 Sự kiện</option><option value="Chụp Chân dung">👤 Chân dung</option><option value="Chụp Gia đình">👨‍👩‍👧‍👦 Gia đình</option><option value="Chụp Kỷ yếu">🎓 Kỷ yếu</option><option value="Khác">✨ Khác</option>
                  </select>
                </div>
                {theLoai === "Khác" && (
                   <div className="flex-1"><label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Nhập loại khác</label><input type="text" placeholder="Nhập..." value={theLoaiKhac} onChange={(e) => setTheLoaiKhac(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none" /></div>
                )}
              </div>

              <div><label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Gói chụp (Chi tiết)</label><input type="text" placeholder="VD: Gói cao cấp 5tr..." value={goiChup} onChange={(e) => setGoiChup(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none" /></div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Giá tiền (VNĐ)</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" placeholder="VD: 5.000.000" value={giaTien} onChange={(e) => setGiaTien(formatTienInput(e.target.value))} className="bg-slate-50 p-4 rounded-2xl w-full pr-12 text-green-600 font-black text-xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none" />
                  <span className="absolute right-5 top-5 text-gray-400 font-bold">đ</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={handleLuuLich} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">💾 Lưu Lịch</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 active:scale-95 transition-all">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM NHẬN HOA HỒNG (ĐÃ SỬA THEO CÔNG ĐOẠN) */}
      {showHoaHongModal && lichDangChon && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl animate-fade-in border border-white">
            <h3 className="text-2xl font-black mb-2 text-blue-600 text-center tracking-tight">Hoàn Thành!</h3>
            <p className="text-xs text-gray-500 mb-6 text-center font-medium">Báo cáo công đoạn bạn đã làm để nhận lương.</p>
            
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-5">
              <div className="text-[10px] text-blue-500 font-black mb-1.5 uppercase tracking-wide">{lichDangChon.theLoai}</div>
              <div className="font-black text-gray-900 text-base">{lichDangChon.tenKhach}</div>
              <div className="text-sm text-green-600 font-black mt-1.5">Tổng HĐ: {formatTienInput(String(lichDangChon.giaTien || 0))} đ</div>
            </div>
            
            <div className="grid gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-2 block mb-1.5">Công đoạn của bạn</label>
                <select value={vaiTro} onChange={(e) => setVaiTro(e.target.value)} className="bg-white border border-blue-200 p-4 rounded-2xl w-full font-black text-gray-700 text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all">
                  <option value="Make-up">💄 Make-up</option>
                  <option value="Chụp ảnh">📸 Chụp ảnh</option>
                  <option value="Chỉnh sửa (Photoshop)">💻 Chỉnh sửa (Photoshop)</option>
                  <option value="Tư vấn / Hỗ trợ">🙋‍♂️ Tư vấn / Hỗ trợ</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-2 block mb-1.5">Tiền công / Hoa hồng</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" placeholder="VD: 300.000" value={tienHoaHong} onChange={(e) => setTienHoaHong(formatTienInput(e.target.value))} className="bg-white border border-blue-200 p-4 rounded-2xl w-full pr-10 font-black text-blue-700 text-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-blue-200" />
                  <span className="absolute right-5 top-5 text-blue-600 font-black">đ</span>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={xacNhanNhanTien} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">💰 Báo Cáo</button>
                <button onClick={() => setShowHoaHongModal(false)} className="px-6 py-4 bg-gray-100 font-bold text-gray-600 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}