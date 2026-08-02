import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  Calendar,
  RefreshCw,
  Tags,
  CalendarRange
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchMonthSummary,
  fetchCategorySummary,
  fetchYearSummary
} from '../features/reports/reportSlice';
import {
  SkeletonCard,
  SkeletonChart,
  SkeletonTable
} from '../components/common/Skeleton';
import { renderCategoryIcon } from '../utils/categoryIcon';
import { formatCurrency } from '../utils/format';

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'NORMAL':
      return <span className="badge-status-normal px-3 py-2 rounded-pill">Bình thường</span>;
    case 'WARNING':
      return <span className="badge-status-warning px-3 py-2 rounded-pill">Cảnh báo (&gt;80%)</span>;
    case 'EXCEEDED':
      return <span className="badge-status-danger px-3 py-2 rounded-pill">Vượt định mức</span>;
    default:
      return <span className="badge bg-secondary px-3 py-2 rounded-pill">Chưa thiết lập</span>;
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

const ReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentDate = new Date();

  // State bộ lọc riêng cho Thống kê Tháng và Báo cáo Năm
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedYearReport, setSelectedYearReport] = useState(currentDate.getFullYear());

  // Lấy data & status từ Redux Store
  const {
    monthSummary,
    categorySummary,
    yearSummary,
    loadingMonth,
    loadingCategory,
    loadingYear,
    errorMonth,
    errorCategory,
    errorYear
  } = useAppSelector((state) => state.reports);

  // Gửi API Báo cáo Tháng (Month Summary + Category Summary) khi selectedMonth hoặc selectedYear thay đổi
  useEffect(() => {
    dispatch(fetchMonthSummary({ month: selectedMonth, year: selectedYear }));
    dispatch(fetchCategorySummary({ month: selectedMonth, year: selectedYear }));
  }, [dispatch, selectedMonth, selectedYear]);

  // Gửi API Báo cáo Năm (Year Summary) khi selectedYearReport thay đổi
  useEffect(() => {
    dispatch(fetchYearSummary({ year: selectedYearReport }));
  }, [dispatch, selectedYearReport]);

  const yearOptions = Array.from({ length: 11 }, (_, i) => currentDate.getFullYear() - 5 + i);

  // Tính toán 4 Card Tổng kết Năm phía Frontend
  const totalYearBudget = yearSummary.reduce((acc, curr) => acc + (curr.budgetAmount || 0), 0);
  const totalYearSpent = yearSummary.reduce((acc, curr) => acc + (curr.spentAmount || 0), 0);
  const totalYearExceeded = yearSummary.reduce((acc, curr) => acc + (curr.exceededAmount || 0), 0);

  const getHighestSpendingMonthText = () => {
    if (yearSummary.length === 0) return 'Chưa có dữ liệu';
    let maxItem = yearSummary[0];
    for (let i = 1; i < yearSummary.length; i++) {
      if ((yearSummary[i].spentAmount || 0) > (maxItem.spentAmount || 0)) {
        maxItem = yearSummary[i];
      }
    }
    if (!maxItem || maxItem.spentAmount === 0) {
      return 'Chưa có dữ liệu';
    }
    return `Tháng ${maxItem.month} (${formatCurrency(maxItem.spentAmount)})`;
  };

  // Custom Recharts Donut Tooltip
  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = Number.isFinite(data.percentage) ? data.percentage : 0;
      return (
        <div className="bg-dark text-white p-2 rounded-3 shadow-sm small border-0">
          <div className="fw-bold d-flex align-items-center gap-1 mb-1">
            <span className="text-secondary">{renderCategoryIcon(data.icon, 'w-4 h-4')}</span>
            <span>{data.categoryName}</span>
          </div>
          <div>Tổng tiền: {formatCurrency(data.totalAmount)}</div>
          <div>Tỷ lệ: {pct}%</div>
        </div>
      );
    }
    return null;
  };

  // Custom Recharts Bar Tooltip
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark text-white p-2 rounded-3 shadow-sm small border-0">
          <div className="fw-bold mb-1">{label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ color: entry.fill }}>
              {entry.name}: {formatCurrency(entry.value)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary" />
          <span>Báo Cáo & Thống Kê</span>
        </h2>
        <p className="text-muted mb-0 small">
          Phân tích tình hình chi tiêu theo danh mục và tổng quan 12 tháng trong năm
        </p>
      </div>

      {/* ========================================================================= */}
      {/* KHU VỰC A: BÁO CÁO THEO THÁNG */}
      {/* ========================================================================= */}
      <div className="card shadow-sm border-0 mb-5 rounded-4">
        <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h4 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span>Báo Cáo Chi Tiêu Theo Tháng</span>
            </h4>

            {/* Selector Month & Year */}
            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>

              <select
                className="form-select form-select-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card-body p-4">
          {/* Error Month Alert */}
          {errorMonth && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4 rounded-3" role="alert">
              <div><strong>Lỗi tải báo cáo tháng:</strong> {errorMonth}</div>
              <button
                className="btn btn-outline-danger btn-sm fw-semibold"
                onClick={() =>
                  dispatch(fetchMonthSummary({ month: selectedMonth, year: selectedYear }))
                }
              >
                <RefreshCw className="w-4 h-4 me-1" /> Thử lại
              </button>
            </div>
          )}

          {/* Month Summary Content */}
          {loadingMonth && !monthSummary ? (
            <div className="row g-3 mb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="col-12 col-sm-6 col-lg-3">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          ) : monthSummary ? (
            <div>
              {/* 4 Stat Cards Month */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="p-3 border rounded-3 bg-light h-100">
                    <div className="text-muted small fw-bold">TỔNG CHI THÁNG</div>
                    <h4 className="fw-bold text-danger mb-0 mt-1">
                      {formatCurrency(monthSummary.totalExpense)}
                    </h4>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="p-3 border rounded-3 bg-light h-100">
                    <div className="text-muted small fw-bold">SỐ KHOẢN CHI</div>
                    <h4 className="fw-bold text-dark mb-0 mt-1">
                      {monthSummary.expenseCount} khoản
                    </h4>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="p-3 border rounded-3 bg-light h-100">
                    <div className="text-muted small fw-bold">ĐỊNH MỨC CHI</div>
                    <h4 className="fw-bold text-primary mb-0 mt-1">
                      {formatCurrency(monthSummary.budgetAmount)}
                    </h4>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="p-3 border rounded-3 bg-light h-100">
                    <div className="text-muted small fw-bold">
                      {monthSummary.status === 'EXCEEDED' ? 'VƯỢT MỨC' : 'CÒN LẠI'}
                    </div>
                    <h4
                      className={`fw-bold mb-0 mt-1 ${
                        monthSummary.status === 'EXCEEDED' ? 'text-danger' : 'text-success'
                      }`}
                    >
                      {monthSummary.status === 'EXCEEDED'
                        ? formatCurrency(monthSummary.exceededAmount)
                        : monthSummary.status === 'NO_BUDGET'
                        ? 'Chưa thiết lập'
                        : formatCurrency(monthSummary.remainingAmount)}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Status */}
              <div className="p-3 border rounded-3 mb-4 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                  <span className="fw-semibold text-secondary">
                    Tình hình sử dụng định mức Tháng {monthSummary.month}/{monthSummary.year}
                  </span>
                  {getStatusBadge(monthSummary.status)}
                </div>

                {monthSummary.status === 'NO_BUDGET' ? (
                  <div className="small text-muted fst-italic">
                    Chưa thiết lập định mức cho tháng này.
                  </div>
                ) : (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-1 small fw-semibold text-muted">
                      <span>Tỷ lệ đã sử dụng</span>
                      <span>{monthSummary.usagePercent}%</span>
                    </div>
                    <div className="progress rounded-pill" style={{ height: '10px' }}>
                      <div
                        className={`progress-bar ${getProgressBarClass(monthSummary.status)}`}
                        role="progressbar"
                        style={{
                          width: `${Math.min(100, Math.max(0, monthSummary.usagePercent))}%`
                        }}
                        aria-valuenow={monthSummary.usagePercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Category Summary Section (Recharts Donut + Table) */}
          <div className="mt-4 pt-3 border-top">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-dark">
              <Tags className="w-5 h-5 text-secondary" />
              <span>Chi Tiêu Theo Danh Mục</span>
            </h5>

            {errorCategory && (
              <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4 rounded-3" role="alert">
                <div><strong>Lỗi tải danh mục:</strong> {errorCategory}</div>
                <button
                  className="btn btn-outline-danger btn-sm fw-semibold"
                  onClick={() =>
                    dispatch(
                      fetchCategorySummary({ month: selectedMonth, year: selectedYear })
                    )
                  }
                >
                  <RefreshCw className="w-4 h-4 me-1" /> Thử lại
                </button>
              </div>
            )}

            {loadingCategory ? (
              <div className="row g-4">
                <div className="col-12 col-md-6">
                  <SkeletonChart height="300px" />
                </div>
                <div className="col-12 col-md-6">
                  <SkeletonTable rows={4} cols={4} />
                </div>
              </div>
            ) : categorySummary.length === 0 ? (
              <div className="text-center py-4 text-muted bg-light rounded-4">
                <PieIcon className="w-10 h-10 mb-2 opacity-50 mx-auto" />
                <div>Chưa có dữ liệu chi tiêu theo danh mục cho Tháng {selectedMonth}/{selectedYear}</div>
              </div>
            ) : (
              <div className="row g-4 align-items-center">
                {/* Recharts Donut Chart */}
                <div className="col-12 col-md-6">
                  <div className="chart-container-wrapper" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categorySummary}
                          dataKey="totalAmount"
                          nameKey="categoryName"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={3}
                        >
                          {categorySummary.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color || '#64748b'}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomCategoryTooltip />} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Table */}
                <div className="col-12 col-md-6">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th scope="col">DANH MỤC</th>
                          <th scope="col" className="text-center">SỐ KHOẢN</th>
                          <th scope="col" className="text-end">TỔNG TIỀN</th>
                          <th scope="col" className="text-end">TỶ LỆ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categorySummary.map((item) => (
                          <tr key={item.categoryId || item.categoryName}>
                            <td>
                              <span className="d-inline-flex align-items-center gap-2">
                                <span
                                  className="d-inline-block rounded-circle"
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: item.color || '#64748b'
                                  }}
                                />
                                <span className="text-secondary">{renderCategoryIcon(item.icon, 'w-4 h-4')}</span>
                                <span className="fw-semibold text-dark">{item.categoryName}</span>
                              </span>
                            </td>
                            <td className="text-center table-nowrap-cell">{item.expenseCount}</td>
                            <td className="text-end fw-bold text-danger table-nowrap-cell">
                              {formatCurrency(item.totalAmount)}
                            </td>
                            <td className="text-end fw-semibold text-secondary table-nowrap-cell">
                              {Number.isFinite(item.percentage) ? item.percentage : 0}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KHU VỰC B: BÁO CÁO 12 THÁNG THEO NĂM */}
      {/* ========================================================================= */}
      <div className="card shadow-sm border-0 mb-4 rounded-4">
        <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h4 className="fw-bold mb-0 text-success d-flex align-items-center gap-2">
              <CalendarRange className="w-5 h-5 text-success" />
              <span>Báo Cáo 12 Tháng Theo Năm</span>
            </h4>

            {/* Selector Year Report */}
            <div className="d-flex align-items-center gap-2">
              <label className="form-label mb-0 small fw-semibold text-muted">Chọn năm:</label>
              <select
                className="form-select form-select-sm"
                style={{ width: '110px' }}
                value={selectedYearReport}
                onChange={(e) => setSelectedYearReport(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card-body p-4">
          {/* Error Year Alert */}
          {errorYear && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4 rounded-3" role="alert">
              <div><strong>Lỗi tải báo cáo năm:</strong> {errorYear}</div>
              <button
                className="btn btn-outline-danger btn-sm fw-semibold"
                onClick={() => dispatch(fetchYearSummary({ year: selectedYearReport }))}
              >
                <RefreshCw className="w-4 h-4 me-1" /> Thử lại
              </button>
            </div>
          )}

          {loadingYear && yearSummary.length === 0 ? (
            <div>
              <div className="row g-3 mb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="col-12 col-sm-6 col-lg-3">
                    <SkeletonCard />
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <SkeletonChart height="320px" />
              </div>
              <SkeletonTable rows={12} cols={7} />
            </div>
          ) : (
            <div>
              {/* 4 Stat Cards Year Summary */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="p-3 border rounded-3 bg-light h-100">
                    <div className="text-muted small fw-bold">TỔNG ĐỊNH MỨC NĂM</div>
                    <h5 className="fw-bold text-primary mb-0 mt-1">
                      {formatCurrency(totalYearBudget)}
                    </h5>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="p-3 border rounded-3 bg-light h-100">
                    <div className="text-muted small fw-bold">TỔNG ĐÃ CHI NĂM</div>
                    <h5 className="fw-bold text-danger mb-0 mt-1">
                      {formatCurrency(totalYearSpent)}
                    </h5>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="p-3 border rounded-3 bg-light h-100">
                    <div className="text-muted small fw-bold">TỔNG VƯỢT MỨC NĂM</div>
                    <h5 className="fw-bold text-warning mb-0 mt-1">
                      {formatCurrency(totalYearExceeded)}
                    </h5>
                  </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="p-3 border rounded-3 bg-light h-100">
                    <div className="text-muted small fw-bold">THÁNG CHI CAO NHẤT</div>
                    <h5 className="fw-bold text-dark mb-0 mt-1 text-truncate" title={getHighestSpendingMonthText()}>
                      {getHighestSpendingMonthText()}
                    </h5>
                  </div>
                </div>
              </div>

              {/* Recharts Bar Chart (12 Months) */}
              <div className="mb-4 pt-2">
                <h5 className="fw-bold mb-3 text-dark">Biểu Đồ So Sánh Định Mức & Thực Chi 12 Tháng</h5>
                <div className="chart-container-wrapper" style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={yearSummary.map((item) => ({
                        monthName: `Tháng ${item.month}`,
                        budgetAmount: item.budgetAmount || 0,
                        spentAmount: item.spentAmount || 0
                      }))}
                      margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="monthName" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <RechartsTooltip content={<CustomBarTooltip />} />
                      <Legend verticalAlign="top" height={36} />
                      <Bar dataKey="budgetAmount" name="Hạn mức" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="spentAmount" name="Đã chi" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 12 Months Table */}
              <div className="pt-3 border-top">
                <h5 className="fw-bold mb-3 text-dark">Bảng Chi Tiết 12 Tháng Năm {selectedYearReport}</h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th scope="col">THÁNG</th>
                        <th scope="col">ĐỊNH MỨC</th>
                        <th scope="col">ĐÃ CHI</th>
                        <th scope="col">CÒN LẠI</th>
                        <th scope="col">VƯỢT MỨC</th>
                        <th scope="col">TỶ LỆ</th>
                        <th scope="col" className="text-center">TRẠNG THÁI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearSummary.map((row) => (
                        <tr key={row.month}>
                          <td className="fw-bold table-nowrap-cell">Tháng {row.month}</td>
                          <td className="fw-semibold text-primary table-nowrap-cell">
                            {formatCurrency(row.budgetAmount)}
                          </td>
                          <td className="fw-bold text-danger table-nowrap-cell">
                            {formatCurrency(row.spentAmount)}
                          </td>
                          <td className="text-success table-nowrap-cell">
                            {row.status === 'NO_BUDGET'
                              ? '-'
                              : formatCurrency(row.remainingAmount)}
                          </td>
                          <td className="text-danger table-nowrap-cell">
                            {row.status === 'NO_BUDGET'
                              ? '-'
                              : formatCurrency(row.exceededAmount)}
                          </td>
                          <td className="fw-semibold table-nowrap-cell">
                            {row.status === 'NO_BUDGET' ? '-' : `${row.usagePercent}%`}
                          </td>
                          <td className="text-center table-nowrap-cell">{getStatusBadge(row.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
