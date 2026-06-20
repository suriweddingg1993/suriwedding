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
import TabLuong from "./components/TabLuong";
import TabTinhTrangKH from "./components/TabTinhTrangKH";
import TabThongKe from "./components/TabThongKe";
import TabNhanVien from "./components/TabNhanVien";
import TabPhatSinh from "./components/TabPhatSinh";
import TabLich from "./components/TabLich";

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
        <TabLich
          dangSua={dangSua}
          ngay={ngay} setNgay={setNgay}
          gio={gio} setGio={setGio}
          tenKhach={tenKhach} setTenKhach={setTenKhach}
          soDienThoai={soDienThoai} setSoDienThoai={setSoDienThoai}
          theLoai={theLoai} setTheLoai={setTheLoai}
          theLoaiKhac={theLoaiKhac} setTheLoaiKhac={setTheLoaiKhac}
          goiChup={goiChup} setGoiChup={setGoiChup}
          giaTien={giaTien} setGiaTien={setGiaTien}
          formatTienInput={formatTienInput}
          themHoacSuaLich={themHoacSuaLich}
          resetForm={resetForm}
          timNgay={timNgay} setTimNgay={setTimNgay}
          tuKhoa={tuKhoa} setTuKhoa={setTuKhoa}
          lichTheoNgay={lichTheoNgay}
          laAdmin={laAdmin}
          capNhatTrangThai={capNhatTrangThai}
          suaLich={suaLich}
          xoaLich={xoaLich}
        />
      )}

      {tab === "phatSinh" && (
        <TabPhatSinh
          psNgay={psNgay} setPsNgay={setPsNgay}
          psTenKhach={psTenKhach} setPsTenKhach={setPsTenKhach}
          psSoDienThoai={psSoDienThoai} setPsSoDienThoai={setPsSoDienThoai}
          psLoai={psLoai} setPsLoai={setPsLoai}
          psNgayTra={psNgayTra} setPsNgayTra={setPsNgayTra}
          psSoTien={psSoTien} setPsSoTien={setPsSoTien}
          psGhiChu={psGhiChu} setPsGhiChu={setPsGhiChu}
          formatTienInput={formatTienInput}
          themPhatSinh={themPhatSinh}
          danhSachPhatSinh={danhSachPhatSinh}
          laAdmin={laAdmin}
          xoaPhatSinh={xoaPhatSinh}
        />
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
        <TabLuong
          luongCungCuaToi={luongCungCuaToi}
          soLanDiMuonThang={soLanDiMuonThang}
          soNgayNghiThang={soNgayNghiThang}
          duocChuyenCan={duocChuyenCan}
          thuongChuyenCanCuaToi={thuongChuyenCanCuaToi}
        />
      )}

      {tab === "nhanVien" && laAdmin && (
        <TabNhanVien
          uidNhanVien={uidNhanVien}
          setUidNhanVien={setUidNhanVien}
          emailNhanVien={emailNhanVien}
          setEmailNhanVien={setEmailNhanVien}
          hoTenNhanVien={hoTenNhanVien}
          setHoTenNhanVien={setHoTenNhanVien}
          soDienThoaiNhanVien={soDienThoaiNhanVien}
          setSoDienThoaiNhanVien={setSoDienThoaiNhanVien}
          luongCungNhanVien={luongCungNhanVien}
          setLuongCungNhanVien={setLuongCungNhanVien}
          thuongChuyenCanNhanVien={thuongChuyenCanNhanVien}
          setThuongChuyenCanNhanVien={setThuongChuyenCanNhanVien}
          quyenNhanVien={quyenNhanVien}
          setQuyenNhanVien={setQuyenNhanVien}
          taoHoSoNhanVien={taoHoSoNhanVien}
          dangSuaNhanVien={dangSuaNhanVien}
          danhSachTaiKhoan={danhSachTaiKhoan}
          laAdmin={laAdmin}
          suaHoSoNhanVien={suaHoSoNhanVien}
          formatTienInput={formatTienInput}
        />
      )}
{tab === "tinhTrangKH" && (
        <TabTinhTrangKH
          quaHan={quaHan}
          canTraHomNay={canTraHomNay}
          dangThue={dangThue}
          danhDauDaTraDo={danhDauDaTraDo}
        />
      )}

      {tab === "thongKe" && laAdmin && (
        <TabThongKe
          thangThongKe={thangThongKe}
          setThangThongKe={setThangThongKe}
          lichTrongThang={lichTrongThang}
          tongThuNhapLich={tongThuNhapLich}
          tongThuNhapPhatSinh={tongThuNhapPhatSinh}
          tongThuNhap={tongThuNhap}
        />
      )}
      </div>
  );
}