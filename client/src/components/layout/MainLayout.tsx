import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';

const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Header Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 shadow-sm">
        <NavLink className="navbar-brand font-weight-bold" to="/dashboard">
          💰 QuanLyChiTieu
        </NavLink>
        <div className="ms-auto d-flex align-items-center gap-3">
          {user && (
            <span className="text-light small fw-semibold">
              👋 Xin chào, {user.fullName || user.username}
            </span>
          )}
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* Content Body with Sidebar */}
      <div className="container-fluid flex-grow-1">
        <div className="row h-100">
          {/* Sidebar */}
          <nav className="col-md-3 col-lg-2 d-md-block bg-white sidebar border-end py-4">
            <div className="position-sticky">
              <ul className="nav nav-pills flex-column gap-2">
                <li className="nav-item">
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : 'link-dark'}`
                    }
                  >
                    📊 Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/categories"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : 'link-dark'}`
                    }
                  >
                    🏷️ Danh mục
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/expenses"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : 'link-dark'}`
                    }
                  >
                    💸 Khoản chi
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/budgets"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : 'link-dark'}`
                    }
                  >
                    🎯 Định mức
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/reports"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : 'link-dark'}`
                    }
                  >
                    📈 Báo cáo
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : 'link-dark'}`
                    }
                  >
                    👤 Profile
                  </NavLink>
                </li>
              </ul>
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
