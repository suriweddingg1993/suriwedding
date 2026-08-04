import { useState } from "react";
import NutCopy from "./NutCopy";
import { Role, TaiKhoan } from "../../types";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import toast from "react-hot-toast";

function chuyenTienVeSo(value: string) { return Number(value.replace(/\./g, "")); }

interface TabNhanVienProps {
  danhSachTaiKhoan: TaiKhoan[];
  laAdmin: boolean;
  formatTienInput: (val: string) => string;
}

export default function TabNhanVien({
  danhSachTaiKhoan, laAdmin, formatTienInput
}: TabNhanVienProps) {

  const [uidNhanVien, setUidNhanVien] = useState("");
  const [emailNhanVien, setEmailNhanVien] = useState("");
  const [hoTenNhanVien, setHoTenNhanVien] = useState("");
  const [soDienThoaiNhanVien, setSoDienThoaiNhanVien] = useState("");
  const [luongCungNhanVien, setLuongCungNhanVien] = useState("3.000.000");
  const [thuongChuyenCanNhanVien, setThuongChuyenCanNhanVien] = useState("300.000");
  const [quyenNhanVien, setQuyenNhanVien] = useState<Role>("staff");
  const [dangSuaNhanVien, setDangSuaNhanVien] = useState<string | null>(null);

  const ADMIN_CHINH_EMAIL = "dangngocan93@gmail.com";

  const taoHoSoNhanVien = async () => {
    if (!laAdmin) { toast.error("Chỉ admin mới được quản lý"); return; }
    if (!uidNhanVien || !emailNhanVien) { toast.error("Nhập UID và email"); return; }
    try { 
      await setDoc(doc(db, "users", uidNhanVien), { 
        email: emailNhanVien, hoTen: hoTenNhanVien, soDienThoai: soDienThoaiNhanVien, 
        luongCung: chuyenTienVeSo(luongCungNhanVien), thuongChuyenCan: chuyenTienVeSo(thuongChuyenCanNhanVien), 
        role: emailNhanVien === ADMIN_CHINH_EMAIL ? "admin" : quyenNhanVien 
      }, { merge: true }); 
      setUidNhanVien(""); setEmailNhanVien(""); setHoTenNhanVien(""); setSoDienThoaiNhanVien(""); 
      setLuongCungNhanVien("3.000.000"); setThuongChuyenCanNhanVien("300.000"); setQuyenNhanVien("staff"); 
      setDangSuaNhanVien(null); toast.success("Thành công"); 
    } catch (error) { toast.error("Lỗi cập nhật hồ sơ"); }
  };

  const suaHoSoNhanVien = (tk: TaiKhoan) => { 
    setDangSuaNhanVien(tk.id); setUidNhanVien(tk.id); setEmailNhanVien(tk.email || ""); 
    setHoTenNhanVien(tk.hoTen || ""); setSoDienThoaiNhanVien(tk.soDienThoai || ""); 
    setLuongCungNhanVien(formatTienInput(String(tk.luongCung || 3000000))); 
    setThuongChuyenCanNhanVien(formatTienInput(String(tk.thuongChuyenCan || 300000))); 
    setQuyenNhanVien(tk.role || "staff"); window.scrollTo({ top: 0, behavior: "smooth" }); 
  };

  const xoaNhanVienTaiKhoan = async (id: string, email: string) => {
    if (email === ADMIN_CHINH_EMAIL) { toast.error("⚠️ KHÔNG ĐƯỢC PHÉP: Đây là tài khoản Quản trị Gốc!"); return; }
    const dongY = confirm(`CẢNH BÁO: Chắc chắn muốn xóa hồ sơ nhân viên ${email}?\nHành động này sẽ không thể khôi phục!`);
    if (dongY) { try { await deleteDoc(doc(db, "users", id)); toast.success("Đã xóa nhân viên!"); } catch(e) { toast.error("Lỗi xóa!"); } }
  };

  return (
    <div className="pb-24 px-2 pt-4">
      <div className="flex items-center justify-between mb-4 pl-1">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">👥 Quản lý nhân sự</h2>
        <div className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{danhSachTaiKhoan.length} tài khoản</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
        <h3 className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">
          {dangSuaNhanVien ? "✏️ Cập nhật hồ sơ nhân viên" : "✨ Thêm hồ sơ nhân viên mới"}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 grid gap-3 md:grid-cols-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div><label className="text-[11px] font-bold text-gray-500 uppercase ml-1 block">Mã UID</label><input type="text" value={uidNhanVien} onChange={(e) => setUidNhanVien(e.target.value)} disabled={!!dangSuaNhanVien} className="border p-3 rounded-xl w-full bg-white outline-none disabled:bg-gray-100" /></div>
            <div><label className="text-[11px] font-bold text-gray-500 uppercase ml-1 block">Email</label><input type="email" value={emailNhanVien} onChange={(e) => setEmailNhanVien(e.target.value)} disabled={!!dangSuaNhanVien} className="border p-3 rounded-xl w-full bg-white outline-none disabled:bg-gray-100" /></div>
          </div>
          <div><label className="text-[11px] font-bold text-gray-500 uppercase ml-1 block">Họ và tên</label><input type="text" value={hoTenNhanVien} onChange={(e) => setHoTenNhanVien(e.target.value)} className="border p-3 rounded-xl w-full bg-white outline-none" /></div>
          <div><label className="text-[11px] font-bold text-gray-500 uppercase ml-1 block">SĐT</label><input type="text" value={soDienThoaiNhanVien} onChange={(e) => setSoDienThoaiNhanVien(e.target.value)} className="border p-3 rounded-xl w-full bg-white outline-none" /></div>
          <div className="relative"><label className="text-[11px] font-bold text-gray-500 uppercase ml-1 block">Lương cứng</label><input type="text" value={luongCungNhanVien} onChange={(e) => setLuongCungNhanVien(formatTienInput(e.target.value))} className="border p-3 rounded-xl w-full bg-white pr-8 outline-none font-bold" /><span className="absolute right-4 top-[30px] text-gray-400">đ</span></div>
          <div className="relative"><label className="text-[11px] font-bold text-gray-500 uppercase ml-1 block">Thưởng chuyên cần</label><input type="text" value={thuongChuyenCanNhanVien} onChange={(e) => setThuongChuyenCanNhanVien(formatTienInput(e.target.value))} className="border p-3 rounded-xl w-full bg-white pr-8 outline-none font-bold" /><span className="absolute right-4 top-[30px] text-gray-400">đ</span></div>
          <div className="md:col-span-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase ml-1 block">Cấp quyền</label>
            <select value={quyenNhanVien} onChange={(e) => setQuyenNhanVien(e.target.value as Role)} disabled={dangSuaNhanVien !== null && emailNhanVien === ADMIN_CHINH_EMAIL} className="border p-3 rounded-xl w-full bg-white font-bold outline-none disabled:bg-gray-100">
              <option value="staff">Nhân viên</option><option value="admin">Quản lý / Admin</option>
            </select>
          </div>
          <div className="md:col-span-2 mt-2">
            <button onClick={taoHoSoNhanVien} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg active:scale-95 ${dangSuaNhanVien ? "bg-yellow-500" : "bg-blue-600"}`}>
              {dangSuaNhanVien ? "💾 LƯU CẬP NHẬT" : "✨ TẠO HỒ SƠ"}
            </button>
            {dangSuaNhanVien && (<div className="text-center mt-3"><button onClick={() => window.location.reload()} className="text-sm text-gray-500 underline">Hủy chỉnh sửa</button></div>)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {danhSachTaiKhoan.map((tk: TaiKhoan) => (
          <div key={tk.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${tk.role === "admin" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>{tk.hoTen ? tk.hoTen.charAt(0).toUpperCase() : "👤"}</div>
                <div><div className="font-bold text-gray-800 text-base">{tk.hoTen || "Chưa có tên"}</div><div className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit mt-1 uppercase ${tk.role === "admin" ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>{tk.role === "admin" ? "Admin" : "Nhân viên"}</div></div>
              </div>
              {laAdmin && (
                <div className="flex flex-col gap-2">
                  <button onClick={() => suaHoSoNhanVien(tk)} className="p-2 bg-gray-50 rounded-lg hover:bg-yellow-50">✏️</button>
                  <button onClick={() => xoaNhanVienTaiKhoan(tk.id, tk.email)} className="p-2 bg-gray-50 rounded-lg hover:bg-red-50">🗑</button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 font-medium mb-3">
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg"><span>📧</span> <span className="truncate max-w-[200px]">{tk.email}</span><NutCopy textCanCopy={tk.email} /></div>
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg"><span>📞</span> {tk.soDienThoai ? (<><a href={`tel:${tk.soDienThoai}`} className="text-blue-600">{tk.soDienThoai}</a><NutCopy textCanCopy={tk.soDienThoai} /></>) : (<span className="text-gray-400 italic">Chưa có SĐT</span>)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}