import React, { useState, useEffect } from "react";
import { doc, updateDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Lich, TaiKhoan } from "../../types";
import toast from "react-hot-toast";

interface ModalPhanCongProps {
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  lichDangChon: Lich | null;
  hoSoCuaToi: TaiKhoan | null;
  laAdmin: boolean;
}

export default function ModalPhanCong({ showModal, setShowModal, lichDangChon, hoSoCuaToi, laAdmin }: ModalPhanCongProps) {
  const [phanCong, setPhanCong] = useState<Record<string, string>>({});
  const [nhanVienList, setNhanVienList] = useState<TaiKhoan[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Tải danh sách nhân viên nếu là Admin để chọn
  useEffect(() => {
    if (showModal && laAdmin) {
      const unsub = onSnapshot(collection(db, "users"), (snap) => {
        setNhanVienList(snap.docs.map(d => ({ id: d.id, ...d.data() })) as TaiKhoan[]);
      });
      return () => unsub();
    }
  }, [showModal, laAdmin]);

  // Load dữ liệu phân công cũ của Lịch này
  useEffect(() => {
    if (lichDangChon) {
      setPhanCong((lichDangChon as any).phanCong || {});
    }
  }, [lichDangChon]);

  if (!showModal || !lichDangChon) return null;

  const danhSachVaiTro = [
    { id: "Make-up", icon: "💄", label: "Make-up" },
    { id: "Chụp ảnh", icon: "📸", label: "Chụp ảnh" },
    { id: "Quay phim", icon: "🎥", label: "Quay phim" },
    { id: "Photoshop", icon: "💻", label: "Photoshop" },
    { id: "Hậu cần", icon: "🎒", label: "Hậu cần" },
  ];

  const tenCuaToi = hoSoCuaToi?.hoTen || hoSoCuaToi?.email?.split('@')[0] || "Nhân viên";

  const handleAssign = (role: string, name: string) => {
    setPhanCong(prev => ({ ...prev, [role]: name }));
  };

  const luuPhanCong = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "lichStudio", lichDangChon.id!), { phanCong });
      toast.success("Đã lưu bảng phân công!");
      setShowModal(false);
    } catch (error) {
      toast.error("Lỗi cập nhật!");
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
      <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-fade-in border-t border-slate-100 sm:border flex flex-col max-h-[90vh]">
        
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Bảng Phân Công</h3>
          <p className="text-xs text-slate-500 font-medium">Khách hàng: <strong className="text-indigo-600">{lichDangChon.tenKhach}</strong></p>
        </div>

        <div className="overflow-y-auto hide-scrollbar flex-1 -mx-2 px-2 space-y-3 mb-6">
          {danhSachVaiTro.map((role) => {
            const nguoiDangNhan = phanCong[role.id];
            const laToiDangNhan = nguoiDangNhan === tenCuaToi;

            return (
              <div key={role.id} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 shrink-0 w-28">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">{role.icon}</div>
                  <div className="text-[11px] font-black text-slate-700">{role.label}</div>
                </div>

                {laAdmin ? (
                  // Giao diện Admin: Hiện List thả xuống (Dropdown) để chọn ép việc
                  <select 
                    value={nguoiDangNhan || ""}
                    onChange={(e) => handleAssign(role.id, e.target.value)}
                    className="bg-white border border-indigo-200 text-indigo-700 text-xs font-bold p-2.5 rounded-xl outline-none flex-1 shadow-sm focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">-- Chưa ai nhận --</option>
                    {nhanVienList.map(nv => {
                      const ten = nv.hoTen || nv.email?.split('@')[0];
                      return <option key={nv.id} value={ten}>{ten}</option>
                    })}
                  </select>
                ) : (
                  // Giao diện Nhân viên: Hiện nút Tự Nhận hoặc Hủy Nhận
                  <div className="flex-1 flex justify-end">
                    {!nguoiDangNhan ? (
                      <button onClick={() => handleAssign(role.id, tenCuaToi)} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95">
                        ✋ Nhận việc
                      </button>
                    ) : laToiDangNhan ? (
                      <button onClick={() => handleAssign(role.id, "")} className="bg-rose-50 text-rose-600 border border-rose-200 px-4 py-2 rounded-xl text-xs font-black hover:bg-rose-100 transition-all shadow-sm active:scale-95">
                        Đang nhận (Hủy)
                      </button>
                    ) : (
                      <div className="bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200">
                        Đã giao: {nguoiDangNhan}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100 mt-2 shrink-0">
          <button onClick={() => setShowModal(false)} className="w-1/3 py-4 bg-slate-100 font-bold text-slate-600 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all">Đóng</button>
          <button onClick={luuPhanCong} disabled={isSaving} className="w-2/3 bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
            {isSaving ? "Đang lưu..." : "LƯU PHÂN CÔNG"}
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}