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

  // Khởi tạo Canvas khi mở Modal Ký tên
  useEffect(() => {
    if (showChuKyModal && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 100; // Trừ hao phần nút bấm bên dưới
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#0f172a"; // Màu mực đen đậm
      }
    }
  }, [showChuKyModal]);

  // Logic Vẽ Chữ Ký (Hỗ trợ cả Chuột và Cảm ứng mượt mà)
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
    if (canvas) setChuKy(canvas.toDataURL("image/png"));
    setShowChuKyModal(false);
  };

  if (!hoaDonData) return null;

  // THUẬT TOÁN TÍNH HÓA ĐƠN
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
  const chiTietHTML = (hoaDonData.chiTietGoi || "").replace(/\n/g, '<br/>');

  // IN HÓA ĐƠN
  const handleInHoaDon = () => {
    const printContent = document.getElementById("vung-in-hoa-don");
    if (!printContent) return;
    const windowPrint = window.open("", "", "width=800,height=900");
    if (!windowPrint) return;

    windowPrint.document.write(`
      <html>
        <head>
          <title>Hóa Đơn - Suri Wedding</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            
            body { font-family: 'Inter', sans-serif; color: #1e293b; background: #f1f5f9; margin: 0; padding: 20px; display: flex; justify-content: center; }
            * { box-sizing: border-box; }
            
            .receipt-wrapper { background: white; max-width: 480px; width: 100%; border-radius: 20px; padding: 30px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
            
            /* HEADER */
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
            .brand-box { flex: 1; }
            .brand-name { font-size: 18px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; margin-bottom: 6px; letter-spacing: -0.5px; }
            .brand-info { font-size: 11px; color: #64748b; line-height: 1.6; }
            .meta-box { text-align: right; font-size: 11px; color: #64748b; line-height: 1.6; }
            
            /* THÔNG TIN KHÁCH HÀNG */
            .customer-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
            .customer-table td { padding: 6px 0; vertical-align: bottom; }
            .customer-table td:first-child { width: 70px; font-weight: 700; color: #64748b; }
            .customer-table td:last-child { font-weight: 800; color: #1e293b; border-bottom: 1px dotted #94a3b8; padding-bottom: 2px; }
            
            /* BẢNG DỊCH VỤ */
            .item-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 13px; }
            .item-table th { text-align: left; padding: 12px 4px; border-top: 2px solid #e2e8f0; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 800; }
            .item-table td { padding: 16px 4px; vertical-align: top; border-bottom: 1px solid #f1f5f9; }
            
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            
            .item-name { font-weight: 800; color: #1e293b; font-size: 14px; }
            .item-details { font-size: 11px; color: #475569; margin-top: 8px; font-style: italic; line-height: 1.6; }
            .item-details strong { font-style: normal; color: #1e293b; }
            
            /* TỔNG KẾT TIỀN */
            .summary-box { border-top: 2px solid #e2e8f0; border-bottom: 2px solid #e2e8f0; padding: 20px 0; margin-bottom: 30px; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
            .sum-line { display: flex; justify-content: space-between; width: 60%; font-size: 13px; color: #64748b; font-weight: 600; }
            .sum-line span:last-child { color: #1e293b; font-weight: 800; }
            
            .sum-line.total { width: 100%; justify-content: center; gap: 20px; margin-top: 10px; font-size: 16px; color: #1e293b; font-weight: 900; align-items: baseline;}
            .sum-line.total .debt { font-size: 22px; color: #e11d48; }
            
            /* CHỮ KÝ */
            .signatures { display: flex; justify-content: space-between; text-align: center; font-size: 12px; }
            .sig-col { width: 45%; display: flex; flex-direction: column; align-items: center; }
            .sig-title { font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .sig-date { font-size: 10px; color: #94a3b8; font-style: italic; margin-bottom: 10px; }
            .sig-img { height: 80px; object-fit: contain; margin-bottom: 10px; }
            .sig-empty { height: 80px; }
            .sig-name { font-weight: 800; color: #1e293b; }
            .sig-brand { font-weight: 900; color: #1e293b; margin-top: auto; }
            
            @media print { 
              body { background: white; padding: 0; } 
              .receipt-wrapper { box-shadow: none; border-radius: 0; padding: 0; max-width: 100%; border: none;} 
            }
          </style>
        </head>
        <body>
          <div class="receipt-wrapper">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => { windowPrint.print(); windowPrint.close(); }, 800);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-slate-50 rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] animate-fade-in overflow-hidden border border-white">
          
          {/* HEADER MODAL */}
          <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center z-10 shrink-0">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Chi tiết Hóa Đơn</h3>
            </div>
            <button onClick={() => setHoaDonData(null)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all active:scale-95">
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* NỘI DUNG CUỘN ĐƯỢC */}
          <div className="overflow-y-auto p-4 md:p-6 custom-scrollbar flex-1 relative">
            
            {/* TÙY CHỈNH ĐỊA CHỈ & KÝ TÊN */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 shadow-sm">
              <div className="mb-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-2 flex items-center gap-1">
                  <MapPin size={12}/> Thêm địa chỉ (Tuỳ chọn)
                </label>
                <input 
                  type="text" value={hdDiaChi} onChange={(e) => setHdDiaChi(e.target.value)} 
                  placeholder="Nhập địa chỉ nhà khách hàng..." 
                  className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl w-full text-slate-700 font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                />
              </div>
              
              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Chữ ký khách hàng</label>
                    {chuKy ? <span className="text-xs font-bold text-emerald-600">Đã có chữ ký ✅</span> : <span className="text-xs font-medium text-slate-400">Chưa ký tên</span>}
                  </div>
                  <button 
                    onClick={() => setShowChuKyModal(true)}
                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    {chuKy ? <><PenTool size={14}/> Ký lại</> : <><PenTool size={14}/> Cho khách ký ngay</>}
                  </button>
                </div>
              </div>
            </div>

            {/* VÙNG ẨN HTML ĐỂ IN */}
            <div className="hidden">
              <div id="vung-in-hoa-don">
                
                <div className="header">
                  <div className="brand-box">
                    <div className="brand-name">ẢNH VIỆN SURI WEDDING</div>
                    <div className="brand-info">Đ/c: Thuận Châu, Sơn La</div>
                    <div className="brand-info">SĐT: 0967.185.505 - 0379.777.819</div>
                  </div>
                  <div className="meta-box">
                    <div>HĐ: {hoaDonData.id?.slice(-6).toUpperCase()}</div>
                    <div>Ngày: {homNay().split("-").reverse().join("/")}</div>
                  </div>
                </div>

                <table className="customer-table">
                  <tbody>
                    <tr><td>Khách:</td><td>{hoaDonData.tenKhach}</td></tr>
                    <tr><td>SĐT:</td><td>{hoaDonData.soDienThoai}</td></tr>
                    <tr><td>Địa chỉ:</td><td>{hdDiaChi || "\u00A0"}</td></tr>
                  </tbody>
                </table>

                <table className="item-table">
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: '40px' }}>STT</th>
                      <th>MÔ TẢ DỊCH VỤ</th>
                      <th className="text-center" style={{ width: '40px' }}>SL</th>
                      <th className="text-right">ĐƠN GIÁ</th>
                      <th className="text-right">THÀNH TIỀN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lichCuaKhach.map((l, idx) => {
                      const donGia = Number(l.giaTien || 0) + Number((l as any).tienDichVuThem || 0);
                      return (
                        <tr key={`l-${idx}`}>
                          <td className="text-center">{idx + 1}</td>
                          <td>
                            <div className="item-name">{l.goiChup || l.theLoai}</div>
                            {l.chiTietGoi && (
                              <div className="item-details">
                                <strong>Chi tiết:</strong><br/>
                                <span dangerouslySetInnerHTML={{ __html: l.chiTietGoi.replace(/\n/g, '<br/>') }}></span>
                              </div>
                            )}
                            {(l as any).dichVuThem && (
                               <div className="item-details" style={{ marginTop: '4px' }}>+ Phát sinh: {(l as any).dichVuThem}</div>
                            )}
                          </td>
                          <td className="text-center">1</td>
                          <td className="text-right">{formatTienInput(String(donGia))}</td>
                          <td className="text-right font-bold">{formatTienInput(String(donGia))}</td>
                        </tr>
                      )
                    })}
                    
                    {psCuaKhach.map((p, idx) => (
                      <tr key={`p-${idx}`}>
                        <td className="text-center">{lichCuaKhach.length + idx + 1}</td>
                        <td>
                          <div className="item-name">{p.loai}</div>
                          {p.ghiChu && <div className="item-details">{p.ghiChu}</div>}
                        </td>
                        <td className="text-center">1</td>
                        <td className="text-right">{formatTienInput(String(p.soTien || 0))}</td>
                        <td className="text-right font-bold">{formatTienInput(String(p.soTien || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="summary-box">
                  <div className="sum-line">
                    <span>Tổng thanh toán:</span>
                    <span>{formatTienInput(String(tongBill))}</span>
                  </div>
                  <div className="sum-line">
                    <span>Khách đã cọc:</span>
                    <span>{formatTienInput(String(daThanhToan))}</span>
                  </div>
                  <div className="sum-line total">
                    <span>CÒN PHẢI THU:</span>
                    <span className="debt">{formatTienInput(String(tongNoHienTai))}</span>
                  </div>
                </div>

                <div className="signatures">
                  <div className="sig-col">
                    <div className="sig-title">Khách hàng</div>
                    {chuKy ? <img src={chuKy} className="sig-img" alt="Chữ ký" /> : <div className="sig-empty"></div>}
                    <div className="sig-name">{hoaDonData.tenKhach}</div>
                  </div>
                  <div className="sig-col">
                    <div className="sig-date">Ngày {homNay().split("-").reverse().join("/")}</div>
                    <div className="sig-title">Đại diện Studio</div>
                    <div className="sig-empty"></div>
                    <div className="sig-brand">SURI WEDDING</div>
                  </div>
                </div>

              </div>
            </div>

            {/* BẢN XEM TRƯỚC THU NHỎ TRÊN APP */}
            <div className="pointer-events-none opacity-50 scale-90 origin-top bg-white p-6 border rounded-xl shadow-sm filter grayscale">
               <div dangerouslySetInnerHTML={{ __html: document.getElementById('vung-in-hoa-don')?.innerHTML || '<div class="text-center font-bold">Đang tạo bản xem trước...</div>' }}></div>
            </div>

          </div>

          {/* NÚT BẤM CỐ ĐỊNH DƯỚI CÙNG */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <button 
              onClick={handleInHoaDon} 
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Printer size={20} /> IN HÓA ĐƠN & PDF
            </button>
          </div>

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
             <h3 className="font-black text-slate-800">Ký xác nhận</h3>
             <button onClick={clearCanvas} className="p-2 text-rose-500 bg-rose-50 rounded-xl active:bg-rose-100"><Eraser size={20}/></button>
          </div>

          {/* Khu vực khách ký tay (Canvas) */}
          <div className="flex-1 relative bg-white cursor-crosshair">
            {/* Placeholder Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <span className="text-4xl font-black rotate-[-15deg]">Ký vào đây</span>
            </div>
            
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={endDrawing}
              onPointerOut={endDrawing}
              style={{ touchAction: "none" }} // Chặn hành vi scroll khi vuốt trên điện thoại
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Footer lưu chữ ký */}
          <div className="bg-white p-4 pb-8 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] shrink-0 z-10">
             <button onClick={saveSignature} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg">
               <Check size={24} /> LƯU CHỮ KÝ
             </button>
          </div>
        </div>
      )}
    </>
  );
}