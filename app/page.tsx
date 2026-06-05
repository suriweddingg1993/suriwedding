"use client";

import { useEffect, useState } from "react";

type Lich = {
  ngay: string;
  gio: string;
  tenKhach: string;
  theLoai: string;
};

export default function Home() {
  const [lichLamViec, setLichLamViec] = useState<Lich[]>([]);

  const [ngay, setNgay] = useState("");
  const [gio, setGio] = useState("");
  const [tenKhach, setTenKhach] = useState("");
  const [theLoai, setTheLoai] = useState("");

  const [timNgay, setTimNgay] = useState("");

  const [dangSua, setDangSua] = useState<number | null>(null);

  useEffect(() => {
    const duLieuDaLuu = localStorage.getItem("lichStudio");

    if (duLieuDaLuu) {
      setLichLamViec(JSON.parse(duLieuDaLuu));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "lichStudio",
      JSON.stringify(lichLamViec)
    );
  }, [lichLamViec]);

  const resetForm = () => {
    setNgay("");
    setGio("");
    setTenKhach("");
    setTheLoai("");
    setDangSua(null);
  };

  const themHoacSuaLich = () => {
    if (!ngay || !gio || !tenKhach || !theLoai) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const trungLich = lichLamViec.some(
      (item, index) =>
        item.ngay === ngay &&
        item.gio === gio &&
        index !== dangSua
    );

    if (trungLich) {
      alert("Khung giờ này đã có lịch!");
      return;
    }

    if (dangSua !== null) {
      const danhSachMoi = [...lichLamViec];

      danhSachMoi[dangSua] = {
        ngay,
        gio,
        tenKhach,
        theLoai,
      };

      setLichLamViec(danhSachMoi);

      resetForm();

      return;
    }

    setLichLamViec([
      ...lichLamViec,
      {
        ngay,
        gio,
        tenKhach,
        theLoai,
      },
    ]);

    resetForm();
  };

  const xoaLich = (index: number) => {
    setLichLamViec(
      lichLamViec.filter((_, i) => i !== index)
    );
  };

  const suaLich = (index: number) => {
    const lich = lichLamViec[index];

    setNgay(lich.ngay);
    setGio(lich.gio);
    setTenKhach(lich.tenKhach);
    setTheLoai(lich.theLoai);

    setDangSua(index);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const danhSachHienThi = timNgay
    ? lichLamViec.filter(
        (item) => item.ngay === timNgay
      )
    : lichLamViec;

  const lichTheoNgay = danhSachHienThi.reduce(
    (acc: Record<string, Lich[]>, item) => {
      if (!acc[item.ngay]) {
        acc[item.ngay] = [];
      }

      acc[item.ngay].push(item);

      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">
        Lịch Studio Suri Wedding
      </h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">
          {dangSua !== null
            ? "Sửa lịch chụp"
            : "Thêm lịch chụp"}
        </h2>

        <div className="grid gap-3">
          <input
            type="date"
            value={ngay}
            onChange={(e) => setNgay(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="time"
            value={gio}
            onChange={(e) => setGio(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Tên khách"
            value={tenKhach}
            onChange={(e) => setTenKhach(e.target.value)}
            className="border p-2 rounded"
          />

          <select
            value={theLoai}
            onChange={(e) => setTheLoai(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">-- Chọn thể loại --</option>
            <option value="Ảnh cưới">Ảnh cưới</option>
            <option value="Baby">Baby</option>
            <option value="Beauty">Beauty</option>
            <option value="Gia đình">Gia đình</option>
            <option value="Bầu">Bầu</option>
            <option value="Kỷ yếu">Kỷ yếu</option>
            <option value="Khác">Khác</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={themHoacSuaLich}
              className="bg-blue-600 text-white p-2 rounded flex-1"
            >
              {dangSua !== null
                ? "Lưu thay đổi"
                : "Thêm lịch"}
            </button>

            {dangSua !== null && (
              <button
                onClick={resetForm}
                className="bg-gray-500 text-white p-2 rounded"
              >
                Hủy
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">
          Tìm lịch theo ngày
        </h2>

        <div className="flex gap-3">
          <input
            type="date"
            value={timNgay}
            onChange={(e) => setTimNgay(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={() => setTimNgay("")}
            className="bg-gray-500 text-white px-4 rounded"
          >
            Xem tất cả
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        {Object.entries(lichTheoNgay)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([ngay, dsLich]) => (
            <div key={ngay} className="mb-6">
              <h2 className="text-xl font-bold mb-3">
                📅 {ngay} ({dsLich.length} lịch)
              </h2>

              <div className="space-y-2">
                {dsLich
                  .sort((a, b) =>
                    a.gio.localeCompare(b.gio)
                  )
                  .map((item) => {
                    const indexGoc =
                      lichLamViec.findIndex(
                        (x) =>
                          x.ngay === item.ngay &&
                          x.gio === item.gio &&
                          x.tenKhach ===
                            item.tenKhach
                      );

                    return (
                      <div
                        key={`${item.ngay}-${item.gio}-${item.tenKhach}`}
                        className="border rounded p-3 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-semibold">
                            🕒 {item.gio} |{" "}
                            {item.theLoai}
                          </div>

                          <div>
                            {item.tenKhach}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              suaLich(indexGoc)
                            }
                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                          >
                            Sửa
                          </button>

                          <button
                            onClick={() =>
                              xoaLich(indexGoc)
                            }
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}