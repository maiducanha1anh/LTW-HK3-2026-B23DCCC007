import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm p-4 text-center">
            <h3 className="text-success mb-3">Đăng Ký</h3>
            <p className="text-muted mb-4">Trang Đăng ký (Placeholder Kiến trúc)</p>
            <div className="d-grid gap-2">
              <Link to="/login" className="btn btn-outline-primary">
                Đã có tài khoản? Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
