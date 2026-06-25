import NutCopy from "./NutCopy";
import { Role, TaiKhoan } from "../../types";
import { Users, Mail, Phone, Shield, Edit2, Info } from "lucide-react";

interface TabNhanVienProps {
  uidNhanVien: string;
  setUidNhanVien: (val: string) => void;
  emailNhanVien: string;
  setEmailNhanVien: (val: string) => void;
  hoTenNhanVien: string;
  setHoTenNhanVien: (val: string) => void;
  soDienThoaiNhanVien: string;
  setSoDienThoaiNhanVien: (val: string) => void;
  luongCungNhanVien: string;
  setLuongCungNhanVien: (val: string) => void;
  thuongChuyenCanNhanVien: string;
  setThuongChuyenCanNhanVien: (val: string) => void;
  quyenNhanVien: Role;
  setQuyenNhanVien: (val: Role) => void;
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
  return (
    <div className="pb-24 pt-2">
      
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-xl font-serif font-bold text-zinc-900 flex items-center gap-2">
          Quản lý nhân sự
        </h2>
        <div className="bg-zinc-100 text-zinc-600 text-[10px] uppercase tracking-widest font-bold px-4 py-1.5 rounded-full">
          {danhSachTaiKhoan.length} Thành viên
        </div>
      </div>

      {/* BOX HƯỚNG DẪN */}
      <div className="bg-white border border-zinc-200 p-5 rounded-[1.5rem] mb-8 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] flex gap-4 items-start">
        <div className="p-2 bg-zinc-50 rounded-full text-zinc-400"><Info size={20} /></div>
        <div>
          <h4 className="font-bold text-zinc-800 text-sm mb-1.5">Quy trình cấp tài khoản</h4>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed">
            1. Tạo tài khoản Email/Password trong <b className="text-zinc-700">Firebase Auth</b>.<br/>
            2. Copy đoạn mã <b className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700 border border-zinc-200">UID</b> của tài khoản đó.<br/>
            3. Dán UID vào form bên dưới để thiết lập mức lương và quyền hạn.
          </p>
        </div>
      </div>

      {/* FORM NHẬP LIỆU */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] border border-zinc-100 p-6 md:p-8 mb-8">
        <h3 className="font-serif text-lg font-bold text-zinc-900 mb-6 border-b border-zinc-100 pb-4">
          {dangSuaNhanVien ? "Cập nhật hồ sơ" : "Tạo hồ sơ mới"}
        </h3>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Nhóm 1: Firebase */}
          <div className="md:col-span-2 grid gap-4 md:grid-cols-2 p-5 bg-zinc-50/50 rounded-2xl border border-zinc-100">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Mã định danh (UID)</label>
              <input type="text" placeholder="Dán UID vào đây..." value={uidNhanVien} onChange={(e) => setUidNhanVien(e.target.value)} disabled={!!dangSuaNhanVien} className="border border-zinc-200 p-4 rounded-xl w-full bg-white text-zinc-900 font-medium focus:ring-4 focus:ring-zinc-100 outline-none disabled:bg-zinc-50 disabled:text-zinc-400 transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Email kết nối</label>
              <input type="email" placeholder="email@gmail.com" value={emailNhanVien} onChange={(e) => setEmailNhanVien(e.target.value)} disabled={!!dangSuaNhanVien} className="border border-zinc-200 p-4 rounded-xl w-full bg-white text-zinc-900 font-medium focus:ring-4 focus:ring-zinc-100 outline-none disabled:bg-zinc-50 disabled:text-zinc-400 transition-all" />
            </div>
          </div>

          {/* Nhóm 2: Cá nhân */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Họ và tên</label>
            <input type="text" placeholder="Nhập tên nhân viên..." value={hoTenNhanVien} onChange={(e) => setHoTenNhanVien(e.target.value)} className="bg-zinc-50/50 border border-zinc-200 p-4 rounded-xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 outline-none transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Số điện thoại</label>
            <input type="text" placeholder="Nhập số liên hệ..." value={soDienThoaiNhanVien} onChange={(e) => setSoDienThoaiNhanVien(e.target.value)} className="bg-zinc-50/50 border border-zinc-200 p-4 rounded-xl w-full text-zinc-900 font-medium focus:bg-white focus:border-zinc-300 outline-none transition-all" />
          </div>

          {/* Nhóm 3: Tài chính & Quyền */}
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Lương cứng cơ bản</label>
            <div className="relative">
              <input type="text" inputMode="numeric" value={luongCungNhanVien} onChange={(e) => setLuongCungNhanVien(formatTienInput(e.target.value))} className="bg-zinc-50/50 border border-zinc-200 p-4 rounded-xl w-full pr-8 text-zinc-900 font-bold focus:bg-white focus:border-zinc-300 outline-none transition-all" />
              <span className="absolute right-4 top-4 text-zinc-400 font-medium">đ</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Phụ cấp chuyên cần</label>
            <div className="relative">
              <input type="text" inputMode="numeric" value={thuongChuyenCanNhanVien} onChange={(e) => setThuongChuyenCanNhanVien(formatTienInput(e.target.value))} className="bg-zinc-50/50 border border-zinc-200 p-4 rounded-xl w-full pr-8 text-zinc-900 font-bold focus:bg-white focus:border-zinc-300 outline-none transition-all" />
              <span className="absolute right-4 top-4 text-zinc-400 font-medium">đ</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Vai trò trong hệ thống</label>
            <select value={quyenNhanVien} onChange={(e) => setQuyenNhanVien(e.target.value as Role)} className="bg-zinc-50/50 border border-zinc-200 p-4 rounded-xl w-full text-zinc-900 font-bold focus:bg-white focus:border-zinc-300 outline-none transition-all">
              <option value="staff">Nhân sự (Quản lý công việc cá nhân)</option>
              <option value="admin">Quản trị viên (Toàn quyền)</option>
            </select>
          </div>

          {/* Nút lưu */}
          <div className="md:col-span-2 mt-4">
            <button 
              onClick={taoHoSoNhanVien} 
              className={`w-full py-4 rounded-2xl font-bold text-white tracking-wide shadow-lg transition-all active:scale-[0.98] ${
                dangSuaNhanVien ? "bg-zinc-900 hover:bg-black shadow-zinc-300/50" : "bg-zinc-900 hover:bg-black shadow-zinc-300/50"
              }`}
            >
              {dangSuaNhanVien ? "LƯU CẬP NHẬT" : "TẠO HỒ SƠ"}
            </button>
            {dangSuaNhanVien && (
               <div className="text-center mt-4">
                 <button onClick={() => window.location.reload()} className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold hover:text-zinc-900 transition-colors">
                   Hủy thao tác
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* DANH SÁCH NHÂN VIÊN */}
      <h3 className="font-serif text-lg font-bold text-zinc-900 mb-4 px-1">Đội ngũ Suri Studio</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {danhSachTaiKhoan.map((tk: TaiKhoan) => (
          <div key={tk.id} className="bg-white rounded-[2rem] border border-zinc-100 p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] transition-all group relative overflow-hidden">
            
            {/* Header Thẻ */}
            <div className="flex justify-between items-start mb-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-[1rem] flex items-center justify-center font-serif text-2xl font-bold ${
                  tk.role === "admin" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
                }`}>
                  {tk.hoTen ? tk.hoTen.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="font-bold text-zinc-900 text-lg leading-tight">{tk.hoTen || "Chưa cập nhật"}</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {tk.role === "admin" ? <Shield size={12} className="text-zinc-400" /> : <Users size={12} className="text-zinc-400" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      {tk.role === "admin" ? "Quản trị" : "Nhân sự"}
                    </span>
                  </div>
                </div>
              </div>

              {laAdmin && (
                <button 
                  onClick={() => suaHoSoNhanVien(tk)} 
                  className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-200 text-zinc-400 rounded-full hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>

            {/* Thông tin liên hệ */}
            <div className="space-y-3 text-sm text-zinc-600 font-medium mb-5">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-zinc-300" />
                <span className="truncate flex-1">{tk.email}</span>
                <NutCopy textCanCopy={tk.email} />
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-zinc-300" />
                {tk.soDienThoai ? (
                  <>
                    <a href={`tel:${tk.soDienThoai}`} className="hover:underline flex-1 text-zinc-900">{tk.soDienThoai}</a>
                    <NutCopy textCanCopy={tk.soDienThoai} />
                  </>
                ) : (
                  <span className="text-zinc-400 italic flex-1">Chưa cập nhật</span>
                )}
              </div>
            </div>

            {/* Chế độ lương */}
            {laAdmin && (
              <div className="bg-[#FAF9F6] border border-zinc-100 rounded-2xl p-4 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Lương cứng</span>
                  <span className="font-serif font-bold text-zinc-900 text-base">{formatTienInput(String(tk.luongCung || 0))}đ</span>
                </div>
                <div className="h-8 w-px bg-zinc-200 mx-2"></div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Chuyên cần</span>
                  <span className="font-serif font-bold text-zinc-600 text-base">+{formatTienInput(String(tk.thuongChuyenCan || 0))}đ</span>
                </div>
              </div>
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
}