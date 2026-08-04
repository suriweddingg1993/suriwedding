import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { collection, addDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { PhatSinh, TaiKhoan, Lich } from "../../types";
import ModalThemPhatSinh from "./ModalThemPhatSinh";
import ModalHoaHongPhatSinh from "./ModalHoaHongPhatSinh";

function chuyenTienVeSo(value: string) { return Number(value.replace(/\./g, "")); }

interface TabPhatSinhProps {
  formatTienInput: (val: string) => string;
  danhSachPhatSinh: PhatSinh[];
  laAdmin: boolean;
  hoSoCuaToi: TaiKhoan | null;
  themThuHuong: (uid: string, email: string, hoTen: string, ngay: string, moTa: string, soTien: string) => Promise<void>;
  danhDauDaTraDo: (id: string) => Promise<void>;
  lichLamViec: Lich[]; 
}

export default function TabPhatSinh({
  formatTienInput, danhSachPhatSinh, laAdmin, hoSoCuaToi, themThuHuong, danhDauDaTraDo, lichLamViec
}: TabPhatSinhProps) {

  const localToday = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(localToday);
  const [currentMonth, setCurrentMonth] = useState(new Date(localToday));

  const [psNgay, setPsNgay] = useState(localToday);
  const [psTenKhach, setPsTenKhach] = useState("");
  const [psSoDienThoai, setPsSoDienThoai] = useState("");
  const [psLoai, setPsLoai] = useState("");
  const [psNgayTra, setPsNgayTra] = useState("");
  const [psSoTien, setPsSoTien] = useState("");
  const [psGhiChu, setPsGhiChu] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showHoaHongModal, setShowHoaHongModal] = useState(false);
  const [phatSinhDangChon, setPhatSinhDangChon] = useState<PhatSinh | null>(null);
  const [tienHoaHong, setTienHoaHong] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (showModal || showHoaHongModal) document.body.style.overflow = "hidden"; 
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal, showHoaHongModal]);

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

  const themPhatSinh = async () => {
    if (!psNgay || !psLoai || !psSoTien) { toast.error("Nhập ngày, loại và số tiền"); return; }
    try { 
      await addDoc(collection(db, "phatSinh"), { ngay: psNgay, tenKhach: psTenKhach, soDienThoai: psSoDienThoai, loai: psLoai, ngayTra: psNgayTra, soTien: chuyenTienVeSo(psSoTien), nguoiGhi: hoSoCuaToi?.email || "", ghiChu: psGhiChu }); 
      setPsNgay(localToday); setPsTenKhach(""); setPsSoDienThoai(""); setPsLoai(""); setPsNgayTra(""); setPsSoTien(""); setPsGhiChu(""); 
      toast.success("Đã lưu dịch vụ phát sinh"); 
    } catch (error) { toast.error("Lỗi cập nhật CSDL"); }
  };

  const xoaPhatSinh = async (id?: string) => { 
    if (!id) return; if (!laAdmin) { toast.error("Chỉ admin mới được xóa"); return; } 
    if (!confirm("Xóa khoản này?")) return; 
    await deleteDoc(doc(db, "phatSinh", id)); toast.success("Đã xóa"); 
  };

  const xacNhanNhanTien = () => {
    if (!tienHoaHong) { toast.error("Vui lòng nhập số tiền!"); return; }
    if (!hoSoCuaToi) { toast.error("Không tìm thấy tài khoản!"); return; }
    if (!phatSinhDangChon) return; 
    const moTaJob = `[Tư vấn ${phatSinhDangChon.loai}] KH: ${phatSinhDangChon.tenKhach || "Khách vãng lai"}`;
    themThuHuong(hoSoCuaToi.id, hoSoCuaToi.email, hoSoCuaToi.hoTen || "", phatSinhDangChon.ngay, moTaJob, tienHoaHong);
    setShowHoaHongModal(false); setTienHoaHong("");
  };

  const handleThemPhatSinh = async () => {
    const newErrors: Record<string, boolean> = {};
    if (!psNgay) newErrors.psNgay = true; if (!psLoai) newErrors.psLoai = true;
    if (!psSoTien || chuyenTienVeSo(psSoTien) <= 0) newErrors.psSoTien = true;
    if (isThueDo(psLoai) && !psNgayTra) newErrors.psNgayTra = true;
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); toast.error("Điền đủ thông tin bôi đỏ!"); return; }
    setErrors({}); await themPhatSinh(); setShowModal(false);
  };

  let dsGiaoDichNgayNay = tuKhoa.trim() ? danhSachPhatSinh.filter(item => (item.tenKhach || "").toLowerCase().includes(tuKhoa.toLowerCase()) || (item.soDienThoai || "").includes(tuKhoa)) : (phatSinhTheoNgay[selectedDate] || []);
  const dsTraDoNgayNay = danhSachPhatSinh.filter((ps) => isThueDo(ps.loai) && ps.ngayTra === selectedDate);

  return (
    <div className="pb-24 px-2 pt-2">
      <div className="mb-4"><input type="text" placeholder="🔍 Tìm bằng Tên, SĐT..." value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl shadow-sm outline-none font-bold" /></div>

      {!tuKhoa.trim() && (
        <div className="bg-white rounded-3xl shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-6"><button onClick={goToToday} className="text-xs font-bold bg-blue-50 text-blue-600 px-4 py-2 rounded-xl">Hôm nay</button></div>
          <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (<div key={d} className="text-[10px] font-black text-slate-400 mb-2">{d}</div>))}
            {daysArray.map((dateStr, idx) => {
              if (!dateStr) return <div key={idx} className="p-2"></div>;
              const isSelected = dateStr === selectedDate;
              return (
                <div key={dateStr} className="flex flex-col items-center justify-start h-12 relative">
                  <button onClick={() => setSelectedDate(dateStr)} className={`w-10 h-10 rounded-2xl text-sm font-bold ${isSelected ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-700"}`}>{parseInt(dateStr.split('-')[2])}</button>
                  <div className="mt-1 flex gap-1 h-1.5 absolute bottom-[-4px]">
                    {(phatSinhTheoNgay[dateStr] || []).length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
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
            <div key={`tra-${item.id}`} className={`p-5 rounded-3xl border mb-3 ${item.daTraDo ? "bg-slate-50 opacity-60" : "bg-orange-50 border-orange-200"}`}>
              <div className="flex justify-between items-start">
                <div><div className="font-black text-lg">{item.tenKhach}</div><div className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-md w-fit mt-1">{item.loai}</div></div>
                {item.daTraDo ? <span className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-lg">ĐÃ TRẢ</span> : <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg">CHƯA TRẢ</span>}
              </div>
              {!item.daTraDo && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-orange-200">
                  <button onClick={() => item.id && danhDauDaTraDo(item.id)} className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-black">✅ Đã nhận lại đồ</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {dsGiaoDichNgayNay.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center"><h4 className="text-slate-600 font-bold">Trống</h4></div>
        ) : (
          [...dsGiaoDichNgayNay].reverse().map((item: PhatSinh) => (
            <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-100 mb-3 shadow-sm relative">
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isThueDo(item.loai) ? "bg-orange-500" : "bg-blue-500"}`}></div>
              <div className="flex justify-between ml-2">
                <div><div className="text-[10px] font-black px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 w-fit mb-2">{item.loai}</div><div className="font-black">{item.tenKhach}</div></div>
                <div className="text-xl font-black text-green-600">+{formatTienInput(String(item.soTien || 0))}</div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 ml-2">
                {isThueDo(item.loai) ? <button onClick={() => { setPhatSinhDangChon(item); setShowHoaHongModal(true); }} className="bg-blue-50 text-blue-700 text-xs font-bold px-4 py-2 rounded-xl">🙋‍♂️ Hoa hồng</button> : <div></div>}
                {laAdmin && item.id && <button onClick={() => xoaPhatSinh(item.id as string)} className="text-slate-400 hover:text-red-500">🗑</button>}
              </div>
            </div>
          ))
        )}
      </div>

      <button onClick={() => { setPsNgay(selectedDate); setShowModal(true); }} className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full text-3xl shadow-xl z-40">+</button>

      <ModalThemPhatSinh showModal={showModal} setShowModal={setShowModal} psNgay={psNgay} setPsNgay={setPsNgay} psLoai={psLoai} setPsLoai={setPsLoai} psTenKhach={psTenKhach} setPsTenKhach={setPsTenKhach} psSoDienThoai={psSoDienThoai} setPsSoDienThoai={setPsSoDienThoai} psNgayTra={psNgayTra} setPsNgayTra={setPsNgayTra} psSoTien={psSoTien} setPsSoTien={setPsSoTien} psGhiChu={psGhiChu} setPsGhiChu={setPsGhiChu} errors={errors} formatTienInput={formatTienInput} handleThemPhatSinh={handleThemPhatSinh} isThueDo={isThueDo} lichLamViec={lichLamViec} />
      <ModalHoaHongPhatSinh showHoaHongModal={showHoaHongModal} setShowHoaHongModal={setShowHoaHongModal} phatSinhDangChon={phatSinhDangChon} tienHoaHong={tienHoaHong} setTienHoaHong={setTienHoaHong} formatTienInput={formatTienInput} xacNhanNhanTien={xacNhanNhanTien} />
    </div>
  );
}