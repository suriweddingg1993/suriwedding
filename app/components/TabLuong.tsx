import { useState } from "react";
import { ChamCong, ThuHuong, TaiKhoan } from "../../types";

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
  // ĐÃ THÊM: State quản lý Tháng được chọn (Mặc định là tháng hiện tại)
  const [thangChon, setThangChon] = useState(homNayStr.slice(0, 7));

  const [showModal, setShowModal] = useState(false);
  const [thUid, setThUid] = useState(""); const [thEmail, setThEmail] = useState("");
  const [thHoTen, setThHoTen] = useState(""); const [thNgay, setThNgay] = useState("");
  const [thMoTa, setThMoTa] = useState(""); const [thSoTien, setThSoTien] = useState("");
  // ĐÃ THÊM: State để quyết định Cộng (Hoa hồng) hay Trừ (Tạm ứng)
  const [thLoai, setThLoai] = useState("cong");

  const moModalThuHuong = (uid: string, email: string, hoTen: string) => {
    setThUid(uid); setThEmail(email); setThHoTen(hoTen || email);
    setThNgay(homNay()); setThMoTa(""); setThSoTien(""); 
    setThLoai("cong"); // Mặc định mở lên là cộng tiền
    setShowModal(true);
  };
  
  const xacNhanCapTien = () => { 
    // ĐÃ THÊM: Thêm dấu trừ vào trước số tiền nếu là loại Trừ/Ứng lương
    const tienDauVao = thLoai === "tru" ? `-${thSoTien}` : thSoTien;
    themThuHuong(thUid, thEmail, thHoTen, thNgay, thMoTa, tienDauVao); 
    setShowModal(false); 
  };

  // =====================================
  // TÍNH TOÁN NGÀY THÁNG ĐỘNG THÔNG MINH
  // =====================================
  const year = parseInt(thangChon.split("-")[0]);
  const month = parseInt(thangChon.split("-")[1]);
  // Tự động biết tháng này có 28, 30 hay 31 ngày
  const daysInMonth = new Date(year, month, 0).getDate();

  const isCurrentMonth = thangChon === homNayStr.slice(0, 7);
  const currentDayNum = parseInt(homNayStr.slice(8, 10));
  
  // Nếu là tháng cũ -> Quét trọn vẹn số ngày của tháng đó
  // Nếu là tháng hiện tại -> Chỉ quét từ mùng 1 đến ngày hôm qua
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
    // ĐÃ SỬA: Chia cho chính xác số ngày của tháng đó thay vì 30
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

  return (
    <div className="pb-24 px-2 pt-4">
      {laAdmin ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 animate-fade-in">
          
          {/* ĐÃ THÊM: Thanh chọn Tháng */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-gray-800">👑 Quản lý Lương</h2>
            <input 
              type="month" 
              value={thangChon} 
              onChange={(e) => setThangChon(e.target.value)} 
              className="bg-slate-100 border border-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg mb-6">
            <div className="text-sm font-medium mb-1 uppercase text-gray-300">Tổng quỹ lương (Tháng {thangChon.split("-").reverse().join("/")})</div>
            <div className="text-4xl font-black text-yellow-400">{formatTienInput(String(tongQuyLuong))}đ</div>
            <div className="text-[10px] mt-2 opacity-70 text-yellow-200">* Hệ thống tự động quét và trừ tiền các ngày vắng mặt/đi muộn của nhân viên.</div>
          </div>

          <div className="space-y-4">
            {bangLuongNhanVien.map((nv: BangLuong) => (
              <div key={nv.id} className="border border-gray-100 bg-slate-50 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <div className="font-bold text-blue-700">{nv.hoTen || nv.email.split('@')[0]}</div>
                  <div className="text-lg font-black text-gray-800">{formatTienInput(String(nv.luongTamTinh))}đ</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold mt-1">
                  <div className="text-gray-500">L.Cứng: {formatTienInput(String(nv.luongCung || 0))}đ</div>
                  <div className={nv.chuyenCan ? "text-green-600 text-right" : "text-red-400 line-through text-right"}>C.Cần: +{formatTienInput(String(nv.thuongChuyenCan || 0))}đ</div>
                  
                  <div className={nv.phatNghi > 0 ? "text-red-600" : "text-gray-500"}>Nghỉ: {nv.soNgayNghi} ngày (Phạt -{formatTienInput(String(nv.phatNghi))}đ)</div>
                  <div className={nv.phatDiMuon > 0 ? "text-orange-600 text-right" : "text-gray-500 text-right"}>Muộn: {nv.tongPhutMuon}p (Phạt -{formatTienInput(String(nv.phatDiMuon))}đ)</div>
                </div>

                <div className="mt-2 bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[11px] font-bold text-gray-600 uppercase flex gap-1 items-center">
                      Hoa hồng & Tạm ứng: 
                      {nv.tongThuHuong >= 0 
                        ? <span className="text-green-600">+{formatTienInput(String(nv.tongThuHuong))}đ</span> 
                        : <span className="text-red-600">-{formatTienInput(String(Math.abs(nv.tongThuHuong)))}đ</span>
                      }
                    </div>
                    <button onClick={() => moModalThuHuong(nv.id, nv.email, nv.hoTen || "")} className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">+ Thêm</button>
                  </div>
                  {nv.thuHuongThang.map((th: ThuHuong) => (
                    <div key={th.id} className={`flex justify-between items-center text-xs p-1.5 rounded border border-dashed mt-1 ${th.soTien && th.soTien < 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
                      <div className="truncate max-w-[150px]"><span className="text-gray-400 mr-1">{th.ngay.slice(8,10)}/{th.ngay.slice(5,7)}:</span> {th.moTa}</div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${th.soTien && th.soTien < 0 ? "text-red-600" : "text-green-600"}`}>
                          {th.soTien && th.soTien < 0 ? "-" : "+"}{formatTienInput(String(Math.abs(th.soTien || 0)))}
                        </span>
                        <button onClick={() => th.id && xoaThuHuong(th.id)} className="text-gray-400 hover:text-red-600">🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        luongCuaToi && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 animate-fade-in">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">💰 Lương của tôi</h2>
              <input type="month" value={thangChon} onChange={(e) => setThangChon(e.target.value)} className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg mb-5">
              <div className="text-sm font-medium mb-1 uppercase text-blue-200">Tổng lương tạm tính</div>
              <div className="text-4xl font-black">{formatTienInput(String(luongCuaToi.luongTamTinh))}đ</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center">
                <div className="text-sm font-bold text-gray-500 uppercase">Lương cơ bản</div>
                <div className="text-lg font-black">{formatTienInput(String(luongCuaToi.luongCung))}đ</div>
              </div>

              <div className={`border rounded-xl p-4 flex flex-col justify-center ${luongCuaToi.phatDiMuon > 0 ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-100"}`}>
                <div className={`text-[11px] font-bold uppercase mb-1 ${luongCuaToi.phatDiMuon > 0 ? "text-orange-600" : "text-gray-500"}`}>Đi muộn ({luongCuaToi.soLanMuon} lần)</div>
                <div className="text-lg font-black text-gray-800">{luongCuaToi.tongPhutMuon} <span className="text-sm font-medium text-gray-400">phút</span></div>
                {luongCuaToi.phatDiMuon > 0 && <div className="text-xs font-bold text-red-500 mt-1">Phạt: -{formatTienInput(String(luongCuaToi.phatDiMuon))}đ</div>}
              </div>

              <div className={`border rounded-xl p-4 flex flex-col justify-center ${luongCuaToi.phatNghi > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100"}`}>
                <div className={`text-[11px] font-bold uppercase mb-1 ${luongCuaToi.phatNghi > 0 ? "text-red-600" : "text-gray-500"}`}>Vắng mặt</div>
                <div className="text-lg font-black text-gray-800">{luongCuaToi.soNgayNghi} <span className="text-sm font-medium text-gray-400">/ 2 ngày phép</span></div>
                {luongCuaToi.phatNghi > 0 && <div className="text-xs font-bold text-red-500 mt-1">Trừ: -{formatTienInput(String(luongCuaToi.phatNghi))}đ</div>}
              </div>
            </div>

            <div className={`border rounded-xl p-4 flex justify-between items-center mt-3 mb-4 ${luongCuaToi.chuyenCan ? "bg-green-50 border-green-200" : "bg-red-50 border-red-100"}`}>
              <div>
                <div className={`text-[11px] font-bold uppercase mb-1 ${luongCuaToi.chuyenCan ? "text-green-600" : "text-red-500"}`}>Thưởng chuyên cần</div>
                <div className={`text-sm font-bold ${luongCuaToi.chuyenCan ? "text-green-700" : "text-red-600"}`}>{luongCuaToi.chuyenCan ? "✅ Đạt điều kiện" : "❌ Vi phạm nội quy"}</div>
              </div>
              <div className={`text-lg font-black ${luongCuaToi.chuyenCan ? "text-green-700" : "text-red-400 line-through opacity-70"}`}>+{formatTienInput(String(luongCuaToi.tienChuyenCan))}đ</div>
            </div>

            <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4">
              <div className="flex justify-between items-center border-b border-blue-200 pb-3 mb-3">
                <div>
                  <h3 className="font-bold text-blue-800 uppercase text-xs">🏆 Hoa hồng & Ứng</h3>
                  <div className={`font-black text-xl ${luongCuaToi.tongThuHuong >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {luongCuaToi.tongThuHuong >= 0 ? "+" : "-"}{formatTienInput(String(Math.abs(luongCuaToi.tongThuHuong)))}đ
                  </div>
                </div>
                <button onClick={() => hoSoCuaToi && uidCuaToi && moModalThuHuong(uidCuaToi, hoSoCuaToi.email, hoSoCuaToi.hoTen || "")} className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md">+ Báo cáo Job</button>
              </div>
              <div className="space-y-2 mt-3">
                {luongCuaToi.thuHuongThang.map((th: ThuHuong) => (
                  <div key={th.id} className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm text-sm">
                    <div className="flex flex-col"><span className="font-bold">{th.moTa}</span><span className="text-[10px] text-gray-400">Ngày: {th.ngay.split("-").reverse().join("/")}</span></div>
                    <div className="flex items-center gap-3">
                      <span className={`font-black ${th.soTien && th.soTien < 0 ? "text-red-600" : "text-green-600"}`}>
                        {th.soTien && th.soTien < 0 ? "-" : "+"}{formatTienInput(String(Math.abs(th.soTien || 0)))}đ
                      </span>
                      <button onClick={() => th.id && xoaThuHuong(th.id)} className="text-gray-300 hover:text-red-500">🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* MODAL CẤP TIỀN HOẶC TRỪ TIỀN */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-white animate-fade-in">
            <h3 className="text-xl font-black mb-1 text-slate-800">{laAdmin ? "Tùy chỉnh Quỹ" : "Báo cáo Job"}</h3>
            <p className="text-xs font-medium text-slate-500 mb-5">Nhân viên: <strong className="text-blue-600">{thHoTen}</strong></p>

            <div className="grid gap-4">
              {laAdmin && (
                <div className="bg-slate-50 p-2 rounded-2xl flex gap-1">
                  <button onClick={() => setThLoai("cong")} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${thLoai === "cong" ? "bg-white text-green-600 shadow-sm border border-green-100" : "text-slate-400"}`}>+ CỘNG THƯỞNG</button>
                  <button onClick={() => setThLoai("tru")} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${thLoai === "tru" ? "bg-white text-red-600 shadow-sm border border-red-100" : "text-slate-400"}`}>- TRỪ TẠM ỨNG</button>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 block mb-1">Ngày ghi nhận</label>
                <input type="date" value={thNgay} onChange={(e) => setThNgay(e.target.value)} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 block mb-1">Lý do / Tên Job</label>
                <input type="text" placeholder="VD: Tạm ứng, Tiền cơm..." value={thMoTa} onChange={(e) => setThMoTa(e.target.value)} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 block mb-1">Số tiền (VNĐ)</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" placeholder="VD: 500.000" value={thSoTien} onChange={(e) => setThSoTien(formatTienInput(e.target.value))} className={`bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full pr-10 font-black text-xl outline-none focus:ring-2 ${thLoai === "tru" ? "text-red-600 focus:ring-red-200" : "text-green-600 focus:ring-green-200"}`} />
                  <span className="absolute right-5 top-5 font-black text-slate-400">đ</span>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={xacNhanCapTien} className={`flex-1 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all ${thLoai === "tru" ? "bg-red-500 hover:bg-red-600 shadow-red-200" : "bg-green-500 hover:bg-green-600 shadow-green-200"}`}>LƯU GIAO DỊCH</button>
                <button onClick={() => setShowModal(false)} className="px-6 py-4 bg-slate-100 font-bold text-slate-600 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}