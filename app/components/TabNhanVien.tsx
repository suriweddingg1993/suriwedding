import NutCopy from "./NutCopy";

// Khai báo kiểu dữ liệu cho quyền nhân viên để không bị lỗi đỏ
type Role = "admin" | "staff";

export default function TabNhanVien({
  uidNhanVien,
  setUidNhanVien,
  emailNhanVien,
  setEmailNhanVien,
  hoTenNhanVien,
  setHoTenNhanVien,
  soDienThoaiNhanVien,
  setSoDienThoaiNhanVien,
  luongCungNhanVien,
  setLuongCungNhanVien,
  thuongChuyenCanNhanVien,
  setThuongChuyenCanNhanVien,
  quyenNhanVien,
  setQuyenNhanVien,
  taoHoSoNhanVien,
  dangSuaNhanVien,
  danhSachTaiKhoan,
  laAdmin,
  suaHoSoNhanVien,
  formatTienInput
}: any) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-xl font-bold mb-4">👥 Quản lý tài khoản</h2>

      <div className="bg-yellow-50 border border-yellow-300 p-3 rounded mb-4 text-sm">
        Bước tạo nhân viên: vào Firebase Authentication tạo tài khoản trước, copy UID của tài khoản đó, rồi dán UID vào đây.
      </div>

      <div className="grid gap-3 md:grid-cols-4 mb-4">
        <input type="text" placeholder="UID nhân viên" value={uidNhanVien} onChange={(e) => setUidNhanVien(e.target.value)} className="border p-2 rounded" />
        <input type="email" placeholder="Email nhân viên" value={emailNhanVien} onChange={(e) => setEmailNhanVien(e.target.value)} className="border p-2 rounded" />
        <input type="text" placeholder="Họ tên" value={hoTenNhanVien} onChange={(e) => setHoTenNhanVien(e.target.value)} className="border p-2 rounded" />
        <input type="text" placeholder="Số điện thoại" value={soDienThoaiNhanVien} onChange={(e) => setSoDienThoaiNhanVien(e.target.value)} className="border p-2 rounded" />
        
        <input type="text" placeholder="Lương cứng" value={luongCungNhanVien} onChange={(e) => setLuongCungNhanVien(formatTienInput(e.target.value))} className="border p-2 rounded" />
        <input type="text" placeholder="Thưởng chuyên cần" value={thuongChuyenCanNhanVien} onChange={(e) => setThuongChuyenCanNhanVien(formatTienInput(e.target.value))} className="border p-2 rounded" />
        
        <select value={quyenNhanVien} onChange={(e) => setQuyenNhanVien(e.target.value as Role)} className="border p-2 rounded">
          <option value="staff">Nhân viên</option>
          <option value="admin">Admin</option>
        </select>

        <button onClick={taoHoSoNhanVien} className="bg-green-600 text-white px-4 py-2 rounded">
          {dangSuaNhanVien ? "💾 Cập nhật hồ sơ" : "Tạo hồ sơ"}
        </button>
      </div>

      <div className="space-y-2">
        {danhSachTaiKhoan.map((tk: any) => (
          <div key={tk.id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <div className="font-semibold flex items-center gap-2">
                <span>{tk.hoTen || tk.email}</span>
                {tk.soDienThoai && (
                  <>
                    <span className="text-gray-400">·</span>
                    <a href={`tel:${tk.soDienThoai}`} className="text-blue-600 font-medium">
                      📞 {tk.soDienThoai}
                    </a>
                    {/* NÚT COPY ĐƯỢC GẮN VÀO SĐT */}
                    <NutCopy textCanCopy={tk.soDienThoai} />
                  </>
                )}
              </div>

              <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                {tk.email}
                {/* NÚT COPY ĐƯỢC GẮN VÀO EMAIL */}
                <NutCopy textCanCopy={tk.email} />
              </div>

              {laAdmin && (
                <div className="text-sm text-gray-600 mt-1">
                  Lương cứng: {formatTienInput(String(tk.luongCung || 0))}đ · Chuyên cần: {formatTienInput(String(tk.thuongChuyenCan || 0))}đ
                </div>
              )}
            </div>

            <div className="flex gap-2 items-center">
              {laAdmin && (
                <button onClick={() => suaHoSoNhanVien(tk)} className="border px-3 py-2 rounded">
                  ✏️ Sửa
                </button>
              )}
              {/* LƯU Ý: Nếu code cũ của bạn có nút XÓA ở đây, hãy báo để mình thêm vào nhé */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}