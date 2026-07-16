import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ChamCong, TaiKhoan } from "../../types";
import { collection, addDoc, doc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";

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
  const [currentTime, setCurrentTime] = useState(() => 
    new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  );
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

  // Cập nhật đồng hồ realtime
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const myRecordToday = danhSachChamCong.find((cc) => cc.uid === hoSoCuaToi?.id && cc.ngay === todayStr);

  // ==========================================
  // 1. LƯU CHECK-IN / CHECK-OUT
  // ==========================================
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

  // ==========================================
  // 2. NHÂN VIÊN GỬI YÊU CẦU
  // ==========================================
  const guiYeuCau = async () => {
    if (!ycLoai || !ycLyDo) return toast.error("Vui lòng điền đủ loại và lý do!");
    if (!hoSoCuaToi) return;

    const recordExist = danhSachChamCong.find(cc => cc.uid === hoSoCuaToi.id && cc.ngay === ycNgay);
    const lyDoChiTiet = ycThoiGian ? `[Đề xuất giờ: ${ycThoiGian}] - ${ycLyDo}` : ycLyDo;

    // ĐÃ THÊM: Lưu lại thoiGianDeXuat vào DB để lát Admin duyệt là tự điền
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

  // ==========================================
  // 3. ADMIN DUYỆT YÊU CẦU TỰ ĐỘNG GHI GIỜ
  // ==========================================
  const duyetYeuCau = async (yc: ChamCong, trangThai: "Đã duyệt" | "Từ chối") => {
    if (!confirm(`Bạn chắc chắn muốn ${trangThai.toLowerCase()} yêu cầu này?`)) return;
    try {
      let updates: any = { trangThaiGiaiTrinh: trangThai };
      
      // NẾU DUYỆT -> TỰ ĐỘNG LẤY GIỜ ĐỀ XUẤT ĐỂ GHI VÀO CHECK-IN/OUT
      if (trangThai === "Đã duyệt" && (yc as any).thoiGianDeXuat) {
        const time = (yc as any).thoiGianDeXuat;
        if (yc.loaiGiaiTrinh === "Quên Check-in" || yc.loaiGiaiTrinh === "Đi muộn / Về sớm") {
          updates.checkIn = time;
          // Tự tính lại đi muộn
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

  // ==========================================
  // 4. ADMIN SỬA GIỜ THỦ CÔNG
  // ==========================================
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
        trangThaiGiaiTrinh: "Đã duyệt" // Coi như admin đã can thiệp thì hợp lệ
      });
      toast.success("Đã ghi đè giờ công!");
      setShowAdminSua(false);
    } catch(e) { toast.error("Lỗi cập nhật!"); }
  };

  // DATA
  const yeuCauChoDuyet = danhSachChamCong.filter(cc => cc.trangThaiGiaiTrinh === "Chờ duyệt");
  const lichSuHienThi = laAdmin 
      ? danhSachChamCong.sort((a, b) => b.ngay.localeCompare(a.ngay)).slice(0, 50) // Admin xem lịch sử tất cả
      : danhSachChamCong.filter(cc => cc.uid === hoSoCuaToi?.id).sort((a, b) => b.ngay.localeCompare(a.ngay)).slice(0, 15); // NV xem của mình

  return (
    <div className="pb-24 px-2 pt-4">
      
      {/* 1. KHU VỰC CHẤM CÔNG */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6 text-center">
        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Ngày {todayStr.split("-").reverse().join("/")}</div>
        <div className="text-5xl font-black text-gray-900 mb-8 tracking-tighter">{currentTime || "00:00"}</div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={handleCheckIn} disabled={!!myRecordToday?.checkIn} className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all shadow-lg ${myRecordToday?.checkIn ? "bg-gray-100 text-gray-400 opacity-70" : "bg-gradient-to-b from-blue-500 to-blue-600 text-white hover:scale-105 active:scale-95 shadow-blue-200"}`}>
            <span className="text-3xl mb-2">👋</span><span className="font-black text-lg">CHECK IN</span>
            <span className="text-[10px] mt-1 opacity-80 font-bold uppercase">{myRecordToday?.checkIn ? `Lúc ${myRecordToday.checkIn}` : "Bắt đầu ca"}</span>
          </button>
          <button onClick={handleCheckOut} disabled={!myRecordToday?.checkIn || !!myRecordToday?.checkOut} className={`flex flex-col items-center justify-center p-6 rounded-2xl transition-all shadow-lg ${!myRecordToday?.checkIn || myRecordToday?.checkOut ? "bg-gray-100 text-gray-400 opacity-70" : "bg-gradient-to-b from-orange-500 to-red-500 text-white hover:scale-105 active:scale-95 shadow-red-200"}`}>
            <span className="text-3xl mb-2">🏃‍♂️</span><span className="font-black text-lg">CHECK OUT</span>
            <span className="text-[10px] mt-1 opacity-80 font-bold uppercase">{myRecordToday?.checkOut ? `Lúc ${myRecordToday.checkOut}` : "Kết thúc ca"}</span>
          </button>
        </div>
      </div>

      {/* 2. ADMIN: YÊU CẦU & BẢNG CÔNG TỔNG */}
      {laAdmin && (
        <>
          {yeuCauChoDuyet.length > 0 && (
            <div className="mb-6 animate-fade-in">
              <h3 className="font-black text-red-600 flex items-center gap-2 mb-3 ml-1">
                <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                YÊU CẦU CHỜ DUYỆT ({yeuCauChoDuyet.length})
              </h3>
              <div className="space-y-3">
                {yeuCauChoDuyet.map(yc => {
                  const tk = danhSachTaiKhoan.find(t => t.id === yc.uid);
                  return (
                    <div key={yc.id} className="bg-white border-l-4 border-l-orange-400 rounded-2xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-gray-900">{tk?.hoTen || yc.email.split('@')[0]}</div>
                          <div className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md mt-1 uppercase w-fit">{yc.loaiGiaiTrinh}</div>
                        </div>
                        <div className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">Ngày {yc.ngay.split('-').reverse().join('/')}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl text-sm text-gray-700 border border-slate-100 mb-3 italic">"{yc.lyDoGiaiTrinh}"</div>
                      <div className="flex gap-2">
                        {/* ĐÃ CẬP NHẬT: Gọi hàm truyền thẳng record yc vào */}
                        <button onClick={() => duyetYeuCau(yc, "Đã duyệt")} className="flex-1 bg-green-50 text-green-700 font-bold py-2.5 rounded-xl border border-green-200 hover:bg-green-500 hover:text-white transition-all">✅ Duyệt ngay</button>
                        <button onClick={() => duyetYeuCau(yc, "Từ chối")} className="px-4 bg-red-50 text-red-600 font-bold py-2.5 rounded-xl border border-red-100 hover:bg-red-100 transition-all">❌ Từ chối</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mb-6">
            <h3 className="font-black text-gray-800 mb-4 text-sm uppercase">📋 Bảng công hôm nay</h3>
            <div className="grid gap-2">
              {danhSachTaiKhoan.filter(tk => tk.role !== "admin").map(tk => {
                const cc = danhSachChamCong.find(c => c.uid === tk.id && c.ngay === todayStr);
                return (
                  <div key={tk.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl">
                    <div className="font-bold text-slate-700 text-xs">{tk.hoTen || tk.email}</div>
                    <div className="flex gap-2">
                      {cc?.checkIn 
                        ? <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded">IN: {cc.checkIn}</span> 
                        : <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded">Chưa đến</span>
                      }
                      {cc?.checkOut && <span className="text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-100 px-2 py-1 rounded">OUT: {cc.checkOut}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* 3. LỊCH SỬ CHẤM CÔNG */}
      <div className="flex justify-between items-end mb-4 px-1">
        <h3 className="font-black text-gray-800 text-lg">{laAdmin ? "Lịch sử Toàn bộ" : "Lịch sử của tôi"}</h3>
        {!laAdmin && (
          <button onClick={() => setShowModalYeuCau(true)} className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:bg-slate-800 active:scale-95 transition-all">
            + Báo Quên/Nghỉ
          </button>
        )}
      </div>

      <div className="space-y-3">
        {lichSuHienThi.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-white text-sm">Chưa có dữ liệu.</div>
        ) : (
          lichSuHienThi.map(cc => {
            const tk = danhSachTaiKhoan.find(t => t.id === cc.uid);
            const tenHienThi = tk?.hoTen || cc.email.split('@')[0];
            
            // XỬ LÝ LỖI QUÊN CHECK-OUT QUA ĐÊM
            const quenCheckOut = cc.checkIn && !cc.checkOut && cc.ngay < todayStr && cc.trangThaiGiaiTrinh !== "Đã duyệt";

            return (
              <div key={cc.id} className={`bg-white rounded-2xl border p-4 shadow-sm flex justify-between items-center transition-all ${quenCheckOut ? "border-red-300 bg-red-50/30" : "border-gray-100"}`}>
                <div>
                  <div className="font-bold text-gray-800 flex items-center gap-2">
                    {cc.ngay.split('-').reverse().join('/')} 
                    {laAdmin && <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{tenHienThi}</span>}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 shadow-sm">In: {cc.checkIn || "--:--"}</span>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 shadow-sm">Out: {cc.checkOut || "--:--"}</span>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-1.5">
                  {/* Nếu Admin thì hiện nút Sửa */}
                  {laAdmin && (
                    <button onClick={() => moFormAdminSua(cc, tenHienThi)} className="text-[10px] text-slate-500 bg-slate-100 hover:bg-blue-100 hover:text-blue-600 px-2 py-1 rounded font-bold transition-all flex items-center gap-1">
                      ✏️ Sửa công
                    </button>
                  )}

                  {/* Hiển thị Trạng thái công */}
                  {cc.trangThaiGiaiTrinh ? (
                    <div className="text-right">
                      <div className="text-[9px] font-bold text-gray-500 truncate max-w-[100px] mb-0.5">{cc.loaiGiaiTrinh}</div>
                      <div className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${cc.trangThaiGiaiTrinh==="Đã duyệt" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{cc.trangThaiGiaiTrinh}</div>
                    </div>
                  ) : quenCheckOut ? (
                    <div className="text-[10px] font-black text-red-600 bg-red-100 border border-red-200 px-2 py-1 rounded-md uppercase animate-pulse">⚠️ Lỗi / Quên Out</div>
                  ) : cc.diMuon ? (
                    <div className="text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-md uppercase">Đi muộn</div>
                  ) : cc.checkIn ? (
                    <div className="text-[10px] font-black text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-md uppercase">Hợp lệ</div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ==============================================
          MODAL: ADMIN SỬA GIỜ THỦ CÔNG 
      =============================================== */}
      {showAdminSua && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl animate-fade-in border border-white">
            <h2 className="text-xl font-black mb-1 text-blue-600">🛠 Bàn Tay Sắt</h2>
            <p className="text-xs text-gray-500 mb-5 font-medium">Sửa công trực tiếp cho <strong className="text-slate-800">{editTenNhanVien}</strong> (Ngày {editNgay.split('-').reverse().join('/')})</p>
            
            <div className="grid gap-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Giờ Check-In</label>
                  <input type="time" value={editCheckIn} onChange={(e) => setEditCheckIn(e.target.value)} className="bg-blue-50 p-4 rounded-2xl w-full text-blue-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none border border-transparent focus:border-blue-300" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Giờ Check-Out</label>
                  <input type="time" value={editCheckOut} onChange={(e) => setEditCheckOut(e.target.value)} className="bg-orange-50 p-4 rounded-2xl w-full text-orange-900 font-bold focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none border border-transparent focus:border-orange-300" />
                </div>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 mt-2">
                <div className="text-[10px] font-bold text-amber-700 uppercase">Lưu ý:</div>
                <div className="text-xs text-amber-600 mt-1">Khi bạn bấm LƯU, hệ thống sẽ tự động coi ngày công này là hợp lệ (bỏ qua mọi vi phạm trước đó của ngày này).</div>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={luuAdminSuaCong} className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-slate-800 active:scale-95 transition-all">LƯU CẬP NHẬT</button>
                <button onClick={() => setShowAdminSua(false)} className="px-6 py-4 bg-gray-100 font-bold text-gray-600 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all">Đóng</button>
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
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 shadow-2xl animate-fade-in border border-white">
            <h2 className="text-xl font-black mb-1 text-gray-900">📝 Gửi Giải Trình</h2>
            <p className="text-xs text-gray-500 mb-5 font-medium">Báo cáo nghỉ phép, đi muộn hoặc quên chấm công.</p>
            
            <div className="grid gap-4">
              <div>
                <label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Ngày áp dụng</label>
                <input type="date" value={ycNgay} onChange={(e) => setYcNgay(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all border border-transparent focus:border-blue-300" />
              </div>
              
              <div>
                <label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Loại yêu cầu</label>
                <select value={ycLoai} onChange={(e) => setYcLoai(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all border border-transparent focus:border-blue-300">
                  <option value="Quên Check-in">👉 Quên Check-in</option>
                  <option value="Quên Check-out">🏃 Quên Check-out</option>
                  <option value="Xin nghỉ phép">🌴 Xin nghỉ phép</option>
                  <option value="Đi muộn / Về sớm">⏰ Đi muộn / Về sớm</option>
                </select>
              </div>

              {(ycLoai === "Quên Check-in" || ycLoai === "Quên Check-out" || ycLoai === "Đi muộn / Về sớm") && (
                <div>
                  <label className="text-[10px] text-blue-600 font-bold ml-2 mb-1.5 block uppercase">Đề xuất giờ (Để Admin duyệt)</label>
                  <input type="time" value={ycThoiGian} onChange={(e) => setYcThoiGian(e.target.value)} className="bg-blue-50 p-4 rounded-2xl w-full text-blue-900 font-black focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all border border-transparent focus:border-blue-300" />
                </div>
              )}

              <div>
                <label className="text-[10px] text-gray-500 font-bold ml-2 mb-1.5 block uppercase">Lý do chi tiết</label>
                <textarea placeholder="VD: Sáng nay quên cầm điện thoại..." value={ycLyDo} onChange={(e) => setYcLyDo(e.target.value)} className="bg-slate-50 p-4 rounded-2xl w-full text-gray-900 font-bold focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all border border-transparent focus:border-blue-300 min-h-[100px]" />
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={guiYeuCau} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">GỬI QUẢN LÝ</button>
                <button onClick={() => setShowModalYeuCau(false)} className="px-6 py-4 bg-gray-100 font-bold text-gray-600 rounded-2xl hover:bg-gray-200 active:scale-95 transition-all">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}