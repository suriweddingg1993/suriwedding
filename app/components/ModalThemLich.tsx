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

  // Hàm xác nhận trước khi lưu
  const xacNhanTruocKhiLuu = () => {
    const isConfirm = window.confirm("Bạn có chắc chắn muốn lưu thông tin lịch hẹn này không?");
    if (isConfirm) {
      props.handleLuuLichThongMinh();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-gray-100 flex flex-col w-screen h-screen overflow-hidden">
      
      {/* HEADER: MŨI TÊN QUAY LẠI VÀ NÚT LƯU GÓC PHẢI */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm shrink-0">
        <div className="flex items-center">
          <button onClick={() => props.setShowModal(false)} className="p-2 -ml-2 text-gray-600 active:bg-gray-100 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h2 className="text-lg font-black text-gray-800 ml-1">{props.dangSua ? "Cập nhật Lịch" : "Thêm Lịch Mới"}</h2>
        </div>
        <button onClick={xacNhanTruocKhiLuu} className="text-blue-600 font-black text-sm uppercase px-2 py-1 active:opacity-50 transition-opacity">
          LƯU
        </button>
      </div>

      {/* NỘI DUNG FORM CUỘN Ở GIỮA */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-full max-w-[400px]">
          
          <div className="bg-white p-5 rounded-2xl shadow-sm text-gray-900 border border-gray-200">
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
                    <option value="">- Chọn -</option>
                    <option value="Chụp Cưới">💍 Chụp Cưới</option>
                    <option value="Chụp Sự kiện">🎉 Sự kiện</option>
                    <option value="Chụp Baby">👶 Chụp Baby</option>
                    <option value="Chụp Chân dung">👤 Chân dung</option>
                    <option value="Chụp Gia đình">👨‍👩‍👧‍👦 Gia đình</option>
                    <option value="Chụp Kỷ yếu">🎓 Kỷ yếu</option>
                    <option value="Khác">✨ Khác</option>
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

            </div>
          </div>
          <div className="h-8 shrink-0"></div>
        </div>
      </div>
    </div>
  );
}