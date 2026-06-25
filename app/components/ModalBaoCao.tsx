import { Lich } from "../../types";

interface ModalBaoCaoProps {
  showHoaHongModal: boolean;
  setShowHoaHongModal: (val: boolean) => void;
  lichDangChon: Lich | null;
  vaiTro: string;
  setVaiTro: (val: string) => void;
  tienHoaHong: string;
  setTienHoaHong: (val: string) => void;
  formatTienInput: (val: string) => string;
  xacNhanNhanTien: () => void;
}

export default function ModalBaoCao(props: ModalBaoCaoProps) {
  if (!props.showHoaHongModal || !props.lichDangChon) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[70] p-4 overflow-hidden">
      <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl animate-fade-in border border-white">
        <h3 className="text-2xl font-black mb-2 text-blue-600 text-center tracking-tight">Hoàn Thành!</h3>
        <p className="text-xs text-slate-500 mb-6 text-center font-medium">Báo cáo công đoạn bạn đã làm để nhận lương.</p>
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-5">
          <div className="text-[10px] text-blue-500 font-black mb-1.5 uppercase tracking-wide">{props.lichDangChon.theLoai}</div>
          <div className="font-black text-slate-900 text-base">{props.lichDangChon.tenKhach}</div>
        </div>
        <div className="grid gap-4 w-full">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 block mb-1.5">Công đoạn của bạn</label>
            <select value={props.vaiTro} onChange={(e) => props.setVaiTro(e.target.value)} className="bg-white border border-blue-200 p-4 rounded-2xl w-full font-black text-slate-700 text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all">
              <option value="Make-up">💄 Make-up</option><option value="Chụp ảnh">📸 Chụp ảnh</option><option value="Chỉnh sửa (Photoshop)">💻 Chỉnh sửa (Photoshop)</option><option value="Tư vấn / Hỗ trợ">🙋‍♂️ Tư vấn / Hỗ trợ</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 block mb-1.5">Tiền công / Hoa hồng</label>
            <div className="relative w-full">
              <input type="text" inputMode="numeric" placeholder="VD: 300.000" value={props.tienHoaHong} onChange={(e) => props.setTienHoaHong(props.formatTienInput(e.target.value))} className="bg-white border border-blue-200 p-4 rounded-2xl w-full pr-10 font-black text-blue-700 text-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-blue-200" />
              <span className="absolute right-5 top-5 text-blue-600 font-black">đ</span>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <button onClick={props.xacNhanNhanTien} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all">💰 Báo Cáo</button>
            <button onClick={() => props.setShowHoaHongModal(false)} className="px-6 py-4 bg-slate-100 font-bold text-slate-600 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}