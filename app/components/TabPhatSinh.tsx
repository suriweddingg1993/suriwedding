import NutCopy from "./NutCopy";
import toast from "react-hot-toast"; // <-- Đã thêm vũ khí Toast

export default function TabPhatSinh({
  psNgay, setPsNgay, psTenKhach, setPsTenKhach, psSoDienThoai, setPsSoDienThoai,
  psLoai, setPsLoai, psNgayTra, setPsNgayTra, psSoTien, setPsSoTien,
  psGhiChu, setPsGhiChu, formatTienInput, themPhatSinh, danhSachPhatSinh,
  laAdmin, xoaPhatSinh
}: any) {
  
  // HÀM TẠO TIN NHẮN ZALO NHẮC TRẢ ĐỒ
  const copyZaloTraDo = (item: any) => {
    const ngayTraFormat = item.ngayTra ? item.ngayTra.split("-").reverse().join("/") : "";
    const text = `Dạ Suri Wedding chào anh/chị ${item.tenKhach}.\n\nEm thấy mình có lịch hẹn trả ${item.loai} vào ngày ${ngayTraFormat}.\nAnh/chị nhớ sắp xếp thời gian ghé qua cửa hàng gửi lại đồ giúp em để team kịp giặt là cho khách sau nhé!\n\nEm cảm ơn anh/chị nhiều ạ.`;
    navigator.clipboard.writeText(text);
    toast.success("Đã copy tin nhắn nhắc trả đồ Zalo!"); // <-- Đã đổi sang Toast mượt mà
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">💰 Thêm phát sinh</h2>
        <div className="grid gap-3">
          <input type="date" value={psNgay} onChange={(e) => setPsNgay(e.target.value)} className="border p-2 rounded" />
          <input type="text" placeholder="Tên khách nếu có" value={psTenKhach} onChange={(e) => setPsTenKhach(e.target.value)} className="border p-2 rounded" />
          <input type="text" placeholder="Số điện thoại nếu có" value={psSoDienThoai} onChange={(e) => setPsSoDienThoai(e.target.value)} className="border p-2 rounded" />

          <select value={psLoai} onChange={(e) => setPsLoai(e.target.value)} className="border p-2 rounded">
            <option value="">-- Chọn loại phát sinh --</option>
            <option value="Thuê váy">Thuê váy</option>
            <option value="Thuê vest">Thuê vest</option>
            <option value="In ảnh">In ảnh</option>
            <option value="Rửa ảnh">Rửa ảnh</option>
            <option value="Bán album">Bán album</option>
            <option value="Trang điểm lẻ">Trang điểm lẻ</option>
            <option value="Chụp ảnh thẻ">Chụp ảnh thẻ</option>
            <option value="Phụ phí đi xa">Phụ phí đi xa</option>
            <option value="Khác">Khác</option>
          </select>

          {(psLoai === "Thuê váy" || psLoai === "Thuê vest") && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Ngày phải trả đồ</div>
              <input type="date" value={psNgayTra} onChange={(e) => setPsNgayTra(e.target.value)} className="border p-2 rounded w-full" />
            </div>
          )}

          <div>
            <div className="relative">
              <input type="text" inputMode="numeric" placeholder="Số tiền" value={psSoTien} onChange={(e) => setPsSoTien(formatTienInput(e.target.value))} className="border p-2 rounded w-full pr-10" />
              <span className="absolute right-3 top-2 text-gray-500">đ</span>
            </div>
            {psSoTien && <div className="text-sm text-green-600 mt-1">Giá trị: {psSoTien}đ</div>}
          </div>

          <input type="text" placeholder="Ghi chú nếu có" value={psGhiChu} onChange={(e) => setPsGhiChu(e.target.value)} className="border p-2 rounded" />
          <button onClick={themPhatSinh} className="bg-blue-600 text-white p-2 rounded">Thêm phát sinh</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Danh sách phát sinh</h2>
        <div className="space-y-2">
          {[...danhSachPhatSinh].sort((a, b) => b.ngay.localeCompare(a.ngay)).map((item) => (
              <div key={item.id} className="border rounded p-3 flex flex-col md:flex-row md:justify-between gap-3">
                <div>
                  <div className="font-semibold">{item.ngay.split("-").reverse().join("/")} • {item.loai}</div>
                  
                  <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    Khách: {item.tenKhach || "Không có"} • SĐT: {item.soDienThoai || "Không có"}
                    {item.soDienThoai && <NutCopy textCanCopy={item.soDienThoai} />}
                  </div>

                  <div className="text-sm text-gray-600 mt-1">Người ghi: {item.nguoiGhi}</div>
                  <div className="font-bold text-green-600 mt-1">{Number(item.soTien || 0).toLocaleString("vi-VN")}đ</div>
                  
                  {item.ngayTra && (
                     <div className="text-sm font-medium text-orange-600 mt-1">
                       📅 Hẹn trả: {item.ngayTra.split("-").reverse().join("/")}
                     </div>
                  )}

                  {item.ghiChu && <div className="text-sm text-gray-500 mt-1">Ghi chú: {item.ghiChu}</div>}
                </div>

                <div className="flex gap-2 items-start">
                  {/* NÚT COPY ZALO CHỈ HIỆN KHI CÓ NGÀY TRẢ */}
                  {item.ngayTra && item.tenKhach && (
                    <button onClick={() => copyZaloTraDo(item)} className="bg-[#0068FF] text-white px-3 py-1 rounded h-fit">
                      💬 Nhắc trả
                    </button>
                  )}

                  {laAdmin && (
                    <button onClick={() => xoaPhatSinh(item.id)} className="bg-red-500 text-white px-3 py-1 rounded h-fit">
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}