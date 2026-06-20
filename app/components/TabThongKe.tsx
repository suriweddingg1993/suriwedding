export default function TabThongKe({
  thangThongKe,
  setThangThongKe,
  lichTrongThang,
  tongThuNhapLich,
  tongThuNhapPhatSinh,
  tongThuNhap
}: any) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-xl font-bold mb-4">📊 Thống kê doanh thu</h2>

      <input 
        type="month" 
        value={thangThongKe} 
        onChange={(e) => setThangThongKe(e.target.value)} 
        className="border p-2 rounded mb-3" 
      />

      <div>Tổng lịch trong tháng: {lichTrongThang.length}</div>

      <div>
        Doanh thu lịch chụp: <b>{tongThuNhapLich.toLocaleString("vi-VN")}đ</b>
      </div>

      <div>
        Doanh thu phát sinh: <b>{tongThuNhapPhatSinh.toLocaleString("vi-VN")}đ</b>
      </div>

      <div className="text-green-600 font-bold text-xl mt-3">
        Tổng doanh thu: {tongThuNhap.toLocaleString("vi-VN")}đ
      </div>

      <div className="text-center text-xs text-gray-400 mt-8 mb-2">
        Phiên bản 1.0.0
      </div>
    </div>
  );
}