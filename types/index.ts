export type Role = "admin" | "staff";
export type TabType = "home" | "lich" | "phatSinh" | "chamCong" | "luong" | "nhanVien" | "tinhTrangKH" | "thongKe" | "khachHang";

export interface TaiKhoan {
  id: string; email: string; hoTen?: string; soDienThoai?: string; role?: Role; luongCung?: number; thuongChuyenCan?: number;
}

export interface Lich {
  id?: string; 
  khachHangId?: string; 
  ngay: string; 
  gio: string; 
  tenKhach: string; 
  soDienThoai: string; 
  soDienThoai2?: string; 
  theLoai: string; 
  goiChup: string; 
  chiTietGoi?: string; // <-- ĐÃ BỔ SUNG TRƯỜNG LƯU CHI TIẾT SẢN PHẨM Ở ĐÂY
  giaTien: number; 
  tienCoc?: number; 
  dichVuThem?: string; 
  tienDichVuThem?: number; 
  trangThai?: string; 
  ngayCuoi?: string; 
  phanCong?: Record<string, string>;
}

export interface PhatSinh {
  id?: string; 
  khachHangId?: string; 
  ngay: string; 
  tenKhach: string; 
  soDienThoai: string; 
  loai: string; 
  ngayTra: string; 
  soTien: number; 
  nguoiGhi: string; 
  ghiChu: string; 
  daTraDo?: boolean;
}

export interface ChamCong {
  id?: string; 
  uid: string; 
  email: string; 
  hoTen: string; 
  ngay: string; 
  checkIn: string; 
  checkOut: string; 
  soPhutMuon: number; 
  diMuon: boolean; 
  trangThaiGiaiTrinh?: string; 
  loaiGiaiTrinh?: string; 
  lyDoGiaiTrinh?: string;
}

export interface ThuHuong {
  id?: string; 
  uid: string; 
  email: string; 
  hoTen: string; 
  ngay: string; 
  moTa: string; 
  soTien: number;
}

export interface GoiDichVu {
  id?: string; 
  tenGoi: string; 
  chiTiet: string; 
  giaTien: number;
}

export interface KhachHang {
  id?: string; 
  tenKhach: string; 
  soDienThoai: string; 
  soDienThoai2?: string; 
  diaChi?: string; 
  nguonKhach?: string; 
  ghiChu?: string; 
  ngayTao?: string; 
  chiTieu?: number;
}