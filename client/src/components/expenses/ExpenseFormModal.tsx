import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  createExpenseThunk,
  updateExpenseThunk,
  clearExpenseMessages
} from '../../features/expenses/expenseSlice';
import { Expense, ExpenseFormPayload } from '../../types';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingExpense: Expense | null;
  onSuccess: () => void;
}

const getTodayLocalDateString = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateToLocalInput = (dateInput: string | Date): string => {
  if (!dateInput) return getTodayLocalDateString();
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return getTodayLocalDateString();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  editingExpense,
  onSuccess
}) => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.items);
  const { submitting, error } = useAppSelector((state) => state.expenses);

  const [amountInput, setAmountInput] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [expenseDate, setExpenseDate] = useState(getTodayLocalDateString());
  const [note, setNote] = useState('');

  // Per-field validation errors
  const [amountError, setAmountError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearExpenseMessages());
      setAmountError(null);
      setCategoryError(null);
      setDateError(null);
      setNoteError(null);

      if (editingExpense) {
        setAmountInput(String(editingExpense.amount));

        // Trích xuất categoryId an toàn (string hoặc populate object)
        const catId =
          typeof editingExpense.categoryId === 'string'
            ? editingExpense.categoryId
            : editingExpense.categoryId?._id || '';

        setCategoryId(catId);
        setExpenseDate(formatDateToLocalInput(editingExpense.expenseDate));
        setNote(editingExpense.note || '');
      } else {
        setAmountInput('');
        // Mặc định chọn danh mục đầu tiên nếu có
        setCategoryId(categories.length > 0 ? categories[0]._id : '');
        setExpenseDate(getTodayLocalDateString());
        setNote('');
      }
    }
  }, [isOpen, editingExpense, categories, dispatch]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setAmountError(null);
    setCategoryError(null);
    setDateError(null);
    setNoteError(null);

    let hasError = false;

    // 1. Validate Số tiền
    if (!amountInput.trim()) {
      setAmountError('Số tiền phải lớn hơn 0');
      hasError = true;
    } else {
      const parsedAmount = Number(amountInput);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        setAmountError('Số tiền phải lớn hơn 0');
        hasError = true;
      } else if (parsedAmount > 10000000) {
        setAmountError('Số tiền không được vượt quá 10.000.000 VND');
        hasError = true;
      }
    }

    // 2. Validate Danh mục
    if (!categoryId.trim()) {
      setCategoryError('Vui lòng chọn danh mục chi tiêu');
      hasError = true;
    }

    // 3. Validate Ngày chi
    if (!expenseDate) {
      setDateError('Vui lòng chọn ngày chi hợp lệ');
      hasError = true;
    } else {
      const selectedDate = new Date(expenseDate);
      const today = new Date();
      // Reset giờ phút giây về 23:59:59 để cho phép chọn ngày hôm nay
      today.setHours(23, 59, 59, 999);
      if (isNaN(selectedDate.getTime())) {
        setDateError('Ngày chi không hợp lệ');
        hasError = true;
      } else if (selectedDate > today) {
        setDateError('Ngày chi không được lớn hơn ngày hiện tại');
        hasError = true;
      }
    }

    // 4. Validate Ghi chú
    if (note.length > 500) {
      setNoteError('Ghi chú không được vượt quá 500 ký tự');
      hasError = true;
    }

    if (hasError) return;

    const payload: ExpenseFormPayload = {
      amount: Number(amountInput),
      categoryId,
      expenseDate,
      note: note.trim() ? note.trim() : undefined
    };

    try {
      if (editingExpense) {
        await dispatch(
          updateExpenseThunk({ id: editingExpense._id, payload })
        ).unwrap();
      } else {
        await dispatch(createExpenseThunk(payload)).unwrap();
      }
      onSuccess();
    } catch {
      // Backend error is handled in Redux state and rendered below
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              {editingExpense ? '✏️ Sửa Khoản Chi' : '➕ Thêm Khoản Chi Mới'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">
              {/* Backend Error Alert */}
              {error && (
                <div className="alert alert-danger py-2 small mb-3" role="alert">
                  {error}
                </div>
              )}

              {/* Field 1: Số tiền */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Số tiền (VND) *</label>
                <input
                  type="number"
                  min={1}
                  max={10000000}
                  step={1}
                  className={`form-control ${amountError ? 'is-invalid' : ''}`}
                  placeholder="Ví dụ: 50000"
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setAmountError(null);
                  }}
                  disabled={submitting}
                  autoFocus
                />
                {amountError ? (
                  <div className="invalid-feedback">{amountError}</div>
                ) : (
                  <div className="form-text">Nhập số tiền từ 1 đến 10.000.000 VND</div>
                )}
              </div>

              {/* Field 2: Danh mục */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Danh mục *</label>
                <select
                  className={`form-select ${categoryError ? 'is-invalid' : ''}`}
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setCategoryError(null);
                  }}
                  disabled={submitting}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {categoryError && (
                  <div className="invalid-feedback">{categoryError}</div>
                )}
              </div>

              {/* Field 3: Ngày chi */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Ngày chi *</label>
                <input
                  type="date"
                  className={`form-control ${dateError ? 'is-invalid' : ''}`}
                  value={expenseDate}
                  onChange={(e) => {
                    setExpenseDate(e.target.value);
                    setDateError(null);
                  }}
                  disabled={submitting}
                />
                {dateError && <div className="invalid-feedback">{dateError}</div>}
              </div>

              {/* Field 4: Ghi chú */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Ghi chú</label>
                <textarea
                  rows={3}
                  maxLength={500}
                  className={`form-control ${noteError ? 'is-invalid' : ''}`}
                  placeholder="Nhập chi tiết khoản chi (không bắt buộc)..."
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setNoteError(null);
                  }}
                  disabled={submitting}
                ></textarea>
                {noteError ? (
                  <div className="invalid-feedback">{noteError}</div>
                ) : (
                  <div className="form-text text-end">{note.length} / 500 ký tự</div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Hủy
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Đang lưu...
                  </>
                ) : editingExpense ? (
                  'Cập Nhật'
                ) : (
                  'Thêm Mới'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
