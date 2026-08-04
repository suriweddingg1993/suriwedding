import { useState } from "react";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { KhachHang, Lich, PhatSinh } from "../../types";
import toast from "react-hot-toast";
import { Search, Plus, Phone, MapPin, History, Edit, Trash2, CalendarDays, Wallet, UserCheck, Star, Clock } from "lucide-react";

interface TabKhachHangProps {
  danhSachKhachHang: KhachHang[];
  lichLamViec: Lich[];
  danhSachPhatSinh: PhatSinh[];
  laAdmin: boolean;
  formatTienInput: (val: string) => string;
}

export default function TabKhachHang({
  danhSachKhachHang,
  lichLamViec,
  danhSachPhatSinh,
  laAdmin,
  formatTienInput
}: TabKhachHangProps) {
  const [tuKhoa, setTuKhoa] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState<string | null>(null);

  // State cho Form
  const [idSua, setIdSua] = useState<string | null>(null);
  const [tenKhach, setTenKhach] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [soDienThoai2, setSoDienThoai2] = useState("");
  const [diaChi, setDiaChi] = useState("");
  const [nguonKhach, setNguonKhach] = useState("Facebook");
  const [ghiChu, setGhiChu] = useState("");

  const resetForm = () => {
    setIdSua(null); setTenKhach(""); setSoDienThoai(""); setSoDienThoai2("");
    setDiaChi(""); setNguonKhach("Facebook"); setGhiChu("");
  };

  const moFormThem = () => { resetForm(); setShowModal(true); };
  
  const moFormSua = (kh: KhachHang) => {
    setIdSua(kh.id!); setTenKhach(kh.tenKhach); setSoDienThoai(kh.soDienThoai);
    setSoDienThoai2(kh.soDienThoai2 || ""); setDiaChi(kh.diaChi || "");
    setNguonKhach(kh.nguonKhach || "Facebook"); setGhiChu(kh.ghiChu || "");
    setShowModal(true);
  };

  const luuKhachHang = async () => {
    if (!tenKhach || !soDienThoai) { toast.error("Vui lòng nhập Tên và Số điện thoại!"); return; }
    
    // Kiểm tra trùng SĐT nếu là thêm mới
    if (!idSua && danhSachKhachHang.some(kh => kh.soDienThoai === soDienThoai)) {
      toast.error("Số điện thoại này đã tồn tại trong hệ thống!"); return;
    }

    const payload = {
      tenKhach, soDienThoai, soDienThoai2, diaChi, nguonKhach, ghiChu,
      ngayTao: idSua ? undefined : new Date().toISOString()
    };

    try {
      if (idSua) {
        await updateDoc(doc(db, "khachHang", idSua), payload);
        toast.success("Đã cập nhật thông tin khách hàng!");
      } else {
        await addDoc(collection(db, "khachHang"), payload);
        toast.success("Đã thêm khách hàng mới!");
      }
      setShowModal(false); resetForm();
    } catch (error) { toast.error("Lỗi khi lưu dữ liệu!"); }
  };

  const xoaKhachHang = async (id: string) => {
    if (!laAdmin) { toast.error("Chỉ Admin mới được xóa hồ sơ!"); return; }
    if (!confirm("Xóa hồ sơ khách hàng này? Các lịch sử chụp vẫn sẽ được giữ lại trong sổ.")) return;
    try {
      await deleteDoc(doc(db, "khachHang", id));
      toast.success("Đã xóa hồ sơ khách hàng!");
    } catch (error) { toast.error("Lỗi xóa dữ liệu!"); }
  };

  // Tính toán Tổng chi tiêu và Lịch sử
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

    return { lichCuaKhach, phatSinhCuaKhach, tongChiTieu, tongNo };
  };

  // Lọc tìm kiếm
  const danhSachHienThi = danhSachKhachHang.filter(kh => {
    const kw = tuKhoa.toLowerCase();
    return kh.tenKhach.toLowerCase().includes(kw) || kh.soDienThoai.includes(kw);
  }).sort((a, b) => (b.ngayTao || "").localeCompare(a.ngayTao || ""));

  const topKhachVIP = [...danhSachKhachHang]
    .map(kh => ({ ...kh, chiTieu: layLichSuKhachHang(kh).tongChiTieu }))
    .sort((a, b) => b.chiTieu - a.chiTieu)
    .slice(0, 3); // Lấy top 3 tiêu nhiều nhất

  return (
    <div className="pb-24 px-2 pt-4 font-sans">
      
      {/* Header & Thống kê */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <UserCheck size={24} className="text-indigo-600" /> Hồ sơ Khách hàng
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Tổng: {danhSachKhachHang.length} KH</p>
        </div>
        <button onClick={moFormThem} className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="Tìm bằng tên hoặc số điện thoại..." 
          value={tuKhoa} 
          onChange={(e) => setTuKhoa(e.target.value)} 
          className="w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-slate-700 transition-all"
        />
        <Search size={20} className="absolute left-4 top-4 text-slate-400" />
      </div>

      {/* NẾU KHÔNG TÌM KIẾM -> HIỂN THỊ TOP VIP */}
      {!tuKhoa && topKhachVIP.length > 0 && topKhachVIP[0].chiTieu > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-xs text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2 ml-1">
            <Star size={14} /> Khách Hàng VIP (Chi tiêu nhiều nhất)
          </h3>
          <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar snap-x">
            {topKhachVIP.filter(kh => kh.chiTieu > 0).map((kh, idx) => (
              <div key={`vip-${kh.id}`} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 min-w-[220px] snap-center shadow-sm relative overflow-hidden shrink-0">
                <div className="absolute -right-2 -top-2 text-4xl opacity-20">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</div>
                <div className="font-black text-slate-800 text-sm truncate max-w-[150px]">{kh.tenKhach}</div>
                <div className="text-xs font-bold text-amber-600 mt-0.5 mb-2">{kh.soDienThoai}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Tổng chi tiêu</div>
                <div className="text-lg font-black text-amber-600">{formatTienInput(String(kh.chiTieu))}đ</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DANH SÁCH KHÁCH HÀNG */}
      <h3 className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-3 ml-1">Tất cả khách hàng</h3>
      <div className="space-y-3">
        {danhSachHienThi.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="text-4xl mb-3 opacity-40">🔍</div>
            <div className="font-bold text-sm">Không tìm thấy khách hàng nào.</div>
          </div>
        ) : (
          danhSachHienThi.map(kh => {
            const { tongChiTieu, tongNo } = layLichSuKhachHang(kh);
            
            return (
              <div key={kh.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-black text-slate-800 text-base">{kh.tenKhach}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <a href={`tel:${kh.soDienThoai}`} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"><Phone size={12}/> {kh.soDienThoai}</a>
                      {kh.nguonKhach && <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full uppercase">{kh.nguonKhach}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => moFormSua(kh)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit size={14}/></button>
                    {laAdmin && <button onClick={() => xoaKhachHang(kh.id!)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={14}/></button>}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tổng chi tiêu</div>
                    <div className="font-black text-emerald-600 text-sm">{formatTienInput(String(tongChiTieu))}đ</div>
                  </div>
                  <div className="h-6 w-px bg-slate-200"></div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Công nợ</div>
                    <div className={`font-black text-sm ${tongNo > 0 ? "text-rose-600" : "text-slate-400"}`}>{tongNo > 0 ? `-${formatTienInput(String(tongNo))}đ` : "0đ"}</div>
                  </div>
                  <button onClick={() => setShowHistory(kh.id!)} className="bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95">
                    <History size={14} /> Lịch sử
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ==============================================
          MODAL THÊM / SỬA KHÁCH HÀNG
      =============================================== */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar border border-white">
            <h3 className="text-xl font-black mb-6 text-slate-900 tracking-tight flex items-center gap-2">
              {idSua ? "✏️ Cập nhật Hồ sơ" : "✨ Khách hàng mới"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Tên khách hàng (*)</label>
                <input type="text" value={tenKhach} onChange={(e) => setTenKhach(e.target.value)} placeholder="Nhập tên..." className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">SĐT Chính (*)</label>
                  <input type="tel" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} placeholder="0987..." className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">SĐT Phụ</label>
                  <input type="tel" value={soDienThoai2} onChange={(e) => setSoDienThoai2(e.target.value)} placeholder="Tùy chọn..." className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5 flex items-center gap-1"><MapPin size={12}/> Địa chỉ / Link Facebook</label>
                <input type="text" value={diaChi} onChange={(e) => setDiaChi(e.target.value)} placeholder="Nhập địa chỉ hoặc link FB..." className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full text-slate-900 font-medium outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Nguồn Khách (Marketing)</label>
                <select value={nguonKhach} onChange={(e) => setNguonKhach(e.target.value)} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all">
                  <option value="Facebook">Facebook Ads / Page</option>
                  <option value="Zalo">Zalo OA</option>
                  <option value="Tiktok">Tiktok</option>
                  <option value="Khách cũ giới thiệu">Khách cũ giới thiệu</option>
                  <option value="Khách vãng lai">Khách vãng lai (Tự đến)</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Ghi chú thêm</label>
                <textarea value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="Sở thích, tính cách khách hàng..." className="bg-slate-50 border border-slate-100 p-4 rounded-2xl w-full text-slate-900 font-medium outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all min-h-[100px]" />
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => setShowModal(false)} className="px-6 py-4 bg-slate-100 font-bold text-slate-600 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all">Hủy</button>
                <button onClick={luuKhachHang} className="flex-1 bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
                  {idSua ? "LƯU THAY ĐỔI" : "LƯU HỒ SƠ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================
          MODAL XEM LỊCH SỬ GIAO DỊCH
      =============================================== */}
      {showHistory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-slate-50 rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] animate-fade-in overflow-hidden border border-white">
            
            {(() => {
              const kh = danhSachKhachHang.find(k => k.id === showHistory);
              if (!kh) return null;
              const { lichCuaKhach, phatSinhCuaKhach, tongChiTieu, tongNo } = layLichSuKhachHang(kh);

              return (
                <>
                  <div className="p-5 border-b border-slate-200 bg-white shadow-sm z-10 relative flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{kh.tenKhach}</h3>
                      <div className="text-xs font-bold text-slate-500 mt-1">{kh.soDienThoai}</div>
                    </div>
                    <button onClick={() => setShowHistory(null)} className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-sm active:scale-95">✕</button>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b border-indigo-100 flex justify-between items-center z-10">
                    <div>
                      <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">Tổng đã chi tiêu</div>
                      <div className="text-xl font-black text-indigo-700">{formatTienInput(String(tongChiTieu))}đ</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-0.5">Đang nợ</div>
                      <div className={`text-xl font-black ${tongNo > 0 ? "text-rose-600" : "text-emerald-500"}`}>{tongNo > 0 ? `-${formatTienInput(String(tongNo))}đ` : "0đ"}</div>
                    </div>
                  </div>

                  <div className="overflow-y-auto p-4 space-y-4 custom-scrollbar flex-1">
                    {lichCuaKhach.length === 0 && phatSinhCuaKhach.length === 0 && (
                      <div className="text-center py-10 text-slate-400 text-sm font-medium italic">Khách hàng chưa có giao dịch nào.</div>
                    )}
                    
                    {lichCuaKhach.length > 0 && (
                      <div>
                        <h4 className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><CalendarDays size={14}/> Lịch chụp ({lichCuaKhach.length})</h4>
                        <div className="space-y-3">
                          {[...lichCuaKhach].reverse().map(l => {
                            const tong = Number(l.giaTien || 0) + Number((l as any).tienDichVuThem || 0);
                            const no = tong - Number(l.tienCoc || 0);
                            return (
                              <div key={l.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="font-bold text-slate-800 text-sm">{l.goiChup || l.theLoai}</div>
                                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">Ngày: {l.ngay.split('-').reverse().join('/')}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-black text-indigo-600 text-sm">{formatTienInput(String(tong))}đ</div>
                                    {no > 0 ? <div className="text-[9px] font-black text-rose-500 mt-1 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">Nợ: {formatTienInput(String(no))}đ</div> : <div className="text-[9px] font-black text-emerald-600 mt-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Đã thanh toán</div>}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {phatSinhCuaKhach.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-bold text-xs text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Wallet size={14}/> Dịch vụ phát sinh ({phatSinhCuaKhach.length})</h4>
                        <div className="space-y-3">
                          {[...phatSinhCuaKhach].reverse().map(p => (
                            <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                              <div>
                                <div className="font-bold text-slate-800 text-sm">{p.loai}</div>
                                <div className="text-[10px] font-bold text-slate-500 mt-0.5">Ngày: {p.ngay.split('-').reverse().join('/')}</div>
                              </div>
                              <div className="font-black text-emerald-600 text-sm">+{formatTienInput(String(p.soTien))}đ</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )
            })()}

          </div>
        </div>
      )}
    </div>
  );
}