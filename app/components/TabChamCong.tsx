import { useMemo, useState } from "react";
import { ChamCong } from "../../types";
import { MapPin, Clock as ClockIcon, FileText, CheckCircle2, XCircle, History } from "lucide-react";

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
    setGtLyDo("");
  };

  const dsChoDuyet = chamCongHienThi.filter((cc: ChamCong) => cc.trangThaiGiaiTrinh === "Chờ duyệt");

  return (
    <div className="pb-24 pt-2">
      {/* DUYỆT ĐƠN CHO ADMIN */}
      {laAdmin && dsChoDuyet.length > 0 && (
        <div className="bg-[#FAF5ED] border border-[#F2E5D0] rounded-[2rem] p-6 mb-8 shadow-sm animate-fade-in">
          <h2 className="text-[#A88B5A] font-bold flex items-center gap-2 mb-4 text-sm uppercase tracking-widest">
            <FileText size={18} /> Đơn xin phép chờ duyệt ({dsChoDuyet.length})
          </h2>
          <div className="space-y-4">
            {dsChoDuyet.map((cc: ChamCong) => (
              <div key={cc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-[#F2E5D0]">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-zinc-800 text-base">{cc.email.split('@')[0]}</div>
                  <div className="text-sm font-bold text-zinc-500">{cc.ngay.split("-").reverse().join("/")}</div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 w-fit px-2.5 py-1 rounded-md mb-2">{cc.loaiGiaiTrinh}</div>
                <div className="text-zinc-500 text-sm italic mb-4 bg-zinc-50 p-3 rounded-xl border border-zinc-100">"{cc.lyDoGiaiTrinh}"</div>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => cc.id && duyetGiaiTrinh(cc.id, true)} className="flex-1 bg-zinc-900 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-zinc-800 transition-all flex justify-center items-center gap-2 shadow-md"><CheckCircle2 size={16} /> Duyệt đơn</button>
                  <button onClick={() => cc.id && duyetGiaiTrinh(cc.id, false)} className="flex-1 bg-white border border-zinc-200 text-red-600 font-bold py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-red-50 transition-all flex justify-center items-center gap-2"><XCircle size={16} /> Từ chối</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BẢNG ĐIỀU KHIỂN CHẤM CÔNG CAO CẤP */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] border border-zinc-100 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-bold text-zinc-900 flex items-center gap-2">Chấm công GPS</h2>
          <div className="text-[10px] font-bold bg-zinc-100 tracking-widest text-zinc-500 px-3 py-1.5 rounded-full">{homNay().split("-").reverse().join("/")}</div>
        </div>

        <div className="bg-zinc-50/50 rounded-2xl p-4 mb-6 border border-zinc-100">
          {khoangCach === null ? (
            <div className="text-zinc-500 font-medium flex items-center gap-2 text-sm"><MapPin size={16} className="animate-pulse" /> Đang cập nhật tọa độ...</div>
          ) : (
            <div className={`font-bold flex items-center gap-2 text-sm ${hopLeGPS ? "text-emerald-600" : "text-rose-500"}`}>
              <MapPin size={16} /> {hopLeGPS ? "Bạn đang ở Studio" : "Ngoài vùng cho phép"} 
              <span className="text-xs font-medium ml-auto bg-white px-2 py-1 rounded-lg border border-zinc-100 shadow-sm text-zinc-500">{khoangCach}m / {BAN_KINH_CHO_PHEP}m</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#F0F5F1] p-5 rounded-[1.5rem] border border-[#DCE8DF] flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute -top-4 -right-4 text-[#DCE8DF] opacity-50"><ClockIcon size={64} /></div>
            <span className="text-[10px] text-[#4E7A5A] font-bold uppercase tracking-[0.2em] mb-2 relative z-10">Giờ vào</span>
            <span className="text-3xl font-light text-[#2C4A35] relative z-10">{chamCongHomNay?.checkIn || "--:--"}</span>
          </div>
          <div className="bg-[#F0F4F8] p-5 rounded-[1.5rem] border border-[#D9E2EC] flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute -top-4 -right-4 text-[#D9E2EC] opacity-50"><ClockIcon size={64} /></div>
            <span className="text-[10px] text-[#486581] font-bold uppercase tracking-[0.2em] mb-2 relative z-10">Giờ ra</span>
            <span className="text-3xl font-light text-[#243B53] relative z-10">{chamCongHomNay?.checkOut || "--:--"}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => chamCong("checkIn")} disabled={dangLayViTri || !!chamCongHomNay?.checkIn} className={`flex-1 py-4 rounded-[1.25rem] font-bold tracking-wide transition-all ${chamCongHomNay?.checkIn ? "bg-zinc-100 text-zinc-400" : "bg-zinc-900 text-white shadow-lg shadow-zinc-200 active:scale-[0.98]"}`}>
            {dangLayViTri ? "Đang xử lý..." : "CHECK-IN"}
          </button>
          <button onClick={() => chamCong("checkOut")} disabled={dangLayViTri || !chamCongHomNay?.checkIn || !!chamCongHomNay?.checkOut} className={`flex-1 py-4 rounded-[1.25rem] font-bold tracking-wide transition-all ${!chamCongHomNay?.checkIn || chamCongHomNay?.checkOut ? "bg-zinc-100 text-zinc-400" : "bg-white border border-zinc-300 text-zinc-900 shadow-sm hover:bg-zinc-50 active:scale-[0.98]"}`}>
            {dangLayViTri ? "Đang xử lý..." : "CHECK-OUT"}
          </button>
        </div>
      </div>

      {/* LỊCH SỬ CHẤM CÔNG */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] border border-zinc-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-serif font-bold text-zinc-900 flex items-center gap-2"><History size={20} className="text-zinc-400"/> {laAdmin ? "Lịch sử Hệ thống" : "Lịch sử Cá nhân"}</h2>
          {!laAdmin && (
            <button onClick={() => setShowModal(true)} className="bg-zinc-100 text-zinc-600 text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-xl hover:bg-zinc-200 transition-colors">
              Viết giải trình
            </button>
          )}
        </div>

        <div className="space-y-4">
          {danhSachDaSapXep.length === 0 ? (
            <div className="text-center text-zinc-400 py-10 italic bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-sm">Chưa có dữ liệu chấm công</div>
          ) : (
            danhSachDaSapXep.map((item: ChamCong) => (
              <div key={item.id} className="p-5 rounded-[1.5rem] border border-zinc-100 hover:border-zinc-200 transition-colors bg-white shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-50">
                  <div className="font-bold text-zinc-800 text-sm">{item.ngay.split("-").reverse().join("/")}</div>
                  {laAdmin && <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 px-2.5 py-1 rounded-lg">{item.email.split('@')[0]}</div>}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.15em] mb-1">Check-in</span>
                    <span className={`font-serif text-2xl font-bold ${item.checkIn ? "text-zinc-900" : "text-zinc-300"}`}>{item.checkIn || "--:--"}</span>
                  </div>
                  <div className="flex flex-col border-l pl-4 border-zinc-100">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.15em] mb-1">Check-out</span>
                    <span className={`font-serif text-2xl font-bold ${item.checkOut ? "text-zinc-900" : "text-zinc-300"}`}>{item.checkOut || "--:--"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-zinc-200">
                  {item.diMuon && (!item.trangThaiGiaiTrinh || item.trangThaiGiaiTrinh === "Từ chối") ? (
                    <span className="text-[10px] text-red-600 font-bold bg-red-50 border border-red-100 px-2.5 py-1 rounded-md uppercase tracking-wider">Đi muộn {item.soPhutMuon} phút</span>
                  ) : <div/>}

                  {item.trangThaiGiaiTrinh && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${item.trangThaiGiaiTrinh === "Đã duyệt" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : item.trangThaiGiaiTrinh === "Từ chối" ? "bg-red-50 text-red-600 border-red-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
                      {item.loaiGiaiTrinh} ({item.trangThaiGiaiTrinh})
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL GỬI GIẢI TRÌNH */}
      {showModal && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-fade-in border border-white/50">
            <h3 className="text-2xl font-serif font-bold mb-6 text-zinc-900 text-center">Đơn Xin Phép</h3>
            <div className="grid gap-5">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Ngày cần giải trình</label>
                <input type="date" value={gtNgay} onChange={(e) => setGtNgay(e.target.value)} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 outline-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Lý do chính</label>
                <select value={gtLoai} onChange={(e) => setGtLoai(e.target.value)} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 outline-none transition-all">
                  <option value="Quên chấm công">Quên chấm công (In/Out)</option>
                  <option value="Xin đi muộn">Xin đi muộn / Gặp khách</option>
                  <option value="Xin nghỉ phép">Xin nghỉ phép cả ngày</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Chi tiết</label>
                <input type="text" placeholder="VD: Gặp khách hàng ở xa..." value={gtLyDo} onChange={(e) => setGtLyDo(e.target.value)} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 outline-none transition-all" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={nopGiaiTrinh} className="flex-1 bg-zinc-900 text-white font-bold tracking-wide py-4 rounded-2xl shadow-lg shadow-zinc-200 hover:bg-zinc-800 active:scale-[0.98] transition-all">Gửi Đơn</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-4 bg-white border border-zinc-200 text-zinc-600 font-bold tracking-wide rounded-2xl hover:bg-zinc-50 active:scale-[0.98] transition-all">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}