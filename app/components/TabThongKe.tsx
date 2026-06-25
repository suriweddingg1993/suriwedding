import { Lich } from "../../types";

interface TabThongKeProps {
  thangThongKe: string;
  setThangThongKe: (val: string) => void;
  lichTrongThang: Lich[];
  tongThuNhapLich: number;
  tongThuNhapPhatSinh: number;
  tongThuNhap: number;
}

export default function TabThongKe({
  thangThongKe,
  setThangThongKe,
  lichTrongThang,
  tongThuNhapLich,
  tongThuNhapPhatSinh,
  tongThuNhap
}: TabThongKeProps) {
  return (
    <div className="pb-24 px-2 pt-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800">
          📊 Thống kê doanh thu
        </h2>

        <div className="mb-6">
          <label className="text-xs font-bold text-gray-500 block mb-2 ml-1 uppercase tracking-wider">
            Chọn tháng cần xem báo cáo
          </label>
          <input 
            type="month" 
            value={thangThongKe} 
            onChange={(e) => setThangThongKe(e.target.value)} 
            className="w-full bg-slate-50 text-gray-900 p-4 rounded-xl border border-gray-200 font-bold text-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all shadow-inner" 
          />
        </div>

        {!thangThongKe ? (
          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <span className="text-3xl block mb-2">🗓️</span>
            Vui lòng chọn một tháng để xem số liệu thống kê
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-green-200/50 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 p-4 opacity-20 text-8xl transform rotate-12">💰</div>
              <div className="text-sm font-medium mb-1 opacity-90 tracking-wide">
                TỔNG DOANH THU THÁNG {thangThongKe.split("-").reverse().join("/")}
              </div>
              <div className="text-4xl font-black tracking-tight mt-1">
                {(tongThuNhap || 0).toLocaleString("vi-VN")}<span className="text-2xl font-bold ml-1 opacity-80">đ</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
                <div className="text-[11px] font-bold text-blue-500 uppercase tracking-wide mb-1">Từ lịch chụp</div>
                <div className="text-lg font-black text-gray-800">
                  {(tongThuNhapLich || 0).toLocaleString("vi-VN")}đ
                </div>
              </div>

              <div className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
                <div className="text-[11px] font-bold text-orange-500 uppercase tracking-wide mb-1">Từ phát sinh</div>
                <div className="text-lg font-black text-gray-800">
                  {(tongThuNhapPhatSinh || 0).toLocaleString("vi-VN")}đ
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex justify-between items-center shadow-sm mt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center text-xl">
                  📸
                </div>
                <div className="font-bold text-gray-700">Tổng số lịch đã nhận</div>
              </div>
              <div className="text-2xl font-black text-purple-700">
                {lichTrongThang.length}
              </div>
            </div>

          </div>
        )}
      </div>

      <div className="text-center mt-8 mb-4">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Suri Wedding App</div>
        <div className="text-[10px] text-gray-400">Phiên bản Premium • Tối ưu hóa hiệu năng</div>
      </div>
    </div>
  );
}