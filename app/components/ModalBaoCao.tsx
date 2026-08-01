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

  // Danh sách các vai trò để hiển thị dạng nút bấm (Nhiều hơn và chuẩn chỉ hơn)
  const danhSachVaiTro = [
    { id: "Make-up", icon: "💄", label: "Make-up" },
    { id: "Chụp ảnh", icon: "📸", label: "Chụp ảnh" },
    { id: "Chỉnh sửa (Photoshop)", icon: "💻", label: "Photoshop" },
    { id: "Tư vấn / Hỗ trợ", icon: "🙋‍♂️", label: "Tư vấn" },
    { id: "Phụ việc / Hậu cần", icon: "🎒", label: "Hậu cần" },
    { id: "Quay Phim", icon: "🎥", label: "Quay Phim" },
  ];

  // Các mốc tiền gợi ý nhanh
  const mocTienNhanh = ["50000", "100000", "150000", "200000", "300000", "500000"];

  return (
    // Sử dụng layout Bottom Sheet cho Mobile (căn dưới đáy) và Modal ở giữa cho Desktop
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
      <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-fade-in border-t border-slate-100 sm:border flex flex-col max-h-[90vh]">
        
        {/* Thanh kéo nhỏ (Chỉ hiện trên mobile tạo cảm giác giống app thật) */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Nhận Hoa Hồng</h3>
          <p className="text-xs text-slate-500 font-medium">Báo cáo công đoạn bạn đã thực hiện</p>
        </div>
        
        {/* Thẻ thông tin Job (Context Card) - Thiết kế nổi bật */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl p-4 mb-6 shadow-sm relative overflow-hidden shrink-0">
          <div className="absolute -right-4 -top-4 text-6xl opacity-10">💼</div>
          <div className="text-[10px] text-blue-600 font-black mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            {props.lichDangChon.theLoai}
          </div>
          <div className="font-black text-slate-900 text-lg leading-tight">{props.lichDangChon.tenKhach}</div>
          <div className="text-xs text-slate-600 font-semibold mt-1">🗓 {props.lichDangChon.ngay.split('-').reverse().join('/')}</div>
        </div>
        
        <div className="overflow-y-auto hide-scrollbar flex-1 -mx-2 px-2">
          {/* Lưới chọn vai trò (Radio Cards) thay cho thẻ Select cũ */}
          <div className="mb-6">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-3">1. Vai trò của bạn</label>
            <div className="grid grid-cols-3 gap-2">
              {danhSachVaiTro.map((role) => {
                const isActive = props.vaiTro === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => props.setVaiTro(role.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 active:scale-95 ${
                      isActive 
                        ? "bg-blue-50 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                        : "bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50 grayscale-[50%]"
                    }`}
                  >
                    <span className={`text-2xl mb-1.5 transition-transform ${isActive ? "scale-110" : ""}`}>{role.icon}</span>
                    <span className={`text-[10px] text-center leading-tight ${isActive ? "font-black text-blue-700" : "font-bold text-slate-600"}`}>
                      {role.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Ô nhập tiền lớn + Chip tiền nhanh */}
          <div className="mb-8">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-3">2. Tiền công đề xuất</label>
            <div className="relative mb-3">
              <input 
                type="text" 
                inputMode="numeric" 
                placeholder="0" 
                value={props.tienHoaHong} 
                onChange={(e) => props.setTienHoaHong(props.formatTienInput(e.target.value))} 
                className="bg-white border-2 border-slate-200 p-4 rounded-2xl w-full pr-12 font-black text-slate-800 text-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300 text-center tracking-tight" 
              />
              <span className="absolute right-4 top-6 text-slate-400 font-bold text-lg">đ</span>
            </div>
            
            {/* Thanh cuộn chọn tiền nhanh */}
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar snap-x">
              {mocTienNhanh.map(tien => (
                <button 
                  key={tien}
                  onClick={() => props.setTienHoaHong(props.formatTienInput(tien))}
                  className="snap-start shrink-0 bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700 text-xs font-black px-4 py-2 rounded-xl transition-colors active:scale-95 border border-transparent hover:border-blue-200"
                >
                  +{props.formatTienInput(tien)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nút Hành động */}
        <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2 shrink-0">
          <button 
            onClick={() => props.setShowHoaHongModal(false)} 
            className="w-1/3 py-4 bg-slate-100 font-bold text-slate-600 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all"
          >
            Đóng
          </button>
          <button 
            onClick={props.xacNhanNhanTien} 
            className="w-2/3 bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>BÁO CÁO NHẬN</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
          </button>
        </div>

      </div>

      {/* Thêm chút CSS để ẩn thanh cuộn (scrollbar) cho đẹp như app */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}