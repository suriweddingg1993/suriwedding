import { useState } from "react";

export default function TabLuong({
  uidCuaToi,
  hoSoCuaToi, // Thêm thông tin hồ sơ của người đang đăng nhập
  luongCungCuaToi,
  soLanDiMuonThang,
  soNgayNghiThang,
  duocChuyenCan,
  thuongChuyenCanCuaToi,
  laAdmin,
  danhSachTaiKhoan = [],
  danhSachChamCong = [],
  danhSachThuHuong = [],
  themThuHuong,
  xoaThuHuong,
  formatTienInput
}: any) {

  // State chung cho hộp thoại cấp tiền (Modal)
  const [showModal, setShowModal] = useState(false);
  const [thUid, setThUid] = useState("");
  const [thEmail, setThEmail] = useState("");
  const [thHoTen, setThHoTen] = useState("");
  const [thNgay, setThNgay] = useState("");
  const [thMoTa, setThMoTa] = useState("");
  const [thSoTien, setThSoTien] = useState("");

  // Hàm mở Modal dùng chung cho cả Admin và Staff
  const moModalThuHuong = (uid: string, email: string, hoTen: string) => {
    setThUid(uid);
    setThEmail(email);
    setThHoTen(hoTen || email);
    setThNgay(new Date().toISOString().slice(0, 10)); // Mặc định là hôm nay
    setThMoTa("");
    setThSoTien("");
    setShowModal(true);
  };

  const xacNhanCapTien = () => {
    themThuHuong(thUid, thEmail, thHoTen, thNgay, thMoTa, thSoTien);
    setShowModal(false);
  };

  const thangHienTai = new Date().toISOString().slice(0, 7);

  // Tính toán dữ liệu cho Admin
  const bangLuongNhanVien = laAdmin ? danhSachTaiKhoan
    .filter((tk: any) => tk.role !== "admin")
    .map((tk: any) => {
      const chamCongThang = danhSachChamCong.filter((cc: any) => cc.uid === tk.id && cc.ngay.startsWith(thangHienTai));
      const soLanMuon = chamCongThang.filter((cc: any) => cc.diMuon && !cc.duyetMuon).length;
      const soNgayNghi = chamCongThang.filter((cc: any) => cc.nghiPhep).length;
      const chuyenCan = soNgayNghi === 0 && soLanMuon <= 3;
      
      const thuHuongThang = danhSachThuHuong.filter((th: any) => th.uid === tk.id && th.ngay.startsWith(thangHienTai));
      const tongThuHuong = thuHuongThang.reduce((sum: number, th: any) => sum + Number(th.soTien || 0), 0);

      const luongTamTinh = (tk.luongCung || 0) + (chuyenCan ? (tk.thuongChuyenCan || 0) : 0) + tongThuHuong;
      
      return { ...tk, soLanMuon, soNgayNghi, chuyenCan, tongThuHuong, thuHuongThang, luongTamTinh };
    }) : [];

  const tongQuyLuong = laAdmin ? bangLuongNhanVien.reduce((sum: number, nv: any) => sum + nv.luongTamTinh, 0) : 0;

  // Tính toán dữ liệu cho Staff
  const thuHuongCuaToiThangNay = danhSachThuHuong.filter((th: any) => th.uid === uidCuaToi && th.ngay.startsWith(thangHienTai));
  const tongThuHuongCuaToi = thuHuongCuaToiThangNay.reduce((sum: number, th: any) => sum + Number(th.soTien || 0), 0);
  const tongLuongTamTinhCuaToi = luongCungCuaToi + (duocChuyenCan ? thuongChuyenCanCuaToi : 0) + tongThuHuongCuaToi;

  return (
    <div className="pb-24 px-2 pt-4">
      
      {/* ========================================== */}
      {/* GIAO DIỆN 1: DÀNH CHO ADMIN (SẾP) */}
      {/* ========================================== */}
      {laAdmin ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">👑 Quản lý Quỹ Lương</h2>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg shadow-gray-200/50 relative overflow-hidden mb-6">
            <div className="absolute -top-6 -right-6 p-4 opacity-10 text-[100px] transform rotate-12">🏢</div>
            <div className="text-sm font-medium mb-1 opacity-90 tracking-wide uppercase">Tổng quỹ lương phải trả (Tháng {thangHienTai.split("-").reverse().join("/")})</div>
            <div className="text-4xl font-black tracking-tight mt-1 flex items-end text-yellow-400">
              {formatTienInput(String(tongQuyLuong))} <span className="text-2xl font-bold ml-1 mb-0.5 opacity-80 text-white">đ</span>
            </div>
            <div className="text-[10px] mt-2 opacity-70 text-yellow-200">* Sếp có thể kiểm tra và xóa các khoản thụ hưởng nếu nhân viên báo cáo sai.</div>
          </div>

          <h3 className="font-bold text-gray-700 mb-3 ml-1 uppercase text-sm tracking-wider">Chi tiết từng nhân viên</h3>
          
          <div className="space-y-4">
            {bangLuongNhanVien.length === 0 ? (
              <div className="text-center text-gray-400 py-4 bg-gray-50 rounded-xl">Chưa có dữ liệu nhân viên</div>
            ) : (
              bangLuongNhanVien.map((nv: any) => (
                <div key={nv.id} className="border border-gray-100 bg-slate-50 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <div className="font-bold text-blue-700 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs">👤</div>
                      {nv.hoTen || nv.email.split('@')[0]}
                    </div>
                    <div className="text-lg font-black text-gray-800">{formatTienInput(String(nv.luongTamTinh))}đ</div>
                  </div>

                  <div className="flex justify-between text-[11px] font-medium text-gray-500 mt-1">
                    <span>Cứng: {formatTienInput(String(nv.luongCung || 0))}đ</span>
                    <span className={nv.soLanMuon > 0 ? "text-orange-500 font-bold" : ""}>Muộn: {nv.soLanMuon} lần</span>
                    <span className={nv.chuyenCan ? "text-green-600 font-bold" : "text-red-500 font-bold line-through"}>CC: +{formatTienInput(String(nv.thuongChuyenCan || 0))}đ</span>
                  </div>

                  <div className="mt-2 bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-[11px] font-bold text-gray-600 uppercase">Hoa hồng Job: <span className="text-green-600 ml-1">+{formatTienInput(String(nv.tongThuHuong))}đ</span></div>
                      <button onClick={() => moModalThuHuong(nv.id, nv.email, nv.hoTen)} className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded hover:bg-gray-200 transition-colors">+ Thêm</button>
                    </div>

                    {nv.thuHuongThang.length > 0 ? (
                      <div className="space-y-1.5 mt-2 border-t border-gray-100 pt-2">
                        {nv.thuHuongThang.map((th: any) => (
                          <div key={th.id} className="flex justify-between items-center text-xs bg-gray-50 p-1.5 rounded border border-dashed border-gray-200">
                            <div className="truncate max-w-[150px]"><span className="text-gray-400 mr-1">{th.ngay.slice(8,10)}/{th.ngay.slice(5,7)}:</span> {th.moTa}</div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-green-600">+{formatTienInput(String(th.soTien))}đ</span>
                              <button onClick={() => xoaThuHuong(th.id)} className="text-red-400 hover:text-white hover:bg-red-500 w-5 h-5 flex items-center justify-center rounded transition-colors" title="Xóa báo cáo này">🗑</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                       <div className="text-[10px] text-gray-400 italic">Nhân viên chưa báo cáo Job nào.</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (

        /* ========================================== */
        /* GIAO DIỆN 2: DÀNH CHO NHÂN VIÊN */
        /* ========================================== */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 animate-fade-in">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800">💰 Bảng lương của tôi</h2>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200/50 relative overflow-hidden mb-5">
            <div className="absolute -top-6 -right-6 p-4 opacity-10 text-[100px] transform rotate-12">💳</div>
            <div className="text-sm font-medium mb-1 opacity-90 tracking-wide uppercase">Tổng lương tạm tính (Tháng {thangHienTai.split("-").reverse().join("/")})</div>
            <div className="text-4xl font-black tracking-tight mt-1 flex items-end">
              {formatTienInput(String(tongLuongTamTinhCuaToi))} <span className="text-2xl font-bold ml-1 mb-0.5 opacity-80">đ</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center">
              <div className="text-sm font-bold text-gray-500 uppercase">Lương cơ bản</div>
              <div className="text-lg font-black text-gray-800">{formatTienInput(String(luongCungCuaToi))}đ</div>
            </div>

            <div className={`border rounded-xl p-4 flex flex-col justify-center ${soLanDiMuonThang > 3 ? "bg-red-50 border-red-200" : soLanDiMuonThang > 0 ? "bg-yellow-50 border-yellow-200" : "bg-slate-50 border-slate-100"}`}>
              <div className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${soLanDiMuonThang > 3 ? "text-red-500" : soLanDiMuonThang > 0 ? "text-yellow-600" : "text-gray-500"}`}>Đi muộn</div>
              <div className="text-lg font-black text-gray-800">{soLanDiMuonThang} <span className="text-sm font-medium text-gray-400">/ 3 lần</span></div>
            </div>

            <div className={`border rounded-xl p-4 flex flex-col justify-center ${soNgayNghiThang > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100"}`}>
              <div className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${soNgayNghiThang > 0 ? "text-red-500" : "text-gray-500"}`}>Nghỉ phép</div>
              <div className="text-lg font-black text-gray-800">{soNgayNghiThang} <span className="text-sm font-medium text-gray-400">/ 2 ngày</span></div>
            </div>
          </div>

          <div className={`border rounded-xl p-4 flex justify-between items-center mt-3 mb-4 ${duocChuyenCan ? "bg-green-50 border-green-200" : "bg-red-50 border-red-100"}`}>
            <div>
              <div className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${duocChuyenCan ? "text-green-600" : "text-red-500"}`}>Thưởng chuyên cần</div>
              <div className={`text-sm font-bold flex items-center gap-1 ${duocChuyenCan ? "text-green-700" : "text-red-600"}`}>{duocChuyenCan ? "✅ Đạt điều kiện" : "❌ Vi phạm nội quy"}</div>
            </div>
            <div className={`text-lg flex flex-col items-end ${duocChuyenCan ? "font-black text-green-700" : "text-red-400"}`}>
              <span className={!duocChuyenCan ? "line-through opacity-70" : ""}>+{formatTienInput(String(thuongChuyenCanCuaToi))}đ</span>
            </div>
          </div>

          {/* VÙNG THỤ HƯỞNG DÀNH CHO NHÂN VIÊN */}
          <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4">
            <div className="flex justify-between items-center border-b border-blue-200 pb-3 mb-3">
              <div>
                <h3 className="font-bold text-blue-800 uppercase text-xs tracking-wide">🏆 Hoa hồng Job tháng này</h3>
                <div className="font-black text-green-600 text-xl mt-0.5">+{formatTienInput(String(tongThuHuongCuaToi))}đ</div>
              </div>
              {/* Nút báo cáo Job cho nhân viên */}
              <button 
                onClick={() => moModalThuHuong(uidCuaToi, hoSoCuaToi?.email, hoSoCuaToi?.hoTen)} 
                className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 active:scale-95 transition-all flex items-center gap-1"
              >
                <span>+ Báo cáo Job</span>
              </button>
            </div>

            {thuHuongCuaToiThangNay.length === 0 ? (
              <div className="text-center text-gray-500 text-xs py-4 bg-white rounded-lg border border-dashed border-blue-200">
                Bạn chưa báo cáo hoàn thành Job nào.
              </div>
            ) : (
              <div className="space-y-2 mt-3">
                {thuHuongCuaToiThangNay.map((th: any) => (
                  <div key={th.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-sm hover:border-blue-200 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{th.moTa}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">🗓 Ngày tạo: {th.ngay.split("-").reverse().join("/")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-green-600">+{formatTienInput(String(th.soTien))}đ</span>
                      {/* Cho phép nhân viên xóa nếu nhập sai */}
                      <button onClick={() => xoaThuHuong(th.id)} className="text-gray-300 hover:text-red-500 transition-colors" title="Xóa báo cáo này">🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL NHẬP LIỆU (Dùng chung cho cả Admin & Staff) */}
      {/* ========================================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold mb-1 text-gray-800">
              {laAdmin ? "Cộng tiền thụ hưởng" : "Báo cáo hoàn thành Job"}
            </h3>
            
            <p className="text-sm text-gray-500 mb-4 pb-3 border-b border-gray-100">
              Nhân viên nhận: <b className="text-blue-600">{thHoTen}</b>
            </p>
            
            <div className="grid gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase ml-1 block mb-1">Ngày hoàn thành</label>
                <input type="date" value={thNgay} onChange={(e) => setThNgay(e.target.value)} className="border border-gray-200 p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none" />
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase ml-1 block mb-1">Tên công việc (Job)</label>
                <input type="text" placeholder="VD: Makeup cô dâu nhà A..." value={thMoTa} onChange={(e) => setThMoTa(e.target.value)} className="border border-gray-200 p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none" />
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase ml-1 block mb-1">Số tiền thụ hưởng</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" placeholder="VD: 300.000" value={thSoTien} onChange={(e) => setThSoTien(formatTienInput(e.target.value))} className="border border-gray-200 p-3 rounded-xl w-full bg-white pr-8 font-black text-green-600 text-lg focus:ring-2 focus:ring-blue-400 outline-none" />
                  <span className="absolute right-4 top-3.5 text-gray-400 font-medium">đ</span>
                </div>
              </div>

              {!laAdmin && (
                <div className="text-[10px] text-orange-600 bg-orange-50 p-2 rounded-lg mt-1 italic text-center">
                  * Vui lòng điền đúng sự thật. Quản lý sẽ kiểm tra lại các khoản này vào cuối tháng.
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <button onClick={xacNhanCapTien} className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200/50 active:scale-95 transition-all">
                  Lưu báo cáo
                </button>
                <button onClick={() => setShowModal(false)} className="px-5 py-3.5 bg-gray-100 font-bold text-gray-600 rounded-xl hover:bg-gray-200 active:scale-95 transition-all">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}