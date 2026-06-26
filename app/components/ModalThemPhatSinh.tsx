import React, { useEffect, useState } from "react";
import { Lich } from "../../types";

interface ModalThemPhatSinhProps {
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  psNgay: string; setPsNgay: (val: string) => void;
  psLoai: string; setPsLoai: (val: string) => void;
  psTenKhach: string; setPsTenKhach: (val: string) => void;
  psSoDienThoai: string; setPsSoDienThoai: (val: string) => void;
  psNgayTra: string; setPsNgayTra: (val: string) => void;
  psSoTien: string; setPsSoTien: (val: string) => void;
  psGhiChu: string; setPsGhiChu: (val: string) => void;
  errors: Record<string, boolean>;
  formatTienInput: (val: string) => string;
  handleThemPhatSinh: () => Promise<void>;
  isThueDo: (loai: string) => boolean;
  lichLamViec: Lich[];
}

export default function ModalThemPhatSinh(props: ModalThemPhatSinhProps) {
  const [goiYKhach, setGoiYKhach] = useState<string>("");

  useEffect(() => {
    if (!props.showModal) setGoiYKhach("");
  }, [props.showModal]);

  const handleDienSoDienThoai = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    props.setPsSoDienThoai(val);

    if (val.length >= 9) {
      const khachCu = props.lichLamViec.find(l => l.soDienThoai === val || l.soDienThoai2 === val);
      if (khachCu && !props.psTenKhach) {
        props.setPsTenKhach(khachCu.tenKhach);
        setGoiYKhach("Đã tự động điền tên khách cũ!");
        setTimeout(() => setGoiYKhach(""), 4000);
      }
    }
  };

  if (!props.showModal) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-gray-100 flex flex-col w-screen h-screen overflow-hidden">
      
      {/* HEADER: MŨI TÊN QUAY LẠI VÀ NÚT LƯU GÓC PHẢI */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm shrink-0 relative z-10">
        <div className="flex items-center">
          <button onClick={() => props.setShowModal(false)} className="p-2 -ml-2 text-gray-600 active:bg-gray-100 rounded-full transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h2 className="text-lg font-black text-gray-800 ml-1">Bổ sung Doanh thu</h2>
        </div>
        <button onClick={props.handleThemPhatSinh} className="text-blue-600 font-black text-sm uppercase px-2 py-1 active:opacity-50 transition-opacity">
          LƯU
        </button>
      </div>

      {/* NỘI DUNG FORM CUỘN Ở GIỮA */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-full max-w-[400px]">
          
          <div className="bg-white p-5 rounded-2xl shadow-sm text-gray-900 border border-gray-200 relative">
            
            {goiYKhach && (
              <div className="absolute -top-3 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full shadow-sm animate-pulse">
                ✓ {goiYKhach}
              </div>
            )}

            <div className="grid gap-4 w-full">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Ngày ghi</label>
                  <input type="date" value={props.psNgay} onChange={(e) => props.setPsNgay(e.target.value)} className={`bg-slate-50 p-4 rounded-2xl w-full text-gray-900 font-bold focus:bg-white focus:ring-4 outline-none transition-all ${props.errors.psNgay ? "border-2 border-red-500" : "border border-transparent focus:border-blue-300 focus:ring-blue-100"}`} />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Loại dịch vụ</label>
                  <select value={props.psLoai} onChange={(e) => props.setPsLoai(e.target.value)} className={`bg-slate-50 p-4 rounded-2xl w-full text-gray-900 font-bold focus:bg-white focus:ring-4 outline-none transition-all ${props.errors.psLoai ? "border-2 border-red-500" : "border border-transparent focus:border-blue-300 focus:ring-blue-100"}`}>
                    <option value="">- Chọn -</option>
                    <optgroup label="👗 Nhóm Cho Thuê">
                      <option value="Thuê váy">Thuê Váy Cưới / Áo dài</option>
                      <option value="Thuê vest">Thuê Vest</option>
                      <option value="Thuê phụ kiện">Thuê Phụ kiện</option>
                    </optgroup>
                    <optgroup label="💄 Nhóm Dịch vụ lẻ">
                      <option value="Make-up lẻ">Make-up lẻ</option>
                      <option value="In thêm ảnh">In thêm ảnh / Khung / Pha lê</option>
                      <option value="Chụp lấy ngay">Chụp thẻ / Chụp lấy ngay</option>
                      <option value="Bán lẻ">Bán phụ kiện lẻ</option>
                    </optgroup>
                    <optgroup label="⚠️ Nhóm Phụ phí">
                      <option value="Phí di chuyển">Phí di chuyển</option>
                      <option value="Phí chụp thêm">Phí chụp thêm giờ</option>
                      <option value="Phí đền bù">Phí đền bù / Giặt là</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Số điện thoại</label>
                <input type="text" placeholder="Gõ SĐT để tìm khách cũ..." value={props.psSoDienThoai} onChange={handleDienSoDienThoai} className={`bg-slate-50 p-4 rounded-2xl w-full text-gray-900 font-bold focus:bg-white focus:ring-4 outline-none transition-all ${props.errors.psSoDienThoai ? "border-2 border-red-500" : "border border-transparent focus:border-blue-300 focus:ring-blue-100"}`} />
              </div>

              <div><label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Tên Khách</label><input type="text" placeholder="Nhập tên..." value={props.psTenKhach} onChange={(e) => props.setPsTenKhach(e.target.value)} className="bg-slate-50 border border-transparent p-4 rounded-2xl w-full text-gray-900 font-bold focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all" /></div>
              
              {props.isThueDo(props.psLoai) && (
                <div className={`p-4 rounded-2xl ${props.errors.psNgayTra ? "bg-red-50 border-2 border-red-500" : "bg-orange-50/50 border border-orange-200"}`}>
                  <label className={`text-[10px] font-black uppercase ml-2 mb-1.5 block tracking-wide ${props.errors.psNgayTra ? "text-red-700" : "text-orange-700"}`}>📅 Ngày hẹn trả đồ</label>
                  <input type="date" value={props.psNgayTra} onChange={(e) => props.setPsNgayTra(e.target.value)} className="border border-orange-200 p-4 rounded-xl w-full bg-white font-black text-orange-800 focus:ring-4 focus:ring-orange-100 outline-none transition-all" />
                </div>
              )}

              <div>
                <label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Doanh thu (VNĐ)</label>
                <div className="relative">
                  <input type="text" inputMode="numeric" placeholder="VD: 500.000" value={props.psSoTien} onChange={(e) => props.setPsSoTien(props.formatTienInput(e.target.value))} className={`bg-emerald-50 p-4 rounded-2xl w-full pr-12 text-emerald-700 font-black text-xl focus:bg-emerald-100 focus:ring-4 outline-none transition-all ${props.errors.psSoTien ? "border-2 border-red-500" : "border border-transparent focus:border-emerald-300 focus:ring-emerald-200"}`} />
                  <span className="absolute right-5 top-5 text-emerald-600 font-bold">đ</span>
                </div>
              </div>

              <div><label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Ghi chú chi tiết</label><input type="text" placeholder="VD: 1 váy đuôi cá, cọc CCCD..." value={props.psGhiChu} onChange={(e) => props.setPsGhiChu(e.target.value)} className="bg-slate-50 border border-transparent p-4 rounded-2xl w-full text-gray-900 font-bold focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all" /></div>
            </div>
          </div>
          
          <div className="h-8 shrink-0"></div>
        </div>
      </div>
    </div>
  );
}