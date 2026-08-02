import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm p-4 text-center">
            <h3 className="text-primary mb-3">Đăng Nhập</h3>
            <p className="text-muted mb-4">Trang Đăng nhập (Placeholder Kiến trúc)</p>
            <div className="d-grid gap-2">
              <Link to="/register" className="btn btn-outline-secondary">
                Chưa có tài khoản? Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
