import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Trash2, Save, Receipt, Plus } from "lucide-react";

export default function TabChiPhi({ formatTienInput }: { formatTienInput: (v: string) => string }) {
  const homNay = new Date().toISOString().slice(0, 10);
  const [ngay, setNgay] = useState(homNay);
  const [hangMuc, setHangMuc] = useState("Tiền mặt bằng");
  const [hangMucKhac, setHangMucKhac] = useState("");
  const [soTien, setSoTien] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  
  const [danhSachChiPhi, setDanhSachChiPhi] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "chiPhi"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDanhSachChiPhi(data.sort((a: any, b: any) => new Date(b.ngay).getTime() - new Date(a.ngay).getTime()));
    }, (error) => {
      console.error("Lỗi tải dữ liệu chi phí: ", error);
    });
    return () => unsub();
  }, []);

  const luuChiPhi = async () => {
    if (!ngay || !soTien) { toast.error("Vui lòng nhập Ngày và Số tiền!"); return; }
    const hangMucChot = hangMuc === "Khác" ? hangMucKhac : hangMuc;
    if (!hangMucChot) { toast.error("Vui lòng nhập hạng mục chi!"); return; }

    try {
      // Chuyển đổi chuỗi tiền có dấu chấm sang kiểu số nguyên an toàn tuyệt đối
      const soTienThuan = Number(soTien.replace(/\./g, ""));
      
      await addDoc(collection(db, "chiPhi"), {
        ngay,
        hangMuc: hangMucChot,
        soTien: isNaN(soTienThuan) ? 0 : soTienThuan,
        ghiChu: ghiChu || ""
      });
      toast.success("Đã ghi chép khoản chi!");
      setSoTien(""); setGhiChu(""); setHangMucKhac("");
    } catch (error: any) { 
      console.error(error);
      toast.error("Lỗi lưu dữ liệu: " + (error?.message || "Kiểm tra lại kết nối")); 
    }
  };

  const xoaChiPhi = async (id: string) => {
    if (confirm("Chắc chắn xóa khoản chi này khỏi sổ sách?")) {
      try {
        await deleteDoc(doc(db, "chiPhi", id));
        toast.success("Đã xóa khoản chi");
      } catch (e) {
        toast.error("Không thể xóa!");
      }
    }
  };

  const tongChiThangNay = danhSachChiPhi
    .filter(c => c.ngay && c.ngay.startsWith(homNay.slice(0, 7)))
    .reduce((acc, curr) => acc + (Number(curr.soTien) || 0), 0);

  return (
    <div className="pb-24 animate-fade-in max-w-3xl mx-auto px-1 mt-4">
      
      <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-3xl p-6 text-white shadow-xl shadow-red-200 mb-6 relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] text-8xl opacity-10 pointer-events-none">📉</div>
        <h2 className="text-sm font-black text-rose-200 uppercase tracking-widest mb-1">Chi phí vận hành tháng này</h2>
        <div className="text-4xl font-black">{formatTienInput(String(tongChiThangNay))}đ</div>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
        <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><Plus size={20} className="text-rose-500"/> Ghi sổ chi phí</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Ngày chi (*)</label>
            <input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-rose-50 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Số tiền (*)</label>
            <div className="relative">
              <input type="text" value={soTien} onChange={(e) => setSoTien(formatTienInput(e.target.value))} placeholder="0" className="bg-white border-2 border-rose-100 p-3.5 rounded-2xl w-full text-rose-600 font-black outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 pr-8 transition-all text-lg" />
              <span className="absolute right-3 top-4 text-rose-400 font-black">đ</span>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Hạng mục chi (*)</label>
            <select value={hangMuc} onChange={(e) => setHangMuc(e.target.value)} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-rose-50 transition-all">
              <option value="Tiền mặt bằng">🏠 Tiền mặt bằng</option>
              <option value="Điện, nước, mạng">⚡ Điện, nước, mạng</option>
              <option value="Marketing & Quảng cáo">📈 Marketing & Quảng cáo</option>
              <option value="Mua sắm thiết bị, váy">🛍️ Mua sắm (Máy ảnh, váy...)</option>
              <option value="Sửa chữa, bảo trì">🔧 Sửa chữa, bảo trì</option>
              <option value="Sinh hoạt tiệm (Ăn uống)">🍜 Sinh hoạt tiệm (Ăn uống)</option>
              <option value="Khác">✨ Khác...</option>
            </select>
          </div>
          {hangMuc === "Khác" ? (
             <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Tên hạng mục (*)</label>
              <input type="text" value={hangMucKhac} onChange={(e) => setHangMucKhac(e.target.value)} placeholder="Nhập tên khoản chi..." className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-slate-900 font-bold outline-none focus:ring-4 focus:ring-rose-50" />
            </div>
          ) : (
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 block mb-1.5">Ghi chú chi tiết</label>
              <input type="text" value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} placeholder="VD: Mua váy mới size M..." className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl w-full text-slate-900 font-medium outline-none focus:ring-4 focus:ring-rose-50" />
            </div>
          )}
        </div>
        <button onClick={luuChiPhi} className="w-full bg-rose-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-700 active:scale-95 shadow-lg shadow-rose-200 transition-all text-sm mt-5">
          <Save size={18}/> LƯU VÀO SỔ CHI PHÍ
        </button>
      </div>

      <div>
        <h3 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-2"><Receipt size={20} className="text-slate-500"/> Lịch sử chi tiêu</h3>
        <div className="space-y-3">
          {danhSachChiPhi.length === 0 ? (
             <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-white text-slate-400 font-bold text-sm">Chưa có khoản chi nào.</div>
          ) : (
            danhSachChiPhi.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{item.ngay ? item.ngay.split('-').reverse().join('/') : ''}</span>
                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md uppercase">{item.hangMuc}</span>
                  </div>
                  {item.ghiChu && <div className="text-sm font-bold text-slate-700 mt-1">{item.ghiChu}</div>}
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  <div className="font-black text-rose-600 text-lg">-{formatTienInput(String(item.soTien || 0))}đ</div>
                  <button onClick={() => xoaChiPhi(item.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 bg-slate-50 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}