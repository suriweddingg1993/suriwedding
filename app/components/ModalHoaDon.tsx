import { X, MapPin, Printer } from "lucide-react";
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
  if (!hoaDonData) return null;

  // THUẬT TOÁN TÍNH HÓA ĐƠN THÔNG MINH (Ưu tiên ID Khách Hàng, Fallback về SĐT)
  const isKhachCungID = (itemKhachHangId?: string, itemSDT?: string) => {
    if (hoaDonData.khachHangId && itemKhachHangId) {
      return itemKhachHangId === hoaDonData.khachHangId;
    }
    // Tương thích ngược với dữ liệu cũ chưa có ID
    return itemSDT === hoaDonData.soDienThoai;
  };

  const psCuaKhach = danhSachPhatSinh.filter((ps) => isKhachCungID(ps.khachHangId, ps.soDienThoai));
  const lichCuaKhach = lichLamViec.filter((l) => isKhachCungID(l.khachHangId, l.soDienThoai));

  // TÍNH TOÁN DÒNG TIỀN
  let tongTienLich = 0;
  let tongDaCocLich = 0;
  let tongNoLich = 0;

  lichCuaKhach.forEach(l => {
    const tong1Lich = Number(l.giaTien || 0) + Number((l as any).tienDichVuThem || 0);
    const coc1Lich = Number(l.tienCoc || 0);
    tongTienLich += tong1Lich;
    tongDaCocLich += coc1Lich;
    tongNoLich += (tong1Lich - coc1Lich);
  });

  let tongTienPhatSinh = 0;
  psCuaKhach.forEach(p => { tongTienPhatSinh += Number(p.soTien || 0); });

  const tongBill = tongTienLich + tongTienPhatSinh;
  const tongNoHienTai = tongNoLich; // Phát sinh mặc định là thu thẳng 100%, không cho nợ
  const daThanhToan = tongBill - tongNoHienTai;

  const handleInHoaDon = () => {
    const printContent = document.getElementById("vung-in-hoa-don");
    if (!printContent) return;
    const windowPrint = window.open("", "", "width=800,height=900");
    if (!windowPrint) return;

    windowPrint.document.write(`
      <html>
        <head>
          <title>Hóa Đơn - Suri Wedding</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #1e293b; background: white; margin: 0; }
            * { box-sizing: border-box; }
            .receipt-container { max-width: 400px; margin: 0 auto; border: 1px dashed #cbd5e1; padding: 24px; }
            .header { text-align: center; margin-bottom: 24px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin: 0 0 5px 0; }
            .slogan { font-size: 11px; color: #64748b; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; }
            .info-line { font-size: 13px; margin: 3px 0; }
            .title { text-align: center; font-size: 18px; font-weight: 800; margin: 20px 0 15px 0; text-transform: uppercase; }
            .customer-info { font-size: 14px; margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 8px; }
            .customer-info div { margin-bottom: 4px; }
            table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            th { border-bottom: 2px solid #1e293b; text-align: left; padding: 8px 4px; font-weight: 700; text-transform: uppercase; font-size: 11px; color: #64748b; }
            td { padding: 10px 4px; border-bottom: 1px dashed #e2e8f0; vertical-align: top; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700; }
            .text-sm { font-size: 12px; color: #64748b; margin-top: 4px; }
            .summary { margin-top: 20px; border-top: 2px solid #1e293b; padding-top: 15px; }
            .summary-line { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .summary-line.total { font-weight: 900; font-size: 18px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #cbd5e1; }
            .summary-line.debt { font-weight: 800; color: #e11d48; }
            .footer { text-align: center; margin-top: 40px; font-size: 13px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
            @media print { body { padding: 0; } .receipt-container { border: none; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => { windowPrint.print(); windowPrint.close(); }, 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-50 rounded-[2rem] w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] animate-fade-in overflow-hidden">
        
        {/* HEADER MODAL */}
        <div className="p-5 bg-white border-b border-slate-200 flex justify-between items-center z-10 shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Chi tiết Hóa Đơn</h3>
            <p className="text-xs font-bold text-slate-500 mt-1">Xuất phiếu thu cho khách hàng</p>
          </div>
          <button onClick={() => setHoaDonData(null)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all active:scale-95">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* NỘI DUNG CUỘN ĐƯỢC */}
        <div className="overflow-y-auto p-6 custom-scrollbar flex-1 relative">
          {/* PHẦN IN HÓA ĐƠN BỊ ẨN ĐỂ LẤY HTML */}
          <div id="vung-in-hoa-don" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
            <div className="header">
              <div className="logo">SURI WEDDING</div>
              <div className="slogan">Lưu giữ khoảnh khắc trọn vẹn</div>
              <div className="info-line">Hotline: 098.xxx.xxxx</div>
              <div className="info-line">Fanpage: fb.com/suriwedding</div>
            </div>

            <div className="title">HÓA ĐƠN DỊCH VỤ</div>

            <div className="customer-info">
              <div><span className="font-bold">Khách hàng:</span> {hoaDonData.tenKhach}</div>
              <div><span className="font-bold">Điện thoại:</span> {hoaDonData.soDienThoai}</div>
              {hdDiaChi && <div><span className="font-bold">Địa chỉ:</span> {hdDiaChi}</div>}
              <div><span className="font-bold">Ngày xuất:</span> {homNay().split("-").reverse().join("/")}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Nội dung</th>
                  <th className="text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {/* IN LỊCH CHỤP */}
                {lichCuaKhach.map((l, idx) => (
                  <tr key={`l-${idx}`}>
                    <td>
                      <div className="font-bold">{l.goiChup || l.theLoai}</div>
                      <div className="text-sm">Ngày: {l.ngay.split("-").reverse().join("/")}</div>
                      {(l as any).dichVuThem && (
                         <div className="text-sm">Ghi chú: +( {(l as any).dichVuThem} )</div>
                      )}
                    </td>
                    <td className="text-right font-bold">
                      {formatTienInput(String(Number(l.giaTien || 0) + Number((l as any).tienDichVuThem || 0)))}đ
                    </td>
                  </tr>
                ))}
                
                {/* IN PHÁT SINH */}
                {psCuaKhach.map((p, idx) => (
                  <tr key={`p-${idx}`}>
                    <td>
                      <div className="font-bold">{p.loai}</div>
                      <div className="text-sm">Ngày: {p.ngay.split("-").reverse().join("/")}</div>
                    </td>
                    <td className="text-right font-bold">{formatTienInput(String(p.soTien || 0))}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="summary">
              <div className="summary-line">
                <span>Tổng chi phí dịch vụ:</span>
                <span>{formatTienInput(String(tongBill))}đ</span>
              </div>
              <div className="summary-line">
                <span>Đã thanh toán (Cọc):</span>
                <span>{formatTienInput(String(daThanhToan))}đ</span>
              </div>
              <div className="summary-line total">
                <span>CÒN CẦN THANH TOÁN:</span>
                <span className="debt">{formatTienInput(String(tongNoHienTai))}đ</span>
              </div>
            </div>

            <div className="footer">
              <div>Cảm ơn quý khách đã sử dụng dịch vụ của Suri Wedding!</div>
              <div style={{ marginTop: '5px' }}>Hẹn gặp lại quý khách!</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-2 flex items-center gap-1">
              <MapPin size={12}/> Thêm địa chỉ vào hóa đơn (Tuỳ chọn)
            </label>
            <input 
              type="text" 
              value={hdDiaChi} 
              onChange={(e) => setHdDiaChi(e.target.value)} 
              placeholder="Nhập địa chỉ nhà khách hàng..." 
              className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl w-full text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
            />
          </div>
        </div>

        {/* NÚT BẤM CỐ ĐỊNH DƯỚI CÙNG */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <button 
            onClick={handleInHoaDon} 
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Printer size={20} /> IN / LƯU PDF HÓA ĐƠN NÀY
          </button>
        </div>

      </div>
    </div>
  );
}