import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchDashboard, clearReportError } from '../features/reports/reportSlice';
import Loading from '../components/common/Loading';
import { formatCurrency, formatDate } from '../utils/format';
import { Category } from '../types';

const getIconEmoji = (iconName?: string): string => {
  switch (iconName) {
    case 'utensils':
      return '🍽️';
    case 'shopping-bag':
      return '🛍️';
    case 'film':
      return '🎬';
    case 'car':
      return '🚗';
    case 'graduation-cap':
      return '🎓';
    case 'home':
      return '🏠';
    case 'plane':
      return '✈️';
    case 'hospital':
      return '🏥';
    default:
      return '🏷️';
  }
};

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'NORMAL':
      return <span className="badge bg-success px-3 py-2">Bình thường</span>;
    case 'WARNING':
      return <span className="badge bg-warning text-dark px-3 py-2">Cảnh báo (&gt;80%)</span>;
    case 'EXCEEDED':
      return <span className="badge bg-danger px-3 py-2">Vượt định mức</span>;
    default:
      return <span className="badge bg-secondary px-3 py-2">Chưa có định mức</span>;
  }
};

const getProgressBarClass = (status?: string) => {
  switch (status) {
    case 'NORMAL':
      return 'bg-success';
    case 'WARNING':
      return 'bg-warning';
    case 'EXCEEDED':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { dashboard, loading, error } = useAppSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(clearReportError());
    dispatch(fetchDashboard());
  };

  const renderCategoryInfo = (cat: string | Category) => {
    if (cat && typeof cat === 'object' && 'name' in cat) {
      return (
        <span className="d-inline-flex align-items-center gap-2">
          <span
            className="d-inline-block rounded-circle"
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: cat.color || '#6c757d'
            }}
          />
          <span>{getIconEmoji(cat.icon)}</span>
          <span className="fw-semibold small">{cat.name}</span>
        </span>
      );
    }
    return <span className="text-muted fst-italic small">Danh mục đã xóa</span>;
  };

  const todayStr = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return (
    <div>
      {/* Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">
            👋 Xin chào, {user?.fullName || user?.username || 'Người dùng'}
          </h2>
          <p className="text-muted mb-0">Tổng quan tình hình chi tiêu tài chính cá nhân</p>
        </div>
        <div className="bg-white border rounded-pill px-3 py-2 text-secondary small fw-semibold shadow-sm">
          📅 {todayStr}
        </div>
      </div>

      {/* Error Alert with Retry */}
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4" role="alert">
          <div>
            <strong>Lỗi tải dữ liệu: </strong> {error}
          </div>
          <button className="btn btn-outline-danger btn-sm fw-semibold" onClick={handleRetry}>
            🔄 Thử lại
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !dashboard ? (
        <Loading />
      ) : dashboard ? (
        <div>
          {/* 4 Stat Cards Row */}
          <div className="row g-3 mb-4">
            {/* Card 1: Tổng chi tháng này */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 rounded-3 h-100">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small fw-semibold">TỔNG CHI THÁNG NÀY</span>
                    <span className="fs-4">💸</span>
                  </div>
                  <h4 className="fw-bold text-danger mb-1">
                    {formatCurrency(dashboard.totalExpenseThisMonth)}
                  </h4>
                  <span className="text-muted small">
                    {dashboard.expenseCountThisMonth} khoản chi
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Chi hôm nay */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 rounded-3 h-100">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small fw-semibold">CHI HÔM NAY</span>
                    <span className="fs-4">📅</span>
                  </div>
                  <h4 className="fw-bold text-warning mb-1">
                    {formatCurrency(dashboard.totalExpenseToday)}
                  </h4>
                  <span className="text-muted small">Múi giờ máy chủ local</span>
                </div>
              </div>
            </div>

            {/* Card 3: Định mức tháng */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 rounded-3 h-100">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small fw-semibold">ĐỊNH MỨC THÁNG</span>
                    <span className="fs-4">🎯</span>
                  </div>
                  <h4 className="fw-bold text-primary mb-1">
                    {formatCurrency(dashboard.budgetAmount)}
                  </h4>
                  <span className="text-muted small">Tháng {dashboard.month}/{dashboard.year}</span>
                </div>
              </div>
            </div>

            {/* Card 4: Tỷ lệ sử dụng */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 rounded-3 h-100">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small fw-semibold">TỶ LỆ SỬ DỤNG</span>
                    <span className="fs-4">📊</span>
                  </div>
                  <h4 className="fw-bold text-dark mb-1">
                    {dashboard.usagePercent}%
                  </h4>
                  <div className="mt-1">{getStatusBadge(dashboard.status)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Budget Summary Card */}
          <div className="card shadow-sm border-0 mb-4 rounded-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h5 className="fw-bold mb-0 text-primary">
                  🎯 Tình Hình Định Mức Chi Tiêu (Tháng {dashboard.month}/{dashboard.year})
                </h5>
                {getStatusBadge(dashboard.status)}
              </div>

              {dashboard.status === 'NO_BUDGET' ? (
                <div className="py-3 text-center text-muted">
                  <p className="mb-0">Bạn chưa thiết lập định mức cho tháng này.</p>
                </div>
              ) : (
                <div>
                  <div className="row text-center mb-3 g-2">
                    <div className="col-6 col-md-3">
                      <div className="p-2 border rounded bg-light">
                        <div className="text-muted small">Hạn mức chi</div>
                        <div className="fw-bold text-dark fs-6">
                          {formatCurrency(dashboard.budgetAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="p-2 border rounded bg-light">
                        <div className="text-muted small">Đã chi tiêu</div>
                        <div className="fw-bold text-primary fs-6">
                          {formatCurrency(dashboard.totalExpenseThisMonth)}
                        </div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="p-2 border rounded bg-light">
                        <div className="text-muted small">Còn lại</div>
                        <div className="fw-bold text-success fs-6">
                          {formatCurrency(dashboard.remainingAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="p-2 border rounded bg-light">
                        <div className="text-muted small">Vượt mức</div>
                        <div className="fw-bold text-danger fs-6">
                          {formatCurrency(dashboard.exceededAmount)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-1 small fw-semibold text-muted">
                    <span>Tỷ lệ sử dụng hạn mức</span>
                    <span>{dashboard.usagePercent}%</span>
                  </div>
                  <div className="progress" style={{ height: '12px' }}>
                    <div
                      className={`progress-bar ${getProgressBarClass(dashboard.status)}`}
                      role="progressbar"
                      style={{
                        width: `${Math.min(100, Math.max(0, dashboard.usagePercent))}%`
                      }}
                      aria-valuenow={dashboard.usagePercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Split Row: Latest Expenses & Top Categories */}
          <div className="row g-4">
            {/* Left Column: 5 Khoản chi mới nhất */}
            <div className="col-12 col-lg-7">
              <div className="card shadow-sm border-0 rounded-3 h-100">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">🕒 5 Khoản Chi Mới Nhất</h5>
                </div>
                <div className="card-body p-4">
                  {dashboard.latestExpenses.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <div className="fs-3 mb-2">💸</div>
                      Chưa có khoản chi nào
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th scope="col" style={{ width: '25%' }}>
                              Ngày
                            </th>
                            <th scope="col" style={{ width: '30%' }}>
                              Danh mục
                            </th>
                            <th scope="col" style={{ width: '25%' }}>
                              Số tiền
                            </th>
                            <th scope="col" style={{ width: '20%' }}>
                              Ghi chú
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.latestExpenses.map((expense) => (
                            <tr key={expense._id}>
                              <td className="text-muted small">
                                {formatDate(expense.expenseDate)}
                              </td>
                              <td>{renderCategoryInfo(expense.categoryId)}</td>
                              <td className="fw-bold text-danger">
                                {formatCurrency(expense.amount)}
                              </td>
                              <td className="text-muted small text-truncate" style={{ maxWidth: '120px' }}>
                                {expense.note || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: 5 Danh mục chi nhiều nhất */}
            <div className="col-12 col-lg-5">
              <div className="card shadow-sm border-0 rounded-3 h-100">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold mb-0">🏷️ Top Danh Mục Chi Nhiều Nhất</h5>
                </div>
                <div className="card-body p-4">
                  {dashboard.topCategories.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <div className="fs-3 mb-2">🏷️</div>
                      Chưa có dữ liệu danh mục
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {dashboard.topCategories.map((cat) => {
                        const pct = Number.isFinite(cat.percentage)
                          ? Math.max(0, cat.percentage)
                          : 0;
                        return (
                          <div key={cat.categoryId}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-semibold small d-flex align-items-center gap-2">
                                <span>{getIconEmoji(cat.icon)}</span>
                                <span>{cat.categoryName}</span>
                              </span>
                              <span className="fw-bold small text-danger">
                                {formatCurrency(cat.totalAmount)}{' '}
                                <span className="text-muted fw-normal">({pct}%)</span>
                              </span>
                            </div>
                            <div className="progress" style={{ height: '8px' }}>
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                  width: `${Math.min(100, pct)}%`,
                                  backgroundColor: cat.color || '#6c757d'
                                }}
                                aria-valuenow={pct}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="card shadow-sm border-0 p-5 text-center my-4">
          <div className="display-4 mb-3">📊</div>
          <h4 className="text-muted mb-2">Chưa có dữ liệu chi tiêu</h4>
          <p className="text-muted mb-0">Hãy bắt đầu thêm các khoản chi để xem báo cáo thống kê.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
