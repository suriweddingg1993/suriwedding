import { useState, useMemo } from "react";
import { KhachHang, Lich, PhatSinh } from "../../types";
import { Search, Star, History, Phone, ChevronDown, ChevronUp, UserCheck, Award } from "lucide-react";

interface TabKhachHangProps {
  danhSachKhachHang: KhachHang[];
  lichLamViec: Lich[];
  danhSachPhatSinh: PhatSinh[];
  laAdmin: boolean;
  formatTienInput: (val: string) => string;
}

export default function TabKhachHang({ danhSachKhachHang, lichLamViec, danhSachPhatSinh, laAdmin, formatTienInput }: TabKhachHangProps) {
  const [tuKhoa, setTuKhoa] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // THUẬT TOÁN GOM DATA TỰ ĐỘNG: Hút toàn bộ khách hàng từ Lịch Cũ + Phát Sinh + CRM
  const customerData = useMemo(() => {
    const map = new Map<string, any>();

    // 1. Quét toàn bộ Lịch Chụp (Gom khách cũ chưa có trong CRM)
    lichLamViec.forEach(lich => {
      if (!lich.soDienThoai) return; // Bỏ qua lịch không nhập SĐT
      let cust = map.get(lich.soDienThoai);
      if (!cust) {
        cust = { id: `legacy-${lich.soDienThoai}`, tenKhach: lich.tenKhach, soDienThoai: lich.soDienThoai, tongTien: 0, soLanDen: 0, lichSu: [], isCRM: false };
        map.set(lich.soDienThoai, cust);
      }
      const tien = Number(lich.giaTien || 0) + Number((lich as any).tienDichVuThem || 0);
      cust.tongTien += tien;
      cust.soLanDen += 1;
      cust.lichSu.push({ ngay: lich.ngay, moTa: `Chụp: ${lich.theLoai || lich.goiChup || "Chưa rõ"}`, tien, id: lich.id, loai: 'lich' });
    });

    // 2. Quét toàn bộ Dịch vụ Phát Sinh
    danhSachPhatSinh.forEach(ps => {
      if (!ps.soDienThoai) return;
      let cust = map.get(ps.soDienThoai);
      if (!cust) {
        cust = { id: `legacy-${ps.soDienThoai}`, tenKhach: ps.tenKhach, soDienThoai: ps.soDienThoai, tongTien: 0, soLanDen: 0, lichSu: [], isCRM: false };
        map.set(ps.soDienThoai, cust);
      }
      const tien = Number(ps.soTien || 0);
      cust.tongTien += tien;
      cust.soLanDen += 1;
      cust.lichSu.push({ ngay: ps.ngay, moTa: `Dịch vụ: ${ps.loai}`, tien, id: ps.id, loai: 'phatsinh' });
    });

    // 3. Hút data chuẩn từ bảng Khách Hàng (Đè lên nếu đã có)
    danhSachKhachHang.forEach(kh => {
      if (kh.soDienThoai) {
        const existing = map.get(kh.soDienThoai);
        if (existing) {
            existing.id = kh.id;
            existing.isCRM = true;
            if (kh.tenKhach) existing.tenKhach = kh.tenKhach;
        } else {
            map.set(kh.soDienThoai, { id: kh.id, tenKhach: kh.tenKhach, soDienThoai: kh.soDienThoai, tongTien: 0, soLanDen: 0, lichSu: [], isCRM: true });
        }
      }
    });

    const arr = Array.from(map.values());
    
    // SẮP XẾP VIP: Khách chi nhiều tiền nhất (Tổng chi tiêu LTV) xếp trên cùng
    arr.sort((a, b) => b.tongTien - a.tongTien);
    
    // Sắp xếp Lịch sử từng người: Mới nhất xếp trên
    arr.forEach(c => { c.lichSu.sort((a:any, b:any) => b.ngay.localeCompare(a.ngay)); });

    return arr;
  }, [danhSachKhachHang, lichLamViec, danhSachPhatSinh]);

  // Bộ lọc tìm kiếm
  const filteredData = customerData.filter(c => 
    (c.tenKhach || "").toLowerCase().includes(tuKhoa.toLowerCase()) || 
    (c.soDienThoai || "").includes(tuKhoa)
  );
  
  // Tính tổng quan tài sản
  const tongDoanhThuLTV = customerData.reduce((acc, curr) => acc + curr.tongTien, 0);

  if (!laAdmin) return <div className="p-10 text-center font-bold text-slate-500">Bạn không có quyền truy cập.</div>;

  return (
    <div className="pb-24 animate-fade-in max-w-3xl mx-auto px-1 mt-4">
      
      {/* KHU VỰC TỔNG QUAN TÀI SẢN DATA */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] text-8xl opacity-10 pointer-events-none">👑</div>
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Dữ Liệu Khách Hàng (CRM)</h2>
        <div className="text-3xl font-black mb-6">{customerData.length} <span className="text-lg text-slate-400 font-bold">Hồ sơ</span></div>
        
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng chi tiêu (LTV)</div>
             <div className="text-lg font-black text-emerald-400">{formatTienInput(String(tongDoanhThuLTV))}đ</div>
           </div>
           <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phân loại</div>
             <div className="text-sm mt-1 font-black text-amber-400 flex items-center gap-1.5"><Star size={16} fill="currentColor"/> Top {Math.min(10, customerData.length)} VIP</div>
           </div>
        </div>
      </div>

      {/* THANH TÌM KIẾM */}
      <div className="mb-6 relative">
        <input 
          type="text" 
          placeholder="Tìm khách bằng Tên hoặc Số điện thoại..." 
          value={tuKhoa} 
          onChange={(e) => setTuKhoa(e.target.value)} 
          className="w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl shadow-sm outline-none font-bold text-slate-700 focus:ring-4 focus:ring-amber-50 transition-all" 
        />
        <Search size={20} className="absolute left-4 top-4 text-slate-400" />
      </div>

      {/* DANH SÁCH BẢNG XẾP HẠNG KHÁCH HÀNG */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200 shadow-sm">
            <div className="text-5xl mb-4 opacity-50 grayscale">🔍</div>
            <h4 className="text-slate-600 font-bold">Không có dữ liệu</h4>
          </div>
        ) : (
          filteredData.map((kh, index) => {
            const isExpanded = expandedId === kh.id;
            
            // Huy hiệu xếp hạng VIP (Top 1, 2, 3)
            let badge = null;
            if (tuKhoa === "") {
                if (index === 0) badge = <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-200/50 border-2 border-white transform rotate-12 z-10" title="Top 1 VIP"><Award size={20} className="text-white"/></div>;
                else if (index === 1) badge = <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center shadow-md border-2 border-white z-10" title="Top 2"><Award size={16} className="text-white"/></div>;
                else if (index === 2) badge = <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-md border-2 border-white z-10" title="Top 3"><Award size={16} className="text-white"/></div>;
            }

            return (
              <div key={kh.id} className={`bg-white rounded-3xl border transition-all duration-300 relative ${isExpanded ? "border-amber-200 shadow-md ring-4 ring-amber-50" : "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"}`}>
                {badge}
                
                {/* THANH THÔNG TIN RÚT GỌN (BẤM VÀO ĐỂ MỞ RỘNG) */}
                <div onClick={() => setExpandedId(isExpanded ? null : kh.id)} className="p-5 cursor-pointer flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <div className="font-black text-slate-800 text-lg flex items-center gap-2">
                        {kh.tenKhach} 
                        {kh.isCRM && <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md uppercase tracking-wider hidden sm:block">Hồ sơ CRM</span>}
                      </div>
                      <div className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Phone size={14}/> <a href={`tel:${kh.soDienThoai}`} onClick={(e) => e.stopPropagation()} className="hover:text-blue-600 hover:underline">{kh.soDienThoai}</a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cột TỔNG CHI TIÊU */}
                  <div className="text-right flex items-center gap-3">
                    <div className="hidden sm:block">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tổng chi tiêu</div>
                      <div className="text-lg font-black text-emerald-600">{formatTienInput(String(kh.tongTien))}đ</div>
                    </div>
                    <div className={`p-2 rounded-full transition-colors ${isExpanded ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"}`}>
                      {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </div>
                  </div>
                </div>

                {/* KHU VỰC MỞ RỘNG: LỊCH SỬ TỪNG LẦN MUA HÀNG */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl animate-fade-in">
                    
                    {/* Hỗ trợ hiển thị trên điện thoại */}
                    <div className="sm:hidden flex justify-between items-center mb-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tổng chi tiêu</div>
                      <div className="text-lg font-black text-emerald-600">{formatTienInput(String(kh.tongTien))}đ</div>
                    </div>

                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-1.5"><History size={16}/> Lịch sử chi tiêu ({kh.soLanDen} lần đến)</h4>
                    
                    {/* Trục Timeline */}
                    <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-[15px] before:w-0.5 before:bg-slate-200">
                      {kh.lichSu.length === 0 ? (
                         <div className="text-xs font-bold text-slate-400 italic pl-10">Chưa có giao dịch.</div>
                      ) : (
                        kh.lichSu.map((ls: any, idx: number) => (
                          <div key={`${ls.id}-${idx}`} className="relative pl-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:border-amber-200 transition-colors">
                            
                            {/* Dấu chấm trên trục thời gian */}
                            <div className={`absolute left-[11px] top-4 w-2.5 h-2.5 rounded-full ring-4 ring-slate-50 ${ls.loai === 'lich' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{ls.ngay.split('-').reverse().join('/')}</span>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${ls.loai === 'lich' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                  {ls.loai === 'lich' ? 'Lịch Studio' : 'Phát Sinh'}
                                </span>
                              </div>
                              <div className="font-bold text-sm text-slate-800">{ls.moTa}</div>
                            </div>
                            
                            <div className="font-black text-emerald-600 sm:text-right mt-1 sm:mt-0">
                              +{formatTienInput(String(ls.tien))}đ
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

    </div>
  );
}