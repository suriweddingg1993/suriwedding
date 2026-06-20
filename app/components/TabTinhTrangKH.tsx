import NutCopy from "./NutCopy";

export default function TabTinhTrangKH({
  quaHan,
  canTraHomNay,
  dangThue,
  danhDauDaTraDo
}: any) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-xl font-bold mb-4">📋 Tình trạng khách hàng</h2>

      <div className="grid gap-4 mb-4 md:grid-cols-3">
        <div className="border rounded-lg p-4 bg-red-50">
          <div className="text-2xl font-bold text-red-600">{quaHan.length}</div>
          <div className="font-semibold">🔴 Quá hạn trả đồ</div>
        </div>

        <div className="border rounded-lg p-4 bg-yellow-50">
          <div className="text-2xl font-bold text-yellow-600">{canTraHomNay.length}</div>
          <div className="font-semibold">🟡 Trả hôm nay</div>
        </div>

        <div className="border rounded-lg p-4 bg-green-50">
          <div className="text-2xl font-bold text-green-600">{dangThue.length}</div>
          <div className="font-semibold">🟢 Đang thuê</div>
        </div>
      </div>

      <div className="mt-6 border rounded-lg p-4">
        <h3 className="font-bold text-lg mb-3">📞 Khách cần liên hệ</h3>

        {quaHan.length === 0 && canTraHomNay.length === 0 ? (
          <div className="text-gray-500">Không có khách cần liên hệ</div>
        ) : (
          <div className="space-y-2">
            {[...quaHan, ...canTraHomNay].map((ps) => (
              <div
                key={ps.id}
                className={`border rounded p-3 ${
                  quaHan.includes(ps) ? "bg-red-50" : "bg-yellow-50"
                }`}
              >
                <div className="font-semibold">{ps.tenKhach || "Không tên"}</div>

                <div className="flex items-center gap-2 mt-1">
                  <span>{ps.soDienThoai || "-"}</span>

                  {/* NÚT COPY VẠN NĂNG ĐƯỢC GẮN VÀO ĐÂY */}
                  {ps.soDienThoai && <NutCopy textCanCopy={ps.soDienThoai} />}

                  {ps.soDienThoai && (
                    <a
                      href={`tel:${ps.soDienThoai}`}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      📞 Gọi
                    </a>
                  )}

                  <button
                    onClick={() => danhDauDaTraDo(ps.id!)}
                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  >
                    ✓ Đã trả đồ
                  </button>
                </div>

                <div className={`mt-2 ${quaHan.includes(ps) ? "text-red-600" : "text-yellow-700"}`}>
                  {quaHan.includes(ps) ? "Quá hạn trả đồ" : "Trả hôm nay"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}