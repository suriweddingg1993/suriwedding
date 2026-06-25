import NutCopy from "./NutCopy";
import { Role, TaiKhoan } from "../../types";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import toast from "react-hot-toast";

interface TabNhanVienProps {
  uidNhanVien: string; setUidNhanVien: (val: string) => void;
  emailNhanVien: string; setEmailNhanVien: (val: string) => void;
  hoTenNhanVien: string; setHoTenNhanVien: (val: string) => void;
  soDienThoaiNhanVien: string; setSoDienThoaiNhanVien: (val: string) => void;
  luongCungNhanVien: string; setLuongCungNhanVien: (val: string) => void;
  thuongChuyenCanNhanVien: string; setThuongChuyenCanNhanVien: (val: string) => void;
  quyenNhanVien: Role; setQuyenNhanVien: (val: Role) => void;
  taoHoSoNhanVien: () => void;
  dangSuaNhanVien: string | null;
  danhSachTaiKhoan: TaiKhoan[];
  laAdmin: boolean;
  suaHoSoNhanVien: (tk: TaiKhoan) => void;
  formatTienInput: (val: string) => string;
}

export default function TabNhanVien({
  uidNhanVien, setUidNhanVien, emailNhanVien, setEmailNhanVien,
  hoTenNhanVien, setHoTenNhanVien, soDienThoaiNhanVien, setSoDienThoaiNhanVien,
  luongCungNhanVien, setLuongCungNhanVien, thuongChuyenCanNhanVien, setThuongChuyenCanNhanVien,
  quyenNhanVien, setQuyenNhanVien, taoHoSoNhanVien, dangSuaNhanVien,
  danhSachTaiKhoan, laAdmin, suaHoSoNhanVien, formatTienInput
}: TabNhanVienProps) {

  // HÀM XÓA NHÂN VIÊN VÀ BẢO VỆ ADMIN
  const xoaNhanVienTaiKhoan = async (id: string, email: string) => {
    if (email === "dangngocan93@gmail.com") {
      toast.error("⚠️ KHÔNG ĐƯỢC PHÉP: Đây là tài khoản Quản trị Gốc!");
      return;
    }
    const dongY = confirm(`CẢNH BÁO: Chắc chắn muốn xóa hồ sơ nhân viên ${email}?\nHành động này sẽ không thể khôi phục!`);
    if (dongY) {
      try {
        await deleteDoc(doc(db, "users", id));
        toast.success("Đã xóa nhân viên vĩnh viễn!");
      } catch(e) { toast.error("Lỗi xóa nhân viên!"); }
    }
  };

  return (
    <div className="pb-24 px-2 pt-4">
      
      <div className="flex items-center justify-between mb-4 pl-1">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          👥 Quản lý nhân sự
        </h2>
        <div className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
          {danhSachTaiKhoan.length} tài khoản
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 shadow-sm flex gap-3 items-start">
        <span className="text-xl">💡</span>
        <div>
          <h4 className="font-bold text-blue-800 text-sm mb-1">Quy trình tạo nhân viên mới:</h4>
          <p className="text-xs text-blue-700 font-medium">
            1. Vào trang quản trị Firebase Authentication tạo tài khoản (Email & Mật khẩu).<br/>
            2. Copy dải mã <b className="bg-blue-200 px-1 rounded">UID</b> của tài khoản vừa tạo.<br/>
            3. Dán UID và điền các thông tin bên dưới để hoàn tất hồ sơ.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
          {dangSuaNhanVien ? "✏️ Cập nhật hồ sơ nhân viên" : "✨ Thêm hồ sơ nhân viên mới"}
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 grid gap-3 md:grid-cols-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Mã UID (Firebase)</label>
              <input type="text" placeholder="Ví dụ: aB3cD5eF..." value={uidNhanVien} onChange={(e) => setUidNhanVien(e.target.value)} disabled={!!dangSuaNhanVien} className="border border-gray-200 p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-100 disabled:text-gray-400" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Tài khoản Email</label>
              <input type="email" placeholder="nhanvien@gmail.com" value={emailNhanVien} onChange={(e) => setEmailNhanVien(e.target.value)} disabled={!!dangSuaNhanVien} className="border border-gray-200 p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-100 disabled:text-gray-400" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Họ và tên</label>
            <input type="text" placeholder="Nguyễn Văn A" value={hoTenNhanVien} onChange={(e) => setHoTenNhanVien(e.target.value)} className="border border-gray-200 p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Số điện thoại</label>
            <input type="text" placeholder="0987..." value={soDienThoaiNhanVien} onChange={(e) => setSoDienThoaiNhanVien(e.target.value)} className="border border-gray-200 p-3 rounded-xl w-full bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none" />
          </div>

          <div className="relative">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Lương cứng</label>
            <input type="text" inputMode="numeric" value={luongCungNhanVien} onChange={(e) => setLuongCungNhanVien(formatTienInput(e.target.value))} className="border border-gray-200 p-3 rounded-xl w-full bg-white text-gray-900 font-bold pr-8 focus:ring-2 focus:ring-blue-400 outline-none" />
            <span className="absolute right-4 top-[30px] text-gray-400 font-medium">đ</span>
          </div>
          <div className="relative">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Thưởng chuyên cần</label>
            <input type="text" inputMode="numeric" value={thuongChuyenCanNhanVien} onChange={(e) => setThuongChuyenCanNhanVien(formatTienInput(e.target.value))} className="border border-gray-200 p-3 rounded-xl w-full bg-white text-gray-900 font-bold pr-8 focus:ring-2 focus:ring-blue-400 outline-none" />
            <span className="absolute right-4 top-[30px] text-gray-400 font-medium">đ</span>
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-1 mb-1 block">Cấp quyền hệ thống</label>
            <select 
              value={quyenNhanVien} 
              onChange={(e) => setQuyenNhanVien(e.target.value as Role)} 
              disabled={dangSuaNhanVien !== null && emailNhanVien === "dangngocan93@gmail.com"} // BẢO VỆ ADMIN: KHÔNG CHO HẠ QUYỀN
              className="border border-gray-200 p-3 rounded-xl w-full bg-white text-gray-900 font-bold focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="staff">Nhân viên (Chỉ xem lịch, tạo phát sinh, chấm công)</option>
              <option value="admin">Quản lý / Admin (Toàn quyền)</option>
            </select>
          </div>

          <div className="md:col-span-2 mt-2">
            <button 
              onClick={taoHoSoNhanVien} 
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98] ${
                dangSuaNhanVien ? "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-200/50" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200/50"
              }`}
            >
              {dangSuaNhanVien ? "💾 LƯU CẬP NHẬT" : "✨ TẠO HỒ SƠ MỚI"}
            </button>
            {dangSuaNhanVien && (
               <div className="text-center mt-3">
                 <button onClick={() => window.location.reload()} className="text-sm text-gray-500 font-medium hover:text-gray-700 underline">
                   Hủy chỉnh sửa
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="font-bold text-gray-800 mb-4 ml-1">📋 Danh sách nhân sự</h3>
      <div className="space-y-4">
        {danhSachTaiKhoan.map((tk: TaiKhoan) => (
          <div key={tk.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
            
            <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  tk.role === "admin" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                }`}>
                  {tk.hoTen ? tk.hoTen.charAt(0).toUpperCase() : "👤"}
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-base">{tk.hoTen || "Chưa cập nhật tên"}</div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit mt-1 uppercase ${
                    tk.role === "admin" ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                  }`}>
                    {tk.role === "admin" ? "Quản lý / Admin" : "Nhân viên"}
                  </div>
                </div>
              </div>

              {laAdmin && (
                <div className="flex flex-col gap-2">
                  <button onClick={() => suaHoSoNhanVien(tk)} className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-yellow-50 hover:text-yellow-600 transition-colors border border-gray-100" title="Sửa thông tin">✏️</button>
                  {/* NÚT XÓA */}
                  <button onClick={() => xoaNhanVienTaiKhoan(tk.id, tk.email)} className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors border border-gray-100" title="Xóa nhân viên">🗑</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 font-medium mb-3">
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                <span>📧</span> <span className="truncate max-w-[200px]">{tk.email}</span>
                <NutCopy textCanCopy={tk.email} />
              </div>
              
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                <span>📞</span> 
                {tk.soDienThoai ? (
                  <>
                    <a href={`tel:${tk.soDienThoai}`} className="text-blue-600 hover:underline">{tk.soDienThoai}</a>
                    <NutCopy textCanCopy={tk.soDienThoai} />
                  </>
                ) : (
                  <span className="text-gray-400 italic">Chưa có SĐT</span>
                )}
              </div>
            </div>

            {laAdmin && (
              <div className="flex justify-between items-center bg-green-50 border border-green-100 rounded-xl p-3 mt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-green-700 uppercase">Lương cứng</span>
                  <span className="font-black text-green-800">{formatTienInput(String(tk.luongCung || 0))}đ</span>
                </div>
                <div className="h-6 w-px bg-green-200"></div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-green-700 uppercase">Thưởng chuyên cần</span>
                  <span className="font-black text-green-800">+{formatTienInput(String(tk.thuongChuyenCan || 0))}đ</span>
                </div>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}