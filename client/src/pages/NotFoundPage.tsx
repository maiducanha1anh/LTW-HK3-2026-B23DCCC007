import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-1 text-danger font-weight-bold">404</h1>
      <h3 className="mb-3">Trang Không Tồn Tại</h3>
      <p className="text-muted mb-4">Đường dẫn bạn truy cập không đúng hoặc đã bị gỡ bỏ.</p>
      <Link to="/dashboard" className="btn btn-primary">
        Về trang chủ Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
