import { Lich, PhatSinh, ChamCong, ThuHuong, TaiKhoan } from "../../types";
import { TrendingUp, Wallet, Receipt, CalendarCheck, Clock, XCircle, PieChart, Banknote, TrendingDown, CircleDollarSign } from "lucide-react";

interface TabThongKeProps {
  homNay: () => string;
  thangThongKe: string;
  setThangThongKe: (val: string) => void;
  lichLamViec: Lich[];
  danhSachPhatSinh: PhatSinh[];
  danhSachTaiKhoan: TaiKhoan[];
  danhSachChamCong: ChamCong[];
  danhSachThuHuong: ThuHuong[];
}

export default function TabThongKe({
  homNay,
  thangThongKe,
  setThangThongKe,
  lichLamViec,
  danhSachPhatSinh,
  danhSachTaiKhoan,
  danhSachChamCong,
  danhSachThuHuong
}: TabThongKeProps) {
  
  // =======================================================
  // 1. TÍNH TOÁN DOANH THU & TIẾN ĐỘ
  // =======================================================
  const lichTrongThang = lichLamViec.filter(l => l.ngay.startsWith(thangThongKe));
  const phatSinhTrongThang = danhSachPhatSinh.filter(p => p.ngay.startsWith(thangThongKe));

  let doanhThuLichDuKien = 0;
  let thucThuLich = 0;
  let soHoanThanh = 0; let soHuy = 0; let soChuaChup = 0;

  lichTrongThang.forEach(l => {
    const tongGia = Number(l.giaTien || 0) + Number((l as any).tienDichVuThem || 0);
    doanhThuLichDuKien += tongGia;
    thucThuLich += Number(l.tienCoc || 0); 
    
    if (l.trangThai === "Hoàn thành") soHoanThanh++;
    else if (l.trangThai === "Hủy lịch") soHuy++;
    else soChuaChup++;
  });

  const thucThuPhatSinh = phatSinhTrongThang.reduce((sum, item) => sum + Number(item.soTien || 0), 0);
  
  const tongThucThu = thucThuLich + thucThuPhatSinh;
  const tongDuKien = doanhThuLichDuKien + thucThuPhatSinh;
  const tongCongNo = tongDuKien - tongThucThu;

  // =======================================================
  // 2. TÍNH TOÁN QUỸ XUẤT LƯƠNG NHÂN VIÊN
  // =======================================================
  const homNayStr = homNay();
  let tongQuyLuong = 0;

  if (thangThongKe) {
    const year = parseInt(thangThongKe.split("-")[0]);
    const month = parseInt(thangThongKe.split("-")[1]);
    const daysInMonth = new Date(year, month, 0).getDate();
    const isCurrentMonth = thangThongKe === homNayStr.slice(0, 7);
    const currentDayNum = parseInt(homNayStr.slice(8, 10));
    const limitDay = isCurrentMonth ? currentDayNum : daysInMonth + 1;
    const pastDates: string[] = [];
    
    for (let i = 1; i < limitDay; i++) {
      const d = i < 10 ? `0${i}` : `${i}`;
      pastDates.push(`${thangThongKe}-${d}`);
    }

    const nhanVienList = danhSachTaiKhoan.filter((tk) => tk.role !== "admin");

    nhanVienList.forEach((tk) => {
      const chamCongThang = danhSachChamCong.filter((cc) => cc.uid === tk.id && cc.ngay.startsWith(thangThongKe));
      const chamCongMap: Record<string, ChamCong> = {};
      chamCongThang.forEach(cc => { chamCongMap[cc.ngay] = cc; });

      let soNgayNghi = 0; let soLanMuon = 0; let tongPhutMuon = 0;

      pastDates.forEach(date => {
        const record = chamCongMap[date]; 
        if (!record) { soNgayNghi++; } 
        else {
          if (record.trangThaiGiaiTrinh === "Đã duyệt") {
            if (record.loaiGiaiTrinh === "Xin nghỉ phép") { soNgayNghi++; }
          } else {
            if (!record.checkIn || !record.checkOut) { soNgayNghi++; } 
            else if (record.diMuon) { soLanMuon++; tongPhutMuon += (record.soPhutMuon || 0); }
          }
        }
      });

      const luongCung = tk.luongCung || 0;
      const luongNgay = luongCung / daysInMonth; 
      const luongPhut = luongNgay / 8 / 60; 

      const phatDiMuon = Math.round(tongPhutMuon * luongPhut) || 0;
      const soNgayPhatThucTe = Math.max(0, soNgayNghi - 2); 
      const phatNghi = Math.round(soNgayPhatThucTe * luongNgay) || 0;

      const chuyenCan = soNgayNghi === 0 && soLanMuon <= 3;
      const tienChuyenCan = chuyenCan ? (tk.thuongChuyenCan || 0) : 0;

      const thuHuongThang = danhSachThuHuong.filter((th) => th.uid === tk.id && th.ngay.startsWith(thangThongKe));
      const tongThuHuong = thuHuongThang.reduce((sum, th) => sum + Number(th.soTien || 0), 0);

      const luongTamTinh = Math.round(luongCung - phatDiMuon - phatNghi + tienChuyenCan + tongThuHuong) || 0;
      tongQuyLuong += Math.max(0, luongTamTinh); // Cộng dồn lương
    });
  }

  // =======================================================
  // 3. LỢI NHUẬN THUẦN (NET PROFIT)
  // =======================================================
  const loiNhuanThuan = tongThucThu - tongQuyLuong;

  const formatTien = (val: number) => val.toLocaleString("vi-VN");

  return (
    <div className="pb-24 px-2 pt-4 font-sans">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 mb-6">
        
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <PieChart size={24} className="text-indigo-600"/> Báo Cáo Tài Chính
          </h2>
        </div>

        <div className="mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <label className="text-[10px] font-bold text-slate-500 block mb-1.5 ml-1 uppercase tracking-widest">
            Chọn tháng cần xem
          </label>
          <input 
            type="month" 
            value={thangThongKe} 
            onChange={(e) => setThangThongKe(e.target.value)} 
            className="w-full bg-white text-slate-900 p-3.5 rounded-xl border border-slate-200 font-bold text-lg focus:ring-2 focus:ring-indigo-200 outline-none transition-all shadow-sm" 
          />
        </div>

        {!thangThongKe ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CalendarCheck size={48} className="mx-auto mb-3 opacity-20" />
            <div className="font-bold text-sm">Vui lòng chọn tháng để xem số liệu</div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            
            {/* THẺ LỢI NHUẬN THUẦN (NET PROFIT) - QUAN TRỌNG NHẤT */}
            <div className={`rounded-3xl p-6 text-white shadow-lg relative overflow-hidden ${loiNhuanThuan >= 0 ? "bg-gradient-to-br from-indigo-500 to-purple-700 shadow-indigo-200" : "bg-gradient-to-br from-rose-500 to-red-700 shadow-rose-200"}`}>
              <div className="absolute -top-4 -right-4 opacity-10 text-8xl transform rotate-12 pointer-events-none">✨</div>
              <div className="flex items-center gap-2 text-white/80 text-[10px] font-bold mb-1 uppercase tracking-widest">
                <CircleDollarSign size={14} /> LỢI NHUẬN THUẦN (THÁNG {thangThongKe.split("-")[1]})
              </div>
              <div className="text-4xl font-black tracking-tight mt-1 drop-shadow-sm">
                {loiNhuanThuan < 0 ? "-" : ""}{formatTien(Math.abs(loiNhuanThuan))}<span className="text-2xl font-bold ml-1 opacity-80">đ</span>
              </div>
              <div className="mt-3 text-[11px] font-bold text-white bg-black/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                = (Thực thu) - (Quỹ lương)
              </div>
            </div>

            {/* THẺ THỰC THU VS QUỸ LƯƠNG */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">
                  <TrendingUp size={14} /> TỔNG THỰC THU
                </div>
                <div className="text-xl font-black text-emerald-700 mt-1">
                  {formatTien(tongThucThu)}đ
                </div>
                <div className="text-[9px] font-bold text-emerald-500 mt-1 opacity-80">Tiền cọc + Đã thanh toán</div>
              </div>

              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1.5">
                  <TrendingDown size={14} /> QUỸ XUẤT LƯƠNG
                </div>
                <div className="text-xl font-black text-rose-700 mt-1">
                  -{formatTien(tongQuyLuong)}đ
                </div>
                <div className="text-[9px] font-bold text-rose-500 mt-1 opacity-80">Lương cứng + Hoa hồng</div>
              </div>
            </div>

            {/* THẺ DỰ KIẾN VÀ CÔNG NỢ */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Receipt size={14} /> Tổng Hợp Đồng
                </div>
                <div className="text-lg font-black text-slate-700">
                  {formatTien(tongDuKien)}đ
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1.5">
                  <Banknote size={14} /> Đang Công Nợ
                </div>
                <div className="text-lg font-black text-orange-700">
                  {formatTien(tongCongNo)}đ
                </div>
              </div>
            </div>

            {/* CHI TIẾT NGUỒN THU */}
            <h3 className="font-bold text-sm text-slate-800 mt-6 mb-2 ml-1 tracking-tight">Chi tiết nguồn Thực Thu</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-indigo-100 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
                <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Từ lịch chụp</div>
                <div className="text-lg font-black text-slate-800">
                  {formatTien(thucThuLich)}đ
                </div>
              </div>

              <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-sm flex flex-col justify-center">
                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Từ dịch vụ thêm</div>
                <div className="text-lg font-black text-slate-800">
                  {formatTien(thucThuPhatSinh)}đ
                </div>
              </div>
            </div>

            {/* THỐNG KÊ TIẾN ĐỘ LỊCH CHỤP */}
            <h3 className="font-bold text-sm text-slate-800 mt-6 mb-2 ml-1 tracking-tight">Tiến độ Lịch chụp ({lichTrongThang.length} Job)</h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all">
                <CalendarCheck size={18} className="text-emerald-500 mb-1" />
                <div className="text-xl font-black text-slate-700">{soHoanThanh}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Hoàn Thành</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all">
                <Clock size={18} className="text-blue-500 mb-1" />
                <div className="text-xl font-black text-slate-700">{soChuaChup}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Chưa Chụp</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all">
                <XCircle size={18} className="text-rose-400 mb-1" />
                <div className="text-xl font-black text-slate-700">{soHuy}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Đã Hủy</div>
              </div>
            </div>

          </div>
        )}
      </div>

      <div className="text-center mt-8 mb-4">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Suri Wedding App</div>
        <div className="text-[9px] text-slate-400 font-medium">Báo cáo Tài chính & Lợi nhuận chuyên sâu</div>
      </div>
    </div>
  );
}