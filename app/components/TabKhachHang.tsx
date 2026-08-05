import { useState } from "react";
import toast from "react-hot-toast";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { KhachHang, Lich, PhatSinh } from "../../types";
import { Search, UserCheck, Phone, MapPin, Edit, Trash2, Plus, Star } from "lucide-react";
import NutCopy from "./NutCopy";

interface TabKhachHangProps {
  danhSachKhachHang: KhachHang[];
  lichLamViec: Lich[];
  danhSachPhatSinh: PhatSinh[];
  laAdmin: boolean;
  formatTienInput: (val: string) => string;
}

export default function TabKhachHang({ danhSachKhachHang, lichLamViec, danhSachPhatSinh, laAdmin, formatTienInput }: TabKhachHangProps) {
  const [tuKhoa, setTuKhoa] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [dangSua, setDangSua] = useState<string | null>(null);

  // State Form Khách Hàng
  const [tenKhach, setTenKhach] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [soDienThoai2, setSoDienThoai2] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [nguonKhach, setNguonKhach] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  // Thuật toán: Lấy toàn bộ lịch sử Khách Hàng và Tính tổng chi tiêu / Tổng nợ
  const layLichSuKhachHang = (kh: KhachHang) => {
    // Tương thích ngược: Lấy theo ID hoặc SĐT (cho các lịch cũ chưa có ID)
    const lichCuaKhach = lichLamViec.filter(l => l.khachHangId === kh.id || l.soDienThoai === kh.soDienThoai);
    const phatSinhCuaKhach = danhSachPhatSinh.filter(p => p.khachHangId === kh.id || p.soDienThoai === kh.soDienThoai);

    let tongChiTieu = 0;
    let tongNo = 0;

    lichCuaKhach.forEach(l => {
      const tongGiaLich = Number(l.giaTien || 0) + Number((l as any).tienDichVuThem || 0);
      tongChiTieu += tongGiaLich;
      tongNo += (tongGiaLich - Number(l.tienCoc || 0));
    });

    phatSinhCuaKhach.forEach(p => { tongChiTieu += Number(p.soTien || 0); });

    return { soLanDen: lichCuaKhach.length + phatSinhCuaKhach.length, tongChiTieu, tongNo };
  };

  const resetForm = () => {
    setDangSua(null); setTenKhach(""); setSoDienThoai(""); setSoDienThoai2(""); setDiaChi(""); setNguonKhach(""); setGhiChu("");
  };

  const moFormSua = (kh: KhachHang) => {
    setDangSua(kh.id!); setTenKhach(kh.tenKhach); setSoDienThoai(kh.soDienThoai); setSoDienThoai2(kh.soDienThoai2 || ""); setDiaChi(kh.diaChi || ""); setNguonKhach(kh.nguonKhach || ""); setGhiChu(kh.ghiChu || ""); setShowModal(true);
  };

  const luuKhachHang = async () => {
    if (!tenKhach || !soDienThoai) { toast.error("Vui lòng nhập Tên và SĐT!"); return; }
    try {
      const data = { tenKhach, soDienThoai, soDienThoai2, diaChi, nguonKhach, ghiChu };
      if (dangSua) { await updateDoc(doc(db, "khachHang", dangSua), data); toast.success("Đã cập nhật hồ sơ!"); } 
      else { await addDoc(collection(db, "khachHang"), { ...data, ngayTao: new Date().toISOString() }); toast.success("Đã thêm khách hàng mới!"); }
      setShowModal(false); resetForm();
    } catch (error) { toast.error("Lỗi mạng!"); }
  };

  const xoaKhachHang = async (id: string) => {
    if (!laAdmin) return;
    if (confirm("Chắc chắn xóa hồ sơ khách hàng này? (Dữ liệu Lịch chụp cũ vẫn sẽ được giữ lại)")) {
      await deleteDoc(doc(db, "khachHang", id)); toast.success("Đã xóa hồ sơ!");
    }
  };

  const khachHangHienThi = danhSachKhachHang.filter(kh => 
    kh.tenKhach.toLowerCase().includes(tuKhoa.toLowerCase()) || kh.soDienThoai.includes(tuKhoa)
  ).sort((a, b) => (b.ngayTao || "").localeCompare(a.ngayTao || ""));

  return (
    <div className="pb-24 px-2 pt-2">
      <div className="mb-4">
        <div className="relative">
          <input type="text" placeholder="🔍 Tìm bằng Tên hoặc SĐT..." value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl shadow-sm focus:ring-4 focus:ring-amber-100 outline-none font-bold text-slate-700 transition-all pl-12" />
          <Search className="absolute left-4 top-4 text-slate-400" size={20} />
        </div>
      </div>

      <div className="mb-4 flex justify-between items-end px-1 mt-6">
        <div><h3 className="font-black text-slate-800 text-lg">Kho Dữ Liệu Khách Hàng</h3><p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Tổng: {danhSachKhachHang.length} Hồ Sơ</p></div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2 text-sm font-black rounded-xl transition-all shadow-sm flex items-center gap-1"><Plus size={16}/> Thêm mới</button>
      </div>

      <div className="space-y-4">
        {khachHangHienThi.length === 0 ? (
           <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center shadow-sm"><h4 className="text-slate-600 font-bold text-base">Không tìm thấy</h4></div>
        ) : (
          khachHangHienThi.map((kh) => {
            const { soLanDen, tongChiTieu, tongNo } = layLichSuKhachHang(kh);
            const laKhachVIP = tongChiTieu >= 15000000; // Khách chi tiêu trên 15 triệu là VIP

            return (
              <div key={kh.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md relative overflow-hidden">
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${laKhachVIP ? "bg-amber-400" : "bg-blue-400"}`}></div>
                
                <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4 ml-2">
                  <div className="pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-lg font-black text-slate-900">{kh.tenKhach}</div>
                      {laKhachVIP && <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-sm"><Star size={10} fill="currentColor"/> VIP</span>}
                    </div>
                    <div className="text-xs font-bold text-slate-500 flex items-center gap-1"><UserCheck size={12}/> Mã KH: #{kh.id?.slice(-5).toUpperCase()}</div>
                  </div>
                  
                  {laAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => moFormSua(kh)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"><Edit size={14}/></button>
                      <button onClick={() => xoaKhachHang(kh.id!)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"><Trash2 size={14}/></button>
                    </div>
                  )}
                </div>

                <div className="grid gap-2 text-sm ml-2">
                  <div className="text-slate-600 font-medium flex items-center gap-2"><Phone size={14} className="text-slate-400"/> <a href={`tel:${kh.soDienThoai}`} className="font-bold text-blue-600 hover:underline">{kh.soDienThoai}</a> <NutCopy textCanCopy={kh.soDienThoai}/></div>
                  {kh.diaChi && <div className="text-slate-600 font-medium flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> {kh.diaChi}</div>}
                  {kh.ghiChu && <div className="text-slate-500 italic bg-slate-50 p-2 rounded-lg text-xs mt-1 border border-slate-100">{kh.ghiChu}</div>}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-slate-200 ml-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tương tác</span>
                    <span className="font-black text-slate-700">{soLanDen} Lần</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tổng chi tiêu</span>
                    <span className="font-black text-emerald-600">{formatTienInput(String(tongChiTieu))}đ</span>
                  </div>
                  {tongNo > 0 && (
                    <div className="flex flex-col text-right bg-rose-50 px-2 py-1 rounded-lg">
                      <span className="text-[10px] font-bold text-rose-500 uppercase">Đang Nợ</span>
                      <span className="font-black text-rose-600">{formatTienInput(String(tongNo))}đ</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl animate-fade-in border border-white">
            <h3 className="text-xl font-black mb-6 text-slate-900 tracking-tight">{dangSua ? "Cập nhật Hồ Sơ" : "Thêm Khách Hàng mới"}</h3>
            <div className="space-y-4">
              <div><label className="text-[10px] font-bold text-slate-500 uppercase ml-2 block mb-1.5">Tên Khách Hàng (*)</label><input type="text" value={tenKhach} onChange={(e) => setTenKhach(e.target.value)} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full font-bold outline-none focus:ring-4 focus:ring-amber-50" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-bold text-slate-500 uppercase ml-2 block mb-1.5">SĐT Chính (*)</label><input type="tel" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full font-bold outline-none focus:ring-4 focus:ring-amber-50" /></div>
                <div><label className="text-[10px] font-bold text-slate-500 uppercase ml-2 block mb-1.5">SĐT Phụ</label><input type="tel" value={soDienThoai2} onChange={(e) => setSoDienThoai2(e.target.value)} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full font-bold outline-none focus:ring-4 focus:ring-amber-50" /></div>
              </div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase ml-2 block mb-1.5">Địa chỉ</label><input type="text" value={diaChi} onChange={(e) => setDiaChi(e.target.value)} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full font-bold outline-none focus:ring-4 focus:ring-amber-50" /></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase ml-2 block mb-1.5">Nguồn Khách (FB, Zalo, Bạn bè...)</label><input type="text" value={nguonKhach} onChange={(e) => setNguonKhach(e.target.value)} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full font-bold outline-none focus:ring-4 focus:ring-amber-50" /></div>
              <div><label className="text-[10px] font-bold text-slate-500 uppercase ml-2 block mb-1.5">Ghi chú thêm</label><textarea value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full font-medium outline-none focus:ring-4 focus:ring-amber-50" rows={2} /></div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="px-6 py-4 bg-slate-100 font-bold text-slate-600 rounded-2xl hover:bg-slate-200 transition-all">Hủy</button>
                <button onClick={luuKhachHang} className="flex-1 bg-amber-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all">LƯU HỒ SƠ</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}