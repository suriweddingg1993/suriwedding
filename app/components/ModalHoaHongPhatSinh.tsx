import React from "react";
import { PhatSinh } from "../../types";

interface ModalHoaHongPhatSinhProps {
  showHoaHongModal: boolean;
  setShowHoaHongModal: (val: boolean) => void;
  phatSinhDangChon: PhatSinh | null;
  tienHoaHong: string;
  setTienHoaHong: (val: string) => void;
  formatTienInput: (val: string) => string;
  xacNhanNhanTien: () => void;
}

export default function ModalHoaHongPhatSinh(props: ModalHoaHongPhatSinhProps) {
  if (!props.showHoaHongModal || !props.phatSinhDangChon) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl animate-fade-in border border-white">
        <h3 className="text-2xl font-black mb-2 text-blue-600 text-center tracking-tight">Chốt Đơn!</h3>
        <p className="text-xs text-slate-500 mb-6 text-center font-medium">Khai báo hoa hồng cho tư vấn dịch vụ này.</p>
        
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-5">
          <div className="text-[10px] text-blue-500 font-black mb-1.5 uppercase tracking-wide">{props.phatSinhDangChon.loai}</div>
          <div className="font-black text-slate-900 text-base">{props.phatSinhDangChon.tenKhach || "Khách lẻ"}</div>
          <div className="text-sm text-green-600 font-black mt-1.5">Giá trị: {props.formatTienInput(String(props.phatSinhDangChon.soTien || 0))} đ</div>
        </div>
        
        <div className="grid gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 block mb-1.5">Tiền hoa hồng (Sếp chia)</label>
            <div className="relative">
              <input type="text" inputMode="numeric" placeholder="VD: 50.000" value={props.tienHoaHong} onChange={(e) => props.setTienHoaHong(props.formatTienInput(e.target.value))} className="bg-white border border-blue-200 p-4 rounded-2xl w-full pr-10 font-black text-blue-700 text-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-blue-200" autoFocus />
              <span className="absolute right-5 top-5 text-blue-600 font-black">đ</span>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button onClick={props.xacNhanNhanTien} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">💰 Nhận Tiền</button>
            <button onClick={() => props.setShowHoaHongModal(false)} className="px-6 py-4 bg-slate-100 font-bold text-slate-600 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}