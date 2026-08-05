import { useState, useRef, useEffect } from "react";
import { X, MapPin, Printer, PenTool, Eraser, Check } from "lucide-react";
import { Lich, PhatSinh } from "../../types";

interface ModalHoaDonProps {
  hoaDonData: Lich | null;
  setHoaDonData: (val: Lich | null) => void;
  hdDiaChi: string;
  setHdDiaChi: (val: string) => void;
  homNay: () => string;
  formatTienInput: (val: string) => string;
  danhSachPhatSinh: PhatSinh[];
  lichLamViec: Lich[];
}

export default function ModalHoaDon({
  hoaDonData,
  setHoaDonData,
  hdDiaChi,
  setHdDiaChi,
  homNay,
  formatTienInput,
  danhSachPhatSinh,
  lichLamViec
}: ModalHoaDonProps) {
  
  // STATE CHỮ KÝ
  const [chuKy, setChuKy] = useState<string | null>(null);
  const [showChuKyModal, setShowChuKyModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Khởi tạo Canvas (Bảng vẽ)
  useEffect(() => {
    if (showChuKyModal && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#0f172a"; 
      }
    }
  }, [showChuKyModal]);

  // Logic Vẽ Chữ Ký mượt mà cho cảm ứng
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDrawing = () => { setIsDrawing(false); };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setChuKy(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Lưu và ép React render lại ngay lập tức
      setChuKy(canvas.toDataURL("image/png"));
    }
    setShowChuKyModal(false);
  };

  if (!hoaDonData) return null;

  // GIỮ NGUYÊN 100% LOGIC TÍNH TOÁN TIỀN
  const isKhachCungID = (itemKhachHangId?: string, itemSDT?: string) => {
    if (hoaDonData.khachHangId && itemKhachHangId) return itemKhachHangId === hoaDonData.khachHangId;
    return itemSDT === hoaDonData.soDienThoai;
  };

  const psCuaKhach = danhSachPhatSinh.filter((ps) => isKhachCungID(ps.khachHangId, ps.soDienThoai));
  const lichCuaKhach = lichLamViec.filter((l) => isKhachCungID(l.khachHangId, l.soDienThoai));

  let tongTienLich = 0; let tongDaCocLich = 0;
  lichCuaKhach.forEach(l => {
    tongTienLich += Number(l.giaTien || 0) + Number((l as any).tienDichVuThem || 0);
    tongDaCocLich += Number(l.tienCoc || 0);
  });

  let tongTienPhatSinh = 0;
  psCuaKhach.forEach(p => { tongTienPhatSinh += Number(p.soTien || 0); });

  const tongBill = tongTienLich + tongTienPhatSinh;
  const daThanhToan = tongDaCocLich;
  const tongNoHienTai = tongBill - daThanhToan;
  
  // Xử lý xuống dòng cho Chi tiết gói
  const chiTietLines = (hoaDonData.chiTietGoi || "").split('\n').filter(line => line.trim() !== '');

  // LOGIC IN HÓA ĐƠN
  const handleInHoaDon = () => {
    const printContent = document.getElementById("vung-in-hoa-don");
    if (!printContent) return;
    const windowPrint = window.open("", "", "width=800,height=900");
    if (!windowPrint) return;

    // Bơm CSS tĩnh để bản In/PDF y hệt bản hiển thị trên điện thoại
    windowPrint.document.write(`
      <html>
        <head>
          <title>Hóa Đơn - Suri Wedding</title>
          <style>
            body { font-family: sans-serif; color: #000; margin: 0; padding: 15px; font-size: 11px; }
            .hd-header { display: flex; justify-content: space-between; margin-bottom: 15px; }
            .hd-title { font-size: 14px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; margin-bottom: 3px; }
            .hd-info { font-size: 9px; color: #4b5563; line-height: 1.4; }
            .hd-meta { text-align: right; font-size: 9px; color: #4b5563; line-height: 1.4; }
            .customer-box { display: grid; grid-template-columns: 50px 1fr; gap: 4px; margin-bottom: 10px; font-size: 10px; }
            .c-label { color: #4b5563; }
            .c-value { font-weight: bold; border-bottom: 1px dotted #9ca3af; padding-bottom: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10px; }
            th, td { border: 1px solid #1f2937; padding: 4px; }
            th { background-color: #f3f4f6; font-weight: bold; text-align: left; text-transform: uppercase; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .item-detail { font-size: 9px; color: #374151; font-style: italic; margin-top: 2px; line-height: 1.3;}
            .item-detail strong { font-style: normal; color: #000; }
            .summary { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; margin-bottom: 15px; font-size: 11px; }
            .sum-line { display: flex; justify-content: space-between; width: 60%; font-weight: bold; }
            .sum-line.total { width: 100%; border-top: 2px solid #1f2937; padding-top: 4px; margin-top: 2px; font-size: 13px; }
            .text-red { color: #dc2626; }
            .signatures { display: flex; justify-content: space-between; text-align: center; font-size: 10px; margin-top: 20px;}
            .sig-col { width: 45%; }
            .sig-title { font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
            .sig-date { font-size: 8px; color: #6b7280; font-style: italic; margin-bottom: 4px; }
            .sig-img { height: 50px; object-fit: contain; margin: 4px auto; display: block; }
            .sig-empty { height: 50px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => { windowPrint.print(); windowPrint.close(); }, 500);
  };

  return (
    <>
      {/* 
        BỐ CỤC MODAL TỐI ƯU 100% CHO ĐIỆN THOẠI 
        Dùng flex-col, giấu các nút lên trên/xuống dưới, chừa toàn bộ không gian giữa cho Hóa đơn.
      */}
      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col">
        
        {/* THANH CÔNG CỤ TRÊN CÙNG (Gọn gàng) */}
        <div className="bg-white p-3 shrink-0 flex flex-col gap-2 z-10 shadow-md rounded-b-2xl">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5"><Printer size={16}/> Hóa Đơn Khách Hàng</h3>
            <button onClick={() => setHoaDonData(null)} className="w-7 h-7 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center active:scale-95"><X size={16}/></button>
          </div>
          
          <div className="flex gap-2 items-center">
            <input 
              type="text" value={hdDiaChi} onChange={(e) => setHdDiaChi(e.target.value)} 
              placeholder="Nhập địa chỉ nhà khách..." 
              className="flex-1 bg-slate-50 border border-slate-200 text-xs p-2.5 rounded-xl outline-none focus:border-blue-300" 
            />
            <button 
              onClick={() => setShowChuKyModal(true)}
              className="bg-indigo-50 border border-indigo-100 text-indigo-700 active:bg-indigo-100 px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1 whitespace-nowrap"
            >
              <PenTool size={14}/> {chuKy ? "Ký lại" : "Ký tên"}
            </button>
          </div>
        </div>

        {/* KHU VỰC HIỂN THỊ HÓA ĐƠN ĐỂ CHỤP MÀN HÌNH (Căn giữa, nền tối tôn hóa đơn sáng) */}
        <div className="flex-1 overflow-auto bg-slate-800 p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center custom-scrollbar">
          
          {/* ĐÂY CHÍNH LÀ TỜ HÓA ĐƠN TRẮNG */}
          <div id="vung-in-hoa-don" className="bg-white w-full max-w-[420px] p-4 text-[10px] sm:text-xs text-black font-sans shadow-2xl rounded-sm leading-tight relative">
            
            {/* Header */}
            <div className="hd-header flex justify-between items-start mb-3">
              <div>
                <div className="hd-title font-black text-blue-900 text-sm uppercase tracking-tight mb-1">Ảnh viện Suri Wedding</div>
                <div className="hd-info text-[9px] text-slate-600">Đ/c: Thuận Châu, Sơn La</div>
                <div className="hd-info text-[9px] text-slate-600 mt-0.5">SĐT: 0967.185.505 - 0379.777.819</div>
              </div>
              <div className="hd-meta text-right text-[9px] text-slate-500">
                <div className="mb-0.5">HĐ: {hoaDonData.id?.slice(-6).toUpperCase()}</div>
                <div>Ngày: {homNay().split("-").reverse().join("/")}</div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="customer-box grid grid-cols-[45px_1fr] gap-x-2 gap-y-1.5 mb-3">
              <div className="c-label text-slate-600">Khách:</div><div className="c-value font-bold border-b border-dotted border-slate-400 pb-0.5">{hoaDonData.tenKhach}</div>
              <div className="c-label text-slate-600">SĐT:</div><div className="c-value font-bold border-b border-dotted border-slate-400 pb-0.5">{hoaDonData.soDienThoai}</div>
              <div className="c-label text-slate-600">Địa chỉ:</div><div className="c-value font-bold border-b border-dotted border-slate-400 pb-0.5">{hdDiaChi || "\u00A0"}</div>
            </div>

            {/* Bảng Dịch Vụ (Đã được kẻ khung lưới rõ ràng) */}
            <table className="w-full border-collapse border border-slate-800 mb-3 text-[10px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-800 p-1.5 text-center font-bold w-6">STT</th>
                  <th className="border border-slate-800 p-1.5 text-left font-bold">MÔ TẢ DỊCH VỤ</th>
                  <th className="border border-slate-800 p-1.5 text-center font-bold w-6">SL</th>
                  <th className="border border-slate-800 p-1.5 text-right font-bold whitespace-nowrap">ĐƠN GIÁ</th>
                  <th className="border border-slate-800 p-1.5 text-right font-bold whitespace-nowrap">THÀNH TIỀN</th>
                </tr>
              </thead>
              <tbody>
                {/* Lịch Chụp */}
                {lichCuaKhach.map((l, idx) => {
                  const donGia = Number(l.giaTien || 0) + Number((l as any).tienDichVuThem || 0);
                  return (
                    <tr key={`l-${idx}`}>
                      <td className="border border-slate-800 p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-slate-800 p-1.5">
                        <div className="font-bold text-[11px]">{l.goiChup || l.theLoai}</div>
                        {chiTietLines.length > 0 && (
                          <div className="item-detail mt-1 text-[9px] text-slate-700 italic">
                            <strong>Chi tiết:</strong>
                            {chiTietLines.map((line, i) => <div key={i}>- {line}</div>)}
                          </div>
                        )}
                        {(l as any).dichVuThem && (
                           <div className="item-detail mt-1 text-[9px] text-slate-700 italic"><strong>+ Phát sinh:</strong> {(l as any).dichVuThem}</div>
                        )}
                      </td>
                      <td className="border border-slate-800 p-1.5 text-center">1</td>
                      <td className="border border-slate-800 p-1.5 text-right">{formatTienInput(String(donGia))}</td>
                      <td className="border border-slate-800 p-1.5 text-right font-bold">{formatTienInput(String(donGia))}</td>
                    </tr>
                  )
                })}
                
                {/* Phát Sinh */}
                {psCuaKhach.map((p, idx) => (
                  <tr key={`p-${idx}`}>
                    <td className="border border-slate-800 p-1.5 text-center">{lichCuaKhach.length + idx + 1}</td>
                    <td className="border border-slate-800 p-1.5">
                      <div className="font-bold text-[11px]">{p.loai}</div>
                      {p.ghiChu && <div className="item-detail mt-1 text-[9px] text-slate-700 italic">{p.ghiChu}</div>}
                    </td>
                    <td className="border border-slate-800 p-1.5 text-center">1</td>
                    <td className="border border-slate-800 p-1.5 text-right">{formatTienInput(String(p.soTien || 0))}</td>
                    <td className="border border-slate-800 p-1.5 text-right font-bold">{formatTienInput(String(p.soTien || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tính Tổng */}
            <div className="summary flex flex-col items-end gap-1.5 mb-4">
              <div className="sum-line flex justify-between w-[65%] font-bold text-slate-700">
                <span>Tổng thanh toán:</span>
                <span className="text-black">{formatTienInput(String(tongBill))}</span>
              </div>
              <div className="sum-line flex justify-between w-[65%] font-bold text-slate-700">
                <span>Khách đã cọc:</span>
                <span className="text-black">{formatTienInput(String(daThanhToan))}</span>
              </div>
              <div className="sum-line total flex justify-between w-full items-end mt-1 pt-1.5 border-t-2 border-slate-800">
                <span className="font-black text-xs uppercase">CÒN PHẢI THU:</span>
                <span className="font-black text-[15px] text-red-600">{formatTienInput(String(tongNoHienTai))}</span>
              </div>
            </div>

            {/* Chữ ký (Hiển thị ngay lập tức khi React render) */}
            <div className="signatures flex justify-between text-center mt-2">
              <div className="sig-col w-1/2 flex flex-col items-center">
                <div className="sig-title font-bold uppercase text-[10px] mb-1">Khách hàng</div>
                <div className="h-[50px] w-full flex items-center justify-center">
                  {chuKy ? <img src={chuKy} className="sig-img max-h-full max-w-full object-contain" alt="Ký tên"/> : null}
                </div>
                <div className="font-bold mt-1 text-[11px]">{hoaDonData.tenKhach}</div>
              </div>
              <div className="sig-col w-1/2 flex flex-col items-center">
                <div className="sig-date text-[8px] text-slate-500 italic mb-1">Ngày {homNay().split("-").reverse().join("/")}</div>
                <div className="sig-title font-bold uppercase text-[10px]">Đại diện Studio</div>
                <div className="h-[40px] w-full"></div>
                <div className="font-black mt-1 text-[11px]">SURI WEDDING</div>
              </div>
            </div>

          </div>
        </div>

        {/* NÚT BẤM IN / LƯU PDF */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] z-10">
          <button 
            onClick={handleInHoaDon} 
            className="w-full bg-blue-600 text-white font-black py-3.5 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Printer size={18} /> IN HÓA ĐƠN & LƯU PDF
          </button>
        </div>

      </div>

      {/* =========================================
          MODAL BẢNG VẼ CHỮ KÝ FULL MÀN HÌNH 
      ========================================= */}
      {showChuKyModal && (
        <div className="fixed inset-0 bg-slate-100 z-[200] flex flex-col touch-none overscroll-none">
          {/* Header Bảng vẽ */}
          <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10 shrink-0">
             <button onClick={() => setShowChuKyModal(false)} className="px-4 py-2 text-slate-500 font-bold active:bg-slate-100 rounded-xl">Đóng</button>
             <h3 className="font-black text-slate-800">Khách Ký Tên</h3>
             <button onClick={clearCanvas} className="p-2 text-rose-500 bg-rose-50 rounded-xl active:bg-rose-100"><Eraser size={20}/></button>
          </div>

          {/* Khu vực khách ký tay (Canvas) */}
          <div className="flex-1 relative bg-white cursor-crosshair">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <span className="text-4xl font-black rotate-[-15deg] uppercase">Ký vào đây</span>
            </div>
            
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={endDrawing}
              onPointerOut={endDrawing}
              style={{ touchAction: "none" }} // Khóa màn hình không cho cuộn khi vuốt chữ ký
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Footer lưu chữ ký */}
          <div className="bg-white p-4 pb-8 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] shrink-0 z-10">
             <button onClick={saveSignature} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg">
               <Check size={24} /> XÁC NHẬN CHỮ KÝ
             </button>
          </div>
        </div>
      )}
    </>
  );
}