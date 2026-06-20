import NutCopy from "./NutCopy";
import toast from "react-hot-toast";

export default function TabPhatSinh({
  psNgay, setPsNgay, psTenKhach, setPsTenKhach, psSoDienThoai, setPsSoDienThoai,
  psLoai, setPsLoai, psNgayTra, setPsNgayTra, psSoTien, setPsSoTien,
  psGhiChu, setPsGhiChu, formatTienInput, themPhatSinh, danhSachPhatSinh,
  laAdmin, xoaPhatSinh
}: any) {
  
  const copyZaloTraDo = (item: any) => {
    const ngayTraFormat = item.ngayTra ? item.ngayTra.split("-").reverse().join("/") : "";
    const text = `Dạ Suri Wedding chào anh/chị ${item.tenKhach}.\n\nEm thấy mình có lịch hẹn trả ${item.loai} vào ngày ${ngayTraFormat}.\nAnh/chị nhớ sắp xếp thời gian ghé qua cửa hàng gửi lại đồ giúp em để team kịp giặt là cho khách sau nhé!\n\nEm cảm ơn anh/chị nhiều ạ.`;
    navigator.clipboard.writeText(text);
    toast.success("Đã copy tin nhắn nhắc trả đồ!");
  };

  return (
    <div className="pb-20">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <h2 className="text-lg font-bold mb-4">💰 Thêm phát sinh</h2>
        <div className="grid gap-3">
          <input type="date" value={psNgay} onChange={(e) => setPsNgay(e.target.value)} className="border p-3 rounded-xl" />
          <input type="text" placeholder="Tên khách" value={psTenKhach} onChange={(e) => setPsTenKhach(e.target.value)} className="border p-3 rounded-xl" />
          <select value={psLoai} onChange={(e) => setPsLoai(e.target.value)} className="border p-3 rounded-xl">
            <option value="">-- Chọn loại phát sinh --</option>
            <option value="Thuê váy">Thuê váy</option>
            <option value="Thuê vest">Thuê vest</option>
            <option value="In/Rửa ảnh">In/Rửa ảnh</option>
            <option value="Khác">Khác</option>
          </select>
          <div className="relative">
            <input type="text" inputMode="numeric" placeholder="Số tiền" value={psSoTien} onChange={(e) => setPsSoTien(formatTienInput(e.target.value))} className="border p-3 rounded-xl w-full pr-10" />
            <span className="absolute right-4 top-3.5 text-gray-400">đ</span>
          </div>
          <button onClick={themPhatSinh} className="bg-blue-600 text-white p-3 rounded-xl font-bold">Thêm phát sinh</button>
        </div>
      </div>

      <div className="space-y-3">
        {[...danhSachPhatSinh].sort((a, b) => b.ngay.localeCompare(a.ngay)).map((item: any) => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <div className="font-bold text-gray-800">{item.loai}</div>
              <div className="text-xs text-gray-500">{item.ngay.split("-").reverse().join("/")} • {item.tenKhach}</div>
              <div className="font-bold text-green-600 mt-1">{Number(item.soTien || 0).toLocaleString("vi-VN")}đ</div>
            </div>
            <div className="flex gap-2">
              {item.ngayTra && <button onClick={() => copyZaloTraDo(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">💬</button>}
              {laAdmin && <button onClick={() => xoaPhatSinh(item.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">🗑</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}