import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { collection, addDoc, doc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { PhatSinh, TaiKhoan, Lich, KhachHang, ThuHuong } from "../../types";
import ModalHoaHongPhatSinh from "./ModalHoaHongPhatSinh";
import { CheckCircle2, UserCheck, Wallet, Search, ChevronDown, HandCoins, Landmark } from "lucide-react";

function chuyenTienVeSo(value: string) { return Number(value.replace(/\./g, "")); }

interface TabPhatSinhProps {
  formatTienInput: (val: string) => string;
  danhSachPhatSinh: PhatSinh[];
  laAdmin: boolean;
  hoSoCuaToi: TaiKhoan | null;
  themThuHuong: (uid: string, email: string, hoTen: string, ngay: string, moTa: string, soTien: string) => Promise<void>;
  danhDauDaTraDo: (id: string) => Promise<void>;
  lichLamViec: Lich[]; 
  danhSachKhachHang: KhachHang[];
  danhSachThuHuong: ThuHuong[];
}

export default function TabPhatSinh({
  formatTienInput, danhSachPhatSinh, laAdmin, hoSoCuaToi, themThuHuong, danhDauDaTraDo, lichLamViec, danhSachKhachHang, danhSachThuHuong
}: TabPhatSinhProps) {

  const localToday = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(localToday);
  const [currentMonth, setCurrentMonth] = useState(new Date(localToday));

  const [psKhachHangId, setPsKhachHangId] = useState<string | null>(null);
  const [psNgay, setPsNgay] = useState(localToday);
  const [psTenKhach, setPsTenKhach] = useState("");
  const [psSoDienThoai, setPsSoDienThoai] = useState("");
  
  const [psLoaiDaChon, setPsLoaiDaChon] = useState("");
  const [psLoaiKhac, setPsLoaiKhac] = useState("");
  
  const [psNgayTra, setPsNgayTra] = useState("");
  const [psSoTien, setPsSoTien] = useState("");
  
  // STATE MỚI CHO TIỀN MẶT / CHUYỂN KHOẢN
  const [psPhuongThuc, setPsPhuongThuc] = useState<"Tiền mặt" | "Chuyển khoản">("Chuyển khoản");
  
  const [psGhiChu, setPsGhiChu] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showHoaHongModal, setShowHoaHongModal] = useState(false);
  const [phatSinhDangChon, setPhatSinhDangChon] = useState<PhatSinh | null>(null);
  const [tienHoaHong, setTienHoaHong] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");

  useEffect(() => {
    if (showModal || showHoaHongModal) document.body.style.overflow = "hidden"; 
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal, showHoaHongModal]);

  useEffect(() => {
    if (psSoDienThoai.length >= 9) {
      const khachCu = danhSachKhachHang.find(kh => kh.soDienThoai === psSoDienThoai);
      if (khachCu) {
        setPsKhachHangId(khachCu.id!);
        setPsTenKhach(khachCu.tenKhach);
      } else { setPsKhachHangId(null); }
    } else if (psSoDienThoai.length < 9) { setPsKhachHangId(null); }
  }, [psSoDienThoai, danhSachKhachHang]);

  const isThueDo = (loai: string) => (loai || "").toLowerCase().includes("thuê");

  const phatSinhTheoNgay = danhSachPhatSinh.reduce((acc: Record<string, PhatSinh[]>, item) => {
    if (!acc[item.ngay]) acc[item.ngay] = [];
    acc[item.ngay].push(item); return acc;
  }, {});

  const year = currentMonth.getFullYear(); const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1); const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7; 
  const daysArray: (string | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) daysArray.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);

  const goToToday = () => { setCurrentMonth(new Date(localToday)); setSelectedDate(localToday); setTuKhoa(""); };

  const xoaPhatSinh = async (id?: string) => { 
    if (!id) return; if (!laAdmin) { toast.error("Chỉ admin mới được xóa"); return; } 
    if (!confirm("Xóa khoản này?")) return; 
    
    const oldPS = danhSachPhatSinh.find(p => p.id === id);
    if (oldPS && oldPS.khachHangId) {
        try { await updateDoc(doc(db, "khachHang", oldPS.khachHangId), { tongChiTieu: increment(-(Number(oldPS.soTien || 0))), soLanDen: increment(-1) }); } catch(e){}
    }

    await deleteDoc(doc(db, "phatSinh", id)); toast.success("Đã xóa"); 
  };

  const xacNhanNhanTien = () => {
    if (!tienHoaHong) { toast.error("Vui lòng nhập số tiền!"); return; }
    if (!hoSoCuaToi) { toast.error("Không tìm thấy tài khoản!"); return; }
    if (!phatSinhDangChon) return; 
    const moTaJob = `[Tư vấn ${phatSinhDangChon.loai}] KH: ${phatSinhDangChon.tenKhach || "Khách vãng lai"}`;
    
    const daBaoCao = danhSachThuHuong?.some(th => th.uid === hoSoCuaToi.id && th.moTa === moTaJob);
    if (daBaoCao) { toast.error("Bạn đã nhận hoa hồng cho khoản này rồi!"); return; }

    themThuHuong(hoSoCuaToi.id, hoSoCuaToi.email, hoSoCuaToi.hoTen || "", phatSinhDangChon.ngay, moTaJob, tienHoaHong);
    setShowHoaHongModal(false); setTienHoaHong("");
  };

  const handleThemPhatSinh = async () => {
    const finalLoai = psLoaiDaChon === "Khác" && psLoaiKhac.trim() !== "" ? psLoaiKhac.trim() : psLoaiDaChon;

    if (!psNgay || !finalLoai || !psSoTien || !psTenKhach || !psSoDienThoai) { 
      toast.error("Vui lòng điền đủ Ngày, Khách, SĐT, Dịch vụ & Tiền!"); return; 
    }
    if (isThueDo(finalLoai) && !psNgayTra) {
      toast.error("Với dịch vụ Thuê đồ, vui lòng chọn Ngày trả!"); return; 
    }

    let finalKhId = psKhachHangId;
    const tienPhatSinhMoi = chuyenTienVeSo(psSoTien);

    try {
      if (!finalKhId) {
        const khRef = await addDoc(collection(db, "khachHang"), {
          tenKhach: psTenKhach, soDienThoai: psSoDienThoai, 
          nguonKhach: "Tự động tạo từ Phát sinh", 
          ngayTao: new Date().toISOString(),
          tongChiTieu: tienPhatSinhMoi,
          soLanDen: 1
        });
        finalKhId = khRef.id;
        toast.success(`Đã tự động tạo Hồ sơ CRM cho khách mới!`);
      } else {
         try { await updateDoc(doc(db, "khachHang", finalKhId), { tongChiTieu: increment(tienPhatSinhMoi), soLanDen: increment(1) }); } catch(e){}
      }

      await addDoc(collection(db, "phatSinh"), { 
        khachHangId: finalKhId,
        ngay: psNgay, tenKhach: psTenKhach, soDienThoai: psSoDienThoai, 
        loai: finalLoai, ngayTra: isThueDo(finalLoai) ? psNgayTra : "", 
        soTien: tienPhatSinhMoi, 
        phuongThuc: psPhuongThuc, // Đã đẩy Hình thức thanh toán vào đây
        nguoiGhi: hoSoCuaToi?.email || "", ghiChu: psGhiChu 
      }); 
      
      setPsNgay(localToday); setPsTenKhach(""); setPsSoDienThoai(""); 
      setPsLoaiDaChon(""); setPsLoaiKhac(""); setPsNgayTra(""); setPsSoTien(""); 
      setPsPhuongThuc("Chuyển khoản"); setPsGhiChu(""); 
      setShowModal(false);
      toast.success("Đã lưu dịch vụ phát sinh"); 
    } catch (error) { toast.error("Lỗi cập nhật CSDL"); }
  };

  let dsGiaoDichNgayNay = tuKhoa.trim() ? danhSachPhatSinh.filter(item => (item.tenKhach || "").toLowerCase().includes(tuKhoa.toLowerCase()) || (item.soDienThoai || "").includes(tuKhoa)) : (phatSinhTheoNgay[selectedDate] || []);
  const dsTraDoNgayNay = danhSachPhatSinh.filter((ps) => isThueDo(ps.loai) && ps.ngayTra === selectedDate);
  const finalLoaiHienTai = psLoaiDaChon === "Khác" ? psLoaiKhac : psLoaiDaChon;

  return (
    <div className="pb-24 px-2 pt-2 animate-fade-in">
      <div className="mb-4 relative">
        <input type="text" placeholder="Tìm bằng Tên hoặc SĐT..." value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} className="w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl shadow-sm outline-none font-bold text-slate-700 focus:ring-4 focus:ring-emerald-50 transition-all" />
        <Search size={20} className="absolute left-4 top-4 text-slate-400" />
      </div>

      {!tuKhoa.trim() && (
        <div className="bg-white rounded-3xl shadow-sm p-5 mb-6 border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <button onClick={goToToday} className="text-xs font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-xl active:scale-95 transition-all">Hôm nay</button>
            <div className="font-black text-slate-800 text-sm uppercase tracking-wide">Tháng {month + 1}, {year}</div>
          </div>
          <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (<div key={d} className="text-[10px] font-black text-slate-400 mb-2">{d}</div>))}
            {daysArray.map((dateStr, idx) => {
              if (!dateStr) return <div key={idx} className="p-2"></div>;
              const isSelected = dateStr === selectedDate;
              return (
                <div key={dateStr} className="flex flex-col items-center justify-start h-12 relative">
                  <button onClick={() => setSelectedDate(dateStr)} className={`w-10 h-10 rounded-2xl text-sm font-bold transition-all ${isSelected ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}>{parseInt(dateStr.split('-')[2])}</button>
                  <div className="mt-1 flex gap-1 h-1.5 absolute bottom-[-4px]">
                    {(phatSinhTheoNgay[dateStr] || []).length > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-emerald-300" : "bg-emerald-500"}`}></span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {dsTraDoNgayNay.length > 0 && !tuKhoa.trim() && (
        <div className="mb-8">
          <h3 className="font-black text-slate-800 text-lg mb-3 px-1">🛎️ Trả đồ hôm nay</h3>
          {dsTraDoNgayNay.map((item: PhatSinh) => (
            <div key={`tra-${item.id}`} className={`p-5 rounded-3xl border mb-3 shadow-sm ${item.daTraDo ? "bg-slate-50 opacity-60" : "bg-orange-50 border-orange-200"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-black text-lg flex items-center gap-1.5">{item.tenKhach} {item.khachHangId && <span title="Khách hàng CRM"><UserCheck size={14} className="text-emerald-500"/></span>}</div>
                  <div className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-md w-fit mt-1">{item.loai}</div>
                </div>
                {item.daTraDo ? <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-lg">ĐÃ TRẢ</span> : <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-sm">CHƯA TRẢ</span>}
              </div>
              {!item.daTraDo && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-orange-200">
                  <button onClick={() => item.id && danhDauDaTraDo(item.id)} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-black active:scale-95 transition-all shadow-sm">✅ Xác nhận đã nhận lại đồ</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mb-4 flex justify-between items-end px-1 mt-6">
        <div><h3 className="font-black text-slate-800 text-lg">{tuKhoa.trim() ? "Kết quả tìm kiếm" : "Dịch vụ phát sinh"}</h3><p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{tuKhoa.trim() ? `Từ khóa: "${tuKhoa}"` : `Ngày ${selectedDate.split("-").reverse().join("/")}`}</p></div>
        <div className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">{dsGiaoDichNgayNay.length} Giao dịch</div>
      </div>

      <div className="space-y-4">
        {dsGiaoDichNgayNay.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4 opacity-50 grayscale">💵</div>
            <h4 className="text-slate-600 font-bold text-base">Không có giao dịch</h4>
          </div>
        ) : (
          [...dsGiaoDichNgayNay].reverse().map((item: PhatSinh) => (
            <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-100 mb-3 shadow-sm relative hover:shadow-md transition-all">
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isThueDo(item.loai) ? "bg-orange-500" : "bg-emerald-500"}`}></div>
              <div className="flex justify-between ml-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                     <div className="text-[10px] font-black px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 w-fit">{item.loai}</div>
                     {/* Báo hiệu Nhận tiền mặt hay chuyển khoản */}
                     {item.phuongThuc === "Tiền mặt" ? (
                        <div className="text-[10px] font-black px-2 py-1 rounded-md border border-emerald-200 text-emerald-600 bg-emerald-50/50 flex items-center gap-1"><HandCoins size={12}/> TM</div>
                     ) : (
                        <div className="text-[10px] font-black px-2 py-1 rounded-md border border-blue-200 text-blue-600 bg-blue-50/50 flex items-center gap-1"><Landmark size={12}/> CK</div>
                     )}
                  </div>
                  
                  <div className="font-black text-slate-800 text-lg flex items-center gap-1.5 mt-1">
                    {item.tenKhach} {item.khachHangId && <span title="Khách hàng CRM"><UserCheck size={16} className="text-emerald-500"/></span>}
                  </div>
                  {item.ghiChu && <div className="text-xs font-medium text-slate-500 mt-1 italic">{item.ghiChu}</div>}
                </div>
                <div className="text-xl font-black text-emerald-600">+{formatTienInput(String(item.soTien || 0))}</div>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 ml-2">
                <button onClick={() => { setPhatSinhDangChon(item); setShowHoaHongModal(true); }} className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">🙋‍♂️ Nhận hoa hồng</button>
                {laAdmin && item.id && <button onClick={() => xoaPhatSinh(item.id as string)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">🗑</button>}
              </div>
            </div>
          ))
        )}
      </div>

      <button onClick={() => { setPsNgay(selectedDate); setShowModal(true); }} className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full text-3xl shadow-xl shadow-emerald-200/50 z-40 hover:scale-110 active:scale-90 transition-all flex items-center justify-center"><Wallet size={24}/></button>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-[100] sm:p-4 overscroll-none touch-none">
          <div className="bg-white w-full sm:max-w-md h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in touch-auto border border-white">
            
            <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-200 shrink-0 shadow-sm z-10">
              <button onClick={() => setShowModal(false)} className="text-slate-500 font-bold px-4 py-2 hover:bg-slate-200 rounded-xl transition-all active:scale-95">Hủy</button>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                ✨ Dịch vụ phát sinh
              </h3>
              <button onClick={handleThemPhatSinh} className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 font-black px-4 py-2 rounded-xl transition-all active:scale-95">LƯU</button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 pb-12 overscroll-contain">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">SĐT Khách Hàng (*)</label>
                  <div className="relative">
                    <input type="tel" value={psSoDienThoai} onChange={(e) => setPsSoDienThoai(e.target.value)} placeholder="Nhập SĐT để tìm kiếm tự động..." className={`bg-slate-50 border p-3.5 rounded-2xl w-full text-slate-900 font-black outline-none focus:ring-4 transition-all pr-24 ${psKhachHangId ? "border-emerald-200 focus:ring-emerald-50 bg-emerald-50/30" : "border-slate-100 focus:ring-emerald-50"}`} />
                    {psKhachHangId && <span className="absolute right-3 top-3.5 text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12}/> Khách cũ</span>}
                    {!psKhachHangId && psSoDienThoai.length >= 9 && <span className="absolute right-3 top-3.5 text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-1 rounded-lg uppercase tracking-wider">✨ Tạo mới</span>}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5 flex justify-between">
                    Tên Khách Hàng (*) 
                    {psKhachHangId && <span className="text-emerald-500 italic lowercase">(Đã tự điền)</span>}
                  </label>
                  <input type="text" value={psTenKhach} onChange={(e) => setPsTenKhach(e.target.value)} placeholder="Tên khách hàng..." className={`border p-3.5 rounded-2xl w-full font-bold outline-none focus:ring-4 transition-all ${psKhachHangId ? "bg-emerald-50/30 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-100 text-slate-900 focus:ring-emerald-50"}`} />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Ngày phát sinh (*)</label>
                  <input type="date" value={psNgay} onChange={(e) => setPsNgay(e.target.value)} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-emerald-700 font-black outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 transition-all" />
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Loại dịch vụ (*)</label>
                  <div className="relative">
                    <select 
                      value={psLoaiDaChon} 
                      onChange={(e) => setPsLoaiDaChon(e.target.value)} 
                      className="appearance-none bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-emerald-50 transition-all pr-8"
                    >
                      <option value="">- Chọn dịch vụ -</option>
                      <optgroup label="👗 Nhóm Cho Thuê">
                        <option value="Thuê váy">Thuê váy</option>
                        <option value="Thuê vest">Thuê vest</option>
                        <option value="Thuê áo dài">Thuê áo dài</option>
                        <option value="Thuê phụ kiện">Thuê phụ kiện</option>
                      </optgroup>
                      <optgroup label="💄 Nhóm Dịch vụ lẻ">
                        <option value="Make-up lẻ">Make-up lẻ</option>
                        <option value="In thêm ảnh">In thêm ảnh / Khung</option>
                        <option value="Chụp lấy ngay">Chụp thẻ / Lấy ngay</option>
                        <option value="Bán lẻ">Bán phụ kiện lẻ</option>
                      </optgroup>
                      <optgroup label="⚠️ Nhóm Phụ phí">
                        <option value="Phí di chuyển">Phí di chuyển</option>
                        <option value="Phí chụp thêm">Phí chụp thêm giờ</option>
                        <option value="Phí đền bù">Phí đền bù / Giặt là</option>
                      </optgroup>
                      <option value="Khác">✨ Khác...</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {psLoaiDaChon === "Khác" && (
                   <div className="col-span-2 animate-fade-in">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Nhập dịch vụ khác (*)</label>
                     <input type="text" value={psLoaiKhac} onChange={(e) => setPsLoaiKhac(e.target.value)} placeholder="VD: Thuê xe đi ngoại cảnh..." className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-emerald-50 transition-all" />
                   </div>
                )}

                {isThueDo(finalLoaiHienTai) && (
                   <div className="col-span-2 animate-fade-in">
                     <label className="text-[10px] font-bold text-orange-500 uppercase tracking-widest ml-2 block mb-1.5">Ngày hẹn trả đồ (*)</label>
                     <input type="date" value={psNgayTra} onChange={(e) => setPsNgayTra(e.target.value)} className="bg-orange-50 border border-orange-100 p-3.5 rounded-2xl w-full text-orange-700 font-black outline-none focus:ring-4 focus:ring-orange-100 transition-all" />
                   </div>
                )}

                <div className="col-span-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Số tiền (*)</label>
                   <div className="relative">
                      <input type="text" value={psSoTien} onChange={(e) => setPsSoTien(formatTienInput(e.target.value))} placeholder="0" className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-emerald-700 font-black outline-none focus:ring-4 focus:ring-emerald-50 pr-8 transition-all text-lg" />
                      <span className="absolute right-4 top-4 text-slate-400 font-black">đ</span>
                   </div>

                   {/* NÚT CHỌN PHƯƠNG THỨC THANH TOÁN (DỊCH VỤ PHÁT SINH) */}
                   <div className="flex gap-1 mt-2">
                     <button type="button" onClick={(e) => { e.preventDefault(); setPsPhuongThuc("Tiền mặt"); }} className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-xs font-black border-2 transition-all ${psPhuongThuc === 'Tiền mặt' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}><HandCoins size={16}/> Tiền mặt</button>
                     <button type="button" onClick={(e) => { e.preventDefault(); setPsPhuongThuc("Chuyển khoản"); }} className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-xs font-black border-2 transition-all ${psPhuongThuc === 'Chuyển khoản' ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}><Landmark size={16}/> Chuyển khoản</button>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 block mb-1.5">Ghi chú thêm</label>
                  <textarea value={psGhiChu} onChange={(e) => setPsGhiChu(e.target.value)} placeholder="Tình trạng đồ, yêu cầu của khách..." className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-slate-900 font-medium outline-none focus:ring-4 focus:ring-emerald-50 transition-all" rows={2}></textarea>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      <ModalHoaHongPhatSinh showHoaHongModal={showHoaHongModal} setShowHoaHongModal={setShowHoaHongModal} phatSinhDangChon={phatSinhDangChon} tienHoaHong={tienHoaHong} setTienHoaHong={setTienHoaHong} formatTienInput={formatTienInput} xacNhanNhanTien={xacNhanNhanTien} />
    </div>
  );
}