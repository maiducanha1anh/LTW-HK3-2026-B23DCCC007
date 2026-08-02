import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, User, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { loginUser, clearAuthError } from '../features/auth/authSlice';
import Logo from '../components/common/Logo';

const LoginPage: React.FC = () => {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccount(e.target.value);
    setValidationError(null);
    if (error) dispatch(clearAuthError());
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setValidationError(null);
    if (error) dispatch(clearAuthError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account.trim()) {
      setValidationError('Vui lòng nhập Username hoặc Email');
      return;
    }

    if (!password) {
      setValidationError('Vui lòng nhập Mật khẩu');
      return;
    }

    try {
      await dispatch(loginUser({ account: account.trim(), password })).unwrap();
      toast.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } catch {
      // Backend error is stored in Redux error state and displayed below
    }
  };

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center py-5">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow border-0 rounded-4">
            <div className="card-body p-4 p-sm-5">
              <div className="text-center mb-4">
                <div className="d-flex justify-content-center mb-3">
                  <Logo size={44} />
                </div>
                <p className="text-muted small mb-0">Đăng nhập tài khoản của bạn để tiếp tục</p>
              </div>

              {(validationError || error) && (
                <div className="alert alert-danger py-2 small rounded-3 mb-4" role="alert">
                  {validationError || error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="accountInput">
                    Tài khoản (Username hoặc Email)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted border-end-0">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="accountInput"
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Nhập username hoặc email..."
                      value={account}
                      onChange={handleAccountChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold" htmlFor="passwordInput">
                    Mật khẩu
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted border-end-0">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="passwordInput"
                      type={showPassword ? 'text' : 'password'}
                      className="form-control border-start-0 border-end-0 ps-0"
                      placeholder="Nhập mật khẩu..."
                      value={password}
                      onChange={handlePasswordChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary bg-white text-muted border-start-0"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2.5 fw-semibold mb-4 rounded-3"
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
                    <>
                      <LogIn className="w-4 h-4 me-1" />
                      <span>Đăng Nhập</span>
                    </>
                  )}
                </button>

                <div className="text-center border-top pt-3">
                  <span className="text-muted small me-2">Chưa có tài khoản?</span>
                  <Link to="/register" className="small text-decoration-none fw-bold text-success">
                    Đăng ký ngay
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

export default LoginPage;
