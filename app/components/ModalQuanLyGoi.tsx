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
  luuGoiDichVu: () => Promise<void>;
  danhSachGoiDichVu: GoiDichVu[];
  xoaGoiDichVu: (id: string) => Promise<void>;
  laAdmin: boolean;
}

export default function ModalQuanLyGoi(props: ModalQuanLyGoiProps) {
  if (!props.showGoiModal || !props.laAdmin) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[70] p-4 overflow-hidden">
      <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <h2 className="text-xl font-black mb-4 text-slate-900">⚙️ Quản lý Gói Dịch Vụ Mẫu</h2>
        <div className="bg-blue-50/50 p-4 rounded-xl mb-5 border border-blue-100 w-full">
          <h3 className="font-bold text-sm mb-3 text-blue-800">{props.dangSuaGoi ? "Sửa thông tin gói" : "Tạo gói mới"}</h3>
          <input type="text" placeholder="Tên gói (VD: Gói Cưới Premium)" value={props.tenGoiMoi} onChange={(e) => props.setTenGoiMoi(e.target.value)} className="w-full mb-3 p-3 rounded-xl border border-blue-200 font-bold outline-none focus:ring-2 focus:ring-blue-300" />
          <textarea placeholder="Chi tiết gồm những gì? (VD: 2 Váy, 1 Vest...)" value={props.chiTietGoiMoi} onChange={(e) => props.setChiTietGoiMoi(e.target.value)} className="w-full mb-3 p-3 rounded-xl border border-blue-200 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-300" rows={3}></textarea>
          <div className="relative mb-4 w-full">
            <input type="text" inputMode="numeric" placeholder="Giá tiền mặc định" value={props.giaGoiMoi} onChange={(e) => props.setGiaGoiMoi(props.formatTienInput(e.target.value))} className="w-full p-3 rounded-xl border border-blue-200 font-black text-emerald-600 text-lg outline-none focus:ring-2 focus:ring-blue-300 pr-10" />
            <span className="absolute right-4 top-4 text-slate-400 font-bold">VNĐ</span>
          </div>
          <div className="flex gap-2">
            <button onClick={props.luuGoiDichVu} className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl shadow-md">{props.dangSuaGoi ? "LƯU CẬP NHẬT" : "TẠO GÓI MỚI"}</button>
            {props.dangSuaGoi && <button onClick={() => {props.setDangSuaGoi(null); props.setTenGoiMoi(""); props.setChiTietGoiMoi(""); props.setGiaGoiMoi("")}} className="px-5 bg-slate-200 font-bold text-slate-700 rounded-xl">Hủy</button>}
          </div>
        </div>

        <div className="space-y-3 w-full">
          <h4 className="font-bold text-slate-600 text-sm mb-2">Danh sách Gói đang có:</h4>
          {props.danhSachGoiDichVu.map(g => (
            <div key={g.id} className="flex justify-between items-center p-4 border border-slate-100 bg-slate-50 rounded-xl">
              <div className="min-w-0 pr-2">
                <div className="font-bold text-slate-800 break-words">{g.tenGoi} <span className="text-emerald-600 text-sm ml-2 font-black">{props.formatTienInput(String(g.giaTien))}đ</span></div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-2">{g.chiTiet}</div>
              </div>
              <div className="flex gap-2 shrink-0 ml-1">
                <button onClick={() => {props.setDangSuaGoi(g.id!); props.setTenGoiMoi(g.tenGoi); props.setChiTietGoiMoi(g.chiTiet); props.setGiaGoiMoi(props.formatTienInput(String(g.giaTien)))}} className="text-blue-600 font-bold text-sm px-3 py-2 bg-blue-100 rounded-lg">Sửa</button>
                <button onClick={() => props.xoaGoiDichVu(g.id!)} className="text-red-500 font-bold text-sm px-3 py-2 bg-red-100 rounded-lg">Xóa</button>
              </div>
            </div>
          ))}
          {props.danhSachGoiDichVu.length === 0 && <div className="text-center text-sm text-slate-400 py-4 italic">Chưa có gói dịch vụ nào</div>}
        </div>
        <button onClick={() => props.setShowGoiModal(false)} className="w-full mt-6 bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-200">ĐÓNG BẢNG</button>
      </div>
    </div>
  );
}