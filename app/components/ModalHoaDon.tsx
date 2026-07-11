import { useState, useRef, useEffect } from "react";
import { Lich, PhatSinh } from "../../types";

interface ModalHoaDonProps {
  hoaDonData: Lich | null;
  setHoaDonData: (val: Lich | null) => void;
  hdDiaChi: string;
  setHdDiaChi: (val: string) => void;
  homNay: () => string;
  formatTienInput: (val: string) => string;
  danhSachPhatSinh: PhatSinh[];
}

export default function ModalHoaDon({
  hoaDonData, setHoaDonData, hdDiaChi, setHdDiaChi, homNay, formatTienInput, danhSachPhatSinh
}: ModalHoaDonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [chuKy, setChuKy] = useState<string | null>(null);

  useEffect(() => {
    if (hoaDonData && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
  }, [hoaDonData]);

  const getCoordinates = (e: any) => { 
    const canvas = canvasRef.current; 
    if (!canvas) return { x: 0, y: 0 }; 
    const rect = canvas.getBoundingClientRect(); 
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }; 
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }; 
  };
  const startDrawing = (e: any) => { 
    setIsDrawing(true); 
    const pos = getCoordinates(e); 
    const ctx = canvasRef.current?.getContext("2d"); 
    if (ctx) { ctx.beginPath(); ctx.moveTo(pos.x, pos.y); } 
  };
  const draw = (e: any) => { 
    if (!isDrawing) return; 
    if(e.cancelable) e.preventDefault(); 
    const pos = getCoordinates(e); 
    const ctx = canvasRef.current?.getContext("2d"); 
    if (ctx) { ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.strokeStyle = "#000000"; ctx.lineTo(pos.x, pos.y); ctx.stroke(); } 
  };
  const stopDrawing = () => { 
    setIsDrawing(false); 
    if (canvasRef.current) setChuKy(canvasRef.current.toDataURL("image/png")); 
  };
  const xoaChuKy = () => { 
    setChuKy(null); 
    if (canvasRef.current) { 
      const ctx = canvasRef.current.getContext("2d"); 
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); 
    } 
  };

  if (!hoaDonData) return null;

  // 1. TÌM CÁC KHOẢN GHI TRONG TAB THU/CHI
  const cacKhoanPhatSinh = danhSachPhatSinh.filter(ps => ps.soDienThoai === hoaDonData.soDienThoai);
  const tongTienPhatSinh = cacKhoanPhatSinh.reduce((sum, item) => sum + (item.soTien || 0), 0);
  
  // 2. TÍNH TỔNG: Giá chụp gốc + Tiền dv thêm (trong Lịch) + Các khoản thu/chi SĐT trùng khớp
  const tienDVThem = (hoaDonData as any).tienDichVuThem || 0;
  const tongThanhToan = (hoaDonData.giaTien || 0) + tienDVThem + tongTienPhatSinh;
  const conPhaiThu = tongThanhToan - (hoaDonData.tienCoc || 0);

  return (
    <div className="fixed inset-0 z-[80] bg-gray-100 flex flex-col w-full h-full overflow-hidden">
      <div className="flex items-center px-4 py-3 bg-white shadow-sm shrink-0">
        <button onClick={() => setHoaDonData(null)} className="p-2 -ml-2 text-gray-600 active:bg-gray-100 rounded-full transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h2 className="text-lg font-black text-gray-800 ml-2">Xác nhận Dịch vụ</h2>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col items-center">
        <div className="w-full max-w-[400px]">
          <div className="mb-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="mb-4">
              <h3 className="font-bold text-blue-600 mb-2 text-[11px] uppercase tracking-wide">Nhập địa chỉ Khách hàng</h3>
              <input type="text" placeholder="VD: Thuận Châu, Sơn La..." value={hdDiaChi} onChange={(e) => setHdDiaChi(e.target.value)} className="bg-gray-50 border border-gray-200 p-3 rounded-xl w-full font-medium text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-blue-600 text-[11px] uppercase tracking-wide">Chữ ký Khách hàng</h3>
                <button onClick={xoaChuKy} className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-1 rounded">Xóa chữ ký</button>
              </div>
              <canvas ref={canvasRef} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} className="w-full h-24 border border-gray-300 rounded-xl bg-gray-50 touch-none cursor-crosshair" style={{ touchAction: 'none' }} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm text-gray-900 border border-gray-200 mb-8">
            <div className="flex justify-between items-start mb-4 border-b border-gray-200 pb-4">
              <div>
                <h1 className="text-sm font-black uppercase text-blue-900 tracking-tight">ẢNH VIỆN SURI WEDDING</h1>
                <p className="text-[10px] text-gray-500 mt-1 font-medium">Đ/c: Thuận Châu, Sơn La</p>
                <p className="text-[10px] text-gray-500 font-medium">SĐT: 0967.185.505 - 0379.777.819</p>
              </div>
              <div className="text-right text-[10px] text-gray-500 font-medium">
                <p>HĐ: {hoaDonData.id?.slice(-6).toUpperCase()}</p>
                <p>Ngày: {homNay().split('-').reverse().join('/')}</p>
              </div>
            </div>

            <div className="text-[11px] mb-5 space-y-1.5">
              <div className="flex"><span className="font-semibold text-gray-500 w-16 shrink-0">Khách:</span> <span className="font-black text-gray-800">{hoaDonData.tenKhach}</span></div>
              <div className="flex"><span className="font-semibold text-gray-500 w-16 shrink-0">SĐT:</span> <span className="font-bold text-gray-800">{hoaDonData.soDienThoai}</span></div>
              <div className="flex"><span className="font-semibold text-gray-500 w-16 shrink-0">Địa chỉ:</span> <span className="font-bold text-gray-800">{hdDiaChi || ".............................................................."}</span></div>
            </div>

            <table className="w-full border-collapse text-[11px] mb-4">
              <thead>
                <tr className="border-b border-gray-300 text-gray-600 bg-gray-50">
                  <th className="py-2 px-1 text-center w-8 font-bold">STT</th>
                  <th className="py-2 px-1 text-left font-bold">MÔ TẢ DỊCH VỤ</th>
                  <th className="py-2 px-1 text-center w-8 font-bold">SL</th>
                  <th className="py-2 px-1 text-right font-bold whitespace-nowrap">ĐƠN GIÁ</th>
                  <th className="py-2 px-1 text-right font-bold whitespace-nowrap">THÀNH TIỀN</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 px-1 text-center font-medium">1</td>
                  <td className="py-2 px-1 font-black text-gray-800">{hoaDonData.theLoai}</td>
                  <td className="py-2 px-1 text-center font-medium">1</td>
                  <td className="py-2 px-1 text-right font-medium whitespace-nowrap">{formatTienInput(String(hoaDonData.giaTien || 0))}</td>
                  <td className="py-2 px-1 text-right font-medium whitespace-nowrap">{formatTienInput(String(hoaDonData.giaTien || 0))}</td>
                </tr>
                {hoaDonData.goiChup && (
                  <tr className="border-b border-gray-100">
                    <td></td>
                    <td className="pb-3 px-1 whitespace-pre-wrap text-gray-600 italic leading-relaxed pt-1" colSpan={4}>
                      <span className="font-semibold not-italic">Chi tiết: </span>
                      {hoaDonData.goiChup.includes('\n') ? '\n' + hoaDonData.goiChup : hoaDonData.goiChup}
                    </td>
                  </tr>
                )}
                
                {/* RENDER DỊCH VỤ THÊM NẾU GHI TRONG LỊCH */}
                {(hoaDonData as any).dichVuThem && (
                  <tr className="border-b border-gray-100 bg-orange-50/40">
                    <td className="py-2 px-1 text-center font-medium">2</td>
                    <td className="py-2 px-1 font-black text-gray-800">
                        {(hoaDonData as any).dichVuThem} <span className="font-normal italic text-gray-500 text-[9px] uppercase ml-1">(Dịch vụ thêm)</span>
                    </td>
                    <td className="py-2 px-1 text-center font-medium">1</td>
                    <td className="py-2 px-1 text-right font-medium whitespace-nowrap">{formatTienInput(String((hoaDonData as any).tienDichVuThem || 0))}</td>
                    <td className="py-2 px-1 text-right font-medium whitespace-nowrap text-orange-700 font-bold">{formatTienInput(String((hoaDonData as any).tienDichVuThem || 0))}</td>
                  </tr>
                )}
                
                {/* RENDER CÁC KHOẢN TỪ THU/CHI */}
                {cacKhoanPhatSinh.map((ps, index) => {
                  const startIndex = (hoaDonData as any).dichVuThem ? 3 : 2;
                  return (
                    <tr key={ps.id || index} className="border-b border-gray-100 bg-blue-50/30">
                      <td className="py-2 px-1 text-center font-medium">{index + startIndex}</td>
                      <td className="py-2 px-1 font-black text-gray-800">
                        {ps.loai} {ps.ghiChu ? <span className="font-normal italic text-gray-500">({ps.ghiChu})</span> : ""}
                      </td>
                      <td className="py-2 px-1 text-center font-medium">1</td>
                      <td className="py-2 px-1 text-right font-medium whitespace-nowrap">{formatTienInput(String(ps.soTien || 0))}</td>
                      <td className="py-2 px-1 text-right font-medium whitespace-nowrap text-blue-700 font-bold">{formatTienInput(String(ps.soTien || 0))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="flex justify-end mb-6 border-t border-gray-200 pt-3">
              <table className="w-2/3 sm:w-1/2 border-collapse text-[11px]">
                <tbody>
                  <tr>
                    <td className="py-1 px-2 font-medium text-gray-500 text-right">Tổng thanh toán:</td>
                    <td className="py-1 px-2 text-right font-bold text-gray-800 w-24">{formatTienInput(String(tongThanhToan))}</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 font-medium text-gray-500 text-right pb-3 border-b border-gray-100">Khách đã cọc:</td>
                    <td className="py-1 px-2 text-right font-bold text-gray-800 pb-3 border-b border-gray-100">{formatTienInput(String(hoaDonData.tienCoc || 0))}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-2 font-black text-gray-900 uppercase text-right pt-3">Còn phải thu:</td>
                    <td className="py-1.5 px-2 text-right font-black text-red-600 text-sm pt-3">{formatTienInput(String(conPhaiThu))}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-start text-center text-[10px]">
              <div className="w-1/2 flex flex-col items-center">
                <p className="font-bold mb-1 text-gray-800">Khách hàng</p>
                <div className="h-14 flex items-center justify-center">
                  {chuKy ? <img src={chuKy} alt="Chữ ký" className="max-h-full max-w-full mix-blend-multiply" /> : <span className="text-gray-300 italic text-[9px]">(Chưa ký)</span>}
                </div>
                <p className="font-bold text-gray-800 mt-1">{hoaDonData.tenKhach}</p>
              </div>
              <div className="w-1/2 flex flex-col items-center">
                <p className="italic text-gray-400 mb-1">Ngày {homNay().split('-')[2]}/{homNay().split('-')[1]}/{homNay().split('-')[0]}</p>
                <p className="font-bold text-gray-800 mb-1">Đại diện Studio</p>
                <div className="h-14"></div>
                <p className="font-bold text-gray-800">SURI WEDDING</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}