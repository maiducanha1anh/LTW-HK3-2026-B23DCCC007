import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchBudgets,
  fetchCurrentBudget,
  deleteBudget,
  clearBudgetMessages
} from '../features/budgets/budgetSlice';
import BudgetFormModal from '../components/budgets/BudgetFormModal';
import Loading from '../components/common/Loading';
import { formatCurrency, formatDate } from '../utils/format';
import { Budget } from '../types';

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'NORMAL':
      return <span className="badge bg-success px-3 py-2">Bình thường</span>;
    case 'WARNING':
      return <span className="badge bg-warning text-dark px-3 py-2">Cảnh báo (&gt;80%)</span>;
    case 'EXCEEDED':
      return <span className="badge bg-danger px-3 py-2">Vượt định mức</span>;
    default:
      return <span className="badge bg-secondary px-3 py-2">Chưa thiết lập</span>;
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

const BudgetsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, currentBudget, loading, deletingId, error, successMessage } =
    useAppSelector((state) => state.budgets);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  useEffect(() => {
    dispatch(fetchBudgets());
    dispatch(fetchCurrentBudget());
  }, [dispatch]);

  // Tự động clear successMessage sau 3 giây
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearBudgetMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleOpenAddModal = () => {
    dispatch(clearBudgetMessages());
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (budget: Budget) => {
    dispatch(clearBudgetMessages());
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, month: number, year: number) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa định mức Tháng ${month}/${year}?`)) {
      dispatch(clearBudgetMessages());
      await dispatch(deleteBudget(id));
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Quản Lý Định Mức Chi Tiêu</h2>
          <p className="text-muted mb-0">Thiết lập và theo dõi hạn mức chi tiêu theo tháng</p>
        </div>
        <button
          className="btn btn-primary px-3 py-2 fw-semibold"
          onClick={handleOpenAddModal}
        >
          ➕ Thiết lập định mức
        </button>
      </div>

      {/* Thông báo thành công */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => dispatch(clearBudgetMessages())}
          ></button>
        </div>
      )}

      {/* Thông báo lỗi trang (Fetch hoặc Delete) */}
      {error && !isModalOpen && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => dispatch(clearBudgetMessages())}
          ></button>
        </div>
      )}

      {/* Current Budget Summary Card */}
      {currentBudget && (
        <div className="card shadow-sm border-0 mb-4 bg-white rounded-3">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h5 className="fw-bold mb-0 text-primary">
                🎯 Định Mức Tháng Này ({currentBudget.month}/{currentBudget.year})
              </h5>
              {getStatusBadge(currentBudget.status)}
            </div>

            {currentBudget.status === 'NO_BUDGET' ? (
              <div className="py-2 text-center text-muted">
                <p className="mb-3">Bạn chưa thiết lập định mức cho tháng này.</p>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleOpenAddModal}
                >
                  Thiết lập ngay
                </button>
              </div>
            ) : (
              <div>
                <div className="row text-center mb-3 g-2">
                  <div className="col-6 col-md-3">
                    <div className="p-2 border rounded bg-light">
                      <div className="text-muted small">Hạn mức chi</div>
                      <div className="fw-bold text-dark fs-6">
                        {formatCurrency(currentBudget.budgetAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="p-2 border rounded bg-light">
                      <div className="text-muted small">Đã chi tiêu</div>
                      <div className="fw-bold text-primary fs-6">
                        {formatCurrency(currentBudget.spentAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="p-2 border rounded bg-light">
                      <div className="text-muted small">Còn lại</div>
                      <div className="fw-bold text-success fs-6">
                        {formatCurrency(currentBudget.remainingAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="p-2 border rounded bg-light">
                      <div className="text-muted small">Vượt mức</div>
                      <div className="fw-bold text-danger fs-6">
                        {formatCurrency(currentBudget.exceededAmount)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="d-flex justify-content-between align-items-center mb-1 small fw-semibold text-muted">
                  <span>Tỷ lệ sử dụng hạn mức</span>
                  <span>{currentBudget.usagePercent}%</span>
                </div>
                <div className="progress" style={{ height: '12px' }}>
                  <div
                    className={`progress-bar ${getProgressBarClass(currentBudget.status)}`}
                    role="progressbar"
                    style={{
                      width: `${Math.min(100, currentBudget.usagePercent)}%`
                    }}
                    aria-valuenow={currentBudget.usagePercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="card shadow-sm border-0 p-5 text-center my-4">
          <div className="display-4 mb-3">🎯</div>
          <h4 className="text-muted mb-2">Bạn chưa thiết lập định mức</h4>
          <p className="text-muted mb-4">
            Hãy cài đặt hạn mức chi tiêu theo tháng để quản lý tài chính hiệu quả hơn.
          </p>
          <div>
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              Thiết lập ngay
            </button>
          </div>
        </div>
      ) : (
        /* Budget Table */
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Tháng / Năm</th>
                  <th scope="col">Định Mức (VND)</th>
                  <th scope="col">Ngày Tạo</th>
                  <th scope="col" className="text-end">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((budget) => (
                  <tr key={budget._id}>
                    <td className="fw-bold text-dark">
                      Tháng {budget.month} / {budget.year}
                    </td>
                    <td className="fw-bold text-primary">
                      {formatCurrency(budget.amount)}
                    </td>
                    <td className="text-muted small">
                      {budget.createdAt ? formatDate(budget.createdAt) : '-'}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleOpenEditModal(budget)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(budget._id, budget.month, budget.year)}
                          disabled={deletingId === budget._id}
                        >
                          {deletingId === budget._id ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          ) : (
                            '🗑️ Xóa'
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form Thêm/Sửa */}
      <BudgetFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingBudget={editingBudget}
      />
    </div>
  );
};

export default BudgetsPage;
