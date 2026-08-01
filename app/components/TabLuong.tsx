import { useState } from "react";
import { ChamCong, ThuHuong, TaiKhoan } from "../../types";
// ĐÃ THÊM: Import icon Chevron cho hiệu ứng xổ xuống
import { ChevronDown, ChevronUp } from "lucide-react";

interface BangLuong extends TaiKhoan {
  soNgayNghi: number;
  soLanMuon: number;
  tongPhutMuon: number;
  phatDiMuon: number;
  phatNghi: number;
  chuyenCan: boolean;
  tienChuyenCan: number;
  tongThuHuong: number;
  thuHuongThang: ThuHuong[];
  luongTamTinh: number;
}

interface TabLuongProps {
  homNay: () => string;
  uidCuaToi?: string;
  hoSoCuaToi: TaiKhoan | null;
  laAdmin: boolean;
  danhSachTaiKhoan: TaiKhoan[];
  danhSachChamCong: ChamCong[];
  danhSachThuHuong: ThuHuong[];
  themThuHuong: (uid: string, email: string, hoTen: string, ngay: string, moTa: string, soTien: string) => Promise<void>;
  xoaThuHuong: (id: string) => Promise<void>;
  formatTienInput: (val: string) => string;
}

function chuyenTienVeSo(value: string) { return Number(value.replace(/\./g, "")) || 0; }

export default function TabLuong({
  homNay, uidCuaToi, hoSoCuaToi, laAdmin, danhSachTaiKhoan = [], danhSachChamCong = [],
  danhSachThuHuong = [], themThuHuong, xoaThuHuong, formatTienInput
}: TabLuongProps) {

  const homNayStr = homNay();
  const [thangChon, setThangChon] = useState(homNayStr.slice(0, 7));

  // ĐÃ THÊM: State quản lý Accordion (ID của nhân viên đang được mở)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [thUid, setThUid] = useState(""); const [thEmail, setThEmail] = useState("");
  const [thHoTen, setThHoTen] = useState(""); const [thNgay, setThNgay] = useState("");
  const [thMoTa, setThMoTa] = useState(""); const [thSoTien, setThSoTien] = useState("");
  const [thLoai, setThLoai] = useState("cong");

  const moModalThuHuong = (uid: string, email: string, hoTen: string) => {
    setThUid(uid); setThEmail(email); setThHoTen(hoTen || email);
    setThNgay(homNay()); setThMoTa(""); setThSoTien(""); 
    setThLoai("cong"); 
    setShowModal(true);
  };
  
  const xacNhanCapTien = () => { 
    const tienDauVao = thLoai === "tru" ? `-${thSoTien}` : thSoTien;
    themThuHuong(thUid, thEmail, thHoTen, thNgay, thMoTa, tienDauVao); 
    setShowModal(false); 
  };

  const year = parseInt(thangChon.split("-")[0]);
  const month = parseInt(thangChon.split("-")[1]);
  const daysInMonth = new Date(year, month, 0).getDate();
  const isCurrentMonth = thangChon === homNayStr.slice(0, 7);
  const currentDayNum = parseInt(homNayStr.slice(8, 10));
  const limitDay = isCurrentMonth ? currentDayNum : daysInMonth + 1;
  const pastDates: string[] = [];
  
  for (let i = 1; i < limitDay; i++) {
    const d = i < 10 ? `0${i}` : `${i}`;
    pastDates.push(`${thangChon}-${d}`);
  }

  const tinhLuongNhanVien = (tk: TaiKhoan): BangLuong => {
    const chamCongThang = danhSachChamCong.filter((cc) => cc.uid === tk.id && cc.ngay.startsWith(thangChon));
    const chamCongMap: Record<string, ChamCong> = {};
    chamCongThang.forEach(cc => { chamCongMap[cc.ngay] = cc; });

    let soNgayNghi = 0; 
    let soLanMuon = 0;
    let tongPhutMuon = 0;

    pastDates.forEach(date => {
      const record = chamCongMap[date]; 
      if (!record) {
        soNgayNghi++; 
      } else {
        if (record.trangThaiGiaiTrinh === "Đã duyệt") {
          if (record.loaiGiaiTrinh === "Xin nghỉ phép") { soNgayNghi++; }
        } else {
          if (!record.checkIn || !record.checkOut) {
            soNgayNghi++; 
          } else if (record.diMuon) {
            soLanMuon++;
            tongPhutMuon += (record.soPhutMuon || 0);
          }
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

    const thuHuongThang = danhSachThuHuong.filter((th) => th.uid === tk.id && th.ngay.startsWith(thangChon));
    const tongThuHuong = thuHuongThang.reduce((sum, th) => sum + Number(th.soTien || 0), 0);

    const luongTamTinh = Math.round((luongCung - phatDiMuon - phatNghi + tienChuyenCan + tongThuHuong)) || 0;

    return { 
      ...tk, soNgayNghi, soLanMuon, tongPhutMuon, phatDiMuon, phatNghi, 
      chuyenCan, tienChuyenCan, tongThuHuong, thuHuongThang, luongTamTinh 
    };
  };

  const bangLuongNhanVien: BangLuong[] = laAdmin ? danhSachTaiKhoan.filter((tk) => tk.role !== "admin").map(tinhLuongNhanVien) : [];
  const tongQuyLuong = laAdmin ? bangLuongNhanVien.reduce((sum, nv) => sum + nv.luongTamTinh, 0) : 0;
  const luongCuaToi = !laAdmin && hoSoCuaToi ? tinhLuongNhanVien(hoSoCuaToi) : null;

  // HÀM BẬT/TẮT ACCORDION
  const toggleRow = (id: string) => {
    if (expandedRowId === id) setExpandedRowId(null);
    else setExpandedRowId(id);
  };

  return (
    <div className="pb-24 px-2 pt-4">
      {laAdmin ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 mb-6 animate-fade-in">
          
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">👑 Quản lý Lương</h2>
            <input 
              type="month" 
              value={thangChon} 
              onChange={(e) => setThangChon(e.target.value)} 
              className="bg-slate-50 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-blue-300 transition-all"
            />
          </div>

          <div className="bg-gradient-to-br from-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 mb-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-8xl opacity-10 pointer-events-none">💰</div>
            <div className="text-[11px] font-bold mb-1 uppercase text-indigo-200 tracking-wider">Tổng quỹ xuất lương (Th. {thangChon.split("-").reverse().join("/")})</div>
            <div className="text-4xl font-black text-emerald-400 drop-shadow-sm">{formatTienInput(String(tongQuyLuong))}đ</div>
            <div className="text-[10px] mt-3 opacity-60 text-slate-300">* Bao gồm Lương cứng, Hoa hồng và đã trừ Phạt vi phạm.</div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest ml-1 mb-2">Bảng tính nhân sự</h3>
            
            {bangLuongNhanVien.map((nv: BangLuong) => {
              const isExpanded = expandedRowId === nv.id;
              
              return (
                <div key={nv.id} className={`border rounded-2xl transition-all duration-300 overflow-hidden ${isExpanded ? "border-indigo-200 bg-indigo-50/30 shadow-md" : "border-slate-100 bg-white shadow-sm hover:shadow-md"}`}>
                  
                  {/* THANH HIỂN THỊ THU GỌN */}
                  <div 
                    onClick={() => toggleRow(nv.id!)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-lg">{nv.hoTen || nv.email.split('@')[0]}</div>
                      <div className="flex gap-3 mt-1.5 text-[11px] font-bold">
                        <span className="text-slate-500">LC: {formatTienInput(String(nv.luongCung || 0))}</span>
                        <span className={nv.tongThuHuong >= 0 ? "text-emerald-600" : "text-rose-600"}>HH: {nv.tongThuHuong >= 0 ? "+" : "-"}{formatTienInput(String(Math.abs(nv.tongThuHuong)))}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Thực Lãnh</div>
                        <div className="text-lg font-black text-indigo-700">{formatTienInput(String(nv.luongTamTinh))}đ</div>
                      </div>
                      <div className={`p-1.5 rounded-full transition-transform duration-300 ${isExpanded ? "bg-indigo-100 text-indigo-600 rotate-180" : "bg-slate-50 text-slate-400"}`}>
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>

                  {/* NỘI DUNG XỔ XUỐNG KHI BẤM VÀO */}
                  {isExpanded && (
                    <div className="px-4 pb-4 animate-fade-in">
                      <div className="border-t border-indigo-100 pt-4 mt-2">
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                            <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">Chấm Công & Phạt</div>
                            <div className="space-y-1.5 text-xs font-medium">
                                <div className="flex justify-between items-center text-slate-600">
                                  <span>Vắng mặt ({nv.soNgayNghi} ngày)</span>
                                  <span className={nv.phatNghi > 0 ? "text-rose-600 font-bold" : ""}>{nv.phatNghi > 0 ? `-${formatTienInput(String(nv.phatNghi))}` : "0"}đ</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                  <span>Đi muộn ({nv.tongPhutMuon} phút)</span>
                                  <span className={nv.phatDiMuon > 0 ? "text-rose-600 font-bold" : ""}>{nv.phatDiMuon > 0 ? `-${formatTienInput(String(nv.phatDiMuon))}` : "0"}đ</span>
                                </div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                            <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">Chuyên Cần</div>
                            <div className="flex flex-col justify-center h-[calc(100%-24px)]">
                               <div className={`text-sm font-black ${nv.chuyenCan ? "text-emerald-600" : "text-rose-500 line-through opacity-70"}`}>
                                 +{formatTienInput(String(nv.thuongChuyenCan || 0))}đ
                               </div>
                               <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                                 {nv.chuyenCan ? "Đạt đủ điều kiện tháng" : "Vi phạm quy định giờ giấc"}
                               </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Chi tiết Hoa hồng & Ứng</div>
                            <button onClick={() => moModalThuHuong(nv.id!, nv.email, nv.hoTen || "")} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded text-[10px] font-black transition-colors uppercase tracking-wider">+ Thêm Giao Dịch</button>
                          </div>
                          
                          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                            {nv.thuHuongThang.length === 0 ? (
                              <div className="text-center text-xs font-medium text-slate-400 py-3 italic">Chưa có giao dịch nào trong tháng này.</div>
                            ) : (
                              nv.thuHuongThang.map((th: ThuHuong) => (
                                <div key={th.id} className={`flex justify-between items-center text-xs p-2.5 rounded-lg border transition-all hover:shadow-sm ${th.soTien && th.soTien < 0 ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"}`}>
                                  <div className="min-w-0 pr-2">
                                    <div className="font-bold text-slate-700 truncate">{th.moTa}</div>
                                    <div className="text-[9px] text-slate-500 mt-0.5">{th.ngay.split("-").reverse().join("/")}</div>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className={`font-black text-sm ${th.soTien && th.soTien < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                      {th.soTien && th.soTien < 0 ? "-" : "+"}{formatTienInput(String(Math.abs(th.soTien || 0)))}đ
                                    </span>
                                    <button onClick={() => th.id && xoaThuHuong(th.id)} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors shadow-sm">✕</button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      ) : (
        luongCuaToi && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 mb-6 animate-fade-in">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">💰 Lương của tôi</h2>
              <input type="month" value={thangChon} onChange={(e) => setThangChon(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-blue-200 mb-6 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-8xl opacity-10 pointer-events-none">✨</div>
              <div className="text-xs font-bold mb-1 uppercase text-blue-200 tracking-wider">Tổng lương tạm tính</div>
              <div className="text-4xl font-black drop-shadow-sm">{formatTienInput(String(luongCuaToi.luongTamTinh))}đ</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lương cơ bản</div>
                <div className="text-lg font-black text-slate-800">{formatTienInput(String(luongCuaToi.luongCung))}đ</div>
              </div>

              <div className={`border rounded-2xl p-4 flex flex-col justify-center shadow-sm ${luongCuaToi.phatDiMuon > 0 ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-100"}`}>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${luongCuaToi.phatDiMuon > 0 ? "text-orange-600" : "text-slate-500"}`}>Đi muộn ({luongCuaToi.soLanMuon} lần)</div>
                <div className="text-lg font-black text-slate-800">{luongCuaToi.tongPhutMuon} <span className="text-xs font-medium text-slate-400">phút</span></div>
                {luongCuaToi.phatDiMuon > 0 && <div className="text-[11px] font-black text-rose-500 mt-1">Phạt: -{formatTienInput(String(luongCuaToi.phatDiMuon))}đ</div>}
              </div>

              <div className={`border rounded-2xl p-4 flex flex-col justify-center shadow-sm ${luongCuaToi.phatNghi > 0 ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-100"}`}>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${luongCuaToi.phatNghi > 0 ? "text-rose-600" : "text-slate-500"}`}>Vắng mặt</div>
                <div className="text-lg font-black text-slate-800">{luongCuaToi.soNgayNghi} <span className="text-xs font-medium text-slate-400">/ 2 ngày phép</span></div>
                {luongCuaToi.phatNghi > 0 && <div className="text-[11px] font-black text-rose-500 mt-1">Trừ: -{formatTienInput(String(luongCuaToi.phatNghi))}đ</div>}
              </div>
            </div>

            <div className={`border rounded-2xl p-4 flex justify-between items-center mt-3 mb-4 shadow-sm ${luongCuaToi.chuyenCan ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-100"}`}>
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${luongCuaToi.chuyenCan ? "text-emerald-600" : "text-rose-500"}`}>Thưởng chuyên cần</div>
                <div className={`text-xs font-black ${luongCuaToi.chuyenCan ? "text-emerald-700" : "text-rose-600"}`}>{luongCuaToi.chuyenCan ? "✅ Đạt điều kiện" : "❌ Vi phạm nội quy"}</div>
              </div>
              <div className={`text-xl font-black ${luongCuaToi.chuyenCan ? "text-emerald-700" : "text-rose-400 line-through opacity-70"}`}>+{formatTienInput(String(luongCuaToi.tienChuyenCan))}đ</div>
            </div>

            <div className="border border-indigo-100 bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-indigo-50 pb-3 mb-3">
                <div>
                  <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px] mb-1">Chi tiết Hoa hồng & Ứng</h3>
                  <div className={`font-black text-xl ${luongCuaToi.tongThuHuong >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {luongCuaToi.tongThuHuong >= 0 ? "+" : "-"}{formatTienInput(String(Math.abs(luongCuaToi.tongThuHuong)))}đ
                  </div>
                </div>
                <button onClick={() => hoSoCuaToi && uidCuaToi && moModalThuHuong(uidCuaToi, hoSoCuaToi.email, hoSoCuaToi.hoTen || "")} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95 text-xs font-black px-4 py-2.5 rounded-xl shadow-sm transition-all uppercase tracking-wide">Thêm HH</button>
              </div>
              <div className="space-y-2 mt-3 max-h-[250px] overflow-y-auto pr-1">
                {luongCuaToi.thuHuongThang.length === 0 ? (
                  <div className="text-center text-xs font-medium text-slate-400 py-4 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">Chưa có giao dịch hoa hồng nào.</div>
                ) : (
                  luongCuaToi.thuHuongThang.map((th: ThuHuong) => (
                    <div key={th.id} className={`flex justify-between items-center p-3 rounded-xl border shadow-sm text-sm transition-all hover:shadow-md ${th.soTien && th.soTien < 0 ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"}`}>
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-bold text-slate-700 truncate">{th.moTa}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-0.5">{th.ngay.split("-").reverse().join("/")}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`font-black text-base ${th.soTien && th.soTien < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                          {th.soTien && th.soTien < 0 ? "-" : "+"}{formatTienInput(String(Math.abs(th.soTien || 0)))}đ
                        </span>
                        <button onClick={() => th.id && xoaThuHuong(th.id)} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors shadow-sm">✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      )}

      {/* MODAL CẤP TIỀN HOẶC TRỪ TIỀN */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl border border-white animate-fade-in">
            <h3 className="text-xl font-black mb-1 text-slate-900 tracking-tight">{laAdmin ? "Tùy chỉnh Quỹ" : "Khai báo Hoa hồng"}</h3>
            <p className="text-xs font-bold text-slate-500 mb-6 bg-slate-50 py-1.5 px-3 rounded-lg w-fit border border-slate-100">
              Nhân viên: <strong className="text-indigo-600 ml-1">{thHoTen}</strong>
            </p>

            <div className="grid gap-4">
              {laAdmin && (
                <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1 border border-slate-100">
                  <button onClick={() => setThLoai("cong")} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${thLoai === "cong" ? "bg-white text-emerald-600 shadow-sm border border-emerald-100" : "text-slate-400 hover:bg-slate-100"}`}>+ THƯỞNG</button>
                  <button onClick={() => setThLoai("tru")} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${thLoai === "tru" ? "bg-white text-rose-600 shadow-sm border border-rose-100" : "text-slate-400 hover:bg-slate-100"}`}>- PHẠT / ỨNG</button>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Ngày ghi nhận</label>
                <input type="date" value={thNgay} onChange={(e) => setThNgay(e.target.value)} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all" />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Nội dung</label>
                <input type="text" placeholder="VD: HH Chụp, Ứng lương..." value={thMoTa} onChange={(e) => setThMoTa(e.target.value)} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all" />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Số tiền (VNĐ)</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" placeholder="VD: 500.000" value={thSoTien} onChange={(e) => setThSoTien(formatTienInput(e.target.value))} className={`bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full pr-10 font-black text-xl outline-none focus:ring-4 transition-all ${thLoai === "tru" ? "text-rose-600 focus:ring-rose-50 focus:border-rose-200" : "text-emerald-600 focus:ring-emerald-50 focus:border-emerald-200"}`} />
                  <span className="absolute right-5 top-5 font-black text-slate-400">đ</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={xacNhanCapTien} className={`flex-1 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all ${thLoai === "tru" ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"}`}>XÁC NHẬN</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-4 bg-slate-100 font-bold text-slate-600 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}