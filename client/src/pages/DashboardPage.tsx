import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Calendar,
  Target,
  PieChart as PieIcon,
  TrendingUp,
  History,
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchDashboard, clearReportError } from '../features/reports/reportSlice';
import { SkeletonCard, SkeletonTable, SkeletonList } from '../components/common/Skeleton';
import { renderCategoryIcon } from '../utils/categoryIcon';
import { formatCurrency, formatDate } from '../utils/format';
import { Category } from '../types';

const getStatusBadgeClass = (status?: string) => {
  switch (status) {
    case 'NORMAL':
      return 'badge-status-normal px-3 py-2 rounded-pill';
    case 'WARNING':
      return 'badge-status-warning px-3 py-2 rounded-pill';
    case 'EXCEEDED':
      return 'badge-status-danger px-3 py-2 rounded-pill';
    default:
      return 'badge bg-secondary px-3 py-2 rounded-pill';
  }
};

const getStatusLabel = (status?: string) => {
  switch (status) {
    case 'NORMAL':
      return 'Bình thường';
    case 'WARNING':
      return 'Cảnh báo (>80%)';
    case 'EXCEEDED':
      return 'Vượt định mức';
    default:
      return 'Chưa có định mức';
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
              backgroundColor: cat.color || '#16a34a'
            }}
          />
          <span className="text-secondary">{renderCategoryIcon(cat.icon, 'w-4 h-4')}</span>
          <span className="fw-bold small text-dark">{cat.name}</span>
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
      {/* Header Greeting Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
            <span>Xin chào, {user?.fullName || user?.username || 'Người dùng'}!</span>
          </h2>
          <p className="text-muted mb-0 small" style={{ fontSize: '0.92rem' }}>
            Tổng quan tình hình chi tiêu tài chính cá nhân
          </p>
        </div>
        <div className="bg-white border rounded-pill px-3 py-2 text-secondary small fw-semibold shadow-sm d-flex align-items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Error Alert with Retry */}
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4 rounded-3" role="alert">
          <div>
            <strong>Lỗi tải dữ liệu: </strong> {error}
          </div>
          <button className="btn btn-outline-danger btn-sm fw-semibold" onClick={handleRetry}>
            <RefreshCw className="w-4 h-4 me-1" /> Thử lại
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && !dashboard ? (
        <div>
          <div className="row g-3 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="col-12 col-sm-6 col-lg-3">
                <SkeletonCard />
              </div>
            ))}
          </div>

          <div className="mb-4">
            <SkeletonCard />
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-7">
              <SkeletonTable rows={5} cols={4} />
            </div>
            <div className="col-12 col-lg-5">
              <SkeletonList count={4} />
            </div>
          </div>
        </div>
      ) : dashboard ? (
        <div>
          {/* 4 Stat Cards Row */}
          <div className="row g-3 mb-4">
            {/* Card 1: Tổng chi tháng này */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 rounded-4 h-100 card-hover-effect">
                <div className="card-body p-4 d-flex align-items-center gap-3">
                  <div className="stat-icon-circle bg-success bg-opacity-10 text-success">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-muted small fw-bold text-uppercase d-block" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      TỔNG CHI THÁNG NÀY
                    </span>
                    <h4 className="fw-bold text-danger mb-1 mt-1">
                      {formatCurrency(dashboard.totalExpenseThisMonth)}
                    </h4>
                    <span className="text-muted small">
                      {dashboard.expenseCountThisMonth} khoản chi
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Chi hôm nay */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 rounded-4 h-100 card-hover-effect">
                <div className="card-body p-4 d-flex align-items-center gap-3">
                  <div className="stat-icon-circle bg-warning bg-opacity-10 text-warning">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-muted small fw-bold text-uppercase d-block" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      CHI HÔM NAY
                    </span>
                    <h4 className="fw-bold text-warning mb-1 mt-1">
                      {formatCurrency(dashboard.totalExpenseToday)}
                    </h4>
                    <span className="text-muted small">Múi giờ máy chủ local</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Định mức tháng */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 rounded-4 h-100 card-hover-effect">
                <div className="card-body p-4 d-flex align-items-center gap-3">
                  <div className="stat-icon-circle bg-primary bg-opacity-10 text-primary">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-muted small fw-bold text-uppercase d-block" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      ĐỊNH MỨC THÁNG
                    </span>
                    <h4 className="fw-bold text-primary mb-1 mt-1">
                      {formatCurrency(dashboard.budgetAmount)}
                    </h4>
                    <span className="text-muted small">Tháng {dashboard.month}/{dashboard.year}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Tỷ lệ sử dụng */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="card shadow-sm border-0 rounded-4 h-100 card-hover-effect">
                <div className="card-body p-4 d-flex align-items-center gap-3">
                  <div className="stat-icon-circle bg-purple bg-opacity-10 text-purple" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                    <PieIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-muted small fw-bold text-uppercase d-block" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                      TỶ LỆ SỬ DỤNG
                    </span>
                    <h4 className="fw-bold text-dark mb-1 mt-1">
                      {dashboard.usagePercent}%
                    </h4>
                    <div className="mt-1">
                      <span className={getStatusBadgeClass(dashboard.status)}>
                        {getStatusLabel(dashboard.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Budget Status Card */}
          <div className="card shadow-sm border-0 mb-4 rounded-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h5 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Tình Hình Định Mức Chi Tiêu (Tháng {dashboard.month}/{dashboard.year})</span>
                </h5>
                <span className={getStatusBadgeClass(dashboard.status)}>
                  {getStatusLabel(dashboard.status)}
                </span>
              </div>

              {dashboard.status === 'NO_BUDGET' ? (
                <div className="py-3 text-center text-muted">
                  <p className="mb-0">Bạn chưa thiết lập định mức cho tháng này.</p>
                </div>
              ) : (
                <div>
                  <div className="row text-center mb-3 g-2">
                    <div className="col-6 col-md-3">
                      <div className="p-3 border rounded-3 bg-light">
                        <div className="text-muted small">Hạn mức chi</div>
                        <div className="fw-bold text-dark fs-6 mt-1">
                          {formatCurrency(dashboard.budgetAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="p-3 border rounded-3 bg-light">
                        <div className="text-muted small">Đã chi tiêu</div>
                        <div className="fw-bold text-primary fs-6 mt-1">
                          {formatCurrency(dashboard.totalExpenseThisMonth)}
                        </div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="p-3 border rounded-3 bg-light">
                        <div className="text-muted small">Còn lại</div>
                        <div className="fw-bold text-success fs-6 mt-1">
                          {formatCurrency(dashboard.remainingAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="col-6 col-md-3">
                      <div className="p-3 border rounded-3 bg-light">
                        <div className="text-muted small">Vượt mức</div>
                        <div className="fw-bold text-danger fs-6 mt-1">
                          {formatCurrency(dashboard.exceededAmount)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-1 small fw-semibold text-muted">
                    <span>Tỷ lệ sử dụng hạn mức</span>
                    <span>{dashboard.usagePercent}%</span>
                  </div>
                  <div className="progress rounded-pill" style={{ height: '10px' }}>
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
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    <History className="w-5 h-5 text-secondary" />
                    <span>5 Khoản Chi Mới Nhất</span>
                  </h5>
                </div>
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  {dashboard.latestExpenses.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <Wallet className="w-8 h-8 mb-2 opacity-50" />
                      <div>Chưa có khoản chi nào</div>
                    </div>
                  ) : (
                    <div className="table-responsive mb-3">
                      <table className="table table-hover align-middle mb-0">
                        <thead>
                          <tr>
                            <th scope="col" style={{ width: '22%' }}>NGÀY</th>
                            <th scope="col" style={{ width: '32%' }}>DANH MỤC</th>
                            <th scope="col" style={{ width: '26%' }}>SỐ TIỀN</th>
                            <th scope="col" style={{ width: '20%' }}>GHI CHÚ</th>
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

                  {/* Footer Action Link */}
                  <Link
                    to="/expenses"
                    className="btn btn-light w-100 fw-semibold text-success d-flex align-items-center justify-content-center gap-2 py-2 mt-auto rounded-3"
                  >
                    <span>Xem tất cả khoản chi</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Top Danh mục chi nhiều nhất */}
            <div className="col-12 col-lg-5">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                    <PieIcon className="w-5 h-5 text-secondary" />
                    <span>Top Danh Mục Chi Nhiều Nhất</span>
                  </h5>
                </div>
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  {dashboard.topCategories.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                      <Sparkles className="w-8 h-8 mb-2 opacity-50" />
                      <div>Chưa có dữ liệu danh mục</div>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3 mb-3">
                      {dashboard.topCategories.map((cat) => {
                        const pct = Number.isFinite(cat.percentage)
                          ? Math.max(0, cat.percentage)
                          : 0;
                        return (
                          <div key={cat.categoryId}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-semibold small d-flex align-items-center gap-2">
                                <span className="text-secondary">{renderCategoryIcon(cat.icon, 'w-4 h-4')}</span>
                                <span className="fw-bold text-dark">{cat.categoryName}</span>
                              </span>
                              <span className="fw-bold small text-danger">
                                {formatCurrency(cat.totalAmount)}{' '}
                                <span className="text-muted fw-normal">({pct}%)</span>
                              </span>
                            </div>
                            <div className="progress rounded-pill" style={{ height: '8px' }}>
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                  width: `${Math.min(100, pct)}%`,
                                  backgroundColor: cat.color || '#16a34a'
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

                  {/* Footer Action Link */}
                  <Link
                    to="/reports"
                    className="btn btn-light w-100 fw-semibold text-success d-flex align-items-center justify-content-center gap-2 py-2 mt-auto rounded-3"
                  >
                    <span>Xem chi tiết báo cáo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="card shadow-sm border-0 p-5 text-center my-4 rounded-4">
          <PieIcon className="w-12 h-12 text-muted mb-3 mx-auto" />
          <h4 className="text-muted mb-2">Chưa có dữ liệu chi tiêu</h4>
          <p className="text-muted mb-0">Hãy bắt đầu thêm các khoản chi để xem báo cáo thống kê.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
