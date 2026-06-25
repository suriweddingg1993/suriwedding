import { GoiDichVu } from "../../types";

interface ModalThemLichProps {
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  dangSua: string | null;
  ngay: string; setNgay: (val: string) => void;
  gio: string; setGio: (val: string) => void;
  tenKhach: string; setTenKhach: (val: string) => void;
  soDienThoai: string; setSoDienThoai: (val: string) => void;
  soDienThoai2: string; setSoDienThoai2: (val: string) => void;
  theLoai: string; setTheLoai: (val: string) => void;
  theLoaiKhac: string; setTheLoaiKhac: (val: string) => void;
  goiChup: string; setGoiChup: (val: string) => void;
  giaTien: string; setGiaTien: (val: string) => void;
  tienCoc: string; setTienCoc: (val: string) => void;
  errors: Record<string, boolean>;
  formatTienInput: (val: string) => string;
  handleLuuLichThongMinh: () => Promise<void>;
  danhSachGoiDichVu: GoiDichVu[];
  laAdmin: boolean;
  setShowGoiModal: (val: boolean) => void;
}

export default function ModalThemLich(props: ModalThemLichProps) {
  if (!props.showModal) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-hidden">
      <div className="bg-white rounded-[2rem] w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 shadow-2xl">
        <h2 className="text-2xl font-black mb-6 text-slate-900">{props.dangSua ? "✏️ Cập nhật Lịch" : "✨ Thêm Lịch Mới"}</h2>
        <div className="grid gap-4 w-full">
          
          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 mb-2">
            <div className="flex justify-between items-end mb-1.5">
              <label className="text-[10px] text-blue-700 font-black ml-2 block uppercase">Chọn Nhanh Gói Dịch Vụ</label>
              {props.laAdmin && <button onClick={() => props.setShowGoiModal(true)} className="text-[10px] text-blue-600 font-bold bg-white px-2 py-1 rounded shadow-sm">⚙️ Cài đặt</button>}
            </div>
            <select 
              onChange={(e) => {
                if (!e.target.value) { props.setGoiChup(""); props.setGiaTien(""); return; }
                const goi = props.danhSachGoiDichVu.find(g => g.id === e.target.value);
                if (goi) { props.setGoiChup(goi.chiTiet); props.setGiaTien(props.formatTienInput(String(goi.giaTien))); props.setTheLoai(goi.tenGoi); }
              }}
              className="bg-white p-3.5 rounded-xl w-full text-blue-700 font-bold outline-none transition-all shadow-sm"
            >
              <option value="">-- Chọn để tự động điền --</option>
              {props.danhSachGoiDichVu.map(g => (<option key={g.id} value={g.id}>{g.tenGoi} - {props.formatTienInput(String(g.giaTien))}đ</option>))}
            </select>
          </div>

          <div className="flex gap-3 w-full">
            <div className="flex-1 min-w-0"><label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Ngày chụp</label><input type="date" value={props.ngay} onChange={(e) => props.setNgay(e.target.value)} className={`bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none ${props.errors.ngay ? "border-2 border-red-500 bg-red-50" : "border border-transparent"}`} /></div>
            <div className="flex-1 min-w-0"><label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Giờ chụp</label><input type="time" value={props.gio} onChange={(e) => props.setGio(e.target.value)} className={`bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none ${props.errors.gio ? "border-2 border-red-500 bg-red-50" : "border border-transparent"}`} /></div>
          </div>
          
          <div><label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Tên Khách</label><input type="text" placeholder="Nhập tên..." value={props.tenKhach} onChange={(e) => props.setTenKhach(e.target.value)} className={`bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none ${props.errors.tenKhach ? "border-2 border-red-500 bg-red-50" : "border border-transparent"}`} /></div>
          
          <div className="flex gap-3 w-full">
            <div className="flex-1 min-w-0"><label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">SĐT 1</label><input type="text" placeholder="0987..." value={props.soDienThoai} onChange={(e) => props.setSoDienThoai(e.target.value)} className={`bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none transition-all ${props.errors.soDienThoai ? "border-2 border-red-500 bg-red-50" : "border border-transparent"}`} /></div>
            <div className="flex-1 min-w-0"><label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">SĐT 2</label><input type="text" placeholder="Dự phòng..." value={props.soDienThoai2} onChange={(e) => props.setSoDienThoai2(e.target.value)} className={`bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none transition-all ${props.errors.soDienThoai2 ? "border-2 border-red-500 bg-red-50" : "border border-transparent"}`} /></div>
          </div>

          <div className="flex gap-3 w-full">
            <div className="flex-1 min-w-0">
              <label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Thể loại</label>
              <select value={props.theLoai} onChange={(e) => props.setTheLoai(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold border border-transparent outline-none">
                <option value="">- Chọn -</option><option value="Chụp Cưới">💍 Chụp Cưới</option><option value="Chụp Sự kiện">🎉 Sự kiện</option><option value="Chụp Chân dung">👤 Chân dung</option><option value="Chụp Gia đình">👨‍👩‍👧‍👦 Gia đình</option><option value="Chụp Kỷ yếu">🎓 Kỷ yếu</option><option value="Khác">✨ Khác</option>
              </select>
            </div>
            {props.theLoai === "Khác" && (
               <div className="flex-1 min-w-0"><label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Nhập loại khác</label><input type="text" placeholder="Nhập..." value={props.theLoaiKhac} onChange={(e) => props.setTheLoaiKhac(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold border border-transparent outline-none" /></div>
            )}
          </div>
          
          <div><label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Ghi chú chi tiết váy/vest</label><input type="text" placeholder="VD: 2 váy, 1 vest..." value={props.goiChup} onChange={(e) => props.setGoiChup(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-slate-900 font-bold border border-transparent outline-none" /></div>
          
          <div className="flex gap-3 w-full">
            <div className="flex-1 min-w-0">
              <label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Giá Hợp Đồng</label>
              <div className="relative">
                <input type="text" inputMode="numeric" placeholder="0" value={props.giaTien} onChange={(e) => props.setGiaTien(props.formatTienInput(e.target.value))} className={`bg-slate-50 p-4 rounded-2xl w-full pr-8 text-emerald-600 font-black text-xl outline-none ${props.errors.giaTien ? "border-2 border-red-500 bg-red-50" : "border border-transparent"}`} />
                <span className="absolute right-3 top-5 text-slate-400 font-bold">đ</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Khách Đã Cọc</label>
              <div className="relative">
                <input type="text" inputMode="numeric" placeholder="0" value={props.tienCoc} onChange={(e) => props.setTienCoc(props.formatTienInput(e.target.value))} className="bg-slate-50 p-4 rounded-2xl w-full pr-8 text-orange-600 font-black text-xl border border-transparent outline-none" />
                <span className="absolute right-3 top-5 text-slate-400 font-bold">đ</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={props.handleLuuLichThongMinh} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 active:scale-95 transition-all">💾 Lưu Lịch</button>
            <button onClick={() => props.setShowModal(false)} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 active:scale-95 transition-all">Hủy</button>
          </div>
        </div>
      </div>
    </div>
  );
}