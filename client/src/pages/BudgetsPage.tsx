import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Target } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchBudgets,
  fetchCurrentBudget,
  deleteBudget,
  clearBudgetMessages
} from '../features/budgets/budgetSlice';
import BudgetFormModal from '../components/budgets/BudgetFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { SkeletonCard, SkeletonTable } from '../components/common/Skeleton';
import { formatCurrency, formatDate } from '../utils/format';
import { Budget } from '../types';

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

const BudgetsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, currentBudget, loading, deletingId, error, successMessage } =
    useAppSelector((state) => state.budgets);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // State cho ConfirmDialog
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    id: string;
    month: number;
    year: number;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchBudgets());
    dispatch(fetchCurrentBudget());
  }, [dispatch]);

  // Hiển thị Toast khi có successMessage
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearBudgetMessages());
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

  const promptDeleteBudget = (id: string, month: number, year: number) => {
    dispatch(clearBudgetMessages());
    setDeleteConfirmTarget({ id, month, year });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    const { id } = deleteConfirmTarget;
    await dispatch(deleteBudget(id));
    setDeleteConfirmTarget(null);
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Quản Lý Định Mức Chi Tiêu</h2>
          <p className="text-muted mb-0 small">Thiết lập và theo dõi hạn mức chi tiêu theo tháng</p>
        </div>
        <button
          className="btn btn-primary px-3 py-2 fw-semibold"
          onClick={handleOpenAddModal}
        >
          <Plus className="w-4 h-4" />
          <span>Thiết lập định mức</span>
        </button>
      </div>

      {/* Thông báo lỗi trang */}
      {error && !isModalOpen && (
        <div className="alert alert-danger alert-dismissible fade show mb-4 rounded-3" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => dispatch(clearBudgetMessages())}
          ></button>
        </div>
      )}

      {/* Current Budget Summary Card */}
      {loading && !currentBudget ? (
        <div className="mb-4">
          <SkeletonCard />
        </div>
      ) : currentBudget ? (
        <div className="card shadow-sm border-0 mb-4 bg-white rounded-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h5 className="fw-bold mb-0 text-primary d-flex align-items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Định Mức Tháng Này ({currentBudget.month}/{currentBudget.year})</span>
              </h5>
              {getStatusBadge(currentBudget.status)}
            </div>

            {currentBudget.status === 'NO_BUDGET' ? (
              <div className="py-3 text-center text-muted">
                <p className="mb-3">Bạn chưa thiết lập định mức cho tháng này.</p>
                <button
                  className="btn btn-outline-primary btn-sm fw-semibold"
                  onClick={handleOpenAddModal}
                >
                  <Plus className="w-4 h-4" />
                  <span>Thiết lập ngay</span>
                </button>
              </div>
            ) : (
              <div>
                <div className="row text-center mb-3 g-2">
                  <div className="col-6 col-md-3">
                    <div className="p-3 border rounded-3 bg-light">
                      <div className="text-muted small">Hạn mức chi</div>
                      <div className="fw-bold text-dark fs-6 mt-1">
                        {formatCurrency(currentBudget.budgetAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="p-3 border rounded-3 bg-light">
                      <div className="text-muted small">Đã chi tiêu</div>
                      <div className="fw-bold text-primary fs-6 mt-1">
                        {formatCurrency(currentBudget.spentAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="p-3 border rounded-3 bg-light">
                      <div className="text-muted small">Còn lại</div>
                      <div className="fw-bold text-success fs-6 mt-1">
                        {formatCurrency(currentBudget.remainingAmount)}
                      </div>
                    </div>
                  </div>

                  <div className="col-6 col-md-3">
                    <div className="p-3 border rounded-3 bg-light">
                      <div className="text-muted small">Vượt mức</div>
                      <div className="fw-bold text-danger fs-6 mt-1">
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
                <div className="progress rounded-pill" style={{ height: '10px' }}>
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
      ) : null}

      {/* Main Content Area */}
      {loading && items.length === 0 ? (
        <SkeletonTable rows={4} cols={4} />
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="card shadow-sm border-0 p-5 text-center my-4 rounded-4">
          <Target className="w-12 h-12 text-muted mb-3 mx-auto" />
          <h4 className="text-muted mb-2">Bạn chưa thiết lập định mức</h4>
          <p className="text-muted mb-4 small">
            Hãy cài đặt hạn mức chi tiêu theo tháng để quản lý tài chính hiệu quả hơn.
          </p>
          <div>
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <Plus className="w-4 h-4" />
              <span>Thiết lập ngay</span>
            </button>
          </div>
        </div>
      ) : (
        /* Budget Table */
        <div className="card shadow-sm border-0 rounded-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">THÁNG / NĂM</th>
                  <th scope="col">ĐỊNH MỨC (VND)</th>
                  <th scope="col">NGÀY TẠO</th>
                  <th scope="col" className="text-end">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {items.map((budget) => (
                  <tr key={budget._id}>
                    <td className="fw-bold text-dark table-nowrap-cell">
                      Tháng {budget.month} / {budget.year}
                    </td>
                    <td className="fw-bold text-primary table-nowrap-cell">
                      {formatCurrency(budget.amount)}
                    </td>
                    <td className="text-muted small table-nowrap-cell">
                      {budget.createdAt ? formatDate(budget.createdAt) : '-'}
                    </td>
                    <td className="text-end table-nowrap-cell">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleOpenEditModal(budget)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => promptDeleteBudget(budget._id, budget.month, budget.year)}
                          disabled={deletingId === budget._id}
                        >
                          {deletingId === budget._id ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          ) : (
                            <>
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa</span>
                            </>
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

      {/* Confirm Dialog Xóa Budget */}
      <ConfirmDialog
        show={!!deleteConfirmTarget}
        title="Xác Nhận Xóa Định Mức"
        message={`Bạn có chắc chắn muốn xóa định mức Tháng ${deleteConfirmTarget?.month || ''}/${deleteConfirmTarget?.year || ''} không?`}
        confirmText="Xóa Định Mức"
        cancelText="Hủy"
        variant="danger"
        loading={!!deletingId}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmTarget(null)}
      />
    </div>
  );
};

export default BudgetsPage;
