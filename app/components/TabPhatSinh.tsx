import { useState } from "react";
import NutCopy from "./NutCopy";
import toast from "react-hot-toast";

export default function TabPhatSinh({
  psNgay, setPsNgay, psTenKhach, setPsTenKhach, psSoDienThoai, setPsSoDienThoai,
  psLoai, setPsLoai, psNgayTra, setPsNgayTra, psSoTien, setPsSoTien,
  psGhiChu, setPsGhiChu, formatTienInput, themPhatSinh, danhSachPhatSinh,
  laAdmin, xoaPhatSinh
}: any) {
  const [showModal, setShowModal] = useState(false);

  const copyZaloTraDo = (item: any) => {
    const ngayTraFormat = item.ngayTra ? item.ngayTra.split("-").reverse().join("/") : "";
    const text = `Dạ Suri Wedding chào anh/chị ${item.tenKhach}.\n\nEm thấy mình có lịch hẹn trả ${item.loai} vào ngày ${ngayTraFormat}.\nAnh/chị nhớ sắp xếp thời gian ghé qua cửa hàng gửi lại đồ giúp em nhé!\n\nEm cảm ơn anh/chị nhiều ạ.`;
    navigator.clipboard.writeText(text);
    toast.success("Đã copy tin nhắn nhắc trả đồ!");
  };

  return (
    <div className="pb-20">
      <div className="space-y-3">
        {[...danhSachPhatSinh].sort((a, b) => b.ngay.localeCompare(a.ngay)).map((item: any) => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <div className="font-bold text-gray-800">{item.loai}</div>
              <div className="text-xs text-gray-500">{item.ngay.split("-").reverse().join("/")} • {item.tenKhach}</div>
              {item.ngayTra && <div className="text-xs font-bold text-orange-600 mt-0.5">📅 Trả: {item.ngayTra.split("-").reverse().join("/")}</div>}
              <div className="font-bold text-green-600 mt-1">{Number(item.soTien || 0).toLocaleString("vi-VN")}đ</div>
            </div>
            <div className="flex gap-2">
              {item.ngayTra && <button onClick={() => copyZaloTraDo(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg">💬</button>}
              {laAdmin && <button onClick={() => xoaPhatSinh(item.id)} className="p-2 bg-red-50 text-red-500 rounded-lg">🗑</button>}
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setShowModal(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-bold hover:bg-green-700 z-40">+</button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Thêm phát sinh</h2>
            <div className="grid gap-3">
              <input type="date" value={psNgay} onChange={(e) => setPsNgay(e.target.value)} className="border p-3 rounded-xl" />
              <input type="text" placeholder="Tên khách" value={psTenKhach} onChange={(e) => setPsTenKhach(e.target.value)} className="border p-3 rounded-xl" />
              <select value={psLoai} onChange={(e) => setPsLoai(e.target.value)} className="border p-3 rounded-xl">
                <option value="">-- Chọn loại --</option>
                <option value="Thuê váy">Thuê váy</option>
                <option value="Thuê vest">Thuê vest</option>
                <option value="Khác">Khác</option>
              </select>
              {(psLoai === "Thuê váy" || psLoai === "Thuê vest") && (
                <input type="date" value={psNgayTra} onChange={(e) => setPsNgayTra(e.target.value)} className="border p-3 rounded-xl" />
              )}
              <input type="text" placeholder="Số tiền" value={psSoTien} onChange={(e) => setPsSoTien(formatTienInput(e.target.value))} className="border p-3 rounded-xl" />
              <div className="flex gap-2 mt-4">
                <button onClick={() => { themPhatSinh(); setShowModal(false); }} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold">Lưu lại</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-3 bg-gray-200 rounded-xl">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}