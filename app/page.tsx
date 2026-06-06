"use client";

import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";

import { db, auth } from "../lib/firebase";

type Role = "admin" | "staff";

type Lich = {
  id?: string;
  ngay: string;
  gio: string;
  tenKhach: string;
  soDienThoai?: string;
  theLoai: string;
  goiChup?: string;
  giaTien?: number;
  trangThai?: string;
};

type TaiKhoan = {
  id: string;
  email: string;
  role: Role;
};

const ADMIN_CHINH_EMAIL = "dangngocan93@gmail.com";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [role, setRole] = useState<Role>("staff");

  const [lichLamViec, setLichLamViec] = useState<Lich[]>([]);
  const [danhSachTaiKhoan, setDanhSachTaiKhoan] = useState<TaiKhoan[]>([]);

  const [ngay, setNgay] = useState("");
  const [gio, setGio] = useState("");
  const [tenKhach, setTenKhach] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [theLoai, setTheLoai] = useState("");
  const [theLoaiKhac, setTheLoaiKhac] = useState("");
  const [goiChup, setGoiChup] = useState("");
  const [giaTien, setGiaTien] = useState("");

  const [timNgay, setTimNgay] = useState("");
  const [tuKhoa, setTuKhoa] = useState("");
  const [thangThongKe, setThangThongKe] = useState("");

  const [dangSua, setDangSua] = useState<string | null>(null);

  const [uidNhanVien, setUidNhanVien] = useState("");
  const [emailNhanVien, setEmailNhanVien] = useState("");
  const [quyenNhanVien, setQuyenNhanVien] = useState<Role>("staff");

  const laAdmin = role === "admin";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);

        if (currentUser.email === ADMIN_CHINH_EMAIL) {
          await setDoc(
            userRef,
            {
              email: currentUser.email,
              role: "admin",
            },
            { merge: true }
          );

          setRole("admin");
          setDangTai(false);
          return;
        }

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setRole(data.role === "admin" ? "admin" : "staff");
        } else {
          setRole("staff");
        }
      }

      setDangTai(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, "lichStudio"), (snapshot) => {
      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      })) as Lich[];

      setLichLamViec(data);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || !laAdmin) return;

    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      })) as TaiKhoan[];

      setDanhSachTaiKhoan(data);
    });

    return () => unsub();
  }, [user, laAdmin]);

  const dangNhap = async () => {
    if (!email || !matKhau) {
      alert("Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, matKhau);
    } catch (error) {
      console.error(error);
      alert("Sai email hoặc mật khẩu");
    }
  };

  const dangXuat = async () => {
    await signOut(auth);
  };

  const resetForm = () => {
    setNgay("");
    setGio("");
    setTenKhach("");
    setSoDienThoai("");
    setTheLoai("");
    setTheLoaiKhac("");
    setGoiChup("");
    setGiaTien("");
    setDangSua(null);
  };

  const themHoacSuaLich = async () => {
    const theLoaiCuoi = theLoai === "Khác" ? theLoaiKhac.trim() : theLoai;

    if (
      !ngay ||
      !gio ||
      !tenKhach ||
      !soDienThoai ||
      !theLoaiCuoi ||
      !goiChup ||
      !giaTien
    ) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const trungLich = lichLamViec.some(
      (item) => item.ngay === ngay && item.gio === gio && item.id !== dangSua
    );

    if (trungLich) {
      alert("Khung giờ này đã có lịch");
      return;
    }

    const duLieuLich = {
      ngay,
      gio,
      tenKhach,
      soDienThoai,
      theLoai: theLoaiCuoi,
      goiChup,
      giaTien: Number(giaTien),
      trangThai: "Chưa liên hệ",
    };

    try {
      if (dangSua) {
        await updateDoc(doc(db, "lichStudio", dangSua), {
          ngay,
          gio,
          tenKhach,
          soDienThoai,
          theLoai: theLoaiCuoi,
          goiChup,
          giaTien: Number(giaTien),
        });
        resetForm();
        return;
      }

      await addDoc(collection(db, "lichStudio"), duLieuLich);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  const xoaLich = async (id?: string) => {
    if (!id) return;

    if (!laAdmin) {
      alert("Chỉ admin mới được xóa lịch");
      return;
    }

    const dongY = confirm("Bạn có chắc muốn xóa lịch này không?");
    if (!dongY) return;

    await deleteDoc(doc(db, "lichStudio", id));
  };

  const suaLich = (item: Lich) => {
    setNgay(item.ngay);
    setGio(item.gio);
    setTenKhach(item.tenKhach);
    setSoDienThoai(item.soDienThoai || "");
    setTheLoai(item.theLoai || "");
    setTheLoaiKhac("");
    setGoiChup(item.goiChup || "");
    setGiaTien(String(item.giaTien || ""));
    setDangSua(item.id || null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const capNhatTrangThai = async (id?: string, trangThai?: string) => {
    if (!id || !trangThai) return;

    try {
      await updateDoc(doc(db, "lichStudio", id), {
        trangThai,
      });
    } catch (error) {
      console.error(error);
      alert("Không cập nhật được trạng thái");
    }
  };

  const taoHoSoNhanVien = async () => {
    if (!laAdmin) {
      alert("Chỉ admin mới được quản lý tài khoản");
      return;
    }

    if (!uidNhanVien || !emailNhanVien) {
      alert("Vui lòng nhập UID và email nhân viên");
      return;
    }

    if (emailNhanVien === ADMIN_CHINH_EMAIL && quyenNhanVien !== "admin") {
      alert("Admin chính luôn phải là admin");
      return;
    }

    try {
      await setDoc(doc(db, "users", uidNhanVien), {
        email: emailNhanVien,
        role: emailNhanVien === ADMIN_CHINH_EMAIL ? "admin" : quyenNhanVien,
      });

      setUidNhanVien("");
      setEmailNhanVien("");
      setQuyenNhanVien("staff");

      alert("Đã tạo hồ sơ tài khoản");
    } catch (error) {
      console.error(error);
      alert("Không tạo được hồ sơ tài khoản");
    }
  };

  const doiQuyen = async (id: string, roleMoi: Role) => {
    if (!laAdmin) {
      alert("Chỉ admin mới được đổi quyền");
      return;
    }

    const taiKhoanCanDoi = danhSachTaiKhoan.find((tk) => tk.id === id);

    if (taiKhoanCanDoi?.email === ADMIN_CHINH_EMAIL) {
      alert("Không thể đổi quyền admin chính");
      return;
    }

    try {
      await updateDoc(doc(db, "users", id), {
        role: roleMoi,
      });
    } catch (error) {
      console.error(error);
      alert("Không đổi được quyền");
    }
  };

  const danhSachHienThi = lichLamViec.filter((item) => {
    const dungNgay = timNgay ? item.ngay === timNgay : true;
    const keyword = tuKhoa.toLowerCase().trim();

    const dungTuKhoa = keyword
      ? item.tenKhach.toLowerCase().includes(keyword) ||
        (item.soDienThoai || "").includes(keyword)
      : true;

    return dungNgay && dungTuKhoa;
  });

  const lichTheoNgay = danhSachHienThi.reduce(
    (acc: Record<string, Lich[]>, item) => {
      if (!acc[item.ngay]) acc[item.ngay] = [];
      acc[item.ngay].push(item);
      return acc;
    },
    {}
  );

  const lichTrongThang = thangThongKe
    ? lichLamViec.filter((item) => item.ngay.startsWith(thangThongKe))
    : [];

  const tongThuNhap = lichTrongThang.reduce(
    (sum, item) => sum + Number(item.giaTien || 0),
    0
  );

  if (dangTai) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-4 text-center">Đăng nhập</h1>

          <div className="grid gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="password"
              placeholder="Mật khẩu"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              className="border p-2 rounded"
            />

            <button
              onClick={dangNhap}
              className="bg-blue-600 text-white p-2 rounded"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Lịch Studio Suri Wedding</h1>

          <div className="text-sm text-gray-600 mt-1">
            {user.email} • Quyền: {laAdmin ? "Admin" : "Nhân viên"}
          </div>
        </div>

        <button
          onClick={dangXuat}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          Đăng xuất
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">
          {dangSua ? "Sửa lịch chụp" : "Thêm lịch chụp"}
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

          <input
            type="text"
            placeholder="Số điện thoại"
            value={soDienThoai}
            onChange={(e) => setSoDienThoai(e.target.value)}
            className="border p-2 rounded"
          />

          <select
            value={theLoai}
            onChange={(e) => {
              setTheLoai(e.target.value);
              if (e.target.value !== "Khác") setTheLoaiKhac("");
            }}
            className="border p-2 rounded"
          >
            <option value="">-- Chọn thể loại --</option>
            <option value="Ảnh cưới">Ảnh cưới</option>
            <option value="Baby">Baby</option>
            <option value="Beauty">Beauty</option>
            <option value="Gia đình">Gia đình</option>
            <option value="Bầu">Bầu</option>
            <option value="Kỷ yếu">Kỷ yếu</option>
            <option value="Khác">➕ Thêm thể loại khác</option>
          </select>

          {theLoai === "Khác" && (
            <input
              type="text"
              placeholder="Nhập thể loại mới"
              value={theLoaiKhac}
              onChange={(e) => setTheLoaiKhac(e.target.value)}
              className="border p-2 rounded"
            />
          )}

          <input
            type="text"
            placeholder="Gói chụp"
            value={goiChup}
            onChange={(e) => setGoiChup(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder="Giá tiền"
            value={giaTien}
            onChange={(e) => setGiaTien(e.target.value)}
            className="border p-2 rounded"
          />

          <div className="flex gap-2">
            <button
              onClick={themHoacSuaLich}
              className="bg-blue-600 text-white p-2 rounded flex-1"
            >
              {dangSua ? "Lưu thay đổi" : "Thêm lịch"}
            </button>

            {dangSua && (
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

      {laAdmin && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">Thống kê thu nhập</h2>

          <input
            type="month"
            value={thangThongKe}
            onChange={(e) => setThangThongKe(e.target.value)}
            className="border p-2 rounded mb-3"
          />

          <div>Tổng lịch trong tháng: {lichTrongThang.length}</div>

          <div className="text-green-600 font-bold text-xl">
            Tổng tiền: {tongThuNhap.toLocaleString("vi-VN")}đ
          </div>
        </div>
      )}

      {laAdmin && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">Quản lý tài khoản</h2>

          <div className="bg-yellow-50 border border-yellow-300 p-3 rounded mb-4 text-sm">
            Bước tạo nhân viên: vào Firebase Authentication tạo tài khoản trước,
            copy UID của tài khoản đó, rồi dán UID vào đây.
          </div>

          <div className="grid gap-3 md:grid-cols-4 mb-4">
            <input
              type="text"
              placeholder="UID nhân viên"
              value={uidNhanVien}
              onChange={(e) => setUidNhanVien(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="email"
              placeholder="Email nhân viên"
              value={emailNhanVien}
              onChange={(e) => setEmailNhanVien(e.target.value)}
              className="border p-2 rounded"
            />

            <select
              value={quyenNhanVien}
              onChange={(e) => setQuyenNhanVien(e.target.value as Role)}
              className="border p-2 rounded"
            >
              <option value="staff">Nhân viên</option>
              <option value="admin">Admin</option>
            </select>

            <button
              onClick={taoHoSoNhanVien}
              className="bg-green-600 text-white px-4 rounded"
            >
              Tạo hồ sơ
            </button>
          </div>

          <div className="space-y-2">
            {danhSachTaiKhoan.map((tk) => (
              <div
                key={tk.id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">{tk.email}</div>
                  <div className="text-sm text-gray-500">UID: {tk.id}</div>
                </div>

                {tk.email === ADMIN_CHINH_EMAIL ? (
                  <div className="text-green-600 font-bold">Admin chính</div>
                ) : (
                  <select
                    value={tk.role}
                    onChange={(e) => doiQuyen(tk.id, e.target.value as Role)}
                    className="border p-2 rounded"
                  >
                    <option value="staff">Nhân viên</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">Tìm lịch</h2>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            type="date"
            value={timNgay}
            onChange={(e) => setTimNgay(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Tìm tên khách hoặc SĐT"
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={() => {
              setTimNgay("");
              setTuKhoa("");
            }}
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
                {[...dsLich]
                  .sort((a, b) => a.gio.localeCompare(b.gio))
                  .map((item) => (
                    <div
                      key={item.id}
                      className="border rounded p-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold">
                          🕒 {item.gio} | {item.theLoai}
                        </div>

                        <div>{item.tenKhach}</div>

                        <div className="text-sm text-gray-600">
                          📞 {item.soDienThoai || "Chưa có SĐT"}
                        </div>

                        <div className="text-sm text-gray-600">
                          📦 {item.goiChup || "Chưa có gói"}
                          {laAdmin && (
                            <>
                              {" "}
                              •{" "}
                              {Number(item.giaTien || 0).toLocaleString(
                                "vi-VN"
                              )}
                              đ
                            </>
                          )}
                        </div>

                        <div className="mt-2">
                          <select
                            value={item.trangThai || "Chưa liên hệ"}
                            onChange={(e) =>
                              capNhatTrangThai(item.id, e.target.value)
                            }
                            className="border p-1 rounded text-sm"
                          >
                            <option value="Chưa liên hệ">Chưa liên hệ</option>
                            <option value="Đã liên hệ">Đã liên hệ</option>
                            <option value="Đã cọc">Đã cọc</option>
                            <option value="Đã chụp">Đã chụp</option>
                            <option value="Đã giao ảnh">Đã giao ảnh</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => suaLich(item)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                          Sửa
                        </button>

                        {laAdmin && (
                          <button
                            onClick={() => xoaLich(item.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}