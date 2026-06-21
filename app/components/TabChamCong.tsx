import { useMemo } from "react";
import NutCopy from "./NutCopy";

export default function TabChamCong({
  homNay,
  BAN_KINH_CHO_PHEP,
  khoangCach,
  chamCongHomNay,
  chamCong,
  dangLayViTri,
  laAdmin,
  chamCongHienThi
}: any) {
  
  // TỐI ƯU HIỆU NĂNG: Chỉ sắp xếp lại khi có nhân viên mới chấm công
  const danhSachDaSapXep = useMemo(() => {
    return [...chamCongHienThi].sort((a, b) => b.ngay.localeCompare(a.ngay));
  }, [chamCongHienThi]);

  // Biến kiểm tra GPS hợp lệ
  const hopLeGPS = khoangCach !== null && khoangCach <= BAN_KINH_CHO_PHEP;

  return (
    <div className="pb-24 px-2 pt-4">
      {/* BẢNG ĐIỀU KHIỂN CHẤM CÔNG CHÍNH */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            ⏰ Chấm công GPS
          </h2>
          <div className="text-sm font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {homNay().split("-").reverse().join("/")}
          </div>
        </div>

        {/* Trạng thái GPS */}
        <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100">
          <div className="text-sm text-gray-500 mb-2 font-medium">Trạng thái định vị:</div>
          {khoangCach === null ? (
            <div className="text-gray-600 font-medium flex items-center gap-2">
              <span>📍 Đang chờ cập nhật vị trí...</span>
            </div>
          ) : (
            <div className={`font-bold flex items-center gap-2 ${hopLeGPS ? "text-green-600" : "text-red-500"}`}>
              {hopLeGPS ? "✅ Đang ở Studio" : "❌ Ngoài vùng chấm công"}
              <span className="text-sm font-normal">({khoangCach}m / {BAN_KINH_CHO_PHEP}m)</span>
            </div>
          )}
        </div>

        {/* Hiển thị Giờ hôm nay */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-green-600 font-bold uppercase mb-1">Giờ vào (Check-in)</span>
            <span className="text-2xl font-black text-green-700">
              {chamCongHomNay?.checkIn || "--:--"}
            </span>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-blue-600 font-bold uppercase mb-1">Giờ ra (Check-out)</span>
            <span className="text-2xl font-black text-blue-700">
              {chamCongHomNay?.checkOut || "--:--"}
            </span>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex gap-3">
          <button 
            onClick={() => chamCong("checkIn")} 
            disabled={dangLayViTri || chamCongHomNay?.checkIn} 
            className={`flex-1 py-4 rounded-xl font-bold text-[15px] flex items-center justify-center transition-all ${
              chamCongHomNay?.checkIn 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-lg shadow-green-200/50"
            }`}
          >
            {dangLayViTri ? "⏳ Đang quét..." : "👋 CHECK IN"}
          </button>

          <button 
            onClick={() => chamCong("checkOut")} 
            disabled={dangLayViTri || !chamCongHomNay?.checkIn || chamCongHomNay?.checkOut} 
            className={`flex-1 py-4 rounded-xl font-bold text-[15px] flex items-center justify-center transition-all ${
              !chamCongHomNay?.checkIn || chamCongHomNay?.checkOut
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200/50"
            }`}
          >
            {dangLayViTri ? "⏳ Đang quét..." : "🏃 CHECK OUT"}
          </button>
        </div>
      </div>

      {/* LỊCH SỬ CHẤM CÔNG */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-bold mb-4 text-gray-800">
          {laAdmin ? "📋 Lịch sử toàn bộ nhân viên" : "📋 Lịch sử của tôi"}
        </h2>

        <div className="space-y-3">
          {danhSachDaSapXep.length === 0 ? (
            <div className="text-center text-gray-400 py-6 italic bg-gray-50 rounded-xl">Chưa có dữ liệu chấm công</div>
          ) : (
            danhSachDaSapXep.map((item: any) => (
              <div key={item.id} className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors bg-slate-50/50">
                <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                  <div className="font-bold text-gray-700 text-sm flex items-center gap-2">
                    📅 {item.ngay.split("-").reverse().join("/")}
                  </div>
                  {laAdmin && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-md truncate max-w-[140px]">
                        {item.email.split('@')[0]}
                      </span>
                      <NutCopy textCanCopy={item.email} />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Check-In</span>
                    <span className={`font-black text-base ${item.checkIn ? "text-green-600" : "text-gray-400"}`}>
                      {item.checkIn || "Chưa có"}
                    </span>
                    {/* Tự động cảnh báo đi muộn */}
                    {item.diMuon && (
                      <span className="text-[10px] text-red-600 font-bold bg-red-100 w-fit px-1.5 py-0.5 rounded mt-1">
                        Muộn {item.soPhutMuon}p
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col border-l pl-4 border-gray-200">
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Check-Out</span>
                    <span className={`font-black text-base ${item.checkOut ? "text-blue-600" : "text-gray-400"}`}>
                      {item.checkOut || "Chưa có"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}