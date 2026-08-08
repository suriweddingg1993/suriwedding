export type Role = "admin" | "staff";
export type TabType = "home" | "lich" | "phatSinh" | "chamCong" | "luong" | "nhanVien" | "tinhTrangKH" | "thongKe" | "khachHang" | "chiPhi";

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
  chiTietGoi?: string; 
  giaTien: number; 
  
  // ĐÃ BỔ SUNG: Mảng lịch sử thanh toán nhiều đợt
  danhSachThanhToan?: {
    idStr: string;
    soTien: number;
    phuongThuc: "Tiền mặt" | "Chuyển khoản";
    ngay: string;
    daNopTien?: boolean;
  }[];

  // Giữ lại các biến cũ để tương thích ngược dữ liệu
  tienCoc?: number; 
  phuongThucCoc?: "Tiền mặt" | "Chuyển khoản" | "Chưa phân loại"; 
  ngayGhiNhanCoc?: string;
  daNopTienCoc?: boolean; 

  tienThanhToanThem?: number;
  ngayThanhToanThem?: string;
  phuongThucThanhToanThem?: "Tiền mặt" | "Chuyển khoản";
  daNopTienThanhToanThem?: boolean; 

  dichVuThem?: string; 
  tienDichVuThem?: number; 
  chiTietDichVuThem?: { ten: string; gia: number }[];

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
  phuongThuc?: "Tiền mặt" | "Chuyển khoản" | "Chưa phân loại"; 
  daNopTien?: boolean; 
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
  thoiGianDeXuat?: string;
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
  theLoai?: string;
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
  tongChiTieu?: number;
  soLanDen?: number;
}

export interface ChiPhi {
  id?: string;
  ngay: string;
  hangMuc: string;
  soTien: number;
  ghiChu?: string;
}