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
type Tab =
  | "home"
  | "lich"
  | "phatSinh"
  | "tinhTrangKH"
  | "chamCong"
  | "luong"
  | "nhanVien"
  | "thongKe";

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

  hoTen?: string;
  soDienThoai?: string;

  luongCung?: number;
  thuongChuyenCan?: number;

  role: Role;
};

type PhatSinh = {
  id?: string;
  ngay: string;
  tenKhach: string;
  soDienThoai?: string;
  loai: string;
  soTien: number;
  nguoiGhi: string;
  ngayTra?: string;
 daTraDo?: boolean;
  ghiChu?: string;
};

type ChamCong = {
  id?: string;
  uid: string;
  email: string;
  ngay: string;
  checkIn?: string;
  checkOut?: string;

  checkInLat?: number;
  checkInLng?: number;
  checkOutLat?: number;
  checkOutLng?: number;

  diMuon?: boolean;
  soPhutMuon?: number;

  lyDoMuon?: string;
  duyetMuon?: boolean;

  nghiPhep?: boolean;
  ghiChuNghi?: string;
};

const ADMIN_CHINH_EMAIL = "dangngocan93@gmail.com";

const CUA_HANG_LAT = 21.436897313370316;
const CUA_HANG_LNG = 103.68803473004635;
const BAN_KINH_CHO_PHEP = 500;
const APP_VERSION = "v1.0.1";
const GIO_CHECKIN_CHUAN = "08:00";
const SO_LAN_DI_MUON_TOI_DA = 3;
const SO_NGAY_NGHI_PHEP_TOI_DA = 2;

function homNay() {
  return new Date().toISOString().slice(0, 10);
}

function gioHienTai() {
  return new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatTienInput(value: string) {
  const so = value.replace(/\D/g, "");
  return so.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function chuyenTienVeSo(value: string) {
  return Number(value.replace(/\./g, ""));
}

function tinhKhoangCachMet(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [role, setRole] = useState<Role>("staff");
  const [tab, setTab] = useState<Tab>("home");
  const [coBanCapNhat, setCoBanCapNhat] = useState(false);

  const [lichLamViec, setLichLamViec] = useState<Lich[]>([]);
  const [danhSachTaiKhoan, setDanhSachTaiKhoan] = useState<TaiKhoan[]>([]);
  const [hoSoCuaToi, setHoSoCuaToi] = useState<TaiKhoan | null>(null);
  const [danhSachPhatSinh, setDanhSachPhatSinh] = useState<PhatSinh[]>([]);
  const [danhSachChamCong, setDanhSachChamCong] = useState<ChamCong[]>([]);

  const [ngay, setNgay] = useState("");
  const [gio, setGio] = useState("");
  const [tenKhach, setTenKhach] = useState("");
  const [moQuaHan, setMoQuaHan] = useState(false);
const [moTraHomNay, setMoTraHomNay] = useState(false);
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
  const [hoTenNhanVien, setHoTenNhanVien] = useState("")
const [soDienThoaiNhanVien, setSoDienThoaiNhanVien] = useState("")
  const [quyenNhanVien, setQuyenNhanVien] = useState<Role>("staff");
  const [dangSuaNhanVien, setDangSuaNhanVien] = useState<string | null>(null);
const [luongCungNhanVien, setLuongCungNhanVien] = useState("3.000.000");
const [thuongChuyenCanNhanVien, setThuongChuyenCanNhanVien] = useState("300.000");

  const [psNgay, setPsNgay] = useState(homNay());
  const [psTenKhach, setPsTenKhach] = useState("");
  const [psSoDienThoai, setPsSoDienThoai] = useState("");
  const [psLoai, setPsLoai] = useState("");
  const [psNgayTra, setPsNgayTra] = useState("");
  const [psSoTien, setPsSoTien] = useState("");
  const [psGhiChu, setPsGhiChu] = useState("");

  const [dangLayViTri, setDangLayViTri] = useState(false);
  const [khoangCach, setKhoangCach] = useState<number | null>(null);

  const laAdmin = role === "admin";
  useEffect(() => {
  const phienBanDaLuu =
    localStorage.getItem("suri_app_version");

  if (
    phienBanDaLuu &&
    phienBanDaLuu !== APP_VERSION
  ) {
    setCoBanCapNhat(true);
  }

  localStorage.setItem(
    "suri_app_version",
    APP_VERSION
  );
}, []);

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

        const adminSnap = await getDoc(userRef);
const adminData = adminSnap.exists() ? adminSnap.data() : {};

setHoSoCuaToi({
  id: currentUser.uid,
  email: currentUser.email || "",
  hoTen: adminData.hoTen || "",
  soDienThoai: adminData.soDienThoai || "",
  luongCung: adminData.luongCung || 0,
  thuongChuyenCan: adminData.thuongChuyenCan || 0,
  role: "admin",
});
        setRole("admin");
        setDangTai(false);
        return;
      }

      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        setHoSoCuaToi({
          id: currentUser.uid,
          email: data.email || currentUser.email || "",
          hoTen: data.hoTen || "",
          soDienThoai: data.soDienThoai || "",
          luongCung: data.luongCung || 0,
          thuongChuyenCan: data.thuongChuyenCan || 0,
          role: data.role === "admin" ? "admin" : "staff",
        });

        setRole(data.role === "admin" ? "admin" : "staff");
      } else {
        setHoSoCuaToi(null);
        setRole("staff");
      }
    } else {
      setHoSoCuaToi(null);
      setRole("staff");
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
    if (!user) return;

    const unsub = onSnapshot(collection(db, "phatSinh"), (snapshot) => {
      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      })) as PhatSinh[];

      setDanhSachPhatSinh(data);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, "chamCong"), (snapshot) => {
      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      })) as ChamCong[];

      setDanhSachChamCong(data);
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
      giaTien: chuyenTienVeSo(giaTien),
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
          giaTien: chuyenTienVeSo(giaTien),
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
    setGiaTien(formatTienInput(String(item.giaTien || "")));
    setDangSua(item.id || null);
    setTab("lich");

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
    await setDoc(
      doc(db, "users", uidNhanVien),
      {
        email: emailNhanVien,
        hoTen: hoTenNhanVien,
        soDienThoai: soDienThoaiNhanVien,
        luongCung: chuyenTienVeSo(luongCungNhanVien),
        thuongChuyenCan: chuyenTienVeSo(thuongChuyenCanNhanVien),
        role: emailNhanVien === ADMIN_CHINH_EMAIL ? "admin" : quyenNhanVien,
      },
      { merge: true }
    );

    setUidNhanVien("");
    setEmailNhanVien("");
    setHoTenNhanVien("");
    setSoDienThoaiNhanVien("");
    setLuongCungNhanVien("3.000.000");
    setThuongChuyenCanNhanVien("300.000");
    setQuyenNhanVien("staff");
    setDangSuaNhanVien(null);

    alert(dangSuaNhanVien ? "Đã cập nhật hồ sơ nhân viên" : "Đã tạo hồ sơ tài khoản");
  } catch (error) {
    console.error(error);
    alert("Không lưu được hồ sơ tài khoản");
  }
};

const suaHoSoNhanVien = (tk: TaiKhoan) => {
  setDangSuaNhanVien(tk.id);
  setUidNhanVien(tk.id);
  setEmailNhanVien(tk.email || "");
  setHoTenNhanVien(tk.hoTen || "");
  setSoDienThoaiNhanVien(tk.soDienThoai || "");
  setLuongCungNhanVien(formatTienInput(String(tk.luongCung || 3000000)));
  setThuongChuyenCanNhanVien(
    formatTienInput(String(tk.thuongChuyenCan || 300000))
  );
  setQuyenNhanVien(tk.role || "staff");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
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

  const themPhatSinh = async () => {
    if (!psNgay || !psLoai || !psSoTien) {
      alert("Vui lòng nhập ngày, loại phát sinh và số tiền");
      return;
    }

    try {
      await addDoc(collection(db, "phatSinh"), {
        ngay: psNgay,
        tenKhach: psTenKhach,
        soDienThoai: psSoDienThoai,
        loai: psLoai,
        ngayTra: psNgayTra,
        soTien: chuyenTienVeSo(psSoTien),
        nguoiGhi: user?.email || "",
        ghiChu: psGhiChu,
      });

      setPsNgay(homNay());
      setPsTenKhach("");
      setPsSoDienThoai("");
      setPsLoai("");
      setPsNgayTra("");
      setPsSoTien("");
      setPsGhiChu("");

      alert("Đã thêm phát sinh");
    } catch (error) {
      console.error(error);
      alert("Không thêm được phát sinh");
    }
  };

  const xoaPhatSinh = async (id?: string) => {
    if (!id) return;

    if (!laAdmin) {
      alert("Chỉ admin mới được xóa phát sinh");
      return;
    }

    const dongY = confirm("Bạn có chắc muốn xóa khoản phát sinh này không?");
    if (!dongY) return;

    await deleteDoc(doc(db, "phatSinh", id));
  };

  const layViTri = () => {
    return new Promise<{ lat: number; lng: number; distance: number }>(
      (resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Thiết bị không hỗ trợ lấy vị trí"));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const distance = tinhKhoangCachMet(
              lat,
              lng,
              CUA_HANG_LAT,
              CUA_HANG_LNG
            );

            resolve({
              lat,
              lng,
              distance,
            });
          },
          () => {
            reject(new Error("Không lấy được vị trí. Hãy bật định vị."));
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );
      }
    );
  };

  const chamCong = async (loai: "checkIn" | "checkOut") => {
    if (!user) return;

    setDangLayViTri(true);

    try {
      const viTri = await layViTri();

      setKhoangCach(viTri.distance);

      if (viTri.distance > BAN_KINH_CHO_PHEP) {
        alert(
          `Bạn đang cách cửa hàng khoảng ${viTri.distance}m. Chỉ được chấm công trong bán kính ${BAN_KINH_CHO_PHEP}m.`
        );
        return;
      }

      const ngayHomNay = homNay();

      const banGhiHomNay = danhSachChamCong.find(
        (item) => item.uid === user.uid && item.ngay === ngayHomNay
      );
const gioHienTaiCheckIn = gioHienTai();

const [gio, phut] = gioHienTaiCheckIn.split(":").map(Number);

const soPhutHienTai = gio * 60 + phut;
const soPhutChuan = 8 * 60;

const soPhutMuon = Math.max(0, soPhutHienTai - soPhutChuan);
const diMuon = soPhutMuon > 0;
      if (loai === "checkIn") {
        if (banGhiHomNay?.checkIn) {          alert("Bạn đã Check In hôm nay rồi");
          return;
        }

        if (banGhiHomNay?.id) {
          await updateDoc(doc(db, "chamCong", banGhiHomNay.id), {
  checkIn: gioHienTaiCheckIn,
  checkInLat: viTri.lat,
  checkInLng: viTri.lng,

  diMuon,
  soPhutMuon,
          });
        } else {
          await addDoc(collection(db, "chamCong"), {
  uid: user.uid,
  email: user.email || "",
  ngay: ngayHomNay,

  checkIn: gioHienTaiCheckIn,
  checkInLat: viTri.lat,
  checkInLng: viTri.lng,

  diMuon,
  soPhutMuon,
          });
        }

        alert("Check In thành công");
      }

      if (loai === "checkOut") {
        if (!banGhiHomNay?.id) {
          await addDoc(collection(db, "chamCong"), {
            uid: user.uid,
            email: user.email || "",
            ngay: ngayHomNay,
            checkOut: gioHienTai(),
            checkOutLat: viTri.lat,
            checkOutLng: viTri.lng,
          });

          alert("Check Out thành công");
          return;
        }

        if (banGhiHomNay.checkOut) {
          alert("Bạn đã Check Out hôm nay rồi");
          return;
        }

        await updateDoc(doc(db, "chamCong", banGhiHomNay.id), {
          checkOut: gioHienTai(),
          checkOutLat: viTri.lat,
          checkOutLng: viTri.lng,
        });

        alert("Check Out thành công");
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Không chấm công được");
    } finally {
      setDangLayViTri(false);
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

  const phatSinhTrongThang = thangThongKe
    ? danhSachPhatSinh.filter((item) => item.ngay.startsWith(thangThongKe))
    : [];

  const tongThuNhapLich = lichTrongThang.reduce(
    (sum, item) => sum + Number(item.giaTien || 0),
    0
  );

  const tongThuNhapPhatSinh = phatSinhTrongThang.reduce(
    (sum, item) => sum + Number(item.soTien || 0),
    0
  );

  const tongThuNhap = tongThuNhapLich + tongThuNhapPhatSinh;

  const chamCongHomNay = danhSachChamCong.find(
    (item) => item.uid === user?.uid && item.ngay === homNay()
  );

  const chamCongHienThi = laAdmin
    ? danhSachChamCong
    : danhSachChamCong.filter((item) => item.uid === user?.uid);
    const thangHienTai = homNay().slice(0, 7);

const chamCongCuaToiThang = danhSachChamCong.filter(
  (cc) => cc.uid === user?.uid && cc.ngay.startsWith(thangHienTai)
);

const soLanDiMuonThang = chamCongCuaToiThang.filter(
  (cc) => cc.diMuon && cc.duyetMuon !== true
).length;

const soNgayNghiThang = chamCongCuaToiThang.filter(
  (cc) => cc.nghiPhep
).length;

const duocChuyenCan =
  soNgayNghiThang === 0 && soLanDiMuonThang <= 3;

const luongCungCuaToi = hoSoCuaToi?.luongCung || 0;
const thuongChuyenCanCuaToi = hoSoCuaToi?.thuongChuyenCan || 0;

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

  const nutMenu = [
  { key: "home", label: "🏠 Trang chủ", adminOnly: false },
  { key: "lich", label: "📅 Lịch làm việc", adminOnly: false },
  { key: "phatSinh", label: "💰 Phát sinh", adminOnly: false },

  { key: "tinhTrangKH", label: "📋 Tình trạng KH", adminOnly: false },

  { key: "chamCong", label: "⏰ Chấm công", adminOnly: false },
  { key: "luong", label: "💰 Lương của tôi", adminOnly: false },
  { key: "nhanVien", label: "👥 Nhân viên", adminOnly: true },
  { key: "thongKe", label: "📊 Thống kê", adminOnly: true },
] as const;

const ngayHomNay = new Date().toISOString().split("T")[0];

const canTraHomNay = danhSachPhatSinh.filter(
  (ps) =>
    !ps.daTraDo &&
    (ps.loai === "Thuê váy" || ps.loai === "Thuê vest") &&
    ps.ngayTra === ngayHomNay
);

const quaHan = danhSachPhatSinh.filter(
  (ps) =>
    !ps.daTraDo &&
    (ps.loai === "Thuê váy" || ps.loai === "Thuê vest") &&
    ps.ngayTra &&
    ps.ngayTra < ngayHomNay
);

const dangThue = danhSachPhatSinh.filter(
  (ps) =>
    !ps.daTraDo &&
    (ps.loai === "Thuê váy" || ps.loai === "Thuê vest") &&
    ps.ngayTra &&
    ps.ngayTra > ngayHomNay

);
const danhDauDaTraDo = async (id: string) => {
  try {
    await updateDoc(doc(db, "phatSinh", id), {
      daTraDo: true,
    });
  } catch (error) {
    console.error(error);
  }
};

return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {coBanCapNhat && (
  <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded-lg mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
    <div>
      🔄 Có phiên bản mới của ứng dụng
    </div>

    <button
      onClick={() => window.location.reload()}
      className="bg-yellow-500 text-white px-4 py-2 rounded"
    >
      Cập nhật
    </button>
  </div>
)}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Suri Wedding</h1>

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

<div className="mb-5">
  {nutMenu
    .filter((item) => item.key === "home")
    .map((item) => {
      const [icon, ...textParts] = item.label.split(" ");
      const text = textParts.join(" ");

      return (
        <button
          key={item.key}
          onClick={() => {
            setTab(item.key);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`w-full mb-3 rounded-2xl shadow-sm border p-3 min-h-[58px] flex items-center justify-center gap-3 transition ${
            tab === item.key
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-800 border-gray-200"
          }`}
        >
          <span className="text-2xl">{icon}</span>
          <span className="font-bold text-base">{text}</span>
        </button>
      );
    })}

  <div className="grid grid-cols-2 gap-3">
    {nutMenu
      .filter((item) => item.key !== "home")
      .filter((item) => !item.adminOnly || laAdmin)
      .map((item) => {
        const [icon, ...textParts] = item.label.split(" ");
        const text = textParts.join(" ");

        return (
          <button
            key={item.key}
            onClick={() => {
              setTab(item.key);

              setTimeout(() => {
                document
                  .getElementById("noi-dung-tab")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              }, 100);
            }}
            className={`rounded-2xl shadow-sm border p-3 min-h-[94px] flex flex-col items-center justify-center gap-2 transition ${
              tab === item.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-800 border-gray-200"
            }`}
          >
            <div className="text-3xl">{icon}</div>

            <div className="font-semibold text-center text-sm leading-tight">
              {text}
            </div>
          </button>
        );
      })}
  </div>
</div>

<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
  <h2 className="font-bold text-base mb-3">⚠️ Việc cần chú ý hôm nay</h2>

  <div className="space-y-2 text-sm">
    <div className="flex justify-between">
      <span>🔴 Khách quá hạn trả đồ</span>
      <b>{quaHan.length}</b>
    </div>

    <div className="flex justify-between">
      <span>🟡 Khách trả hôm nay</span>
      <b>{canTraHomNay.length}</b>
    </div>

    <div className="flex justify-between">
      <span>📅 Lịch hôm nay</span>
      <b>{lichLamViec.filter((item) => item.ngay === homNay()).length}</b>
    </div>

    <div className="flex justify-between">
      <span>⏰ Chấm công hôm nay</span>
      <b>{chamCongHomNay?.checkIn ? "Đã check in" : "Chưa check in"}</b>
    </div>
  </div>
</div>
<div id="noi-dung-tab"></div>

      {tab === "lich" && (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {dangSua ? "Sửa lịch chụp" : "Thêm lịch chụp"}
            </h2>

            <div className="grid gap-3">
              <input type="date" value={ngay} onChange={(e) => setNgay(e.target.value)} className="border p-2 rounded" />
              <input type="time" value={gio} onChange={(e) => setGio(e.target.value)} className="border p-2 rounded" />
              <input type="text" placeholder="Tên khách" value={tenKhach} onChange={(e) => setTenKhach(e.target.value)} className="border p-2 rounded" />
              <input type="text" placeholder="Số điện thoại" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} className="border p-2 rounded" />

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
                <input type="text" placeholder="Nhập thể loại mới" value={theLoaiKhac} onChange={(e) => setTheLoaiKhac(e.target.value)} className="border p-2 rounded" />
              )}

              <input type="text" placeholder="Gói chụp" value={goiChup} onChange={(e) => setGoiChup(e.target.value)} className="border p-2 rounded" />
              <div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Giá tiền"
                    value={giaTien}
                    onChange={(e) => setGiaTien(formatTienInput(e.target.value))}
                    className="border p-2 rounded w-full pr-10"
                  />
                  <span className="absolute right-3 top-2 text-gray-500">đ</span>
                </div>

                {giaTien && (
                  <div className="text-sm text-green-600 mt-1">
                    Giá trị: {giaTien}đ
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={themHoacSuaLich} className="bg-blue-600 text-white p-2 rounded flex-1">
                  {dangSua ? "Lưu thay đổi" : "Thêm lịch"}
                </button>

                {dangSua && (
                  <button onClick={resetForm} className="bg-gray-500 text-white p-2 rounded">
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-xl font-bold mb-4">Tìm lịch</h2>

            <div className="grid gap-3 md:grid-cols-3">
              <input type="date" value={timNgay} onChange={(e) => setTimNgay(e.target.value)} className="border p-2 rounded" />
              <input type="text" placeholder="Tìm tên khách hoặc SĐT" value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} className="border p-2 rounded" />

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
                        <div key={item.id} className="border rounded p-3 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                          <div>
                            <div className="font-semibold">🕒 {item.gio} | {item.theLoai}</div>
                            <div>{item.tenKhach}</div>
                            <div className="text-sm text-gray-600">📞 {item.soDienThoai || "Chưa có SĐT"}</div>

                            <div className="text-sm text-gray-600">
                              📦 {item.goiChup || "Chưa có gói"}
                              {laAdmin && <> • {Number(item.giaTien || 0).toLocaleString("vi-VN")}đ</>}
                            </div>

                            <div className="mt-2">
                              <select
                                value={item.trangThai || "Chưa liên hệ"}
                                onChange={(e) => capNhatTrangThai(item.id, e.target.value)}
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
                            <button onClick={() => suaLich(item)} className="bg-yellow-500 text-white px-3 py-1 rounded">
                              Sửa
                            </button>

                            {laAdmin && (
                              <button onClick={() => xoaLich(item.id)} className="bg-red-500 text-white px-3 py-1 rounded">
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
        </>
      )}

      {tab === "phatSinh" && (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-xl font-bold mb-4">💰 Thêm phát sinh</h2>

            <div className="grid gap-3">
              <input type="date" value={psNgay} onChange={(e) => setPsNgay(e.target.value)} className="border p-2 rounded" />

              <input type="text" placeholder="Tên khách nếu có" value={psTenKhach} onChange={(e) => setPsTenKhach(e.target.value)} className="border p-2 rounded" />

              <input type="text" placeholder="Số điện thoại nếu có" value={psSoDienThoai} onChange={(e) => setPsSoDienThoai(e.target.value)} className="border p-2 rounded" />

              <select value={psLoai} onChange={(e) => setPsLoai(e.target.value)} className="border p-2 rounded">
                <option value="">-- Chọn loại phát sinh --</option>
                <option value="Thuê váy">Thuê váy</option>
                <option value="Thuê vest">Thuê vest</option>
                <option value="In ảnh">In ảnh</option>
                <option value="Rửa ảnh">Rửa ảnh</option>
                <option value="Bán album">Bán album</option>
                <option value="Trang điểm lẻ">Trang điểm lẻ</option>
                <option value="Chụp ảnh thẻ">Chụp ảnh thẻ</option>
                <option value="Phụ phí đi xa">Phụ phí đi xa</option>
                <option value="Khác">Khác</option>
              </select>

{(psLoai === "Thuê váy" || psLoai === "Thuê vest") && (
  <div>
    <div className="text-sm text-gray-600 mb-1">
      Ngày phải trả đồ
    </div>

    <input
      type="date"
      value={psNgayTra}
      onChange={(e) => setPsNgayTra(e.target.value)}
      className="border p-2 rounded w-full"
    />
  </div>
)}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Số tiền"
                    value={psSoTien}
                    onChange={(e) => setPsSoTien(formatTienInput(e.target.value))}
                    className="border p-2 rounded w-full pr-10"
                  />
                  <span className="absolute right-3 top-2 text-gray-500">đ</span>
                </div>

                {psSoTien && (
                  <div className="text-sm text-green-600 mt-1">
                    Giá trị: {psSoTien}đ
                  </div>
                )}
              </div>

              <input type="text" placeholder="Ghi chú nếu có" value={psGhiChu} onChange={(e) => setPsGhiChu(e.target.value)} className="border p-2 rounded" />

              <button onClick={themPhatSinh} className="bg-blue-600 text-white p-2 rounded">
                Thêm phát sinh
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Danh sách phát sinh</h2>

            <div className="space-y-2">
              {[...danhSachPhatSinh]
                .sort((a, b) => b.ngay.localeCompare(a.ngay))
                .map((item) => (
                  <div key={item.id} className="border rounded p-3 flex flex-col md:flex-row md:justify-between gap-3">
                    <div>
                      <div className="font-semibold">
                        {item.ngay} • {item.loai}
                      </div>

                      <div className="text-sm text-gray-600">
                        Khách: {item.tenKhach || "Không có"} • SĐT: {item.soDienThoai || "Không có"}
                      </div>

                      <div className="text-sm text-gray-600">
                        Người ghi: {item.nguoiGhi}
                      </div>

                      <div className="font-bold text-green-600">
                        {Number(item.soTien || 0).toLocaleString("vi-VN")}đ
                      </div>

                      {item.ghiChu && (
                        <div className="text-sm text-gray-500">
                          Ghi chú: {item.ghiChu}
                        </div>
                      )}
                    </div>

                    {laAdmin && (
                      <button onClick={() => xoaPhatSinh(item.id)} className="bg-red-500 text-white px-3 py-1 rounded h-fit">
                        Xóa
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {tab === "chamCong" && (
        <>
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-xl font-bold mb-4">⏰ Chấm công GPS</h2>

            <div className="mb-3">
              Hôm nay: <b>{homNay()}</b>
            </div>

            <div className="mb-3 text-sm text-gray-600">
              Chỉ chấm công khi ở trong bán kính {BAN_KINH_CHO_PHEP}m quanh cửa hàng.
            </div>

            {khoangCach !== null && (
              <div className="mb-3">
                Khoảng cách hiện tại: <b>{khoangCach}m</b>
              </div>
            )}

            <div className="mb-4">
              <div>Check In: {chamCongHomNay?.checkIn || "Chưa có"}</div>
              <div>Check Out: {chamCongHomNay?.checkOut || "Chưa có"}</div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => chamCong("checkIn")} disabled={dangLayViTri} className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400">
                {dangLayViTri ? "Đang lấy vị trí..." : "Check In"}
              </button>

              <button onClick={() => chamCong("checkOut")} disabled={dangLayViTri} className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400">
                {dangLayViTri ? "Đang lấy vị trí..." : "Check Out"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">
              {laAdmin ? "Lịch sử chấm công toàn bộ" : "Lịch sử chấm công"}
            </h2>

            <div className="space-y-2">
              {[...chamCongHienThi]
                .sort((a, b) => b.ngay.localeCompare(a.ngay))
                .map((item) => (
                  <div key={item.id} className="border rounded p-3">
                    <div className="font-semibold">
                      {item.ngay} • {item.email}
                    </div>
                    <div>Check In: {item.checkIn || "Chưa có"}</div>
                    <div>Check Out: {item.checkOut || "Chưa có"}</div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
      {tab === "luong" && (
  <div className="bg-white rounded-lg shadow p-4 mb-6">
    <h2 className="text-xl font-bold mb-4">
      💰 Lương của tôi
    </h2>

    <div className="space-y-3">

      <div className="border rounded p-3">
        <div className="text-gray-500 text-sm">
          Lương cứng
        </div>
        <div className="font-bold text-lg">
          {formatTienInput(String(luongCungCuaToi))}đ
        </div>
      </div>

      <div className="border rounded p-3">
        <div className="text-gray-500 text-sm">
          Đi muộn
        </div>
        <div className="font-bold text-lg">
          {soLanDiMuonThang} / 3 lần
        </div>
      </div>

      <div className="border rounded p-3">
        <div className="text-gray-500 text-sm">
          Nghỉ phép
        </div>
        <div className="font-bold text-lg">
          {soNgayNghiThang} / 2 ngày
        </div>
      </div>

      <div className="border rounded p-3">
        <div className="text-gray-500 text-sm">
          Chuyên cần
        </div>
        <div
  className={`font-bold text-lg ${
    duocChuyenCan ? "text-green-600" : "text-red-600"
  }`}
>
  {duocChuyenCan ? "Đủ điều kiện" : "Không đủ điều kiện"}
</div>

<div className="text-sm text-gray-500 mt-1">
  Thưởng: {duocChuyenCan
    ? formatTienInput(String(thuongChuyenCanCuaToi))
    : "0"}đ
</div>
      </div>
      <div className="border rounded p-3 bg-green-50">
  <div className="text-gray-500 text-sm">
    Lương tạm tính
  </div>
  <div className="font-bold text-xl text-green-700">
    {formatTienInput(
      String(
        luongCungCuaToi +
          (duocChuyenCan ? thuongChuyenCanCuaToi : 0)
      )
    )}đ
  </div>
</div>

    </div>
  </div>
)}

      {tab === "nhanVien" && laAdmin && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">👥 Quản lý tài khoản</h2>

          <div className="bg-yellow-50 border border-yellow-300 p-3 rounded mb-4 text-sm">
            Bước tạo nhân viên: vào Firebase Authentication tạo tài khoản trước, copy UID của tài khoản đó, rồi dán UID vào đây.
          </div>

          <div className="grid gap-3 md:grid-cols-4 mb-4">
            <input type="text" placeholder="UID nhân viên" value={uidNhanVien} onChange={(e) => setUidNhanVien(e.target.value)} className="border p-2 rounded" />

            <input type="email" placeholder="Email nhân viên" value={emailNhanVien} onChange={(e) => setEmailNhanVien(e.target.value)} className="border p-2 rounded" />
            <input
  type="text"
  placeholder="Họ tên"
  value={hoTenNhanVien}
  onChange={(e) => setHoTenNhanVien(e.target.value)}
  className="border p-2 rounded"
/>

<input
  type="text"
  placeholder="Số điện thoại"
  value={soDienThoaiNhanVien}
  onChange={(e) => setSoDienThoaiNhanVien(e.target.value)}
  className="border p-2 rounded"
/>
<input
  type="text"
  placeholder="Lương cứng"
  value={luongCungNhanVien}
  onChange={(e) => setLuongCungNhanVien(formatTienInput(e.target.value))}
  className="border p-2 rounded"
/>

<input
  type="text"
  placeholder="Thưởng chuyên cần"
  value={thuongChuyenCanNhanVien}
  onChange={(e) =>
    setThuongChuyenCanNhanVien(formatTienInput(e.target.value))
  }
  className="border p-2 rounded"
/>

            <select value={quyenNhanVien} onChange={(e) => setQuyenNhanVien(e.target.value as Role)} className="border p-2 rounded">
              <option value="staff">Nhân viên</option>
              <option value="admin">Admin</option>
            </select>

            <button onClick={taoHoSoNhanVien}
  className="bg-green-600 text-white px-4 rounded"
>
  {dangSuaNhanVien ? "💾 Cập nhật hồ sơ" : "Tạo hồ sơ"}
            </button>
          </div>

          <div className="space-y-2">
            {danhSachTaiKhoan.map((tk) => (
              <div key={tk.id} className="border rounded p-3 flex justify-between items-center">
                <div>
  <div className="font-semibold">
    {tk.hoTen || tk.email}
    {tk.soDienThoai && (
      <>
        {" · "}
        <a
          href={`tel:${tk.soDienThoai}`}
          className="text-blue-600 font-medium"
        >
          📞 {tk.soDienThoai}
        </a>
      </>
    )}
  </div>

  <div className="text-sm text-gray-500">
    {tk.email}
  </div>
  {laAdmin && (
  <div className="text-sm text-gray-600 mt-1">
    Lương cứng: {formatTienInput(String(tk.luongCung || 0))}đ · Chuyên cần:{" "}
    {formatTienInput(String(tk.thuongChuyenCan || 0))}đ
  </div>
)}
</div>

{laAdmin && (
  <button
    onClick={() => suaHoSoNhanVien(tk)}
    className="border px-3 py-2 rounded mr-2"
  >
    ✏️ Sửa
  </button>
)}
                {tk.email === ADMIN_CHINH_EMAIL ? (
                  <div className="text-green-600 font-bold">Admin chính</div>
                ) : (
                  <select value={tk.role} onChange={(e) => doiQuyen(tk.id, e.target.value as Role)} className="border p-2 rounded">
                    <option value="staff">Nhân viên</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
{tab === "tinhTrangKH" && (
  <div className="bg-white rounded-lg shadow p-4 mb-6">
    <h2 className="text-xl font-bold mb-4">📋 Tình trạng khách hàng</h2>

    <div className="grid gap-4 mb-4 md:grid-cols-3">
      <div className="border rounded-lg p-4 bg-red-50">
        <div className="text-2xl font-bold text-red-600">{quaHan.length}</div>
        <div className="font-semibold">🔴 Quá hạn trả đồ</div>
      </div>

      <div className="border rounded-lg p-4 bg-yellow-50">
        <div className="text-2xl font-bold text-yellow-600">{canTraHomNay.length}</div>
        <div className="font-semibold">🟡 Trả hôm nay</div>
      </div>

      <div className="border rounded-lg p-4 bg-green-50">
        <div className="text-2xl font-bold text-green-600">{dangThue.length}</div>
        <div className="font-semibold">🟢 Đang thuê</div>
      </div>
    </div>

    <div className="mt-6 border rounded-lg p-4">
      <h3 className="font-bold text-lg mb-3">📞 Khách cần liên hệ</h3>

      {quaHan.length === 0 && canTraHomNay.length === 0 ? (
        <div className="text-gray-500">Không có khách cần liên hệ</div>
      ) : (
        <div className="space-y-2">
          {[...quaHan, ...canTraHomNay].map((ps) => (
            <div
              key={ps.id}
              className={`border rounded p-3 ${
                quaHan.includes(ps) ? "bg-red-50" : "bg-yellow-50"
              }`}
            >
              <div className="font-semibold">{ps.tenKhach || "Không tên"}</div>

              <div className="flex items-center gap-2">
                <span>{ps.soDienThoai || "-"}</span>

                {ps.soDienThoai && (
                  <a
                    href={`tel:${ps.soDienThoai}`}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                  >
                    📞 Gọi
                  </a>
                )}

                <button
                  onClick={() => danhDauDaTraDo(ps.id!)}
                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                >
                  ✓ Đã trả đồ
                </button>
              </div>

              <div className={quaHan.includes(ps) ? "text-red-600" : "text-yellow-700"}>
                {quaHan.includes(ps) ? "Quá hạn trả đồ" : "Trả hôm nay"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

      {tab === "thongKe" && laAdmin && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">📊 Thống kê doanh thu</h2>

          <input type="month" value={thangThongKe} onChange={(e) => setThangThongKe(e.target.value)} className="border p-2 rounded mb-3" />

          <div>Tổng lịch trong tháng: {lichTrongThang.length}</div>

          <div>
            Doanh thu lịch chụp: <b>{tongThuNhapLich.toLocaleString("vi-VN")}đ</b>
          </div>

          <div>
            Doanh thu phát sinh: <b>{tongThuNhapPhatSinh.toLocaleString("vi-VN")}đ</b>
          </div>

          <div className="text-green-600 font-bold text-xl mt-3">
            Tổng doanh thu: {tongThuNhap.toLocaleString("vi-VN")}đ
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-400 mt-8 mb-2">
        Phiên bản {APP_VERSION}
      </div>

    </div>
  );
}
