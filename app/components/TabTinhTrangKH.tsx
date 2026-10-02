import { useState } from "react";
import NutCopy from "./NutCopy";
import toast from "react-hot-toast";
import { PhatSinh } from "../../types";
import { ChevronDown } from "lucide-react";

interface TabTinhTrangKHProps {
  quaHan: PhatSinh[];
  canTraHomNay: PhatSinh[];
  dangThue: PhatSinh[];
  lichSuThue: PhatSinh[]; // ĐÃ THÊM: Dữ liệu lịch sử
  danhDauDaTraDo: (id: string) => Promise<void>;
  formatTienInput: (val: string) => string; // ĐÃ THÊM: Hàm format tiền
}

export default function TabTinhTrangKH({
  quaHan,
  canTraHomNay,
  dangThue,
  lichSuThue,
  danhDauDaTraDo,
  formatTienInput
}: TabTinhTrangKHProps) {
  
  // ĐÃ THÊM: Trạng thái đóng/mở danh sách lịch sử
  const [showLichSu, setShowLichSu] = useState(false);

  const copyZaloTraDo = (item: PhatSinh) => {
    const ngayTraFormat = item.ngayTra ? item.ngayTra.split("-").reverse().join("/") : "";
    const text = `Dạ Suri Wedding chào anh/chị ${item.tenKhach}.\n\nEm thấy mình có lịch hẹn trả ${item.loai} vào ngày ${ngayTraFormat}.\nAnh/chị sắp xếp thời gian ghé qua cửa hàng gửi lại đồ giúp em nhé!\n\nCần hỗ trợ thêm anh/chị cứ nhắn em ạ.`;
    navigator.clipboard.writeText(text);
    toast.success("Đã copy tin nhắn nhắc trả đồ!");
  };

  const xacNhanTraDoNangCao = (id: string, tenKhach: string, ngayTra: string | undefined) => {
    const today = new Date().toISOString().slice(0, 10);
    let canhBao = `Xác nhận khách hàng ${tenKhach} đã gửi lại đồ nguyên vẹn?`;
    
    // TÍNH TOÁN NGÀY TRỄ NẾU CÓ
    if (ngayTra && ngayTra < today) {
       const diffTime = Math.abs(new Date(today).getTime() - new Date(ngayTra).getTime());
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
       canhBao = `⚠️ KHÁCH TRẢ TRỄ ${diffDays} NGÀY!\n\nXác nhận khách hàng ${tenKhach} đã gửi lại đồ?`;
    }
    
    if (confirm(canhBao)) {
      danhDauDaTraDo(id);
    }
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
        {quaHan.length > 0 && (
          <div>
            <h3 className="font-bold text-red-600 flex items-center gap-2 mb-3 ml-1">
              <span>🔴 CẦN ĐÒI GẤP ({quaHan.length})</span>
            </h3>
            <div className="space-y-3">
              {quaHan.map((ps: PhatSinh) => (
                <div key={ps.id} className="bg-white border-l-4 border-l-red-500 border border-red-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-gray-800 text-base">{ps.tenKhach || "Không tên"}</div>
                      <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit mt-1">
                        👗 {ps.loai}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-red-500 mb-0.5">Hạn trả:</div>
                      <div className="text-sm font-black text-red-600">{ps.ngayTra?.split("-").reverse().join("/")}</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2 flex items-center justify-between mt-3 border border-slate-100">
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                      📞 {ps.soDienThoai || "Không có SĐT"}
                      {ps.soDienThoai && <NutCopy textCanCopy={ps.soDienThoai} />}
                    </div>
                    {ps.soDienThoai && (
                      <div className="flex gap-2">
                        <button onClick={() => copyZaloTraDo(ps)} className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">💬</button>
                        <a href={`tel:${ps.soDienThoai}`} className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200">📞</a>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => ps.id && xacNhanTraDoNangCao(ps.id, ps.tenKhach, ps.ngayTra)}
                    className="w-full mt-3 bg-red-50 text-red-600 font-bold py-2.5 rounded-lg border border-red-200 hover:bg-red-500 hover:text-white transition-colors flex justify-center items-center gap-2"
                  >
                    ✓ Đã nhận lại đồ
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {canTraHomNay.length > 0 && (
          <div>
            <h3 className="font-bold text-orange-600 flex items-center gap-2 mb-3 ml-1 mt-4">
              <span>🟡 NHẮC TRẢ HÔM NAY ({canTraHomNay.length})</span>
            </h3>
            <div className="space-y-3">
              {canTraHomNay.map((ps: PhatSinh) => (
                <div key={ps.id} className="bg-white border-l-4 border-l-orange-400 border border-orange-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-gray-800 text-base">{ps.tenKhach || "Không tên"}</div>
                      <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit mt-1">
                        👗 {ps.loai}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2 flex items-center justify-between mt-3 border border-slate-100">
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                      📞 {ps.soDienThoai || "Không có SĐT"}
                      {ps.soDienThoai && <NutCopy textCanCopy={ps.soDienThoai} />}
                    </div>
                    {ps.soDienThoai && (
                      <div className="flex gap-2">
                        <button onClick={() => copyZaloTraDo(ps)} className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">💬</button>
                        <a href={`tel:${ps.soDienThoai}`} className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200">📞</a>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => ps.id && xacNhanTraDoNangCao(ps.id, ps.tenKhach, ps.ngayTra)}
                    className="w-full mt-3 bg-orange-50 text-orange-600 font-bold py-2.5 rounded-lg border border-orange-200 hover:bg-orange-500 hover:text-white transition-colors flex justify-center items-center gap-2"
                  >
                    ✓ Đã nhận lại đồ
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =======================================================
          ĐÃ THÊM: MỤC LỊCH SỬ THUÊ ĐỒ (THU GỌN)
      ======================================================== */}
      <div className="mt-8 border-t border-slate-200 pt-6">
        <button 
          onClick={() => setShowLichSu(!showLichSu)} 
          className="w-full flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-all outline-none"
        >
          <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
            📦 Lịch sử khách đã thuê ({lichSuThue.length})
          </h3>
          <div className={`p-1.5 rounded-full bg-slate-50 text-slate-400 transition-transform ${showLichSu ? "rotate-180" : ""}`}>
            <ChevronDown size={18} />
          </div>
        </button>

        {showLichSu && (
          <div className="mt-4 space-y-3 animate-fade-in">
            {lichSuThue.length === 0 ? (
              <div className="text-center py-8 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm">
                Chưa có lịch sử giao dịch thuê đồ nào.
              </div>
            ) : (
              lichSuThue.map((ps) => (
                <div key={ps.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center hover:border-slate-200 transition-colors">
                  <div>
                    <div className="font-bold text-slate-800 text-base mb-1.5">{ps.tenKhach || "Khách hàng"}</div>
                    <div className="text-[11px] font-medium text-slate-500 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1">Dịch vụ: <strong className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{ps.loai}</strong></span>
                        <span>Ngày thuê: <strong className="text-slate-700">{ps.ngay.split("-").reverse().join("/")}</strong></span>
                        {ps.ngayTra && <span>Ngày trả: <strong className="text-slate-700">{ps.ngayTra.split("-").reverse().join("/")}</strong></span>}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <div className="text-lg font-black text-emerald-600">
                      {formatTienInput(String(ps.soTien || 0))}đ
                    </div>
                    <div className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded uppercase tracking-wider border border-emerald-100">
                      Hoàn tất
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
}