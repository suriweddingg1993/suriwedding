import { useState } from "react";

import NutCopy from "./NutCopy";

import toast from "react-hot-toast";



export default function TabLich({

  dangSua, ngay, setNgay, gio, setGio, tenKhach, setTenKhach, soDienThoai, setSoDienThoai,

  theLoai, setTheLoai, theLoaiKhac, setTheLoaiKhac, goiChup, setGoiChup, giaTien, setGiaTien,

  formatTienInput, themHoacSuaLich, resetForm, lichTheoNgay, laAdmin, capNhatTrangThai, suaLich, xoaLich

}: any) {

  const [showModal, setShowModal] = useState(false);



  const copyZaloLich = (item: any) => {

    const text = `Dạ Suri Wedding chào anh/chị ${item.tenKhach}.\n\nEm xin phép nhắc lịch ${item.theLoai} của mình vào lúc ${item.gio} ngày ${item.ngay}.\nCần hỗ trợ gì thêm anh/chị cứ nhắn em ạ.`;

    navigator.clipboard.writeText(text);

    toast.success("Đã copy Zalo!");

  };



  return (

    <div className="pb-20">

      {/* DANH SÁCH TIMELINE */}

      <div className="space-y-6">

        {Object.entries(lichTheoNgay).sort(([a], [b]) => a.localeCompare(b)).map(([ngay, dsLich]: any) => (

          <div key={ngay}>

            <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm py-2 font-bold text-gray-700 flex items-center gap-2 z-10">

              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">{ngay}</span>

              <span className="text-sm text-gray-500">{dsLich.length} lịch</span>

            </div>

           

            <div className="space-y-3 mt-2">

              {[...dsLich].sort((a, b) => a.gio.localeCompare(b.gio)).map((item: any) => (

                <div key={item.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${

                    item.trangThai === "Đã cọc" ? "border-l-green-500" :

                    item.trangThai === "Hoàn thành" ? "border-l-gray-400" : "border-l-blue-400"

                  } border border-gray-100 flex items-center gap-4`}>

                    <div className="flex flex-col items-center min-w-[60px]">

                        <span className="font-bold text-lg text-blue-600">{item.gio}</span>

                        <span className="text-[10px] uppercase font-bold text-gray-400">{item.trangThai}</span>

                    </div>

                    <div className="flex-1">

                        <div className="font-bold text-gray-800 text-base">{item.tenKhach}</div>

                        <div className="text-xs text-gray-500">

                            {item.theLoai} • <span className="font-medium text-blue-600">{Number(item.giaTien || 0).toLocaleString("vi-VN")}đ</span>

                        </div>

                    </div>

                    <div className="flex gap-1">

                        <button onClick={() => copyZaloLich(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">💬</button>

                        <button onClick={() => { suaLich(item); setShowModal(true); }} className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100">✏️</button>

                    </div>

                </div>

              ))}

            </div>

          </div>

        ))}

      </div>



      {/* NÚT FAB THÊM LỊCH */}

      <button

        onClick={() => { resetForm(); setShowModal(true); }}

        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl font-bold hover:bg-blue-700 transition-transform active:scale-90 z-40"

      >

        +

      </button>



      {/* MODAL */}

      {showModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl">

            <h2 className="text-xl font-bold mb-4">{dangSua ? "Sửa lịch" : "Thêm lịch mới"}</h2>

            <div className="grid gap-3">

              <input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} className="border p-3 rounded-xl" />

              <input type="time" value={gio} onChange={(e) => setGio(e.target.value)} className="border p-3 rounded-xl" />

              <input type="text" placeholder="Tên khách" value={tenKhach} onChange={(e) => setTenKhach(e.target.value)} className="border p-3 rounded-xl" />

              <input type="text" placeholder="Số điện thoại" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} className="border p-3 rounded-xl" />

              <input type="text" placeholder="Gói chụp" value={goiChup} onChange={(e) => setGoiChup(e.target.value)} className="border p-3 rounded-xl" />

              <div className="relative">

                <input type="text" inputMode="numeric" placeholder="Giá tiền" value={giaTien} onChange={(e) => setGiaTien(formatTienInput(e.target.value))} className="border p-3 rounded-xl w-full pr-10" />

                <span className="absolute right-4 top-3.5 text-gray-400">đ</span>

              </div>

              <div className="flex gap-2 pt-4">

                <button onClick={() => { themHoacSuaLich(); setShowModal(false); }} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">Lưu lại</button>

                <button onClick={() => setShowModal(false)} className="px-6 py-3 bg-gray-200 rounded-xl">Hủy</button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}