import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  AlertTriangle,
  Wallet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchCategories } from '../features/categories/categorySlice';
import {
  fetchExpenses,
  deleteExpenseThunk,
  setKeyword,
  setCategoryFilter,
  setMonth,
  setYear,
  setSortBy,
  setSortOrder,
  setPage,
  resetFilters,
  clearExpenseMessages
} from '../features/expenses/expenseSlice';
import ExpenseFormModal from '../components/expenses/ExpenseFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { SkeletonTable } from '../components/common/Skeleton';
import { renderCategoryIcon } from '../utils/categoryIcon';
import { formatCurrency, formatDate } from '../utils/format';
import { Category, Expense } from '../types';

const ExpensesPage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Categories from Redux
  const categories = useAppSelector((state) => state.categories.items);

  // Expense State & Filters
  const {
    items,
    pagination,
    filters,
    loading,
    deletingId,
    error,
    successMessage
  } = useAppSelector((state) => state.expenses);

  // Modal local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Confirm Dialog delete target state
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Expense | null>(null);

  // Local state cho ô tìm kiếm gõ phím (Debounce 400ms)
  const [searchTerm, setSearchTerm] = useState(filters.keyword);

  // Tải danh mục nếu chưa có
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // Debounce 400ms cho ô tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.keyword) {
        dispatch(setKeyword(searchTerm));
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, filters.keyword, dispatch]);

  // Kích hoạt fetchExpenses khi filters thay đổi
  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch, filters]);

  // Hiển thị Toast khi có successMessage
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearExpenseMessages());
    }
  }, [successMessage, dispatch]);

  // Reset filters
  const handleReset = () => {
    setSearchTerm('');
    dispatch(resetFilters());
  };

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    dispatch(clearExpenseMessages());
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    dispatch(fetchExpenses());
  };

  const promptDeleteExpense = (expense: Expense) => {
    dispatch(clearExpenseMessages());
    setDeleteConfirmTarget(expense);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;

    dispatch(deleteExpenseThunk(deleteConfirmTarget._id))
      .unwrap()
      .then(() => {
        setDeleteConfirmTarget(null);
        if (items.length === 1 && pagination.currentPage > 1) {
          dispatch(setPage(pagination.currentPage - 1));
        } else {
          dispatch(fetchExpenses());
        }
      })
      .catch(() => {
        setDeleteConfirmTarget(null);
      });
  };

  // Safe Category Renderer
  const renderCategoryInfo = (cat: string | Category) => {
    if (cat && typeof cat === 'object' && 'name' in cat) {
      return (
        <span className="d-inline-flex align-items-center gap-2">
          <span
            className="d-inline-block rounded-circle"
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: cat.color || '#64748b'
            }}
          />
          <span className="text-secondary">{renderCategoryIcon(cat.icon, 'w-4 h-4')}</span>
          <span className="fw-semibold text-dark">{cat.name}</span>
        </span>
      );
    }
    return <span className="text-muted fst-italic small">Danh mục đã xóa</span>;
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const renderPaginationButtons = () => {
    const { currentPage, totalPages } = pagination;
    if (totalPages <= 1) return null;

    const pageNumbers: number[] = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 p-3 border-top bg-light rounded-bottom-4">
        <div className="text-muted small">
          Hiển thị trang <span className="fw-bold">{currentPage}</span> /{' '}
          <span className="fw-bold">{totalPages}</span> (Tổng{' '}
          <span className="fw-bold">{pagination.totalItems}</span> khoản chi)
        </div>

        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage <= 1 || loading ? 'disabled' : ''}`}>
            <button
              className="page-link d-flex align-items-center gap-1"
              onClick={() => dispatch(setPage(currentPage - 1))}
              disabled={currentPage <= 1 || loading}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trước</span>
            </button>
          </li>

          {pageNumbers.map((num) => (
            <li
              key={num}
              className={`page-item ${num === currentPage ? 'active' : ''} ${
                loading ? 'disabled' : ''
              }`}
            >
              <button
                className="page-link"
                onClick={() => dispatch(setPage(num))}
                disabled={loading}
              >
                {num}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${
              currentPage >= totalPages || loading ? 'disabled' : ''
            }`}
          >
            <button
              className="page-link d-flex align-items-center gap-1"
              onClick={() => dispatch(setPage(currentPage + 1))}
              disabled={currentPage >= totalPages || loading}
            >
              <span>Sau</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </li>
        </ul>
      </div>
    );
  };

  const hasNoCategories = categories.length === 0;

  return (
    <div>
      {/* Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Quản Lý Khoản Chi</h2>
          <p className="text-muted mb-0 small">Xem danh sách, tìm kiếm, thêm, sửa và xóa các khoản chi tiêu</p>
        </div>

        <button
          className="btn btn-primary px-3 py-2 fw-semibold"
          onClick={handleOpenAddModal}
          disabled={hasNoCategories}
          title={hasNoCategories ? 'Cần tạo ít nhất một danh mục trước khi thêm khoản chi' : ''}
        >
          <Plus className="w-4 h-4" />
          <span>Thêm khoản chi</span>
        </button>
      </div>

      {/* Warning Banner: No Category Guard */}
      {hasNoCategories && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center mb-4 rounded-3" role="alert">
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <span><strong>Chưa có danh mục:</strong> Bạn cần tạo ít nhất một danh mục trước khi thêm khoản chi.</span>
          </div>
          <Link to="/categories" className="btn btn-warning btn-sm fw-semibold text-dark">
            Quản lý danh mục
          </Link>
        </div>
      )}

      {/* Filter Toolbar Card */}
      <div className="card shadow-sm border-0 mb-4 rounded-4">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            {/* Keyword Search */}
            <div className="col-12 col-md-3">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white text-muted border-end-0">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Tìm theo ghi chú..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={filters.categoryId}
                onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="col-6 col-sm-3 col-md-2">
              <select
                className="form-select form-select-sm"
                value={filters.month}
                onChange={(e) => dispatch(setMonth(Number(e.target.value)))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="col-6 col-sm-3 col-md-2">
              <select
                className="form-select form-select-sm"
                value={filters.year}
                onChange={(e) => dispatch(setYear(Number(e.target.value)))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('-');
                  dispatch(setSortBy(sb));
                  dispatch(setSortOrder(so as 'asc' | 'desc'));
                }}
              >
                <option value="expenseDate-desc">Ngày: Mới nhất</option>
                <option value="expenseDate-asc">Ngày: Cũ nhất</option>
                <option value="amount-desc">Số tiền: Cao nhất</option>
                <option value="amount-asc">Số tiền: Thấp nhất</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="col-12 col-sm-6 col-md-1">
              <button
                className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                onClick={handleReset}
                title="Đặt lại bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && !isModalOpen && (
        <div className="alert alert-danger alert-dismissible fade show mb-4 rounded-3" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => dispatch(clearExpenseMessages())}
          ></button>
        </div>
      )}

      {/* Table Content Area */}
      {loading && items.length === 0 ? (
        <SkeletonTable rows={5} cols={5} />
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="card shadow-sm border-0 p-5 text-center my-4 rounded-4">
          <Wallet className="w-12 h-12 text-muted mb-3 mx-auto" />
          <h4 className="text-muted mb-2">Chưa có khoản chi nào phù hợp</h4>
          <p className="text-muted mb-0 small">Thử thay đổi bộ lọc tìm kiếm, tháng hoặc năm.</p>
        </div>
      ) : (
        /* Expense Table */
        <div className="card shadow-sm border-0 rounded-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '15%' }}>NGÀY CHI</th>
                  <th scope="col" style={{ width: '25%' }}>DANH MỤC</th>
                  <th scope="col" style={{ width: '20%' }}>SỐ TIỀN</th>
                  <th scope="col" style={{ width: '25%' }}>GHI CHÚ</th>
                  <th scope="col" style={{ width: '15%' }} className="text-end">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {items.map((expense) => (
                  <tr key={expense._id}>
                    <td className="fw-medium text-secondary table-nowrap-cell">
                      {formatDate(expense.expenseDate)}
                    </td>
                    <td>{renderCategoryInfo(expense.categoryId)}</td>
                    <td className="fw-bold text-danger table-nowrap-cell">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="text-muted small text-truncate" style={{ maxWidth: '200px' }}>
                      {expense.note || '-'}
                    </td>
                    <td className="text-end table-nowrap-cell">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleOpenEditModal(expense)}
                          title="Sửa khoản chi"
                          disabled={deletingId === expense._id}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => promptDeleteExpense(expense)}
                          title="Xóa khoản chi"
                          disabled={deletingId === expense._id}
                        >
                          {deletingId === expense._id ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {renderPaginationButtons()}
        </div>
      )}

      {/* Expense Form Modal */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingExpense={editingExpense}
        onSuccess={handleModalSuccess}
      />

      {/* Confirm Dialog Xóa Expense */}
      <ConfirmDialog
        show={!!deleteConfirmTarget}
        title="Xác Nhận Xóa Khoản Chi"
        message={`Bạn có chắc chắn muốn xóa khoản chi ${formatCurrency(deleteConfirmTarget?.amount || 0)} (${formatDate(deleteConfirmTarget?.expenseDate || '')}) không?`}
        confirmText="Xóa Khoản Chi"
        cancelText="Hủy"
        variant="danger"
        loading={!!deletingId}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmTarget(null)}
      />
    </div>
  );
};

export default ExpensesPage;
