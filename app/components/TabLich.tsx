import NutCopy from "./NutCopy";

export default function TabLich({
  dangSua,
  ngay, setNgay,
  gio, setGio,
  tenKhach, setTenKhach,
  soDienThoai, setSoDienThoai,
  theLoai, setTheLoai,
  theLoaiKhac, setTheLoaiKhac,
  goiChup, setGoiChup,
  giaTien, setGiaTien,
  formatTienInput,
  themHoacSuaLich,
  resetForm,
  timNgay, setTimNgay,
  tuKhoa, setTuKhoa,
  lichTheoNgay,
  laAdmin,
  capNhatTrangThai,
  suaLich,
  xoaLich
}: any) {
  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">
          {dangSua ? "Sửa lịch chụp" : "Thêm lịch chụp"}
        </h2>

        <div className="grid gap-3">
          <input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} className="border p-2 rounded" />
          <input type="time" value={gio} onChange={(e) => setGio(e.target.value)} className="border p-2 rounded" />
          <input type="text" placeholder="Tên khách" value={tenKhach} onChange={(e) => setTenKhach(e.target.value)} className="border p-2 rounded" />
          <input type="text" placeholder="Số điện thoại" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} className="border p-2 rounded" />

          <select
            value={theLoai}
            onChange={(e) => {
              setTheLoai(e.target.value);
              if (e.target.value !== "Khác") setTheLoaiKhac("");
            }}
            className="border p-2 rounded"
          >
            <option value="">-- Chọn thể loại --</option>
            <option value="Ảnh cưới">Ảnh cưới</option>
            <option value="Baby">Baby</option>
            <option value="Beauty">Beauty</option>
            <option value="Gia đình">Gia đình</option>
            <option value="Bầu">Bầu</option>
            <option value="Kỷ yếu">Kỷ yếu</option>
            <option value="Khác">➕ Thêm thể loại khác</option>
          </select>

          {theLoai === "Khác" && (
            <input type="text" placeholder="Nhập thể loại mới" value={theLoaiKhac} onChange={(e) => setTheLoaiKhac(e.target.value)} className="border p-2 rounded" />
          )}

          <input type="text" placeholder="Gói chụp" value={goiChup} onChange={(e) => setGoiChup(e.target.value)} className="border p-2 rounded" />
          
          <div>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Giá tiền"
                value={giaTien}
                onChange={(e) => setGiaTien(formatTienInput(e.target.value))}
                className="border p-2 rounded w-full pr-10"
              />
              <span className="absolute right-3 top-2 text-gray-500">đ</span>
            </div>

            {giaTien && (
              <div className="text-sm text-green-600 mt-1">
                Giá trị: {giaTien}đ
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={themHoacSuaLich} className="bg-blue-600 text-white p-2 rounded flex-1">
              {dangSua ? "Lưu thay đổi" : "Thêm lịch"}
            </button>

            {dangSua && (
              <button onClick={resetForm} className="bg-gray-500 text-white p-2 rounded">
                Hủy
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Tìm lịch</h2>

        <div className="grid gap-3 md:grid-cols-3">
          <input type="date" value={timNgay} onChange={(e) => setTimNgay(e.target.value)} className="border p-2 rounded" />
          <input type="text" placeholder="Tìm tên khách hoặc SĐT" value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} className="border p-2 rounded" />

          <button
            onClick={() => {
              setTimNgay("");
              setTuKhoa("");
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Xem tất cả
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {Object.entries(lichTheoNgay)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([ngay, dsLich]: any) => (
            <div key={ngay} className="mb-6">
              <h2 className="text-xl font-bold mb-3">
                📅 {ngay} ({dsLich.length} lịch)
              </h2>

              <div className="space-y-2">
                {[...dsLich]
                  .sort((a, b) => a.gio.localeCompare(b.gio))
                  .map((item) => (
                    <div key={item.id} className="border rounded p-3 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                      <div>
                        <div className="font-semibold">🕒 {item.gio} | {item.theLoai}</div>
                        <div>{item.tenKhach}</div>
                        
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          📞 {item.soDienThoai || "Chưa có SĐT"}
                          {/* NÚT COPY ĐƯỢC GẮN VÀO SĐT Ở ĐÂY */}
                          {item.soDienThoai && <NutCopy textCanCopy={item.soDienThoai} />}
                        </div>

                        <div className="text-sm text-gray-600 mt-1">
                          📦 {item.goiChup || "Chưa có gói"}
                          {laAdmin && <> • {Number(item.giaTien || 0).toLocaleString("vi-VN")}đ</>}
                        </div>

                        <div className="mt-2">
                          <select
                            value={item.trangThai || "Chưa liên hệ"}
                            onChange={(e) => capNhatTrangThai(item.id, e.target.value)}
                            className="border p-1 rounded text-sm"
                          >
                            <option value="Chưa liên hệ">Chưa liên hệ</option>
                            <option value="Đã liên hệ">Đã liên hệ</option>
                            <option value="Đã cọc">Đã cọc</option>
                            <option value="Đã chụp">Đã chụp</option>
                            <option value="Đã giao ảnh">Đã giao ảnh</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => suaLich(item)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                          Sửa
                        </button>

                        {laAdmin && (
                          <button onClick={() => xoaLich(item.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                            Xóa
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </>
  );
}