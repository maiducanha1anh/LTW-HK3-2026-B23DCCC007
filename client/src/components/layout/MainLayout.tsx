import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Tags,
  Wallet,
  Target,
  BarChart3,
  UserRound,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import Logo, { LogoSvg } from '../common/Logo';

const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  // State cho Mobile Offcanvas Drawer Sidebar (< 992px)
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  // Load avatar from localStorage
  useEffect(() => {
    if (user?.id) {
      const savedAvatar = localStorage.getItem(`profile_avatar_${user.id}`);
      setAvatar(savedAvatar || null);
    }
  }, [user?.id]);

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
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/categories', icon: Tags, label: 'Danh mục' },
    { path: '/expenses', icon: Wallet, label: 'Khoản chi' },
    { path: '/budgets', icon: Target, label: 'Định mức chi tiêu' },
    { path: '/reports', icon: BarChart3, label: 'Báo cáo' },
    { path: '/profile', icon: UserRound, label: 'Profile' }
  ];

  const getUserInitials = () => {
    const name = user?.fullName || user?.username || 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Top Navbar Header */}
      <header className="navbar app-navbar px-3 px-md-4 sticky-top">
        <div className="d-flex align-items-center gap-3">
          {/* Hamburger Toggle Button for Mobile */}
          <button
            type="button"
            className="btn text-white p-1 d-lg-none"
            aria-label="Mở Menu điều hướng"
            aria-expanded={isMobileOpen}
            aria-controls="mobile-sidebar-offcanvas"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo & Title for Navbar Header */}
          <div className="d-flex align-items-center gap-3 text-white">
            <LogoSvg size={36} />
            <div className="d-flex flex-column">
              <span className="fw-bold fs-6 lh-sm text-white">Quản Lý Chi Tiêu</span>
              <span className="text-white-50 small d-none d-sm-inline" style={{ fontSize: '0.72rem' }}>
                Kiểm soát tài chính, sống an tâm
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Notification & User Info */}
        <div className="ms-auto d-flex align-items-center gap-3">
          {/* Notification Bell */}
          <button type="button" className="notification-bell-btn" title="Thông báo">
            <Bell className="w-5 h-5" />
            <span className="notification-badge">3</span>
          </button>

          {/* User Profile Info */}
          {user && (
            <div className="d-flex align-items-center gap-2 text-white">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="navbar-user-avatar"
                />
              ) : (
                <div
                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}
                >
                  {getUserInitials()}
                </div>
              )}
              <span className="small fw-semibold text-white d-none d-md-inline user-name-truncated">
                {user.fullName || user.username}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Desktop Sidebar (>= 992px) */}
      <aside className="app-sidebar-desktop d-flex flex-column justify-content-between p-3" aria-label="Menu điều hướng máy tính">
        <div>
          {/* Sidebar Header Brand Logo */}
          <div className="px-2 py-3 mb-3 border-bottom">
            <Logo size={40} />
          </div>

          {/* Navigation Items */}
          <ul className="nav nav-pills flex-column gap-1 sidebar-nav-item">
            {navItems.map((item) => {
              const IconComp = item.icon;
              return (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <IconComp className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom Logout Button */}
        <div className="pt-3 border-top">
          <button
            type="button"
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-between px-3 py-2 text-start"
            onClick={handleLogout}
          >
            <div className="d-flex align-items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Offcanvas Drawer & Backdrop (< 992px) */}
      {isMobileOpen && (
        <>
          <div
            className="sidebar-backdrop"
            onClick={() => setIsMobileOpen(false)}
          />
          <div
            id="mobile-sidebar-offcanvas"
            className="mobile-offcanvas-drawer show p-3 d-flex flex-column justify-content-between"
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng di động"
          >
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                <Logo size={36} />
                <button
                  type="button"
                  className="btn-close text-reset"
                  aria-label="Đóng Menu"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ul className="nav nav-pills flex-column gap-1 sidebar-nav-item">
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <li key={item.path} className="nav-item">
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <IconComp className="w-5 h-5" />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="pt-3 border-top">
              <button
                type="button"
                className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-between px-3 py-2"
                onClick={handleLogout}
              >
                <div className="d-flex align-items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content Body */}
      <div className="main-content-offset flex-grow-1 px-3 px-md-4">
        <Outlet />
      </div>

      {/* Global Footer */}
      <footer className="main-content-offset py-3 px-4 text-center text-muted small border-top bg-white">
        © 2026 Quản Lý Chi Tiêu. Tất cả quyền được bảo lưu.
      </footer>
    </div>
  );
};

export default MainLayout;
