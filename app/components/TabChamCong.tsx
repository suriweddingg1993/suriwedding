import NutCopy from "./NutCopy";

export default function TabChamCong({
  homNay,
  BAN_KINH_CHO_PHEP,
  khoangCach,
  chamCongHomNay,
  chamCong,
  dangLayViTri,
  laAdmin,
  chamCongHienThi
}: any) {
  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">⏰ Chấm công GPS</h2>

        <div className="mb-3">
          Hôm nay: <b>{homNay()}</b>
        </div>

        <div className="mb-3 text-sm text-gray-600">
          Chỉ chấm công khi ở trong bán kính {BAN_KINH_CHO_PHEP}m quanh cửa hàng.
        </div>

        {khoangCach !== null && (
          <div className="mb-3">
            Khoảng cách hiện tại: <b>{khoangCach}m</b>
          </div>
        )}

        <div className="mb-4">
          <div>Check In: {chamCongHomNay?.checkIn || "Chưa có"}</div>
          <div>Check Out: {chamCongHomNay?.checkOut || "Chưa có"}</div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => chamCong("checkIn")} 
            disabled={dangLayViTri} 
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {dangLayViTri ? "Đang lấy vị trí..." : "Check In"}
          </button>

          <button 
            onClick={() => chamCong("checkOut")} 
            disabled={dangLayViTri} 
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {dangLayViTri ? "Đang lấy vị trí..." : "Check Out"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">
          {laAdmin ? "Lịch sử chấm công toàn bộ" : "Lịch sử chấm công"}
        </h2>

        <div className="space-y-2">
          {[...chamCongHienThi]
            .sort((a, b) => b.ngay.localeCompare(a.ngay))
            .map((item) => (
              <div key={item.id} className="border rounded p-3">
                <div className="font-semibold flex items-center gap-2">
                  <span>{item.ngay} • {item.email}</span>
                  {/* NÚT COPY ĐƯỢC GẮN VÀO EMAIL */}
                  {laAdmin && <NutCopy textCanCopy={item.email} />}
                </div>
                <div className="mt-1">Check In: {item.checkIn || "Chưa có"}</div>
                <div>Check Out: {item.checkOut || "Chưa có"}</div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}