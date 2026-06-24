import { useMemo, useState } from "react";
import { ChamCong } from "../../types";

interface TabChamCongProps {
  homNay: () => string;
  BAN_KINH_CHO_PHEP: number;
  khoangCach: number | null;
  chamCongHomNay?: ChamCong;
  chamCong: (loai: "checkIn" | "checkOut") => void;
  dangLayViTri: boolean;
  laAdmin: boolean;
  chamCongHienThi: ChamCong[];
  guiGiaiTrinh: (ngay: string, loai: string, lyDo: string) => void;
  duyetGiaiTrinh: (id: string, isApproved: boolean) => void;
}

export default function TabChamCong({
  homNay, 
  BAN_KINH_CHO_PHEP, 
  khoangCach, 
  chamCongHomNay, 
  chamCong, 
  dangLayViTri, 
  laAdmin, 
  chamCongHienThi, 
  guiGiaiTrinh, 
  duyetGiaiTrinh
}: TabChamCongProps) {
  
  const danhSachDaSapXep = useMemo(() => {
    return [...chamCongHienThi].sort((a, b) => b.ngay.localeCompare(a.ngay));
  }, [chamCongHienThi]);

  const hopLeGPS = khoangCach !== null && khoangCach <= BAN_KINH_CHO_PHEP;

  // Form Giải trình
  const [showModal, setShowModal] = useState(false);
  const [gtNgay, setGtNgay] = useState(homNay());
  const [gtLoai, setGtLoai] = useState("Quên chấm công");
  const [gtLyDo, setGtLyDo] = useState("");

  const nopGiaiTrinh = () => {
    if(!gtNgay || !gtLyDo) return alert("Vui lòng điền đủ ngày và lý do!");
    guiGiaiTrinh(gtNgay, gtLoai, gtLyDo);
    setShowModal(false);
    setGtLyDo(""); // Reset lại lý do sau khi gửi
  };

  const dsChoDuyet = chamCongHienThi.filter((cc: ChamCong) => cc.trangThaiGiaiTrinh === "Chờ duyệt");

  return (
    <div className="pb-24 px-2 pt-4">
      {/* DUYỆT ĐƠN CHO ADMIN */}
      {laAdmin && dsChoDuyet.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6 shadow-sm">
          <h2 className="text-orange-800 font-bold flex items-center gap-2 mb-3">🚨 Đơn xin phép chờ duyệt ({dsChoDuyet.length})</h2>
          <div className="space-y-3">
            {dsChoDuyet.map((cc: ChamCong) => (
              <div key={cc.id} className="bg-white p-3 rounded-xl shadow-sm text-sm">
                <div className="font-bold text-gray-800">{cc.email.split('@')[0]} - <span className="text-blue-600">{cc.ngay}</span></div>
                <div className="text-xs font-bold bg-orange-100 text-orange-700 w-fit px-2 py-0.5 rounded mt-1">{cc.loaiGiaiTrinh}</div>
                <div className="text-gray-600 italic mt-1 pb-2 border-b border-gray-100">" {cc.lyDoGiaiTrinh} "</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => cc.id && duyetGiaiTrinh(cc.id, true)} className="flex-1 bg-green-500 text-white font-bold py-1.5 rounded text-xs hover:bg-green-600">✅ Duyệt</button>
                  <button onClick={() => cc.id && duyetGiaiTrinh(cc.id, false)} className="flex-1 bg-red-500 text-white font-bold py-1.5 rounded text-xs hover:bg-red-600">❌ Từ chối</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BẢNG ĐIỀU KHIỂN CHẤM CÔNG */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">⏰ Chấm công GPS</h2>
          <div className="text-sm font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{homNay().split("-").reverse().join("/")}</div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100">
          {khoangCach === null ? (
            <div className="text-gray-600 font-medium flex items-center gap-2"><span>📍 Đang chờ cập nhật vị trí...</span></div>
          ) : (
            <div className={`font-bold flex items-center gap-2 ${hopLeGPS ? "text-green-600" : "text-red-500"}`}>
              {hopLeGPS ? "✅ Đang ở Studio" : "❌ Ngoài vùng chấm công"} <span className="text-sm font-normal">({khoangCach}m / {BAN_KINH_CHO_PHEP}m)</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-green-600 font-bold uppercase mb-1">Giờ vào (Check-in)</span>
            <span className="text-2xl font-black text-green-700">{chamCongHomNay?.checkIn || "--:--"}</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-blue-600 font-bold uppercase mb-1">Giờ ra (Check-out)</span>
            <span className="text-2xl font-black text-blue-700">{chamCongHomNay?.checkOut || "--:--"}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => chamCong("checkIn")} disabled={dangLayViTri || !!chamCongHomNay?.checkIn} className={`flex-1 py-4 rounded-xl font-bold text-[15px] transition-all ${chamCongHomNay?.checkIn ? "bg-gray-100 text-gray-400" : "bg-green-600 text-white shadow-lg"}`}>{dangLayViTri ? "⏳..." : "👋 CHECK IN"}</button>
          <button onClick={() => chamCong("checkOut")} disabled={dangLayViTri || !chamCongHomNay?.checkIn || !!chamCongHomNay?.checkOut} className={`flex-1 py-4 rounded-xl font-bold text-[15px] transition-all ${!chamCongHomNay?.checkIn || chamCongHomNay?.checkOut ? "bg-gray-100 text-gray-400" : "bg-blue-600 text-white shadow-lg"}`}>{dangLayViTri ? "⏳..." : "🏃 CHECK OUT"}</button>
        </div>
      </div>

      {/* LỊCH SỬ CHẤM CÔNG */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">{laAdmin ? "📋 Lịch sử toàn bộ" : "📋 Lịch sử của tôi"}</h2>
          {!laAdmin && (
            <button onClick={() => setShowModal(true)} className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded hover:bg-orange-200">📝 Giải trình</button>
          )}
        </div>

        <div className="space-y-3">
          {danhSachDaSapXep.length === 0 ? (
            <div className="text-center text-gray-400 py-6 italic bg-gray-50 rounded-xl">Chưa có dữ liệu chấm công</div>
          ) : (
            danhSachDaSapXep.map((item: ChamCong) => (
              <div key={item.id} className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors bg-slate-50/50">
                <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                  <div className="font-bold text-gray-700 text-sm flex items-center gap-2">📅 {item.ngay.split("-").reverse().join("/")}</div>
                  {laAdmin && <div className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">{item.email.split('@')[0]}</div>}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div className="flex flex-col"><span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Check-In</span><span className={`font-black text-base ${item.checkIn ? "text-green-600" : "text-gray-400"}`}>{item.checkIn || "Chưa có"}</span></div>
                  <div className="flex flex-col border-l pl-4 border-gray-200"><span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Check-Out</span><span className={`font-black text-base ${item.checkOut ? "text-blue-600" : "text-gray-400"}`}>{item.checkOut || "Chưa có"}</span></div>
                </div>

                {/* Khu vực hiển thị Phạt Đi muộn và Trạng thái Đơn giải trình */}
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-gray-200">
                  {item.diMuon && (!item.trangThaiGiaiTrinh || item.trangThaiGiaiTrinh === "Từ chối") ? (
                    <span className="text-[10px] text-red-600 font-bold bg-red-100 px-2 py-1 rounded">Muộn {item.soPhutMuon}p</span>
                  ) : <div/>}

                  {item.trangThaiGiaiTrinh && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${item.trangThaiGiaiTrinh === "Đã duyệt" ? "bg-green-100 text-green-700" : item.trangThaiGiaiTrinh === "Từ chối" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                      {item.loaiGiaiTrinh} ({item.trangThaiGiaiTrinh})
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL GỬI GIẢI TRÌNH (Dành cho Nhân viên) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">📝 Tạo đơn xin phép</h3>
            <div className="grid gap-3">
              <div><label className="text-xs font-bold text-gray-500 uppercase">Ngày cần giải trình</label><input type="date" value={gtNgay} onChange={(e) => setGtNgay(e.target.value)} className="border p-3 rounded-xl w-full mt-1 outline-none focus:ring-2 focus:ring-blue-400" /></div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Loại đơn</label>
                <select value={gtLoai} onChange={(e) => setGtLoai(e.target.value)} className="border p-3 rounded-xl w-full mt-1 outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="Quên chấm công">Quên chấm công (In/Out)</option>
                  <option value="Xin đi muộn">Xin đi muộn / Gặp khách</option>
                  <option value="Xin nghỉ phép">Xin nghỉ phép cả ngày</option>
                </select>
              </div>
              <div><label className="text-xs font-bold text-gray-500 uppercase">Lý do chi tiết</label><input type="text" placeholder="VD: Đi gửi đồ cho khách..." value={gtLyDo} onChange={(e) => setGtLyDo(e.target.value)} className="border p-3 rounded-xl w-full mt-1 outline-none focus:ring-2 focus:ring-blue-400" /></div>
              <div className="flex gap-2 mt-2"><button onClick={nopGiaiTrinh} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">Gửi Sếp</button><button onClick={() => setShowModal(false)} className="px-5 py-3 bg-gray-200 font-bold text-gray-700 rounded-xl hover:bg-gray-300">Hủy</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}