export default function TabLuong({
  luongCungCuaToi,
  soLanDiMuonThang,
  soNgayNghiThang,
  duocChuyenCan,
  thuongChuyenCanCuaToi
}: any) {

  // Tạm thời để hàm format tiền ở đây để file này độc lập
  function formatTienInput(value: string) {
    const so = value.replace(/\D/g, "");
    return so.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-xl font-bold mb-4">💰 Lương của tôi</h2>
      
      <div className="space-y-3">
        <div className="border rounded p-3">
          <div className="text-gray-500 text-sm">Lương cứng</div>
          <div className="font-bold text-lg">{formatTienInput(String(luongCungCuaToi))}đ</div>
        </div>

        <div className="border rounded p-3">
          <div className="text-gray-500 text-sm">Đi muộn</div>
          <div className="font-bold text-lg">{soLanDiMuonThang} / 3 lần</div>
        </div>

        <div className="border rounded p-3">
          <div className="text-gray-500 text-sm">Nghỉ phép</div>
          <div className="font-bold text-lg">{soNgayNghiThang} / 2 ngày</div>
        </div>

        <div className="border rounded p-3">
          <div className="text-gray-500 text-sm">Chuyên cần</div>
          <div className={`font-bold text-lg ${duocChuyenCan ? "text-green-600" : "text-red-600"}`}>
            {duocChuyenCan ? "Đủ điều kiện" : "Không đủ điều kiện"}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Thưởng: {duocChuyenCan ? formatTienInput(String(thuongChuyenCanCuaToi)) : "0"}đ
          </div>
        </div>

        <div className="border rounded p-3 bg-green-50">
          <div className="text-gray-500 text-sm">Lương tạm tính</div>
          <div className="font-bold text-xl text-green-700">
            {formatTienInput(String(luongCungCuaToi + (duocChuyenCan ? thuongChuyenCanCuaToi : 0)))}đ
          </div>
        </div>
      </div>
    </div>
  );
}