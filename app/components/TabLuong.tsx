export default function TabLuong({
  luongCungCuaToi,
  soLanDiMuonThang,
  soNgayNghiThang,
  duocChuyenCan,
  thuongChuyenCanCuaToi,
  laAdmin,
  danhSachTaiKhoan = [],
  danhSachChamCong = []
}: any) {

  // Hàm format tiền tệ
  function formatTienInput(value: string) {
    const so = value.replace(/\D/g, "");
    return so.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // ==========================================
  // GIAO DIỆN 1: DÀNH CHO ADMIN (SẾP)
  // Tính tổng quỹ lương của tất cả nhân viên
  // ==========================================
  if (laAdmin) {
    const thangHienTai = new Date().toISOString().slice(0, 7);
    
    // Tính lương cho từng nhân viên
    const bangLuongNhanVien = danhSachTaiKhoan
      .filter((tk: any) => tk.role !== "admin")
      .map((tk: any) => {
        const chamCongThang = danhSachChamCong.filter((cc: any) => cc.uid === tk.id && cc.ngay.startsWith(thangHienTai));
        const soLanMuon = chamCongThang.filter((cc: any) => cc.diMuon && !cc.duyetMuon).length;
        const soNgayNghi = chamCongThang.filter((cc: any) => cc.nghiPhep).length;
        const chuyenCan = soNgayNghi === 0 && soLanMuon <= 3;
        const luongTamTinh = (tk.luongCung || 0) + (chuyenCan ? (tk.thuongChuyenCan || 0) : 0);
        
        return { ...tk, soLanMuon, soNgayNghi, chuyenCan, luongTamTinh };
      });

    const tongQuyLuong = bangLuongNhanVien.reduce((sum: number, nv: any) => sum + nv.luongTamTinh, 0);

    return (
      <div className="pb-24 px-2 pt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 animate-fade-in">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800">
            👑 Quản lý Quỹ Lương
          </h2>

          <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg shadow-gray-200/50 relative overflow-hidden mb-6">
            <div className="absolute -top-6 -right-6 p-4 opacity-10 text-[100px] transform rotate-12">🏢</div>
            <div className="text-sm font-medium mb-1 opacity-90 tracking-wide uppercase">
              Tổng quỹ lương phải trả (Tháng {thangHienTai.split("-").reverse().join("/")})
            </div>
            <div className="text-4xl font-black tracking-tight mt-1 flex items-end text-yellow-400">
              {formatTienInput(String(tongQuyLuong))} <span className="text-2xl font-bold ml-1 mb-0.5 opacity-80 text-white">đ</span>
            </div>
            <div className="text-[10px] mt-2 opacity-70">
              * Hệ thống tự động tính toán dựa trên dữ liệu chấm công
            </div>
          </div>

          <h3 className="font-bold text-gray-700 mb-3 ml-1 uppercase text-sm tracking-wider">Chi tiết từng nhân viên</h3>
          
          <div className="space-y-3">
            {bangLuongNhanVien.length === 0 ? (
              <div className="text-center text-gray-400 py-4 bg-gray-50 rounded-xl">Chưa có dữ liệu nhân viên</div>
            ) : (
              bangLuongNhanVien.map((nv: any) => (
                <div key={nv.id} className="border border-gray-100 bg-slate-50 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <div className="font-bold text-blue-700">{nv.email.split('@')[0]}</div>
                    <div className="text-lg font-black text-gray-800">{formatTienInput(String(nv.luongTamTinh))}đ</div>
                  </div>
                  <div className="flex justify-between text-[11px] font-medium text-gray-500 mt-1">
                    <span>Lương cứng: {formatTienInput(String(nv.luongCung || 0))}đ</span>
                    <span className={nv.soLanMuon > 0 ? "text-orange-500 font-bold" : ""}>Muộn: {nv.soLanMuon} lần</span>
                    <span className={nv.soNgayNghi > 0 ? "text-red-500 font-bold" : ""}>Nghỉ: {nv.soNgayNghi} ngày</span>
                    <span className={nv.chuyenCan ? "text-green-600 font-bold" : "text-red-500 font-bold line-through"}>
                      +{formatTienInput(String(nv.thuongChuyenCan || 0))}đ
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // GIAO DIỆN 2: DÀNH CHO NHÂN VIÊN (Như cũ)
  // ==========================================
  const tongLuongTamTinh = luongCungCuaToi + (duocChuyenCan ? thuongChuyenCanCuaToi : 0);

  return (
    <div className="pb-24 px-2 pt-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 animate-fade-in">
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800">
          💰 Bảng lương của tôi
        </h2>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200/50 relative overflow-hidden mb-5">
          <div className="absolute -top-6 -right-6 p-4 opacity-10 text-[100px] transform rotate-12">💳</div>
          <div className="text-sm font-medium mb-1 opacity-90 tracking-wide uppercase">
            Tổng lương tạm tính
          </div>
          <div className="text-4xl font-black tracking-tight mt-1 flex items-end">
            {formatTienInput(String(tongLuongTamTinh))} <span className="text-2xl font-bold ml-1 mb-0.5 opacity-80">đ</span>
          </div>
          <div className="text-[10px] mt-2 opacity-70">
            * Cập nhật theo thời gian thực dựa trên chấm công
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center">
            <div className="text-sm font-bold text-gray-500 uppercase">Lương cơ bản</div>
            <div className="text-lg font-black text-gray-800">
              {formatTienInput(String(luongCungCuaToi))}đ
            </div>
          </div>

          <div className={`border rounded-xl p-4 flex flex-col justify-center ${
            soLanDiMuonThang > 3 ? "bg-red-50 border-red-200" : 
            soLanDiMuonThang > 0 ? "bg-yellow-50 border-yellow-200" : "bg-slate-50 border-slate-100"
          }`}>
            <div className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${
              soLanDiMuonThang > 3 ? "text-red-500" : 
              soLanDiMuonThang > 0 ? "text-yellow-600" : "text-gray-500"
            }`}>
              Đi muộn
            </div>
            <div className="text-lg font-black text-gray-800">
              {soLanDiMuonThang} <span className="text-sm font-medium text-gray-400">/ 3 lần</span>
            </div>
          </div>

          <div className={`border rounded-xl p-4 flex flex-col justify-center ${
            soNgayNghiThang > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100"
          }`}>
            <div className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${
              soNgayNghiThang > 0 ? "text-red-500" : "text-gray-500"
            }`}>
              Nghỉ phép
            </div>
            <div className="text-lg font-black text-gray-800">
              {soNgayNghiThang} <span className="text-sm font-medium text-gray-400">/ 2 ngày</span>
            </div>
          </div>
        </div>

        <div className={`border rounded-xl p-4 flex justify-between items-center mt-3 ${
          duocChuyenCan ? "bg-green-50 border-green-200" : "bg-red-50 border-red-100"
        }`}>
          <div>
            <div className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${
              duocChuyenCan ? "text-green-600" : "text-red-500"
            }`}>
              Thưởng chuyên cần
            </div>
            <div className={`text-sm font-bold flex items-center gap-1 ${
              duocChuyenCan ? "text-green-700" : "text-red-600"
            }`}>
              {duocChuyenCan ? "✅ Đạt điều kiện" : "❌ Vi phạm nội quy"}
            </div>
          </div>
          
          <div className={`text-lg flex flex-col items-end ${
            duocChuyenCan ? "font-black text-green-700" : "text-red-400"
          }`}>
            <span className={!duocChuyenCan ? "line-through opacity-70" : ""}>
              +{formatTienInput(String(thuongChuyenCanCuaToi))}đ
            </span>
            {!duocChuyenCan && <span className="text-[10px] text-red-500 font-bold mt-0.5">Mất thưởng</span>}
          </div>
        </div>

      </div>
    </div>
  );
}