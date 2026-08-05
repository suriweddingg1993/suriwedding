import { X, Edit, Trash2, Package } from "lucide-react";
import { GoiDichVu } from "../../types";

interface ModalQuanLyGoiProps {
  showGoiModal: boolean;
  setShowGoiModal: (val: boolean) => void;
  dangSuaGoi: string | null;
  setDangSuaGoi: (val: string | null) => void;
  tenGoiMoi: string;
  setTenGoiMoi: (val: string) => void;
  chiTietGoiMoi: string;
  setChiTietGoiMoi: (val: string) => void;
  giaGoiMoi: string;
  setGiaGoiMoi: (val: string) => void;
  formatTienInput: (val: string) => string;
  luuGoiDichVu: () => void;
  danhSachGoiDichVu: GoiDichVu[];
  xoaGoiDichVu: (id: string) => void;
  laAdmin: boolean;
}

export default function ModalQuanLyGoi({
  showGoiModal, setShowGoiModal, dangSuaGoi, setDangSuaGoi,
  tenGoiMoi, setTenGoiMoi, chiTietGoiMoi, setChiTietGoiMoi, giaGoiMoi, setGiaGoiMoi,
  formatTienInput, luuGoiDichVu, danhSachGoiDichVu, xoaGoiDichVu, laAdmin
}: ModalQuanLyGoiProps) {
  if (!showGoiModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[120] p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl animate-fade-in flex flex-col max-h-[90vh] border border-white">
        
        {/* HEADER MODAL */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Package size={24} className="text-indigo-600"/> Quản lý Gói Chụp
          </h3>
          <button onClick={() => setShowGoiModal(false)} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-95"><X size={18} strokeWidth={2.5}/></button>
        </div>

        {/* NỘI DUNG CUỘN ĐƯỢC */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-6">
          
          {/* FORM THÊM / SỬA GÓI (CHỈ ADMIN THẤY) */}
          {laAdmin && (
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 shrink-0">
              <h4 className="font-bold text-sm text-indigo-800 mb-3 flex items-center gap-1.5">
                {dangSuaGoi ? "✏️ Cập nhật thông tin Gói" : "✨ Thêm Gói Mới vào thư viện"}
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Tên Gói (*)</label>
                  <input type="text" value={tenGoiMoi} onChange={(e) => setTenGoiMoi(e.target.value)} placeholder="VD: Gói Pre-Wedding VIP..." className="w-full bg-white border border-slate-200 p-3.5 rounded-xl outline-none font-bold text-slate-800 focus:ring-4 focus:ring-indigo-100 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Chi tiết sản phẩm</label>
                  <textarea value={chiTietGoiMoi} onChange={(e) => setChiTietGoiMoi(e.target.value)} placeholder="VD: 1 Ảnh cổng 60x90, 1 Album 25x25, 2 Váy cưới..." className="w-full bg-white border border-slate-200 p-3.5 rounded-xl outline-none font-medium text-slate-700 focus:ring-4 focus:ring-indigo-100 transition-all" rows={3} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Giá tiền mặc định (*)</label>
                  <div className="relative">
                    <input type="text" value={giaGoiMoi} onChange={(e) => setGiaGoiMoi(formatTienInput(e.target.value))} placeholder="15.000.000" className="w-full bg-white border border-slate-200 p-3.5 rounded-xl outline-none font-black text-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all pr-8" />
                    <span className="absolute right-3 top-3.5 text-slate-400 font-bold">đ</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  {dangSuaGoi && <button onClick={() => { setDangSuaGoi(null); setTenGoiMoi(""); setChiTietGoiMoi(""); setGiaGoiMoi(""); }} className="px-5 py-3.5 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 active:scale-95 transition-all">Hủy</button>}
                  <button onClick={luuGoiDichVu} className="flex-1 bg-indigo-600 text-white font-black py-3.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md">{dangSuaGoi ? "LƯU CẬP NHẬT" : "LƯU VÀO THƯ VIỆN"}</button>
                </div>
              </div>
            </div>
          )}

          {/* DANH SÁCH GÓI HIỆN CÓ TRONG DATA */}
          <div>
            <h4 className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-3 ml-1">Thư viện Gói chụp ({danhSachGoiDichVu.length})</h4>
            <div className="space-y-3">
              {danhSachGoiDichVu.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <div className="text-3xl mb-2 opacity-50">📂</div>
                  <div className="font-medium text-sm italic">Chưa có gói nào được lưu.</div>
                </div>
              ) : (
                danhSachGoiDichVu.map(goi => (
                  <div key={goi.id} className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-md transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-black text-slate-800 leading-tight pr-2">{goi.tenGoi}</div>
                      <div className="font-black text-indigo-600 shrink-0">{formatTienInput(String(goi.giaTien))}đ</div>
                    </div>
                    {goi.chiTiet && <div className="text-[11px] text-slate-500 font-medium mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100 whitespace-pre-line">{goi.chiTiet}</div>}
                    
                    {laAdmin && (
                      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                        <button onClick={() => { setDangSuaGoi(goi.id!); setTenGoiMoi(goi.tenGoi); setChiTietGoiMoi(goi.chiTiet || ""); setGiaGoiMoi(formatTienInput(String(goi.giaTien))); }} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl hover:bg-indigo-100 flex items-center gap-1.5 transition-all"><Edit size={14}/> Sửa</button>
                        <button onClick={() => xoaGoiDichVu(goi.id!)} className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-2 rounded-xl hover:bg-rose-100 flex items-center gap-1.5 transition-all"><Trash2 size={14}/> Xóa</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}