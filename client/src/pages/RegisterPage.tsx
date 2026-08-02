import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { registerUser, clearAuthError } from '../features/auth/authSlice';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setValidationError(null);
      if (error) dispatch(clearAuthError());
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setValidationError('Vui lòng nhập Họ và tên');
      return;
    }

    if (username.trim().length < 3) {
      setValidationError('Username phải có tối thiểu 3 ký tự');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setValidationError('Email không đúng định dạng');
      return;
    }

    if (password.length < 6) {
      setValidationError('Mật khẩu phải có tối thiểu 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Xác nhận mật khẩu không khớp');
      return;
    }

    try {
      await dispatch(
        registerUser({
          fullName: fullName.trim(),
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password
        })
      ).unwrap();
      toast.success('Đăng ký tài khoản thành công!');
      navigate('/dashboard');
    } catch {
      // Backend error is stored in Redux error state and displayed below
    }
  };

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center py-5">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body p-4 p-sm-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-success mb-2">💰 Quản Lý Chi Tiêu</h2>
                <p className="text-muted">Đăng ký tài khoản mới</p>
              </div>

              {(validationError || error) && (
                <div className="alert alert-danger py-2 small" role="alert">
                  {validationError || error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="fullNameInput">
                    Họ và tên
                  </label>
                  <input
                    id="fullNameInput"
                    type="text"
                    className="form-control"
                    placeholder="Nhập họ và tên..."
                    value={fullName}
                    onChange={handleInputChange(setFullName)}
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="usernameInput">
                    Username
                  </label>
                  <input
                    id="usernameInput"
                    type="text"
                    className="form-control"
                    placeholder="Nhập username (tối thiểu 3 ký tự)..."
                    value={username}
                    onChange={handleInputChange(setUsername)}
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="emailInput">
                    Email
                  </label>
                  <input
                    id="emailInput"
                    type="email"
                    className="form-control"
                    placeholder="example@domain.com"
                    value={email}
                    onChange={handleInputChange(setEmail)}
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="passwordInput">
                    Mật khẩu
                  </label>
                  <div className="input-group">
                    <input
                      id="passwordInput"
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)..."
                      value={password}
                      onChange={handleInputChange(setPassword)}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? '👁️ Ẩn' : '👁️ Hiện'}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold" htmlFor="confirmPasswordInput">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    id="confirmPasswordInput"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Nhập lại mật khẩu..."
                    value={confirmPassword}
                    onChange={handleInputChange(setConfirmPassword)}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 py-2 fw-semibold mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Đang xử lý...
                    </>
                  ) : (
                    'Đăng Ký'
                  )}
                </button>

                <div className="text-center">
                  <span className="text-muted small me-2">Đã có tài khoản?</span>
                  <Link to="/login" className="small text-decoration-none fw-semibold">
                    Đăng nhập ngay
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
