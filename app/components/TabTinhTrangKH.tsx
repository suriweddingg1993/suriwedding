import NutCopy from "./NutCopy";
import toast from "react-hot-toast";
import { PhatSinh } from "../../types";

interface TabTinhTrangKHProps {
  quaHan: PhatSinh[];
  canTraHomNay: PhatSinh[];
  dangThue: PhatSinh[];
  danhDauDaTraDo: (id: string) => Promise<void>;
}

export default function TabTinhTrangKH({
  quaHan,
  canTraHomNay,
  dangThue,
  danhDauDaTraDo
}: TabTinhTrangKHProps) {

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
      
    </div>
  );
}