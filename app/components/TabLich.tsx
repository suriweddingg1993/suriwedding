import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function TabLich({
  dangSua, ngay, setNgay, gio, setGio, tenKhach, setTenKhach, soDienThoai, setSoDienThoai, 
  theLoai, setTheLoai, theLoaiKhac, setTheLoaiKhac, goiChup, setGoiChup, giaTien, setGiaTien, 
  formatTienInput, themHoacSuaLich, resetForm, lichTheoNgay, laAdmin, capNhatTrangThai, suaLich, xoaLich
}: any) {
  const [showModal, setShowModal] = useState(false);
  const [flashDate, setFlashDate] = useState("");
  const scrollRef = useRef<Record<string, HTMLDivElement | null>>({});

  // Cuộn đến hôm nay khi load
  useEffect(() => {
    const homNay = new Date().toISOString().slice(0, 10);
    if (scrollRef.current[homNay]) {
      scrollRef.current[homNay]?.scrollIntoView({ behavior: "smooth", block: "start" });
      setFlashDate(homNay);
      setTimeout(() => setFlashDate(""), 2000);
    }
  }, [lichTheoNgay]);

  // Hàm TÌM NGÀY NHANH
  const kiemTraNgay = (dateStr: string) => {
    if (!dateStr) return;
    if (scrollRef.current[dateStr]) {
      // Nếu có lịch -> Cuộn đến và nháy sáng
      scrollRef.current[dateStr]?.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashDate(dateStr);
      setTimeout(() => setFlashDate(""), 2000);
      toast.success("Ngày này đã có lịch!");
    } else {
      // Nếu không có lịch
      toast.success("✨ Ngày này đang trống lịch, có thể nhận khách!", {
        style: { border: '1px solid #4ade80', padding: '16px', color: '#166534', backgroundColor: '#f0fdf4' },
        iconTheme: { primary: '#16a34a', secondary: '#FFFAEE' },
      });
    }
  };

  return (
    <div className="pb-24 px-2">
      
      {/* THANH TÌM KIẾM NGÀY NHANH (Nằm cố định trên cùng) */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur py-3 mb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-600">🔍 Kiểm tra nhanh:</span>
          <input 
            type="date" 
            onChange={(e) => kiemTraNgay(e.target.value)} 
            className="flex-1 border-none bg-white shadow-sm p-2 rounded-xl text-blue-600 font-bold outline-none ring-1 ring-gray-200 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(lichTheoNgay).sort(([a], [b]) => a.localeCompare(b)).map(([ngayList, dsLich]: any) => (
          <div 
            key={ngayList} 
            ref={(el) => { scrollRef.current[ngayList] = el; }} 
            className={`mb-6 transition-all duration-1000 ${flashDate === ngayList ? "bg-blue-50 ring-2 ring-blue-300 rounded-2xl p-2" : ""}`}
          >
            {/* Header ngày */}
            <div className="flex items-center gap-2 mb-3 pl-1">
               <div className="text-xs font-bold bg-gray-200 px-2 py-0.5 rounded text-gray-600 uppercase">{ngayList}</div>
               <div className="text-xs text-gray-400">{dsLich.length} lịch</div>
            </div>
            
            {/* Danh sách lịch */}
            <div className="grid gap-3">
              {[...dsLich].sort((a, b) => a.gio.localeCompare(b.gio)).map((item: any) => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-lg font-black text-blue-600 leading-none">{item.gio}</span>
                    </div>
                    <div className="border-l pl-4 border-gray-100">
                      <div className="font-bold text-gray-800 text-[15px]">{item.tenKhach}</div>
                      <div className="text-[13px] text-gray-500">{item.goiChup}</div>
                      <div className="text-[13px] font-semibold text-green-600">
                        {Number(item.giaTien || 0).toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { suaLich(item); setShowModal(true); }} 
                    className="p-2 bg-gray-50 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg"
                  >
                    ✏️
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Nút thêm mới */}
      <button 
        onClick={() => { resetForm(); setShowModal(true); }} 
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl z-40 hover:scale-105 active:scale-95 transition-all"
      >
        +
      </button>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{dangSua ? "Sửa lịch" : "Thêm lịch mới"}</h2>
            
            {/* CẢNH BÁO THÔNG MINH TRONG MODAL */}
            {ngay && lichTheoNgay[ngay] && !dangSua && (
              <div className="mb-4 bg-orange-50 p-3 rounded-xl border border-orange-200">
                <div className="text-sm font-bold text-orange-700 mb-1">
                  ⚠️ Ngày này đã có {lichTheoNgay[ngay].length} lịch:
                </div>
                <div className="text-xs text-orange-600 flex flex-col gap-1">
                  {lichTheoNgay[ngay].map((l: any, idx: number) => (
                    <span key={idx}>• {l.gio} - {l.tenKhach} ({l.goiChup})</span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-3">
              <input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} className="border p-3 rounded-xl" />
              <input type="time" value={gio} onChange={(e) => setGio(e.target.value)} className="border p-3 rounded-xl" />
              <input type="text" placeholder="Tên khách" value={tenKhach} onChange={(e) => setTenKhach(e.target.value)} className="border p-3 rounded-xl" />
              <input type="text" placeholder="Số điện thoại" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} className="border p-3 rounded-xl" />
              <input type="text" placeholder="Gói chụp" value={goiChup} onChange={(e) => setGoiChup(e.target.value)} className="border p-3 rounded-xl" />
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="numeric" 
                  placeholder="Giá tiền" 
                  value={giaTien} 
                  onChange={(e) => setGiaTien(formatTienInput(e.target.value))} 
                  className="border p-3 rounded-xl w-full pr-10" 
                />
                <span className="absolute right-4 top-3.5 text-gray-400">đ</span>
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={() => { themHoacSuaLich(); setShowModal(false); }} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">Lưu lại</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-3 bg-gray-200 rounded-xl font-medium">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}