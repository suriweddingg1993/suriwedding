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
  const [showSettings, setShowSettings] = useState(false);

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
      if (hoaDonData.khachHangId && itemKhachHangId) return itemKhachHangId === hoaDonData.khachHangId;
      if (itemSDT !== hoaDonData.soDienThoai) return false;
      const tenA = (itemTen || "").toLowerCase().trim();
      const tenB = (hoaDonData.tenKhach || "").toLowerCase().trim();
      return tenA === tenB || tenA.includes(tenB) || tenB.includes(tenA);
    };

    const tinhKhoangCachNgay = (ngay1: string, ngay2: string) => Math.abs(new Date(ngay1).getTime() - new Date(ngay2).getTime()) / (1000 * 3600 * 24);

    const items: any[] = [];
    
    lichLamViec.forEach(l => {
      if (isCungKhach(l.khachHangId, l.soDienThoai, l.tenKhach) && tinhKhoangCachNgay(l.ngay, hoaDonData.ngay) <= 60) {
        items.push({ ...l, loaiItem: 'lich' });
      }
    });
    
    danhSachPhatSinh.forEach(p => {
      if (isCungKhach(p.khachHangId, p.soDienThoai, p.tenKhach) && tinhKhoangCachNgay(p.ngay, hoaDonData.ngay) <= 60) {
        items.push({ ...p, loaiItem: 'phatsinh' });
      }
    });

    return items.sort((a,b) => a.ngay.localeCompare(b.ngay));
  }, [hoaDonData, lichLamViec, danhSachPhatSinh]);

  useEffect(() => {
    if (hoaDonData) {
      setSelectedIds(availableItems.map(i => i.id!));
    }
  }, [hoaDonData?.id]);

  if (!hoaDonData) return null;

  const checkedLich = availableItems.filter(i => i.loaiItem === 'lich' && selectedIds.includes(i.id));
  const checkedPhatSinh = availableItems.filter(i => i.loaiItem === 'phatsinh' && selectedIds.includes(i.id));

  // TÍNH TOÁN TIỀN
  let tongTienLich = 0; let tongDaCocLich = 0;
  checkedLich.forEach(l => {
    // Tương thích logic tính giá trị Dịch vụ thêm
    let tongPhatSinhPhu = 0;
    if (l.chiTietDichVuThem && Array.isArray(l.chiTietDichVuThem)) {
        tongPhatSinhPhu = l.chiTietDichVuThem.reduce((acc: number, curr: any) => acc + (Number(curr.gia) || 0), 0);
    } else {
        tongPhatSinhPhu = Number(l.tienDichVuThem || 0);
    }
    tongTienLich += Number(l.giaTien || 0) + tongPhatSinhPhu;
    
    // Tương thích logic tính Cọc nhiều lần
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
      // Nếu có biến báo đã nộp tiền/thu tiền phát sinh thì cộng vào (Tương thích mở rộng)
      if (p.daNopTien || p.phuongThuc) tongDaThuPhatSinh += Number(p.soTien || 0);
  });

  const tongBill = tongTienLich + tongTienPhatSinh;
  const daThanhToan = tongDaCocLich + tongDaThuPhatSinh;
  const tongNoHienTai = tongBill - daThanhToan;
  
  const chiTietLines = (hoaDonData.chiTietGoi || "").split('\n').filter(line => line.trim() !== '');

  return (
    <>
      <div className="fixed inset-0 bg-slate-100 sm:bg-slate-900/80 z-[100] flex flex-col items-center justify-start sm:p-4 overflow-hidden">
        
        {/* KHU VỰC HIỂN THỊ HÓA ĐƠN TRÀN VIỀN ĐỂ CHỤP MÀN HÌNH */}
        <div className="w-full flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center pb-6">
          <div className="w-full max-w-md bg-white sm:rounded-3xl sm:shadow-2xl sm:my-4 flex flex-col min-h-full sm:min-h-0 relative">
            
            <div className="p-5 sm:p-8 flex-1">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-5">
                <div>
                    <div className="font-black text-blue-900 text-[22px] uppercase tracking-tight leading-none mb-1.5">Suri Wedding</div>
                    <div className="text-[11px] font-medium text-slate-600">Đ/c: Thuận Châu, Sơn La</div>
                    <div className="text-[11px] font-medium text-slate-600 mt-0.5">SĐT: 0967.185.505 - 0379.777.819</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hóa Đơn</div>
                    <div className="font-black text-slate-800 text-sm">#{hoaDonData.id?.slice(-6).toUpperCase()}</div>
                    <div className="text-[10px] font-bold text-slate-500 mt-1">{homNay().split("-").reverse().join("/")}</div>
                </div>
                </div>

                {/* Customer Info */}
                <div className="bg-slate-50 rounded-xl p-3 mb-6 border border-slate-200">
                <div className="grid grid-cols-[60px_1fr] gap-y-2 text-xs">
                    <div className="font-bold text-slate-500">Khách:</div><div className="font-black text-slate-900 text-[13px]">{hoaDonData.tenKhach}</div>
                    <div className="font-bold text-slate-500">SĐT:</div><div className="font-bold text-slate-800">{hoaDonData.soDienThoai}</div>
                    <div className="font-bold text-slate-500">Địa chỉ:</div><div className="font-bold text-slate-800 border-b border-dotted border-slate-300 pb-0.5 min-h-[18px]">{hdDiaChi}</div>
                </div>
                </div>

                <div className="text-center font-black text-lg mb-4 tracking-wide uppercase text-slate-800">Chi tiết dịch vụ</div>

                {/* Table */}
                <table className="w-full border-collapse mb-6 text-xs text-slate-800">
                <thead>
                    <tr className="border-b-2 border-slate-800">
                    <th className="py-2 text-left font-black uppercase text-[10px]">Mô tả</th>
                    <th className="py-2 text-center font-black uppercase text-[10px] w-8">SL</th>
                    <th className="py-2 text-right font-black uppercase text-[10px]">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {checkedLich.map((l, idx) => {
                    let tongPhatSinhPhu = 0;
                    if (l.chiTietDichVuThem && Array.isArray(l.chiTietDichVuThem)) {
                        tongPhatSinhPhu = l.chiTietDichVuThem.reduce((acc: number, curr: any) => acc + (Number(curr.gia) || 0), 0);
                    } else { tongPhatSinhPhu = Number(l.tienDichVuThem || 0); }
                    
                    const donGia = Number(l.giaTien || 0) + tongPhatSinhPhu;
                    const hienChiTiet = l.id === hoaDonData.id;
                    
                    return (
                        <tr key={`l-${idx}`} className="border-b border-dashed border-slate-300">
                        <td className="py-3 pr-2">
                            <div className="font-bold text-[13px] text-slate-900 leading-tight mb-1">{l.goiChup || l.theLoai}</div>
                            {(hienChiTiet && chiTietLines.length > 0) && (
                            <div className="mt-1 text-[10px] text-slate-600 leading-relaxed">
                                {chiTietLines.map((line, i) => <div key={i}>- {line}</div>)}
                            </div>
                            )}
                            
                            {/* Hiển thị rõ các dịch vụ in ấn phụ */}
                            {l.chiTietDichVuThem && Array.isArray(l.chiTietDichVuThem) && l.chiTietDichVuThem.length > 0 ? (
                                <div className="mt-1.5 text-[10px] text-slate-700 font-medium">
                                    <strong>+ SP Thêm:</strong> {l.chiTietDichVuThem.map((d:any) => d.ten).join(", ")}
                                </div>
                            ) : (l as any).dichVuThem ? (
                                <div className="mt-1.5 text-[10px] text-slate-700 font-medium"><strong>+ SP Thêm:</strong> {(l as any).dichVuThem}</div>
                            ) : null}
                        </td>
                        <td className="py-3 text-center font-medium align-top pt-3.5">1</td>
                        <td className="py-3 text-right font-black align-top pt-3.5">{formatTienInput(String(donGia))}</td>
                        </tr>
                    )
                    })}
                    
                    {checkedPhatSinh.map((p, idx) => (
                    <tr key={`p-${idx}`} className="border-b border-dashed border-slate-300">
                        <td className="py-3 pr-2">
                        <div className="font-bold text-[13px] text-slate-900">{p.loai}</div>
                        {p.ghiChu && <div className="mt-1 text-[10px] text-slate-600 italic">{p.ghiChu}</div>}
                        </td>
                        <td className="py-3 text-center font-medium align-top pt-3.5">1</td>
                        <td className="py-3 text-right font-black align-top pt-3.5">{formatTienInput(String(p.soTien || 0))}</td>
                    </tr>
                    ))}
                </tbody>
                </table>

                {/* Summary */}
                <div className="flex flex-col items-end gap-1.5 mb-8">
                <div className="flex justify-between w-[70%] text-xs font-bold text-slate-600">
                    <span>Tổng hóa đơn:</span>
                    <span className="text-slate-900">{formatTienInput(String(tongBill))}</span>
                </div>
                <div className="flex justify-between w-[70%] text-xs font-bold text-slate-600">
                    <span>Khách đã cọc:</span>
                    <span className="text-slate-900">{formatTienInput(String(daThanhToan))}</span>
                </div>
                <div className="flex justify-between w-[100%] items-end mt-2 pt-2 border-t-2 border-slate-800">
                    <span className="font-black text-sm uppercase text-slate-800">CÒN PHẢI THU:</span>
                    <span className="font-black text-[18px] text-rose-600">{formatTienInput(String(tongNoHienTai))}</span>
                </div>
                </div>

                {/* Signatures */}
                <div className="flex justify-between text-center mt-4">
                <div className="w-[45%] flex flex-col items-center">
                    <div className="font-black uppercase text-[10px] mb-1 text-slate-800">Khách hàng</div>
                    <div className="text-[8px] text-transparent mb-1 line-through">.</div>
                    <div className="h-[60px] w-full flex items-center justify-center border-b border-dotted border-slate-300">
                    {chuKy ? <img src={chuKy} className="max-h-full max-w-full object-contain" alt="Ký tên"/> : null}
                    </div>
                    <div className="font-bold mt-2 text-xs">{hoaDonData.tenKhach}</div>
                </div>
                <div className="w-[45%] flex flex-col items-center">
                    <div className="font-black uppercase text-[10px] mb-1 text-slate-800">Đại diện Studio</div>
                    <div className="text-[8px] text-slate-500 italic mb-1">Ngày {homNay().split("-").reverse().join("/")}</div>
                    <div className="h-[60px] w-full flex items-center justify-center border-b border-dotted border-slate-300">
                        {/* Khu vực để sếp ký sẵn nếu cần hoặc đóng mộc */}
                    </div>
                    <div className="font-black mt-2 text-xs text-blue-900">SURI WEDDING</div>
                </div>
                </div>
            </div>
            
            <div className="h-8 w-full border-t border-dashed border-slate-300 relative bg-slate-50 overflow-hidden">
                <div className="absolute top-[-10px] left-[-10px] w-5 h-5 bg-white sm:bg-slate-100 rounded-full"></div>
                <div className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-white sm:bg-slate-100 rounded-full"></div>
                <div className="w-full h-full flex justify-center items-center opacity-30">
                    <span className="text-[8px] font-bold tracking-[0.2em] uppercase">Xin cảm ơn quý khách</span>
                </div>
            </div>

          </div>
        </div>

        {/* BẢNG ĐIỀU KHIỂN & GỘP TÁCH BILL (ẨN DƯỚI CÙNG ĐỂ DỄ CHỤP MÀN HÌNH) */}
        <div className="w-full bg-white border-t border-slate-200 p-3 sm:p-4 shrink-0 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)] z-20">
          <div className="max-w-md mx-auto w-full">
            
            {showSettings && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3 max-h-[30vh] overflow-y-auto custom-scrollbar animate-fade-in shadow-inner">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-center">Gộp các hóa đơn (60 ngày)</div>
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
                                    {isLichGoc && <span className="text-[8px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded uppercase font-black">Gốc</span>}
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

            <div className="flex flex-col gap-2.5">
                <div className="flex gap-2">
                    <input 
                        type="text" value={hdDiaChi} onChange={(e) => setHdDiaChi(e.target.value)} 
                        placeholder="Thêm địa chỉ..." 
                        className="flex-1 bg-slate-50 border border-slate-200 text-xs font-bold p-3 rounded-xl outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all" 
                    />
                    <button 
                        onClick={() => setShowChuKyModal(true)}
                        className={`px-4 py-3 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-sm ${chuKy ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'}`}
                    >
                        <PenTool size={16}/> {chuKy ? "Đã Ký" : "Ký Tên"}
                    </button>
                </div>
                
                <div className="flex gap-2">
                    <button onClick={() => setShowSettings(!showSettings)} className={`flex-1 py-3 rounded-xl flex justify-center items-center gap-1.5 text-xs font-black transition-all border ${showSettings ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                        <Settings2 size={16}/> {showSettings ? "Ẩn tùy chỉnh" : "Tùy chỉnh Gộp Bill"}
                    </button>
                    <button onClick={() => setHoaDonData(null)} className="w-[100px] bg-slate-100 text-slate-600 font-bold rounded-xl flex items-center justify-center text-xs active:scale-95 transition-all hover:bg-slate-200">
                        Đóng lại
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CHỮ KÝ */}
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