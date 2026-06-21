import { useState } from "react";
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

  // MẸO: Khai báo danh sách các dịch vụ cần phải trả đồ
  const cacLoaiCanTraDo = ["Thuê váy", "Thuê vest", "Thuê áo dài", "Thuê phụ kiện"];
  const hienOChonNgayTra = cacLoaiCanTraDo.includes(psLoai);

  return (
    <div className="pb-24 px-2 pt-4">
      {/* DANH SÁCH PHÁT SINH */}
      <div className="space-y-4">
        {[...danhSachPhatSinh].sort((a, b) => b.ngay.localeCompare(a.ngay)).map((item: any) => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:border-green-200 transition-colors">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                  {item.ngay.split("-").reverse().join("/")}
                </span>
                <span className="font-bold text-gray-800 text-[15px]">{item.loai}</span>
              </div>
              
              <div className="text-[14px] text-gray-600 font-medium mb-1">{item.tenKhach}</div>
              
              {/* Hiển thị ngày trả nếu có */}
              {item.ngayTra && (
                <div className="text-[12px] font-bold text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-md mb-1 border border-orange-100">
                  📅 Hẹn trả: {item.ngayTra.split("-").reverse().join("/")}
                </div>
              )}
              
              <div className="text-[15px] font-black text-green-600 mt-0.5">
                + {Number(item.soTien || 0).toLocaleString("vi-VN")}đ
              </div>
            </div>

            {/* Cột Nút bấm */}
            <div className="flex flex-col gap-2">
              {item.ngayTra && (
                <button onClick={() => copyZaloTraDo(item)} className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors">
                  💬 Nhắc
                </button>
              )}
              {laAdmin && (
                <button onClick={() => xoaPhatSinh(item.id)} className="px-3 py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors">
                  🗑 Xóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* NÚT THÊM */}
      <button 
        onClick={() => setShowModal(true)} 
        className="fixed bottom-24 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-bold hover:scale-105 active:scale-95 transition-all z-40"
      >
        +
      </button>

      {/* MODAL THÊM PHÁT SINH */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">💰 Thêm phát sinh</h2>
            
            <div className="grid gap-3">
              <div>
                <label className="text-xs text-gray-500 font-bold ml-1 mb-1 block">Ngày ghi nhận</label>
                <input type="date" value={psNgay} onChange={(e) => setPsNgay(e.target.value)} className="border p-3 rounded-xl w-full bg-white text-gray-900" />
              </div>

              <input type="text" placeholder="Tên khách hàng" value={psTenKhach} onChange={(e) => setPsTenKhach(e.target.value)} className="border p-3 rounded-xl w-full bg-white text-gray-900 mt-1" />
              
              {/* ĐÃ NÂNG CẤP DANH SÁCH LỰA CHỌN */}
              <select value={psLoai} onChange={(e) => setPsLoai(e.target.value)} className="border p-3 rounded-xl w-full bg-white text-gray-900">
                <option value="">-- Chọn loại dịch vụ --</option>
                
                <optgroup label="👗 Đồ cho thuê (Cần thu lại)">
                  <option value="Thuê váy">Thuê váy</option>
                  <option value="Thuê vest">Thuê vest</option>
                  <option value="Thuê áo dài">Thuê áo dài</option>
                  <option value="Thuê phụ kiện">Thuê phụ kiện</option>
                </optgroup>
                
                <optgroup label="💄 Dịch vụ lẻ">
                  <option value="Trang điểm/Làm tóc">Trang điểm/Làm tóc</option>
                  <option value="Hoa cưới/Hoa xe">Hoa cưới/Hoa xe</option>
                  <option value="Thuê xe hoa">Thuê xe hoa</option>
                  <option value="In/Rửa ảnh">In/Rửa ảnh</option>
                </optgroup>
                
                <optgroup label="📸 Nhân sự">
                  <option value="Thợ chụp/quay thêm">Thợ chụp/quay thêm</option>
                  <option value="Đội bê tráp">Đội bê tráp</option>
                  <option value="Khác">Khác</option>
                </optgroup>
              </select>

              {/* Logic thông minh: Chỉ hiện ô ngày trả với các loại đồ cho thuê */}
              {hienOChonNgayTra && (
                <div className="bg-orange-50 p-3 rounded-xl border border-orange-200 mt-1">
                  <label className="text-xs font-bold text-orange-700 block mb-1">📅 NGÀY HẸN TRẢ ĐỒ</label>
                  <input type="date" value={psNgayTra} onChange={(e) => setPsNgayTra(e.target.value)} className="w-full bg-transparent border-none p-0 text-lg font-bold text-orange-800 outline-none" />
                </div>
              )}

              <div className="relative mt-1">
                <input 
                  type="text" 
                  inputMode="numeric" 
                  placeholder="Số tiền thu" 
                  value={psSoTien} 
                  onChange={(e) => setPsSoTien(formatTienInput(e.target.value))} 
                  className="border p-3 rounded-xl w-full pr-10 bg-white text-green-700 font-bold text-lg" 
                />
                <span className="absolute right-4 top-3.5 text-gray-400 font-medium">đ</span>
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={() => { themPhatSinh(); setShowModal(false); }} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">Lưu lại</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-xl hover:bg-gray-300">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}