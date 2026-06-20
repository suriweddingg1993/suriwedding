import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function TabLich({ 
    lichTheoNgay, suaLich, resetForm, themHoacSuaLich, 
    ngay, setNgay, gio, setGio, tenKhach, setTenKhach, giaTien, setGiaTien, formatTienInput, dangSua 
}: any) {
  const [showModal, setShowModal] = useState(false);
  const scrollRef = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const homNay = new Date().toISOString().slice(0, 10);
    if (scrollRef.current[homNay]) {
      scrollRef.current[homNay]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [lichTheoNgay]);

  return (
    <div className="pb-20">
      <div className="space-y-6">
        {Object.entries(lichTheoNgay).map(([ngay, dsLich]: any) => (
          // ĐÃ SỬA LỖI Ở ĐÂY: Thêm ngoặc nhọn { } để hàm trả về void
          <div key={ngay} ref={(el) => { scrollRef.current[ngay] = el; }} className="p-2">
            <h3 className="font-bold text-blue-600 mb-2">{ngay}</h3>
            <div className="space-y-2">
              {dsLich.map((item: any) => (
                <div key={item.id} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                  <span>{item.gio} - {item.tenKhach}</span>
                  <button onClick={() => { suaLich(item); setShowModal(true); }} className="bg-yellow-100 p-1 rounded text-yellow-700">Sửa</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => { resetForm(); setShowModal(true); }} className="fixed bottom-20 right-5 bg-blue-600 text-white p-4 rounded-full shadow-xl">+</button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h2 className="font-bold mb-4">{dangSua ? "Sửa lịch" : "Thêm mới"}</h2>
            <div className="space-y-3">
              <input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} className="w-full border p-2 rounded" />
              <input type="time" value={gio} onChange={(e) => setGio(e.target.value)} className="w-full border p-2 rounded" />
              <input type="text" placeholder="Tên khách" value={tenKhach} onChange={(e) => setTenKhach(e.target.value)} className="w-full border p-2 rounded" />
              <input type="text" placeholder="Giá tiền" value={giaTien} onChange={(e) => setGiaTien(formatTienInput(e.target.value))} className="w-full border p-2 rounded" />
              <div className="flex gap-2">
                <button onClick={() => { themHoacSuaLich(); setShowModal(false); }} className="flex-1 bg-blue-600 text-white p-2 rounded">Lưu</button>
                <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 p-2 rounded">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}