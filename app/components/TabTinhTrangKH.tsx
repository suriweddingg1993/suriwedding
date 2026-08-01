import { useState } from "react";
import NutCopy from "./NutCopy";
import toast from "react-hot-toast";
import { PhatSinh, TaiKhoan, ThuHuong } from "../../types";
// ĐÃ THÊM: Các icon mới để trang trí thẻ
import { ChevronDown, ChevronUp, History, User, Banknote } from "lucide-react"; 

interface TabTinhTrangKHProps {
  quaHan: PhatSinh[];
  canTraHomNay: PhatSinh[];
  dangThue: PhatSinh[];
  danhDauDaTraDo: (id: string) => Promise<void>;
  // CÁC PROP MỚI THÊM VÀO ĐỂ TÍNH HOA HỒNG & LỊCH SỬ
  danhSachPhatSinh?: PhatSinh[];
  hoSoCuaToi?: TaiKhoan | null;
  themThuHuong?: (uid: string, email: string, hoTen: string, ngay: string, moTa: string, soTien: string) => Promise<void>;
  danhSachThuHuong?: ThuHuong[];
}

export default function TabTinhTrangKH({
  quaHan,
  canTraHomNay,
  dangThue,
  danhDauDaTraDo,
  danhSachPhatSinh = [],
  hoSoCuaToi,
  themThuHuong,
  danhSachThuHuong = []
}: TabTinhTrangKHProps) {

  const [showLichSu, setShowLichSu] = useState(false);

  // Lọc ra các món đồ Khách Đã Trả (Có chữ thuê và daTraDo = true)
  const lichSuTraDo = danhSachPhatSinh
    .filter(ps => ps.daTraDo && ps.loai && ps.loai.toLowerCase().includes("thuê"))
    .sort((a,b) => (b.ngayTra || "").localeCompare(a.ngayTra || ""));

  const formatTien = (val: number) => val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const copyZaloTraDo = (item: PhatSinh) => {
    const ngayTraFormat = item.ngayTra ? item.ngayTra.split("-").reverse().join("/") : "";
    const text = `Dạ Suri Wedding chào anh/chị ${item.tenKhach}.\n\nEm thấy mình có lịch hẹn trả ${item.loai} vào ngày ${ngayTraFormat}.\nAnh/chị sắp xếp thời gian ghé qua cửa hàng gửi lại đồ giúp em nhé!\n\nCần hỗ trợ thêm anh/chị cứ nhắn em ạ.`;
    navigator.clipboard.writeText(text);
    toast.success("Đã copy tin nhắn nhắc trả đồ!");
  };

  const xacNhanTraDoNangCao = (id: string, tenKhach: string, ngayTra: string | undefined) => {
    const today = new Date().toISOString().slice(0, 10);
    let canhBao = `Xác nhận khách hàng ${tenKhach} đã gửi lại đồ nguyên vẹn?`;
    
    if (ngayTra && ngayTra < today) {
       const diffTime = Math.abs(new Date(today).getTime() - new Date(ngayTra).getTime());
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
       canhBao = `⚠️ KHÁCH TRẢ TRỄ ${diffDays} NGÀY!\n\nXác nhận khách hàng ${tenKhach} đã gửi lại đồ?`;
    }
    
    if (confirm(canhBao)) {
      danhDauDaTraDo(id);
    }
  };

  // HÀM: XỬ LÝ NHÂN VIÊN NHẬN 10% HOA HỒNG
  const nhanHoaHong = (ps: PhatSinh) => {
    if (!hoSoCuaToi || !themThuHuong) { toast.error("Lỗi xác thực tài khoản!"); return; }
    
    const tienHoaHong = (ps.soTien || 0) * 0.1;
    const moTa = `[HH 10%] Cho thuê ${ps.loai} - KH: ${ps.tenKhach} (${ps.id?.slice(-4)})`;
    
    const daNhan = danhSachThuHuong.some(th => th.uid === hoSoCuaToi.id && th.moTa === moTa);
    if (daNhan) { toast.error("Bạn đã nhận hoa hồng cho đơn này rồi!"); return; }

    themThuHuong(hoSoCuaToi.id, hoSoCuaToi.email, hoSoCuaToi.hoTen || "", ps.ngay, moTa, String(tienHoaHong));
  };

  return (
    <div className="pb-24 px-2 pt-4">
      
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="text-2xl font-black text-red-600 drop-shadow-sm mb-1">{quaHan.length}</div>
          <div className="text-[10px] font-bold text-red-800 uppercase tracking-wide">Quá hạn</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="text-2xl font-black text-orange-600 drop-shadow-sm mb-1">{canTraHomNay.length}</div>
          <div className="text-[10px] font-bold text-orange-800 uppercase tracking-wide">Trả hôm nay</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="text-2xl font-black text-green-600 drop-shadow-sm mb-1">{dangThue.length}</div>
          <div className="text-[10px] font-bold text-green-800 uppercase tracking-wide">Đang thuê</div>
        </div>
      </div>

      {quaHan.length === 0 && canTraHomNay.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-green-300 p-8 text-center shadow-sm">
          <div className="text-4xl mb-2">🎉</div>
          <h3 className="text-green-600 font-bold text-lg">Tuyệt vời!</h3>
          <p className="text-gray-500 text-sm mt-1">Không có khách nào nợ đồ quá hạn hay cần nhắc trả đồ hôm nay.</p>
        </div>
      )}

      <div className="space-y-6">
        
        {/* BLOCK 1: ĐỒ QUÁ HẠN */}
        {quaHan.length > 0 && (
          <div>
            <h3 className="font-bold text-red-600 flex items-center gap-2 mb-3 ml-1">
              <span>🔴 CẦN ĐÒI GẤP ({quaHan.length})</span>
            </h3>
            <div className="space-y-3">
              {quaHan.map((ps: PhatSinh) => {
                const isVayVest = ps.loai?.toLowerCase().includes("váy") || ps.loai?.toLowerCase().includes("vest");
                const tienHoaHong = (ps.soTien || 0) * 0.1;
                const moTa = `[HH 10%] Cho thuê ${ps.loai} - KH: ${ps.tenKhach} (${ps.id?.slice(-4)})`;
                const daNhan = danhSachThuHuong.some(th => th.uid === hoSoCuaToi?.id && th.moTa === moTa);

                return (
                  <div key={ps.id} className="bg-white border-l-4 border-l-red-500 border border-red-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-gray-800 text-base">{ps.tenKhach || "Không tên"}</div>
                        <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded w-fit mt-1">👗 {ps.loai}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-red-500 mb-0.5">Hạn trả:</div>
                        <div className="text-sm font-black text-red-600">{ps.ngayTra?.split("-").reverse().join("/")}</div>
                      </div>
                    </div>

                    {/* HIỂN THỊ NV XUẤT ĐỒ & GIÁ TIỀN */}
                    <div className="bg-slate-50 rounded-lg p-2.5 mt-3 border border-slate-100">
                      <div className="flex justify-between items-center text-xs mb-2 pb-2 border-b border-slate-200">
                         <span className="flex items-center gap-1.5 text-slate-500"><User size={14}/> NV Xuất: <strong className="text-slate-700">{ps.nguoiGhi?.split('@')[0] || "Admin"}</strong></span>
                         <span className="font-black text-emerald-600">Giá: {formatTien(ps.soTien || 0)}đ</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-700 flex items-center gap-1">📞 {ps.soDienThoai || "Không có SĐT"} {ps.soDienThoai && <NutCopy textCanCopy={ps.soDienThoai} />}</span>
                        {ps.soDienThoai && (
                          <div className="flex gap-2">
                            <button onClick={() => copyZaloTraDo(ps)} className="px-2 py-1 bg-blue-100 text-blue-600 font-bold rounded hover:bg-blue-200">Zalo</button>
                            <a href={`tel:${ps.soDienThoai}`} className="px-2 py-1 bg-green-100 text-green-600 font-bold rounded hover:bg-green-200">Gọi</a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button onClick={() => ps.id && xacNhanTraDoNangCao(ps.id, ps.tenKhach, ps.ngayTra)} className="flex-[1.5] bg-red-50 text-red-600 font-bold py-2.5 rounded-lg border border-red-200 hover:bg-red-500 hover:text-white transition-colors flex justify-center items-center gap-1 text-xs">
                        ✓ Khách đã trả đồ
                      </button>
                      {isVayVest && (
                        <button onClick={() => nhanHoaHong(ps)} disabled={daNhan} className={`flex-1 font-bold py-2.5 rounded-lg border transition-colors flex justify-center items-center gap-1 text-xs ${daNhan ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white'}`}>
                           <Banknote size={14} /> {daNhan ? 'Đã nhận HH' : `Nhận ${formatTien(tienHoaHong)}đ`}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* BLOCK 2: ĐỒ CẦN TRẢ HÔM NAY */}
        {canTraHomNay.length > 0 && (
          <div>
            <h3 className="font-bold text-orange-600 flex items-center gap-2 mb-3 ml-1 mt-4">
              <span>🟡 NHẮC TRẢ HÔM NAY ({canTraHomNay.length})</span>
            </h3>
            <div className="space-y-3">
              {canTraHomNay.map((ps: PhatSinh) => {
                const isVayVest = ps.loai?.toLowerCase().includes("váy") || ps.loai?.toLowerCase().includes("vest");
                const tienHoaHong = (ps.soTien || 0) * 0.1;
                const moTa = `[HH 10%] Cho thuê ${ps.loai} - KH: ${ps.tenKhach} (${ps.id?.slice(-4)})`;
                const daNhan = danhSachThuHuong.some(th => th.uid === hoSoCuaToi?.id && th.moTa === moTa);

                return (
                  <div key={ps.id} className="bg-white border-l-4 border-l-orange-400 border border-orange-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-gray-800 text-base">{ps.tenKhach || "Không tên"}</div>
                        <div className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-1 rounded w-fit mt-1">👗 {ps.loai}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-orange-500 mb-0.5">Hạn trả:</div>
                        <div className="text-sm font-black text-orange-600">{ps.ngayTra?.split("-").reverse().join("/")}</div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-2.5 mt-3 border border-slate-100">
                      <div className="flex justify-between items-center text-xs mb-2 pb-2 border-b border-slate-200">
                         <span className="flex items-center gap-1.5 text-slate-500"><User size={14}/> NV Xuất: <strong className="text-slate-700">{ps.nguoiGhi?.split('@')[0] || "Admin"}</strong></span>
                         <span className="font-black text-emerald-600">Giá: {formatTien(ps.soTien || 0)}đ</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-700 flex items-center gap-1">📞 {ps.soDienThoai || "Không có SĐT"} {ps.soDienThoai && <NutCopy textCanCopy={ps.soDienThoai} />}</span>
                        {ps.soDienThoai && (
                          <div className="flex gap-2">
                            <button onClick={() => copyZaloTraDo(ps)} className="px-2 py-1 bg-blue-100 text-blue-600 font-bold rounded hover:bg-blue-200">Zalo</button>
                            <a href={`tel:${ps.soDienThoai}`} className="px-2 py-1 bg-green-100 text-green-600 font-bold rounded hover:bg-green-200">Gọi</a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button onClick={() => ps.id && xacNhanTraDoNangCao(ps.id, ps.tenKhach, ps.ngayTra)} className="flex-[1.5] bg-orange-50 text-orange-600 font-bold py-2.5 rounded-lg border border-orange-200 hover:bg-orange-500 hover:text-white transition-colors flex justify-center items-center gap-1 text-xs">
                        ✓ Khách đã trả đồ
                      </button>
                      {isVayVest && (
                        <button onClick={() => nhanHoaHong(ps)} disabled={daNhan} className={`flex-1 font-bold py-2.5 rounded-lg border transition-colors flex justify-center items-center gap-1 text-xs ${daNhan ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white'}`}>
                           <Banknote size={14} /> {daNhan ? 'Đã nhận HH' : `Nhận ${formatTien(tienHoaHong)}đ`}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* ==============================================
          BLOCK 3: LỊCH SỬ ĐÃ TRẢ ĐỒ (ACCORDION)
      =============================================== */}
      <div className="mt-8 border-t border-slate-200 pt-6">
        <button
          onClick={() => setShowLichSu(!showLichSu)}
          className="w-full flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-left outline-none transition-all hover:bg-slate-50"
        >
          <h2 className="font-black text-lg text-slate-700 tracking-tight flex items-center gap-2">
            <History size={24} className="text-slate-500" /> Lịch sử Đã trả đồ ({lichSuTraDo.length})
          </h2>
          <div className="bg-slate-100 text-slate-600 p-1.5 rounded-full transition-transform">
            {showLichSu ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        {showLichSu && (
          <div className="flex flex-col gap-3 mt-4 animate-fade-in">
            {lichSuTraDo.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm font-medium border border-dashed border-slate-200 rounded-2xl bg-white">Chưa có lịch sử khách trả đồ.</div>
            ) : (
                lichSuTraDo.map(ps => {
                  const isVayVest = ps.loai?.toLowerCase().includes("váy") || ps.loai?.toLowerCase().includes("vest");
                  const tienHoaHong = (ps.soTien || 0) * 0.1;
                  const moTa = `[HH 10%] Cho thuê ${ps.loai} - KH: ${ps.tenKhach} (${ps.id?.slice(-4)})`;
                  const daNhan = danhSachThuHuong.some(th => th.uid === hoSoCuaToi?.id && th.moTa === moTa);

                  return (
                    <div key={ps.id} className="bg-white border-l-4 border-l-slate-300 border border-slate-100 rounded-xl p-4 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-slate-800 text-base">{ps.tenKhach || "Không tên"}</div>
                          <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{ps.soDienThoai}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-slate-400 mb-0.5">Ngày hẹn trả:</div>
                          <div className="text-sm font-black text-slate-500 line-through">{ps.ngayTra?.split("-").reverse().join("/")}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-2 mt-3">
                         <span className="flex items-center gap-1 text-slate-500"><User size={14}/> NV Xuất: <strong className="text-slate-700">{ps.nguoiGhi?.split('@')[0] || "Admin"}</strong></span>
                         <span className="font-black text-slate-500">Đồ: {ps.loai} ({formatTien(ps.soTien || 0)}đ)</span>
                      </div>

                      {/* Nút nhận hoa hồng cho lịch sử (Phòng trường hợp quên bấm lúc trước) */}
                      {isVayVest && (
                        <button onClick={() => nhanHoaHong(ps)} disabled={daNhan} className={`w-full mt-2 font-bold py-2.5 rounded-lg border transition-colors flex justify-center items-center gap-1 text-xs ${daNhan ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white'}`}>
                            <Banknote size={14} /> {daNhan ? 'Đã nhận HH' : `Nhận ${formatTien(tienHoaHong)}đ`}
                        </button>
                      )}
                    </div>
                  )
                })
            )}
          </div>
        )}
      </div>

    </div>
  );
}