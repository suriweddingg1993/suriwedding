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

// BẢO VỆ CHỐNG NaN KHI NHẬP
function chuyenTienVeSo(value: string) { return Number(value.replace(/\./g, "")) || 0; }

export default function TabLuong({
  homNay, uidCuaToi, hoSoCuaToi, laAdmin, danhSachTaiKhoan = [], danhSachChamCong = [],
  danhSachThuHuong = [], themThuHuong, xoaThuHuong, formatTienInput
}: TabLuongProps) {

  const [showModal, setShowModal] = useState(false);
  const [thUid, setThUid] = useState(""); const [thEmail, setThEmail] = useState("");
  const [thHoTen, setThHoTen] = useState(""); const [thNgay, setThNgay] = useState("");
  const [thMoTa, setThMoTa] = useState(""); const [thSoTien, setThSoTien] = useState("");

  const moModalThuHuong = (uid: string, email: string, hoTen: string) => {
    setThUid(uid); setThEmail(email); setThHoTen(hoTen || email);
    setThNgay(homNay()); setThMoTa(""); setThSoTien(""); setShowModal(true);
  };
  
  const xacNhanCapTien = () => { 
    themThuHuong(thUid, thEmail, thHoTen, thNgay, thMoTa, thSoTien); 
    setShowModal(false); 
  };

  const homNayStr = homNay();
  const thangHienTai = homNayStr.slice(0, 7);
  const currentDayNum = parseInt(homNayStr.slice(8, 10));

  const pastDates: string[] = [];
  for (let i = 1; i < currentDayNum; i++) {
    const d = i < 10 ? `0${i}` : `${i}`;
    pastDates.push(`${thangHienTai}-${d}`);
  }

  const tinhLuongNhanVien = (tk: TaiKhoan): BangLuong => {
    const chamCongThang = danhSachChamCong.filter((cc) => cc.uid === tk.id && cc.ngay.startsWith(thangHienTai));
    const chamCongMap: Record<string, ChamCong> = {};
    chamCongThang.forEach(cc => { chamCongMap[cc.ngay] = cc; });

    let soNgayNghi = 0; 
    let soNgayTruLuong = 0; 
    let soLanMuon = 0;
    let tongPhutMuon = 0;

    pastDates.forEach(date => {
      const record = chamCongMap[date]; 
      if (!record) {
        soNgayNghi++; soNgayTruLuong++;
      } else {
        if (record.trangThaiGiaiTrinh === "Đã duyệt") {
          if (record.loaiGiaiTrinh === "Xin nghỉ phép") { soNgayNghi++; }
        } else {
          if (!record.checkIn || !record.checkOut) {
            soNgayNghi++; soNgayTruLuong++;
          } else if (record.diMuon) {
            soLanMuon++;
            tongPhutMuon += (record.soPhutMuon || 0);
          }
        }
      }
    });

    const luongCung = tk.luongCung || 0;
    const luongNgay = luongCung / 30;
    const luongPhut = luongNgay / 8 / 60; 

    const phatDiMuon = Math.round(tongPhutMuon * luongPhut) || 0;
    const soNgayPhatThucTe = Math.max(0, soNgayNghi - 2); 
    const phatNghi = Math.round(soNgayPhatThucTe * luongNgay) || 0;

    const chuyenCan = soNgayNghi === 0 && soLanMuon <= 3;
    const tienChuyenCan = chuyenCan ? (tk.thuongChuyenCan || 0) : 0;

    const thuHuongThang = danhSachThuHuong.filter((th) => th.uid === tk.id && th.ngay.startsWith(thangHienTai));
    const tongThuHuong = thuHuongThang.reduce((sum, th) => sum + Number(th.soTien || 0), 0);

    const luongTamTinh = (luongCung - phatDiMuon - phatNghi + tienChuyenCan + tongThuHuong) || 0;

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
          <h2 className="text-xl font-bold mb-5 text-gray-800">👑 Quản lý Quỹ Lương</h2>
          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg mb-6">
            <div className="text-sm font-medium mb-1 uppercase text-gray-300">Tổng quỹ lương (Tháng {thangHienTai.split("-").reverse().join("/")})</div>
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
                    <div className="text-[11px] font-bold text-gray-600 uppercase">Hoa hồng Job: <span className="text-green-600">+{formatTienInput(String(nv.tongThuHuong))}đ</span></div>
                    <button onClick={() => moModalThuHuong(nv.id, nv.email, nv.hoTen || "")} className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">+ Thêm</button>
                  </div>
                  {nv.thuHuongThang.map((th: ThuHuong) => (
                    <div key={th.id} className="flex justify-between items-center text-xs bg-gray-50 p-1.5 rounded border border-dashed border-gray-200 mt-1">
                      <div className="truncate max-w-[150px]"><span className="text-gray-400 mr-1">{th.ngay.slice(8,10)}/{th.ngay.slice(5,7)}:</span> {th.moTa}</div>
                      <div className="flex items-center gap-2"><span className="font-bold text-green-600">+{formatTienInput(String(th.soTien))}</span><button onClick={() => th.id && xoaThuHuong(th.id)} className="text-red-400 hover:text-red-600">🗑</button></div>
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
            <h2 className="text-xl font-bold mb-5 text-gray-800">💰 Bảng lương của tôi</h2>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg mb-5">
              <div className="text-sm font-medium mb-1 uppercase text-blue-200">Tổng lương tạm tính (Tháng {thangHienTai.split("-").reverse().join("/")})</div>
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
                <div><h3 className="font-bold text-blue-800 uppercase text-xs">🏆 Hoa hồng Job</h3><div className="font-black text-green-600 text-xl">+{formatTienInput(String(luongCuaToi.tongThuHuong))}đ</div></div>
                <button onClick={() => hoSoCuaToi && uidCuaToi && moModalThuHuong(uidCuaToi, hoSoCuaToi.email, hoSoCuaToi.hoTen || "")} className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md">+ Báo cáo Job</button>
              </div>
              <div className="space-y-2 mt-3">
                {luongCuaToi.thuHuongThang.map((th: ThuHuong) => (
                  <div key={th.id} className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm text-sm">
                    <div className="flex flex-col"><span className="font-bold">{th.moTa}</span><span className="text-[10px] text-gray-400">Ngày: {th.ngay.split("-").reverse().join("/")}</span></div>
                    <div className="flex items-center gap-3"><span className="font-black text-green-600">+{formatTienInput(String(th.soTien))}đ</span><button onClick={() => th.id && xoaThuHuong(th.id)} className="text-gray-300 hover:text-red-500">🗑</button></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-1">{laAdmin ? "Cộng tiền thụ hưởng" : "Báo cáo Job"}</h3>
            <div className="grid gap-3 mt-4">
              <input type="date" value={thNgay} onChange={(e) => setThNgay(e.target.value)} className="border p-3 rounded-xl w-full" />
              <input type="text" placeholder="Tên công việc (Makeup, Chụp...)" value={thMoTa} onChange={(e) => setThMoTa(e.target.value)} className="border p-3 rounded-xl w-full" />
              <input type="text" inputMode="numeric" placeholder="Số tiền (VNĐ)" value={thSoTien} onChange={(e) => setThSoTien(formatTienInput(e.target.value))} className="border p-3 rounded-xl w-full font-black text-green-600 text-lg" />
              <div className="flex gap-2 mt-2"><button onClick={xacNhanCapTien} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl">Lưu báo cáo</button><button onClick={() => setShowModal(false)} className="px-5 bg-gray-100 font-bold rounded-xl">Hủy</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}