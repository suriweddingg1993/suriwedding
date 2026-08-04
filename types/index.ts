// Định nghĩa các loại quyền và tab
export type Role = "admin" | "staff";
// ĐÃ THÊM: Tab "khachHang" cho hệ thống CRM
export type TabType = "home" | "lich" | "phatSinh" | "tinhTrangKH" | "chamCong" | "luong" | "nhanVien" | "thongKe" | "khachHang";

// Chuẩn hóa cho Hồ sơ nhân viên
export interface TaiKhoan {
  id: string;
  email: string;
  hoTen?: string;
  soDienThoai?: string;
  luongCung?: number;
  thuongChuyenCan?: number;
  role: Role;
}

// BỔ SUNG: Cấu trúc Hồ Sơ Khách Hàng (CRM)
export interface KhachHang {
  id?: string;
  tenKhach: string;
  soDienThoai: string;
  soDienThoai2?: string;
  diaChi?: string;
  nguonKhach?: string; // Ví dụ: Facebook, Zalo, Người quen giới thiệu...
  ghiChu?: string;
  ngayTao: string;
}

// Cấu trúc Gói Dịch Vụ
export interface GoiDichVu {
  id?: string;
  tenGoi: string;
  chiTiet: string;
  giaTien: number;
}

// Chuẩn hóa cho Lịch chụp
export interface Lich {
  id?: string;
  khachHangId?: string; // ĐÃ THÊM: Dùng để liên kết với bảng KhachHang
  ngay: string;
  gio: string;
  tenKhach: string;
  soDienThoai?: string;
  soDienThoai2?: string;
  theLoai: string;
  goiChup?: string;
  giaTien?: number;
  tienCoc?: number; 
  trangThai?: string;
  ngayCuoi?: string;
  dichVuThem?: string;
  tienDichVuThem?: number;
  phanCong?: Record<string, string>;
}

// Chuẩn hóa cho Thu Chi / Phát sinh
export interface PhatSinh {
  id?: string;
  khachHangId?: string; // ĐÃ THÊM: Dùng để liên kết với bảng KhachHang
  ngay: string;
  tenKhach: string;
  soDienThoai?: string;
  loai: string;
  soTien: number;
  nguoiGhi: string;
  ngayTra?: string;
  daTraDo?: boolean;
  ghiChu?: string;
}

// Chuẩn hóa cho Chấm công
export interface ChamCong {
  id?: string;
  uid: string;
  email: string;
  ngay: string;
  checkIn?: string;
  checkInLat?: number;
  checkInLng?: number;
  checkOut?: string;
  checkOutLat?: number;
  checkOutLng?: number;
  diMuon?: boolean;
  soPhutMuon?: number;
  loaiGiaiTrinh?: string;
  lyDoGiaiTrinh?: string;
  trangThaiGiaiTrinh?: string;
  thoiGianDeXuat?: string;
}

// Chuẩn hóa cho Thụ hưởng (Hoa hồng)
export interface ThuHuong {
  id?: string;
  uid: string;
  email: string;
  hoTen: string;
  ngay: string;
  moTa: string;
  soTien: number;
}