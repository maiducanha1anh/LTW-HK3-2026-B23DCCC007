import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';

const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  // State cho Mobile Offcanvas Drawer Sidebar (< 992px)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Lock body scroll khi mở Mobile Sidebar & hỗ trợ phím ESC
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMobileOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isMobileOpen]);

  // Reset mobile sidebar khi thay đổi kích thước màn hình lên >= 992px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    setIsMobileOpen(false);
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/categories', icon: '🏷️', label: 'Danh mục' },
    { path: '/expenses', icon: '💸', label: 'Khoản chi' },
    { path: '/budgets', icon: '🎯', label: 'Định mức' },
    { path: '/reports', icon: '📈', label: 'Báo cáo' },
    { path: '/profile', icon: '👤', label: 'Profile' }
  ];

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Top Navbar Header */}
      <header className="navbar navbar-dark bg-dark app-navbar px-3 shadow-sm sticky-top">
        <div className="d-flex align-items-center gap-2">
          {/* Hamburger Menu Toggle Button for Mobile (< 992px) */}
          <button
            type="button"
            className="btn btn-outline-light btn-sm d-lg-none me-1"
            aria-label="Mở Menu điều hướng"
            aria-expanded={isMobileOpen}
            aria-controls="mobile-sidebar-offcanvas"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            ☰
          </button>

          <NavLink className="navbar-brand fw-bold text-white mb-0" to="/dashboard">
            💰 QuanLyChiTieu
          </NavLink>
        </div>

        <div className="ms-auto d-flex align-items-center gap-2 gap-sm-3">
          {user && (
            <span className="text-light small fw-semibold user-name-truncated" title={user.fullName || user.username}>
              👋 <span className="d-none d-sm-inline">Xin chào, </span>
              {user.fullName || user.username}
            </span>
          )}
          <button
            className="btn btn-outline-light btn-sm fw-semibold"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Desktop Sidebar (>= 992px Cố định) */}
      <aside className="app-sidebar-desktop py-4 px-3" aria-label="Menu điều hướng máy tính">
        <ul className="nav nav-pills flex-column gap-1 sidebar-nav-item">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>

      {/* Mobile Backdrop & Offcanvas Drawer (< 992px) */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        id="mobile-sidebar-offcanvas"
        className={`mobile-offcanvas-drawer p-3 ${isMobileOpen ? 'show' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng di động"
      >
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <span className="fw-bold text-primary fs-5">💰 Menu Điều Hướng</span>
          <button
            type="button"
            className="btn-close text-reset"
            aria-label="Đóng Menu"
            onClick={() => setIsMobileOpen(false)}
          ></button>
        </div>

        <ul className="nav nav-pills flex-column gap-1 sidebar-nav-item">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setIsMobileOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content Body */}
      <div className="main-content-offset flex-grow-1 p-3 p-sm-4">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
