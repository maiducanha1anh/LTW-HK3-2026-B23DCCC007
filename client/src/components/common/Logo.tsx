import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const LogoSvg: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="48" height="48" rx="14" fill="url(#logo_grad)" />
    {/* Wallet outline */}
    <path
      d="M12 16C12 14.8954 12.8954 14 14 14H32C33.1046 14 34 14.8954 34 16V32C34 33.1046 33.1046 34 32 34H14C12.8954 34 12 33.1046 12 32V16Z"
      fill="#FFFFFF"
      fillOpacity="0.9"
    />
    <path
      d="M28 21C28 19.8954 28.8954 19 30 19H36V27H30C28.8954 27 28 26.1046 28 25V21Z"
      fill="#22C55E"
    />
    <circle cx="31.5" cy="23" r="1.5" fill="#FFFFFF" />
    {/* Growth chart bars inside wallet */}
    <rect x="16" y="24" width="3" height="6" rx="1" fill="#2563EB" />
    <rect x="20" y="21" width="3" height="9" rx="1" fill="#2563EB" />
    <rect x="24" y="18" width="3" height="12" rx="1" fill="#16A34A" />
    {/* Growth trend line */}
    <path
      d="M15 25L20 21L24 18L30 14"
      stroke="#10B981"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="logo_grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#16A34A" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
    </defs>
  </svg>
);

const Logo: React.FC<LogoProps> = ({ size = 38, className = '' }) => {
  return (
    <div className={`d-flex align-items-center gap-3 ${className}`}>
      <LogoSvg size={size} />
      <div className="d-flex flex-column">
        <span className="fw-bold text-dark fs-6 lh-sm" style={{ letterSpacing: '-0.2px' }}>
          Quản Lý Chi Tiêu
        </span>
        <span className="text-muted small" style={{ fontSize: '0.72rem', fontWeight: 400 }}>
          Kiểm soát tài chính cá nhân
        </span>
      </div>
    </div>
  );
};

export default Logo;
