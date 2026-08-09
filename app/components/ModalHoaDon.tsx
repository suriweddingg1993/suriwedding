import { useState, useRef, useEffect, useMemo } from "react";
import { X, PenTool, Eraser, Check, Settings2 } from "lucide-react";
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

  // STATE CHECKBOX CHO HÓA ĐƠN
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false); // Ẩn/Hiện bảng điều khiển

  useEffect(() => {
    if (showChuKyModal && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 100;
      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = 3; ctx.strokeStyle = "#0f172a"; }
    }
  }, [showChuKyModal]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d"); if (!ctx) return;
    const rect = canvas.getBoundingClientRect(); ctx.beginPath(); ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top); setIsDrawing(true);
  };
  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return; const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d"); if (!ctx) return;
    const rect = canvas.getBoundingClientRect(); ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); ctx.stroke();
  };
  const endDrawing = () => { setIsDrawing(false); };
  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); setChuKy(null);
  };
  const saveSignature = () => { const canvas = canvasRef.current; if (canvas) setChuKy(canvas.toDataURL("image/png")); setShowChuKyModal(false); };

  // =========================================================================
  // THUẬT TOÁN "ĐỢT DỊCH VỤ" THÔNG MINH (TRONG VÒNG 60 NGÀY)
  // =========================================================================
  const availableItems = useMemo(() => {
    if (!hoaDonData) return [];
    
    const isCungKhach = (itemKhachHangId?: string, itemSDT?: string, itemTen?: string) => {
      // 1. Kiểm tra bằng ID CRM (Ưu tiên số 1)
      if (hoaDonData.khachHangId && itemKhachHangId) return itemKhachHangId === hoaDonData.khachHangId;
      // 2. Nếu không có ID, buộc phải cùng Số điện thoại
      if (itemSDT !== hoaDonData.soDienThoai) return false;
      // 3. Cùng SĐT nhưng phải tương đồng về Tên (Tránh 2 người chung 1 số)
      const tenA = (itemTen || "").toLowerCase().trim();
      const tenB = (hoaDonData.tenKhach || "").toLowerCase().trim();
      const isSameName = tenA === tenB || tenA.includes(tenB) || tenB.includes(tenA);
      return isSameName;
    };

    const tinhKhoangCachNgay = (ngay1: string, ngay2: string) => Math.abs(new Date(ngay1).getTime() - new Date(ngay2).getTime()) / (1000 * 3600 * 24);

    const items: any[] = [];
    
    // Quét Lịch Chụp
    lichLamViec.forEach(l => {
      if (isCungKhach(l.khachHangId, l.soDienThoai, l.tenKhach) && tinhKhoangCachNgay(l.ngay, hoaDonData.ngay) <= 60) {
        items.push({ ...l, loaiItem: 'lich' });
      }
    });
    
    // Quét Phát Sinh
    danhSachPhatSinh.forEach(p => {
      if (isCungKhach(p.khachHangId, p.soDienThoai, p.tenKhach) && tinhKhoangCachNgay(p.ngay, hoaDonData.ngay) <= 60) {
        items.push({ ...p, loaiItem: 'phatsinh' });
      }
    });

    return items.sort((a,b) => a.ngay.localeCompare(b.ngay));
  }, [hoaDonData, lichLamViec, danhSachPhatSinh]);

  // Tự động tích chọn TẤT CẢ các dịch vụ thuộc Đợt này khi vừa mở Hóa Đơn
  useEffect(() => {
    if (hoaDonData) {
      setSelectedIds(availableItems.map(i => i.id!));
    }
  }, [hoaDonData?.id]);

  if (!hoaDonData) return null;

  // Lọc ra các Dịch vụ đã được Tích chọn (Checked)
  const checkedLich = availableItems.filter(i => i.loaiItem === 'lich' && selectedIds.includes(i.id));
  const checkedPhatSinh = availableItems.filter(i => i.loaiItem === 'phatsinh' && selectedIds.includes(i.id));

  // =========================================================================
  // ĐÃ SỬA: TÍNH TOÁN TIỀN CHUẨN XÁC KẾT HỢP MẢNG THANH TOÁN
  // =========================================================================
  let tongTienLich = 0; let tongDaCocLich = 0;
  checkedLich.forEach(l => {
    let tongPhatSinhPhu = 0;
    if (l.chiTietDichVuThem && Array.isArray(l.chiTietDichVuThem)) {
        tongPhatSinhPhu = l.chiTietDichVuThem.reduce((acc: number, curr: any) => acc + (Number(curr.gia) || 0), 0);
    } else {
        tongPhatSinhPhu = Number((l as any).tienDichVuThem || 0);
    }
    tongTienLich += Number(l.giaTien || 0) + tongPhatSinhPhu;

    if (l.danhSachThanhToan && l.danhSachThanhToan.length > 0) {
        tongDaCocLich += l.danhSachThanhToan.reduce((a: number, b: any) => a + (Number(b.soTien) || 0), 0);
    } else {
        tongDaCocLich += Number(l.tienCoc || 0) + Number(l.tienThanhToanThem || 0);
    }
  });

  let tongTienPhatSinh = 0;
  let tongDaThuPhatSinh = 0;
  checkedPhatSinh.forEach(p => { 
      tongTienPhatSinh += Number(p.soTien || 0); 
      if (p.phuongThuc || p.daNopTien) tongDaThuPhatSinh += Number(p.soTien || 0);
  });

  const tongBill = tongTienLich + tongTienPhatSinh;
  const daThanhToan = tongDaCocLich + tongDaThuPhatSinh;
  const tongNoHienTai = tongBill - daThanhToan;
  
  const chiTietLines = (hoaDonData.chiTietGoi || "").split('\n').filter(line => line.trim() !== '');

  return (
    <>
      <div className="fixed inset-0 bg-white sm:bg-slate-900 z-[100] flex flex-col w-full h-full">
        
        {/* HEADER CÔNG CỤ */}
        <div className="bg-slate-100 sm:bg-white p-3 shrink-0 flex flex-col gap-2 z-10 shadow-md sm:rounded-b-2xl max-w-3xl w-full mx-auto">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">Hóa Đơn Của Khách</h3>
            <div className="flex gap-2">
              <button onClick={() => setShowSettings(!showSettings)} className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold transition-all border ${showSettings ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300'}`}>
                <Settings2 size={14}/> Gộp / Tách Bill
              </button>
              <button onClick={() => setHoaDonData(null)} className="w-7 h-7 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center active:scale-95"><X size={16}/></button>
            </div>
          </div>
          
          <div className="flex gap-2 items-center mt-1">
            <input 
              type="text" value={hdDiaChi} onChange={(e) => setHdDiaChi(e.target.value)} 
              placeholder="Nhập địa chỉ nhà khách..." 
              className="flex-1 bg-white border border-slate-300 text-xs p-2.5 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50" 
            />
            <button 
              onClick={() => setShowChuKyModal(true)}
              className="bg-indigo-600 text-white active:bg-indigo-700 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <PenTool size={14}/> {chuKy ? "Đã Ký" : "Ký tên"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white sm:bg-slate-800 p-0 sm:p-4 flex flex-col items-center justify-start custom-scrollbar relative w-full">
          
          {/* BẢNG ĐIỀU KHIỂN: CHỌN CHECKBOX ĐỂ GỘP HOẶC TÁCH BILL */}
          {showSettings && (
            <div className="w-full max-w-lg bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-200 shadow-inner animate-fade-in mt-2 sm:mt-0">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 text-center">Các dịch vụ trong vòng 60 ngày</div>
              <div className="flex flex-col gap-2">
                {availableItems.map(item => {
                  const isLichGoc = item.id === hoaDonData.id;
                  return (
                    <label key={item.id} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${selectedIds.includes(item.id) ? 'bg-white border-blue-300 shadow-sm' : 'bg-slate-100 border-slate-200 opacity-60'}`}>
                      <input 
                        type="checkbox" 
                        disabled={isLichGoc} 
                        checked={selectedIds.includes(item.id)} 
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds([...selectedIds, item.id]);
                          else setSelectedIds(selectedIds.filter(id => id !== item.id));
                        }} 
                        className="w-4 h-4 text-blue-600 rounded" 
                      />
                      <div className="flex-1">
                        <div className="text-[11px] font-bold text-slate-800 flex items-center gap-2">
                          {item.loaiItem === 'lich' ? (item.goiChup || item.theLoai) : item.loai}
                          {isLichGoc && <span className="text-[8px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded uppercase">Đang xem</span>}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {item.ngay.split('-').reverse().join('/')} - <span className="font-black text-slate-700">{formatTienInput(String(item.loaiItem==='lich' ? (Number(item.giaTien||0) + Number(item.tienDichVuThem||0)) : item.soTien))}đ</span>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* VÙNG HÓA ĐƠN ĐƯỢC MỞ RỘNG FULL MÀN HÌNH ĐIỆN THOẠI */}
          <div id="vung-in-hoa-don" className="bg-white w-full max-w-2xl mx-auto p-5 sm:p-8 text-[11px] sm:text-[13px] text-black font-sans leading-tight relative flex-1 flex flex-col shrink-0">
            
            <div className="hd-header flex justify-between items-start mb-4 border-b-2 border-slate-800 pb-3">
              <div>
                <div className="font-black text-blue-900 text-base sm:text-xl uppercase tracking-tight mb-1">Ảnh viện Suri Wedding</div>
                <div className="text-[10px] sm:text-xs text-slate-600">Đ/c: Thuận Châu, Sơn La</div>
                <div className="text-[10px] sm:text-xs text-slate-600 mt-0.5">SĐT: 0967.185.505 - 0379.777.819</div>
              </div>
              <div className="text-right text-[10px] sm:text-xs text-slate-500 font-medium">
                <div className="mb-0.5">HĐ: {hoaDonData.id?.slice(-6).toUpperCase()}</div>
                <div>Ngày: {homNay().split("-").reverse().join("/")}</div>
              </div>
            </div>

            <div className="customer-box grid grid-cols-[55px_1fr] sm:grid-cols-[65px_1fr] gap-x-2 gap-y-2 mb-4 text-[11px] sm:text-[13px]">
              <div className="text-slate-600 font-bold">Khách:</div><div className="font-black text-[13px] sm:text-[15px] border-b border-dotted border-slate-400 pb-0.5">{hoaDonData.tenKhach}</div>
              <div className="text-slate-600 font-bold">SĐT:</div><div className="font-bold border-b border-dotted border-slate-400 pb-0.5">{hoaDonData.soDienThoai}</div>
              <div className="text-slate-600 font-bold">Địa chỉ:</div><div className="font-bold border-b border-dotted border-slate-400 pb-0.5 min-h-[18px]">{hdDiaChi || "\u00A0"}</div>
            </div>

            <table className="w-full border-collapse border border-slate-800 mb-4 text-[11px] sm:text-[13px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-800 p-2 text-center font-black w-8">STT</th>
                  <th className="border border-slate-800 p-2 text-left font-black">MÔ TẢ DỊCH VỤ</th>
                  <th className="border border-slate-800 p-2 text-center font-black w-8">SL</th>
                  <th className="border border-slate-800 p-2 text-right font-black whitespace-nowrap">ĐƠN GIÁ</th>
                  <th className="border border-slate-800 p-2 text-right font-black whitespace-nowrap">THÀNH TIỀN</th>
                </tr>
              </thead>
              <tbody>
                {checkedLich.map((l, idx) => {
                  let tongPhatSinhPhu = 0;
                  if (l.chiTietDichVuThem && Array.isArray(l.chiTietDichVuThem)) {
                      tongPhatSinhPhu = l.chiTietDichVuThem.reduce((acc: number, curr: any) => acc + (Number(curr.gia) || 0), 0);
                  } else {
                      tongPhatSinhPhu = Number((l as any).tienDichVuThem || 0);
                  }
                  
                  const donGia = Number(l.giaTien || 0) + tongPhatSinhPhu;
                  const hienChiTiet = l.id === hoaDonData.id;
                  
                  return (
                    <tr key={`l-${idx}`}>
                      <td className="border border-slate-800 p-2 text-center font-medium align-top">{idx + 1}</td>
                      <td className="border border-slate-800 p-2">
                        <div className="font-bold text-[12px] sm:text-[14px]">{l.goiChup || l.theLoai}</div>
                        {(hienChiTiet && chiTietLines.length > 0) && (
                          <div className="item-detail mt-1.5 text-[10px] sm:text-xs text-slate-700 italic leading-relaxed">
                            <strong>Chi tiết:</strong>
                            {chiTietLines.map((line, i) => <div key={i}>- {line}</div>)}
                          </div>
                        )}
                        {l.chiTietDichVuThem && Array.isArray(l.chiTietDichVuThem) && l.chiTietDichVuThem.length > 0 ? (
                            <div className="item-detail mt-1.5 text-[10px] sm:text-xs text-slate-700 italic">
                                <strong>+ SP Thêm:</strong> {l.chiTietDichVuThem.map((d:any) => d.ten).join(", ")}
                            </div>
                        ) : (l as any).dichVuThem ? (
                            <div className="item-detail mt-1.5 text-[10px] sm:text-xs text-slate-700 italic"><strong>+ Phát sinh:</strong> {(l as any).dichVuThem}</div>
                        ) : null}
                      </td>
                      <td className="border border-slate-800 p-2 text-center font-medium align-top">1</td>
                      <td className="border border-slate-800 p-2 text-right align-top">{formatTienInput(String(donGia))}</td>
                      <td className="border border-slate-800 p-2 text-right font-black align-top">{formatTienInput(String(donGia))}</td>
                    </tr>
                  )
                })}
                
                {checkedPhatSinh.map((p, idx) => (
                  <tr key={`p-${idx}`}>
                    <td className="border border-slate-800 p-2 text-center font-medium align-top">{checkedLich.length + idx + 1}</td>
                    <td className="border border-slate-800 p-2">
                      <div className="font-bold text-[12px] sm:text-[14px]">{p.loai}</div>
                      {p.ghiChu && <div className="item-detail mt-1 text-[10px] sm:text-xs text-slate-700 italic">{p.ghiChu}</div>}
                    </td>
                    <td className="border border-slate-800 p-2 text-center font-medium align-top">1</td>
                    <td className="border border-slate-800 p-2 text-right align-top">{formatTienInput(String(p.soTien || 0))}</td>
                    <td className="border border-slate-800 p-2 text-right font-black align-top">{formatTienInput(String(p.soTien || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-col items-end gap-1.5 mb-6 text-[12px] sm:text-[14px]">
              <div className="flex justify-between w-[70%] sm:w-[50%] font-bold text-slate-700">
                <span>Tổng thanh toán:</span>
                <span className="text-black">{formatTienInput(String(tongBill))}</span>
              </div>
              <div className="flex justify-between w-[70%] sm:w-[50%] font-bold text-slate-700">
                <span>Khách đã cọc/trả:</span>
                <span className="text-black">{formatTienInput(String(daThanhToan))}</span>
              </div>
              <div className="flex justify-between w-full sm:w-[60%] items-end mt-1.5 pt-2 border-t-2 border-slate-800">
                <span className="font-black text-xs sm:text-sm uppercase">CÒN PHẢI THU:</span>
                <span className="font-black text-[16px] sm:text-[20px] text-red-600">{formatTienInput(String(tongNoHienTai))}</span>
              </div>
            </div>

            {/* ĐÃ SỬA: CHỮ KÝ ĐƯỢC PHÓNG TO VÀ ĐẨY XUỐNG DƯỚI CÙNG */}
            <div className="signatures flex justify-between text-center mt-auto pt-6">
              <div className="w-1/2 flex flex-col items-center">
                <div className="font-black uppercase text-[11px] sm:text-xs mb-1">Khách hàng</div>
                <div className="h-[100px] w-full flex items-center justify-center">
                  {chuKy ? <img src={chuKy} className="max-h-full max-w-full object-contain scale-[1.5]" alt="Ký tên"/> : null}
                </div>
                <div className="font-bold mt-1 text-[13px]">{hoaDonData.tenKhach}</div>
              </div>
              <div className="w-1/2 flex flex-col items-center">
                <div className="text-[10px] text-slate-500 italic mb-1">Ngày {homNay().split("-").reverse().join("/")}</div>
                <div className="font-black uppercase text-[11px] sm:text-xs">Đại diện Studio</div>
                <div className="h-[100px] w-full"></div>
                <div className="font-black mt-1 text-[13px]">SURI WEDDING</div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {showChuKyModal && (
        <div className="fixed inset-0 bg-slate-100 z-[200] flex flex-col touch-none overscroll-none">
          <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10 shrink-0">
             <button onClick={() => setShowChuKyModal(false)} className="px-4 py-2 text-slate-500 font-bold active:bg-slate-100 rounded-xl">Đóng</button>
             <h3 className="font-black text-slate-800">Khách Ký Tên</h3>
             <button onClick={clearCanvas} className="p-2 text-rose-500 bg-rose-50 rounded-xl active:bg-rose-100"><Eraser size={20}/></button>
          </div>

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
              style={{ touchAction: "none" }}
              className="absolute inset-0 w-full h-full"
            />
          </div>

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