import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { fetchCategories } from '../features/categories/categorySlice';
import { fetchExpenses } from '../features/expenses/expenseSlice';
import { fetchBudgets } from '../features/budgets/budgetSlice';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { SkeletonCard } from '../components/common/Skeleton';
import { formatCurrency, formatDate } from '../utils/format';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // User auth state
  const user = useAppSelector((state) => state.auth.user);

  // Redux stats state
  const categories = useAppSelector((state) => state.categories.items);
  const expenses = useAppSelector((state) => state.expenses);
  const budgets = useAppSelector((state) => state.budgets.items);

  // Local state cho Profile Avatar & Extra Info
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [note, setNote] = useState('');

  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // ConfirmDialog delete avatar state
  const [showDeleteAvatarConfirm, setShowDeleteAvatarConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto fetch stats if store is empty on mount
  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
    if (expenses.items.length === 0 && expenses.pagination.totalItems === 0) {
      dispatch(fetchExpenses());
    }
    if (budgets.length === 0) dispatch(fetchBudgets());
  }, [
    dispatch,
    categories.length,
    expenses.items.length,
    expenses.pagination.totalItems,
    budgets.length
  ]);

  // Load user profile extra info & avatar from localStorage keyed by user.id
  useEffect(() => {
    if (!user?.id) return;

    // Load avatar
    const savedAvatar = localStorage.getItem(`profile_avatar_${user.id}`);
    if (savedAvatar) {
      setAvatar(savedAvatar);
    } else {
      setAvatar(null);
    }

    // Load extra info
    const savedExtra = localStorage.getItem(`profile_extra_${user.id}`);
    if (savedExtra) {
      try {
        const parsed = JSON.parse(savedExtra);
        if (parsed.fullName) setFullName(parsed.fullName);
        else setFullName(user.fullName || '');
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.birthDate) setBirthDate(parsed.birthDate);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.occupation) setOccupation(parsed.occupation);
        if (parsed.note) setNote(parsed.note);
      } catch {
        setFullName(user.fullName || '');
      }
    } else {
      setFullName(user.fullName || '');
      setPhone('');
      setGender('');
      setBirthDate('');
      setAddress('');
      setOccupation('');
      setNote('');
    }
  }, [user?.id, user?.fullName]);

  // Upload Avatar Handler (Max 2MB, FileReader Base64)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Định dạng ảnh không hỗ trợ. Vui lòng chọn PNG, JPG, JPEG hoặc WEBP');
      return;
    }

    const maxBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxBytes) {
      setAvatarError('Dung lượng ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setAvatar(base64Data);
      if (user?.id) {
        localStorage.setItem(`profile_avatar_${user.id}`, base64Data);
      }
      toast.success('Tải ảnh đại diện thành công!');
    };
    reader.readAsDataURL(file);
  };

  // Remove Avatar Handler
  const promptRemoveAvatar = () => {
    setShowDeleteAvatarConfirm(true);
  };

  const handleConfirmRemoveAvatar = () => {
    setAvatar(null);
    setAvatarError(null);
    if (user?.id) {
      localStorage.removeItem(`profile_avatar_${user.id}`);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowDeleteAvatarConfirm(false);
    toast.success('Đã xóa ảnh đại diện.');
  };

  // Save Profile Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setValidationError('Họ và tên không được để rỗng');
      return;
    }

    if (phone.trim() && !/^\d{9,11}$/.test(phone.trim())) {
      setValidationError('Số điện thoại không hợp lệ (phải từ 9 đến 11 chữ số)');
      return;
    }

    if (birthDate) {
      const selectedDate = new Date(birthDate);
      const today = new Date();
      if (selectedDate > today) {
        setValidationError('Ngày sinh không được lớn hơn ngày hiện tại');
        return;
      }
    }

    if (note.length > 500) {
      setValidationError('Ghi chú cá nhân không được vượt quá 500 ký tự');
      return;
    }

    if (user?.id) {
      const extraData = {
        fullName: trimmedName,
        phone: phone.trim(),
        gender,
        birthDate,
        address: address.trim(),
        occupation: occupation.trim(),
        note: note.trim()
      };
      localStorage.setItem(`profile_extra_${user.id}`, JSON.stringify(extraData));
    }

    toast.success('Cập nhật thông tin thành công.');
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.info('Đã đăng xuất tài khoản.');
    navigate('/login');
  };

  const getInitialLetter = () => {
    const name = fullName || user?.fullName || user?.username || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getShortId = () => {
    if (!user?.id) return '-';
    return user.id.length > 6 ? `...${user.id.slice(-6)}` : user.id;
  };

  const totalExpenseCount = expenses.pagination.totalItems || expenses.items.length;
  const totalBudgetSum = budgets.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  if (!user) {
    return (
      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <SkeletonCard className="mb-4" />
          <SkeletonCard />
        </div>
        <div className="col-12 col-lg-8">
          <SkeletonCard className="mb-4" />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Bar */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">👤 Thông Tin Cá Nhân</h2>
        <p className="text-muted mb-0">Quản lý hồ sơ người dùng và cài đặt bảo mật tài khoản</p>
      </div>

      <div className="row g-4">
        {/* ========================================================================= */}
        {/* CỘT TRÁI: AVATAR & BẢO MẬT */}
        {/* ========================================================================= */}
        <div className="col-12 col-lg-4">
          {/* Card Avatar */}
          <div className="card shadow-sm border-0 rounded-3 text-center p-4 mb-4">
            <div className="d-flex justify-content-center mb-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile Avatar"
                  className="rounded-circle border border-3 border-primary shadow-sm object-fit-cover"
                  style={{ width: '160px', height: '160px' }}
                />
              ) : (
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center border border-3 border-light shadow-sm font-weight-bold"
                  style={{ width: '160px', height: '160px', fontSize: '64px' }}
                >
                  {getInitialLetter()}
                </div>
              )}
            </div>

            <h5 className="fw-bold mb-1">{fullName || user?.fullName || user?.username}</h5>
            <p className="text-muted small mb-3">ID: {getShortId()}</p>

            {avatarError && (
              <div className="alert alert-danger py-1 small mb-3" role="alert">
                {avatarError}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="d-none"
              onChange={handleAvatarChange}
            />

            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-outline-primary btn-sm px-3 fw-semibold"
                onClick={() => fileInputRef.current?.click()}
              >
                📷 Đổi ảnh
              </button>
              {avatar && (
                <button
                  className="btn btn-outline-danger btn-sm px-3 fw-semibold"
                  onClick={promptRemoveAvatar}
                >
                  🗑️ Xóa ảnh
                </button>
              )}
            </div>
            <div className="form-text small mt-2">
              Định dạng PNG, JPG, WEBP (Tối đa 2MB).
            </div>
          </div>

          {/* Card Bảo mật & Phiên đăng nhập */}
          <div className="card shadow-sm border-0 rounded-3 p-4">
            <h5 className="fw-bold mb-3 text-primary">🔒 Bảo Mật Tài Khoản</h5>
            <div className="mb-3">
              <label className="text-muted small fw-semibold d-block mb-1">Username</label>
              <div className="fw-bold text-dark">{user?.username || '-'}</div>
            </div>

            <div className="mb-3">
              <label className="text-muted small fw-semibold d-block mb-1">Email</label>
              <div className="fw-bold text-dark">{user?.email || '-'}</div>
            </div>

            <div className="mb-4">
              <label className="text-muted small fw-semibold d-block mb-1">Trạng thái phiên</label>
              <div className="badge bg-success px-2 py-1">
                ● Phiên đăng nhập đang hoạt động
              </div>
            </div>

            <button className="btn btn-danger w-100 fw-semibold" onClick={handleLogout}>
              🚪 Đăng xuất khỏi thiết bị
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CỘT PHẢI: FORM THÔNG TIN CÁ NHÂN & THỐNG KÊ TÀI KHOẢN */}
        {/* ========================================================================= */}
        <div className="col-12 col-lg-8">
          {/* Card Thông tin cá nhân */}
          <div className="card shadow-sm border-0 rounded-3 mb-4">
            <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h5 className="fw-bold mb-0 text-primary">📝 Thông Tin Chi Tiết Hồ Sơ</h5>
            </div>

            <div className="card-body p-4">
              {validationError && (
                <div className="alert alert-danger py-2 small mb-3" role="alert">
                  {validationError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} noValidate>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Họ và tên *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setValidationError(null);
                      }}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ví dụ: 0987654321"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setValidationError(null);
                      }}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Giới tính</label>
                    <select
                      className="form-select"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="nam">Nam</option>
                      <option value="nu">Nữ</option>
                      <option value="khac">Khác</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Ngày sinh</label>
                    <input
                      type="date"
                      className="form-control"
                      value={birthDate}
                      onChange={(e) => {
                        setBirthDate(e.target.value);
                        setValidationError(null);
                      }}
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Địa chỉ</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập địa chỉ của bạn..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Nghề nghiệp</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ví dụ: Lập trình viên, Sinh viên..."
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Ghi chú cá nhân (Bio)</label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    className="form-control"
                    placeholder="Giới thiệu ngắn về bản thân..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                  <div className="form-text text-end small">
                    {note.length} / 500 ký tự
                  </div>
                </div>

                <div className="alert alert-light border small text-muted mb-4">
                  💡 <strong>Ghi chú:</strong> Thông tin cá nhân bổ sung và ảnh đại diện hiện được lưu an toàn tại bộ nhớ thiết bị (localStorage). Khi Backend hỗ trợ API cập nhật Profile, dữ liệu sẽ được tự động đồng bộ lên cơ sở dữ liệu.
                </div>

                <button type="submit" className="btn btn-primary px-4 fw-semibold">
                  💾 Lưu thông tin
                </button>
              </form>
            </div>
          </div>

          {/* Card Thống kê tài khoản */}
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h5 className="fw-bold mb-0 text-success">📊 Thống Kê Tài Khoản</h5>
            </div>

            <div className="card-body p-4">
              <div className="row text-center g-3">
                <div className="col-6 col-md-3">
                  <div className="p-3 border rounded bg-light">
                    <div className="text-muted small">Danh mục</div>
                    <div className="fw-bold text-dark fs-5">{categories.length}</div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="p-3 border rounded bg-light">
                    <div className="text-muted small">Khoản chi</div>
                    <div className="fw-bold text-danger fs-5">{totalExpenseCount}</div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="p-3 border rounded bg-light">
                    <div className="text-muted small">Tổng định mức</div>
                    <div className="fw-bold text-primary fs-5">
                      {formatCurrency(totalBudgetSum)}
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="p-3 border rounded bg-light">
                    <div className="text-muted small">Trạng thái</div>
                    <div className="mt-1">
                      <span className="badge bg-success">● Đang hoạt động</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-muted small text-center">
                Tài khoản khởi tạo ngày:{' '}
                <span className="fw-bold">
                  {user?.createdAt ? formatDate(user.createdAt) : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog Xóa Avatar */}
      <ConfirmDialog
        show={showDeleteAvatarConfirm}
        title="Xác Nhận Xóa Ảnh Đại Diện"
        message="Bạn có chắc chắn muốn xóa ảnh đại diện không? Ảnh sẽ quay về dạng chữ cái mặc định."
        confirmText="Xóa Ảnh"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleConfirmRemoveAvatar}
        onCancel={() => setShowDeleteAvatarConfirm(false)}
      />
    </div>
  );
};

export default ProfilePage;
