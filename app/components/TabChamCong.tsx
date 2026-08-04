import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ChamCong, TaiKhoan } from "../../types";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Clock, LogIn, LogOut, CheckCircle2, XCircle, FileText, UserCheck, CalendarDays, ShieldAlert, History, User, ChevronDown } from "lucide-react";

interface TabChamCongProps {
  homNay: () => string;
  hoSoCuaToi: TaiKhoan | null;
  laAdmin: boolean;
  danhSachChamCong: ChamCong[];
  danhSachTaiKhoan: TaiKhoan[];
}

export default function TabChamCong({
  homNay,
  hoSoCuaToi,
  laAdmin,
  danhSachChamCong,
  danhSachTaiKhoan
}: TabChamCongProps) {
  
  const todayStr = homNay();
  // ĐÃ SỬA: Chuyển tháng thành State để có thể chọn xem lại lịch sử
  const [thangChon, setThangChon] = useState(todayStr.slice(0, 7));

  const [currentTime, setCurrentTime] = useState(() => 
    new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  );
  
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [showModalYeuCau, setShowModalYeuCau] = useState(false);
  
  // FORM YÊU CẦU
  const [ycNgay, setYcNgay] = useState(todayStr);
  const [ycLoai, setYcLoai] = useState("Quên Check-in");
  const [ycThoiGian, setYcThoiGian] = useState("");
  const [ycLyDo, setYcLyDo] = useState("");

  // ADMIN SỬA THỦ CÔNG
  const [showAdminSua, setShowAdminSua] = useState(false);
  const [editId, setEditId] = useState("");
  const [editNgay, setEditNgay] = useState("");
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [editTenNhanVien, setEditTenNhanVien] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const myRecordToday = danhSachChamCong.find((cc) => cc.uid === hoSoCuaToi?.id && cc.ngay === todayStr);

  const handleCheckIn = async () => {
    if (!hoSoCuaToi) return toast.error("Lỗi tài khoản!");
    if (myRecordToday?.checkIn) return toast.error("Bạn đã Check-in hôm nay rồi!");

    const [h, m] = currentTime.split(":").map(Number);
    const timeInMins = h * 60 + m;
    const startMins = 8 * 60 + 30; // MỐC 08:30 SÁNG
    const isLate = timeInMins > startMins;
    const lateMins = isLate ? timeInMins - startMins : 0;

    try {
      if (myRecordToday) {
        await updateDoc(doc(db, "chamCong", myRecordToday.id!), { checkIn: currentTime, diMuon: isLate, soPhutMuon: lateMins });
      } else {
        await addDoc(collection(db, "chamCong"), {
          uid: hoSoCuaToi.id, email: hoSoCuaToi.email, ngay: todayStr, checkIn: currentTime, diMuon: isLate, soPhutMuon: lateMins
        });
      }
      toast.success(isLate ? `Check-in muộn ${lateMins} phút!` : "Check-in thành công!");
    } catch (error) { toast.error("Lỗi mạng!"); }
  };

  const handleCheckOut = async () => {
    if (!hoSoCuaToi) return toast.error("Lỗi tài khoản!");
    if (!myRecordToday?.checkIn) return toast.error("Bạn chưa Check-in!");
    if (myRecordToday?.checkOut) return toast.error("Bạn đã Check-out rồi!");

    try {
      await updateDoc(doc(db, "chamCong", myRecordToday.id!), { checkOut: currentTime });
      toast.success("Check-out thành công. Nghỉ ngơi thôi!");
    } catch (error) { toast.error("Lỗi mạng!"); }
  };

  const guiYeuCau = async () => {
    if (!ycLoai || !ycLyDo) return toast.error("Vui lòng điền đủ loại và lý do!");
    if (!hoSoCuaToi) return;

    const recordExist = danhSachChamCong.find(cc => cc.uid === hoSoCuaToi.id && cc.ngay === ycNgay);
    const lyDoChiTiet = ycThoiGian ? `[Đề xuất giờ: ${ycThoiGian}] - ${ycLyDo}` : ycLyDo;

    const payload: any = {
      uid: hoSoCuaToi.id, email: hoSoCuaToi.email, ngay: ycNgay, 
      loaiGiaiTrinh: ycLoai, lyDoGiaiTrinh: lyDoChiTiet, trangThaiGiaiTrinh: "Chờ duyệt",
      thoiGianDeXuat: ycThoiGian 
    };

    try {
      if (recordExist) {
        await updateDoc(doc(db, "chamCong", recordExist.id!), { ...payload, uid: undefined, email: undefined, ngay: undefined });
      } else {
        await addDoc(collection(db, "chamCong"), payload);
      }
      toast.success("Đã gửi yêu cầu cho Quản lý!");
      setShowModalYeuCau(false);
      setYcThoiGian(""); setYcLyDo("");
    } catch (error) { toast.error("Lỗi gửi yêu cầu!"); }
  };

  const duyetYeuCau = async (yc: ChamCong, trangThai: "Đã duyệt" | "Từ chối") => {
    if (!confirm(`Bạn chắc chắn muốn ${trangThai.toLowerCase()} yêu cầu này?`)) return;
    try {
      let updates: any = { trangThaiGiaiTrinh: trangThai };
      
      if (trangThai === "Đã duyệt" && (yc as any).thoiGianDeXuat) {
        const time = (yc as any).thoiGianDeXuat;
        if (yc.loaiGiaiTrinh === "Quên Check-in" || yc.loaiGiaiTrinh === "Đi muộn / Về sớm") {
          updates.checkIn = time;
          const [h, m] = time.split(":").map(Number);
          const timeInMins = h * 60 + m;
          const startMins = 8 * 60 + 30;
          updates.diMuon = timeInMins > startMins;
          updates.soPhutMuon = updates.diMuon ? timeInMins - startMins : 0;
        } else if (yc.loaiGiaiTrinh === "Quên Check-out") {
          updates.checkOut = time;
        }
      }

      await updateDoc(doc(db, "chamCong", yc.id!), updates);
      toast.success(trangThai === "Đã duyệt" ? "Đã duyệt và cập nhật giờ công!" : "Đã từ chối!");
    } catch (error) { toast.error("Lỗi cập nhật!"); }
  };

  const moFormAdminSua = (cc: ChamCong, tenNV: string) => {
    setEditId(cc.id!); setEditNgay(cc.ngay);
    setEditCheckIn(cc.checkIn || ""); setEditCheckOut(cc.checkOut || "");
    setEditTenNhanVien(tenNV);
    setShowAdminSua(true);
  };

  const luuAdminSuaCong = async () => {
    try {
      let isLate = false;
      let lateMins = 0;
      if (editCheckIn) {
        const [h, m] = editCheckIn.split(":").map(Number);
        const timeInMins = h * 60 + m;
        const startMins = 8 * 60 + 30;
        isLate = timeInMins > startMins;
        lateMins = isLate ? timeInMins - startMins : 0;
      }

      await updateDoc(doc(db, "chamCong", editId), {
        checkIn: editCheckIn, checkOut: editCheckOut,
        diMuon: isLate, soPhutMuon: lateMins,
        trangThaiGiaiTrinh: "Đã duyệt"
      });
      toast.success("Đã ghi đè giờ công!");
      setShowAdminSua(false);
    } catch(e) { toast.error("Lỗi cập nhật!"); }
  };

  const toggleUser = (uid: string) => {
    if (expandedUser === uid) setExpandedUser(null);
    else setExpandedUser(uid);
  };

  // ==========================================
  // DATA LỌC THEO THÁNG
  // ==========================================
  const yeuCauChoDuyet = danhSachChamCong.filter(cc => cc.trangThaiGiaiTrinh === "Chờ duyệt");
  const lichSuCuaToi = danhSachChamCong
    .filter(cc => cc.uid === hoSoCuaToi?.id && cc.ngay.startsWith(thangChon))
    .sort((a, b) => b.ngay.localeCompare(a.ngay)); 
  const danhSachNhanVien = danhSachTaiKhoan.filter(tk => tk.role !== "admin");

  // THUẬT TOÁN ĐẾM NGÀY ĐỂ HIỂN THỊ CHÍNH XÁC NHƯ BẢNG LƯONG
  const year = parseInt(thangChon.split("-")[0]);
  const month = parseInt(thangChon.split("-")[1]);
  const daysInMonth = new Date(year, month, 0).getDate();
  const isCurrentMonth = thangChon === todayStr.slice(0, 7);
  const currentDayNum = parseInt(todayStr.slice(8, 10));
  // Chỉ quét đến ngày hôm qua đối với tháng hiện tại
  const limitDay = isCurrentMonth ? currentDayNum : daysInMonth + 1;
  const pastDates: string[] = [];
  
  for (let i = 1; i < limitDay; i++) {
    const d = i < 10 ? `0${i}` : `${i}`;
    pastDates.push(`${thangChon}-${d}`);
  }

  return (
    <div className="pb-24 px-2 pt-4">
      
      {/* 1. KHU VỰC CHẤM CÔNG */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        <div className="flex items-center justify-center gap-2 text-slate-400 mb-2 mt-2">
          <CalendarDays size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Hôm nay, {todayStr.split("-").reverse().join("/")}</span>
        </div>
        <div className="text-[3.5rem] leading-none font-black text-slate-800 mb-8 tracking-tighter flex items-center justify-center gap-3">
          {currentTime || "00:00"}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleCheckIn} 
            disabled={!!myRecordToday?.checkIn} 
            className={`group flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-300 ${myRecordToday?.checkIn ? "bg-slate-50 border border-slate-100 text-slate-400 opacity-60" : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:-translate-y-1 active:scale-95 border border-blue-400"}`}
          >
            <div className={`p-3 rounded-full mb-2 transition-transform duration-300 ${myRecordToday?.checkIn ? "bg-slate-100 text-slate-400" : "bg-white/20 text-white group-hover:scale-110"}`}>
              <LogIn size={24} strokeWidth={2.5} />
            </div>
            <span className="font-black tracking-wide text-sm">CHECK IN</span>
            <span className="text-[10px] mt-1 font-bold uppercase opacity-90">{myRecordToday?.checkIn ? `Đã điểm: ${myRecordToday.checkIn}` : "Vào ca làm"}</span>
          </button>
          
          <button 
            onClick={handleCheckOut} 
            disabled={!myRecordToday?.checkIn || !!myRecordToday?.checkOut} 
            className={`group flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-300 ${!myRecordToday?.checkIn || myRecordToday?.checkOut ? "bg-slate-50 border border-slate-100 text-slate-400 opacity-60" : "bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg shadow-rose-200 hover:-translate-y-1 active:scale-95 border border-rose-400"}`}
          >
            <div className={`p-3 rounded-full mb-2 transition-transform duration-300 ${!myRecordToday?.checkIn || myRecordToday?.checkOut ? "bg-slate-100 text-slate-400" : "bg-white/20 text-white group-hover:scale-110"}`}>
              <LogOut size={24} strokeWidth={2.5} />
            </div>
            <span className="font-black tracking-wide text-sm">CHECK OUT</span>
            <span className="text-[10px] mt-1 font-bold uppercase opacity-90">{myRecordToday?.checkOut ? `Đã điểm: ${myRecordToday.checkOut}` : "Kết thúc ca"}</span>
          </button>
        </div>
      </div>

      {/* 2. ADMIN: YÊU CẦU & BẢNG CÔNG TỔNG HÔM NAY */}
      {laAdmin && (
        <>
          {yeuCauChoDuyet.length > 0 && (
            <div className="mb-6 animate-fade-in">
              <h3 className="font-black text-rose-600 flex items-center gap-2 mb-3 ml-1 text-sm uppercase tracking-wide">
                <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span></span>
                Yêu cầu chờ duyệt ({yeuCauChoDuyet.length})
              </h3>
              <div className="space-y-3">
                {yeuCauChoDuyet.map(yc => {
                  const tk = danhSachTaiKhoan.find(t => t.id === yc.uid);
                  return (
                    <div key={yc.id} className="bg-white border border-rose-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-rose-400"></div>
                      <div className="flex justify-between items-start mb-2 ml-2">
                        <div>
                          <div className="font-black text-slate-800 text-sm flex items-center gap-1.5"><User size={14} className="text-slate-400"/> {tk?.hoTen || yc.email.split('@')[0]}</div>
                          <div className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded w-fit mt-1.5 uppercase">{yc.loaiGiaiTrinh}</div>
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded">Ngày {yc.ngay.split('-').reverse().join('/')}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600 font-medium border border-slate-100 mb-3 ml-2 flex items-start gap-2">
                        <FileText size={14} className="shrink-0 text-slate-400 mt-0.5" />
                        <span className="italic leading-relaxed">"{yc.lyDoGiaiTrinh}"</span>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button onClick={() => duyetYeuCau(yc, "Đã duyệt")} className="flex-1 bg-emerald-50 text-emerald-700 font-black py-2.5 rounded-xl border border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 transition-all text-xs flex justify-center items-center gap-1.5 shadow-sm">
                          <CheckCircle2 size={16} /> Duyệt ngay
                        </button>
                        <button onClick={() => duyetYeuCau(yc, "Từ chối")} className="px-4 bg-white text-rose-600 font-bold py-2.5 rounded-xl border border-slate-200 hover:bg-rose-50 transition-all text-xs">Từ chối</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 mb-6">
            <h3 className="font-black text-slate-800 mb-4 text-xs uppercase flex items-center gap-2">
              <UserCheck size={16} className="text-indigo-500" /> Bảng công hôm nay
            </h3>
            <div className="grid gap-2">
              {danhSachNhanVien.map(tk => {
                const cc = danhSachChamCong.find(c => c.uid === tk.id && c.ngay === todayStr);
                return (
                  <div key={tk.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 px-3 py-3 rounded-2xl hover:bg-slate-100 transition-colors">
                    <div className="font-bold text-slate-700 text-xs flex items-center gap-2">
                       <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 text-slate-400">
                          <User size={12} />
                       </div>
                       {tk.hoTen || tk.email}
                    </div>
                    <div className="flex gap-2">
                      {cc?.checkIn 
                        ? <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md shadow-sm">IN: {cc.checkIn}</span> 
                        : <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-md">Chưa đến</span>
                      }
                      {cc?.checkOut && <span className="text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-md shadow-sm">OUT: {cc.checkOut}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ========================================================
          3. LỊCH SỬ CHẤM CÔNG CÓ TÙY CHỌN THÁNG
      ======================================================== */}
      <div className="flex justify-between items-end mb-4 px-1 mt-8 border-t border-slate-200 pt-6">
        <h3 className="font-black text-slate-800 text-sm uppercase flex items-center gap-2">
          <History size={18} className="text-slate-400" /> {laAdmin ? "Lịch sử Nhân sự" : "Lịch sử của tôi"}
        </h3>
        <div className="flex items-center gap-2">
          {/* Ô Chọn Tháng */}
          <input 
            type="month" 
            value={thangChon} 
            onChange={(e) => setThangChon(e.target.value)} 
            className="bg-white border border-slate-200 text-slate-700 text-[11px] font-bold px-2 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-200 shadow-sm transition-all cursor-pointer"
          />
          {!laAdmin && (
            <button onClick={() => setShowModalYeuCau(true)} className="bg-slate-800 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-sm hover:bg-slate-700 active:scale-95 transition-all flex items-center gap-1">
              <FileText size={12} /> Báo Giải Trình
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {laAdmin ? (
          /* GIAO DIỆN ADMIN: DẠNG ACCORDION CÓ THỐNG KÊ VẮNG/MUỘN */
          danhSachNhanVien.map(tk => {
            const isExpanded = expandedUser === tk.id;
            
            // Lấy toàn bộ records của nhân viên trong tháng được chọn
            const hsNhanVien = danhSachChamCong
              .filter(cc => cc.uid === tk.id && cc.ngay.startsWith(thangChon))
              .sort((a,b) => b.ngay.localeCompare(a.ngay));

            // THUẬT TOÁN ĐẾM VẮNG / MUỘN
            let soNgayNghi = 0;
            let soLanMuon = 0;
            const chamCongMap: Record<string, ChamCong> = {};
            hsNhanVien.forEach(cc => { chamCongMap[cc.ngay] = cc; });
            
            pastDates.forEach(date => {
              const record = chamCongMap[date];
              if (!record) {
                soNgayNghi++; 
              } else {
                if (record.trangThaiGiaiTrinh === "Đã duyệt") {
                  if (record.loaiGiaiTrinh === "Xin nghỉ phép") soNgayNghi++;
                } else {
                  if (!record.checkIn || !record.checkOut) soNgayNghi++;
                  else if (record.diMuon) soLanMuon++;
                }
              }
            });

            return (
              <div key={tk.id} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? "border-indigo-200 shadow-md" : "border-slate-100 shadow-sm"}`}>
                <button onClick={() => toggleUser(tk.id!)} className={`w-full flex items-center justify-between p-4 outline-none transition-colors ${isExpanded ? "bg-indigo-50/50" : "hover:bg-slate-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                      <User size={18} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <div className="font-black text-slate-800 text-sm flex items-center gap-2 flex-wrap mb-0.5">
                        {tk.hoTen || tk.email}
                        <div className="flex gap-1.5 mt-0.5 sm:mt-0">
                          {soNgayNghi > 0 && <span className="text-[9px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 font-bold whitespace-nowrap">Vắng: {soNgayNghi}</span>}
                          {soLanMuon > 0 && <span className="text-[9px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 font-bold whitespace-nowrap">Muộn: {soLanMuon}</span>}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold">{hsNhanVien.length} bản ghi (Tháng {thangChon.split('-')[1]})</div>
                    </div>
                  </div>
                  <div className={`p-1.5 rounded-full transition-transform duration-300 shrink-0 ${isExpanded ? "bg-indigo-100 text-indigo-600 rotate-180" : "bg-slate-50 text-slate-400"}`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="bg-slate-50 p-4 border-t border-slate-100 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {hsNhanVien.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs font-medium italic bg-white rounded-xl border border-dashed border-slate-200">Không có dữ liệu trong tháng này.</div>
                    ) : (
                      hsNhanVien.map(cc => {
                        const quenCheckOut = cc.checkIn && !cc.checkOut && cc.ngay < todayStr && cc.trangThaiGiaiTrinh !== "Đã duyệt";
                        
                        return (
                          <div key={cc.id} className={`bg-white rounded-xl border p-3 flex justify-between items-center transition-all hover:shadow-sm ${quenCheckOut ? "border-rose-300 bg-rose-50/30" : "border-slate-200"}`}>
                            <div>
                              <div className="font-bold text-slate-800 text-xs mb-1.5">Ngày {cc.ngay.split('-').reverse().join('/')}</div>
                              <div className="flex gap-2">
                                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">In: {cc.checkIn || "--:--"}</span>
                                <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">Out: {cc.checkOut || "--:--"}</span>
                              </div>
                            </div>
                            
                            <div className="text-right flex flex-col items-end gap-1.5">
                              <button onClick={() => moFormAdminSua(cc, tk.hoTen || tk.email || "")} className="text-[9px] text-slate-500 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 px-2 py-1 rounded font-bold transition-all shadow-sm">
                                Sửa công
                              </button>

                              {cc.trangThaiGiaiTrinh ? (
                                <div className="text-right">
                                  <div className="text-[8px] font-bold text-slate-400 truncate max-w-[90px] mb-0.5">{cc.loaiGiaiTrinh}</div>
                                  <div className={`text-[8px] font-black px-1.5 py-1 rounded uppercase tracking-wider ${cc.trangThaiGiaiTrinh==="Đã duyệt" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{cc.trangThaiGiaiTrinh}</div>
                                </div>
                              ) : quenCheckOut ? (
                                <div className="text-[8px] font-black text-rose-600 bg-rose-100 border border-rose-200 px-1.5 py-1 rounded uppercase tracking-wider flex items-center gap-1 animate-pulse"><ShieldAlert size={10}/> Lỗi Out</div>
                              ) : cc.diMuon ? (
                                <div className="text-[8px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-1 rounded uppercase tracking-wider">Đi muộn</div>
                              ) : cc.checkIn ? (
                                <div className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-1 rounded uppercase tracking-wider">Hợp lệ</div>
                              ) : null}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          /* GIAO DIỆN NHÂN VIÊN: DẠNG LIST */
          lichSuCuaToi.length === 0 ? (
            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white text-xs font-medium">Tháng này bạn chưa có lịch sử đi làm.</div>
          ) : (
            lichSuCuaToi.map(cc => {
              const quenCheckOut = cc.checkIn && !cc.checkOut && cc.ngay < todayStr && cc.trangThaiGiaiTrinh !== "Đã duyệt";
              return (
                <div key={cc.id} className={`bg-white rounded-2xl border p-4 flex justify-between items-center transition-all ${quenCheckOut ? "border-rose-300 bg-rose-50/50 shadow-sm" : "border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"}`}>
                  <div>
                    <div className="font-bold text-slate-800 text-sm mb-2">{cc.ngay.split('-').reverse().join('/')}</div>
                    <div className="flex gap-2">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 shadow-sm">In: {cc.checkIn || "--:--"}</span>
                      <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100 shadow-sm">Out: {cc.checkOut || "--:--"}</span>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end justify-center gap-2">
                    {cc.trangThaiGiaiTrinh ? (
                      <div className="text-right">
                        <div className="text-[9px] font-bold text-slate-400 truncate max-w-[100px] mb-1">{cc.loaiGiaiTrinh}</div>
                        <div className={`text-[9px] font-black px-2 py-1.5 rounded-md uppercase tracking-wider ${cc.trangThaiGiaiTrinh==="Đã duyệt" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{cc.trangThaiGiaiTrinh}</div>
                      </div>
                    ) : quenCheckOut ? (
                      <div className="text-[9px] font-black text-rose-600 bg-rose-100 border border-rose-200 px-2 py-1.5 rounded-md uppercase tracking-wider flex items-center gap-1 animate-pulse"><ShieldAlert size={12}/> Lỗi Out</div>
                    ) : cc.diMuon ? (
                      <div className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1.5 rounded-md uppercase tracking-wider">Đi muộn</div>
                    ) : cc.checkIn ? (
                      <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1.5 rounded-md uppercase tracking-wider">Hợp lệ</div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {/* ==============================================
          MODAL: ADMIN SỬA GIỜ THỦ CÔNG 
      =============================================== */}
      {showAdminSua && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl animate-fade-in">
            <h2 className="text-xl font-black mb-1 text-indigo-600 tracking-tight">Sửa Giờ Công</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Cập nhật cho <strong className="text-slate-800">{editTenNhanVien}</strong> (Ngày {editNgay.split('-').reverse().join('/')})</p>
            
            <div className="grid gap-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Giờ Check-In</label>
                  <input type="time" value={editCheckIn} onChange={(e) => setEditCheckIn(e.target.value)} className="bg-slate-50 p-3.5 rounded-xl w-full text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none border border-slate-100 focus:border-indigo-300 transition-all" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Giờ Check-Out</label>
                  <input type="time" value={editCheckOut} onChange={(e) => setEditCheckOut(e.target.value)} className="bg-slate-50 p-3.5 rounded-xl w-full text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none border border-slate-100 focus:border-indigo-300 transition-all" />
                </div>
              </div>
              
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100 mt-2">
                <div className="text-[10px] font-black text-amber-700 uppercase mb-1">Lưu ý hệ thống:</div>
                <div className="text-xs text-amber-700 font-medium">Khi bấm LƯU, hệ thống sẽ tự động coi ngày công này là hợp lệ (Ghi đè mọi vi phạm).</div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowAdminSua(false)} className="px-5 py-3.5 bg-slate-100 font-bold text-slate-600 rounded-xl hover:bg-slate-200 active:scale-95 transition-all text-sm">Hủy</button>
                <button onClick={luuAdminSuaCong} className="flex-1 bg-indigo-600 text-white font-black py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all text-sm">LƯU CẬP NHẬT</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================
          MODAL: NHÂN VIÊN GỬI YÊU CẦU GIẢI TRÌNH
      =============================================== */}
      {showModalYeuCau && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl animate-fade-in">
            <h2 className="text-xl font-black mb-1 text-slate-800 tracking-tight">Gửi Giải Trình</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Báo cáo nghỉ phép, đi muộn hoặc quên chấm công.</p>
            
            <div className="grid gap-4">
              <div>
                <label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Ngày áp dụng</label>
                <input type="date" value={ycNgay} onChange={(e) => setYcNgay(e.target.value)} className="bg-slate-50 p-3.5 rounded-xl w-full text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none border border-slate-100 focus:border-blue-300 transition-all" />
              </div>
              
              <div>
                <label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Loại yêu cầu</label>
                <select value={ycLoai} onChange={(e) => setYcLoai(e.target.value)} className="bg-slate-50 p-3.5 rounded-xl w-full text-slate-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none border border-slate-100 focus:border-blue-300 transition-all">
                  <option value="Quên Check-in">Quên Check-in</option>
                  <option value="Quên Check-out">Quên Check-out</option>
                  <option value="Xin nghỉ phép">Xin nghỉ phép</option>
                  <option value="Đi muộn / Về sớm">Đi muộn / Về sớm</option>
                </select>
              </div>

              {(ycLoai === "Quên Check-in" || ycLoai === "Quên Check-out" || ycLoai === "Đi muộn / Về sớm") && (
                <div>
                  <label className="text-[10px] text-blue-600 font-bold ml-2 mb-1.5 block uppercase">Giờ đề xuất (Bắt buộc)</label>
                  <input type="time" value={ycThoiGian} onChange={(e) => setYcThoiGian(e.target.value)} className="bg-blue-50 p-3.5 rounded-xl w-full text-blue-900 font-black focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none border border-blue-200 focus:border-blue-400 transition-all" />
                </div>
              )}

              <div>
                <label className="text-[10px] text-slate-500 font-bold ml-2 mb-1.5 block uppercase">Lý do chi tiết</label>
                <textarea placeholder="VD: Sáng nay em quên cầm điện thoại..." value={ycLyDo} onChange={(e) => setYcLyDo(e.target.value)} className="bg-slate-50 p-3.5 rounded-xl w-full text-slate-900 font-medium focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none border border-slate-100 focus:border-blue-300 transition-all min-h-[90px]" />
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowModalYeuCau(false)} className="px-5 py-3.5 bg-slate-100 font-bold text-slate-600 rounded-xl hover:bg-slate-200 active:scale-95 transition-all text-sm">Hủy</button>
                <button onClick={guiYeuCau} className="flex-1 bg-blue-600 text-white font-black py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all text-sm flex items-center justify-center gap-2">GỬI CHO QUẢN LÝ</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}