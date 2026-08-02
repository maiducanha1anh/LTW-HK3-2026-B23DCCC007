import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  createBudget,
  updateBudget,
  clearBudgetMessages
} from '../../features/budgets/budgetSlice';
import { Budget } from '../../types';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBudget: Budget | null;
}

const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  editingBudget
}) => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [amountInput, setAmountInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { submitting, error } = useAppSelector((state) => state.budgets);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearBudgetMessages());
      setValidationError(null);
      if (editingBudget) {
        setMonth(editingBudget.month);
        setYear(editingBudget.year);
        setAmountInput(String(editingBudget.amount));
      } else {
        const now = new Date();
        setMonth(now.getMonth() + 1);
        setYear(now.getFullYear());
        setAmountInput('');
      }
    }
  }, [isOpen, editingBudget, dispatch]);

  if (!isOpen) return null;

  const currentYearVal = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYearVal - 5 + i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amountInput.trim()) {
      setValidationError('Số tiền phải lớn hơn 0');
      return;
    }

    const parsedAmount = Number(amountInput);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Số tiền phải lớn hơn 0');
      return;
    }

    if (parsedAmount > 10000000) {
      setValidationError('Số tiền không được vượt quá 10.000.000 VND');
      return;
    }

    if (month < 1 || month > 12) {
      setValidationError('Tháng không hợp lệ (từ 1 đến 12)');
      return;
    }

    if (year < 2000 || year > 2100) {
      setValidationError('Năm không hợp lệ (từ 2000 đến 2100)');
      return;
    }

    const payload = {
      month,
      year,
      amount: parsedAmount
    };

    try {
      if (editingBudget) {
        await dispatch(
          updateBudget({ id: editingBudget._id, payload })
        ).unwrap();
      } else {
        await dispatch(createBudget(payload)).unwrap();
      }
      onClose();
    } catch {
      // Error handled by Redux state and rendered in modal below
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
              {editingBudget ? 'Sửa Định Mức Chi Tiêu' : 'Thiết Lập Định Mức Chi Tiêu'}
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
              {(validationError || error) && (
                <div className="alert alert-danger py-2 small mb-3" role="alert">
                  {validationError || error}
                </div>
              )}

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label fw-semibold">Tháng *</label>
                  <select
                    className="form-select"
                    value={month}
                    onChange={(e) => {
                      setMonth(Number(e.target.value));
                      setValidationError(null);
                      if (error) dispatch(clearBudgetMessages());
                    }}
                    disabled={submitting}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        Tháng {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label fw-semibold">Năm *</label>
                  <select
                    className="form-select"
                    value={year}
                    onChange={(e) => {
                      setYear(Number(e.target.value));
                      setValidationError(null);
                      if (error) dispatch(clearBudgetMessages());
                    }}
                    disabled={submitting}
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        Năm {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Số tiền định mức (VND) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={10000000}
                  step={1}
                  className="form-control"
                  placeholder="Ví dụ: 5000000"
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setValidationError(null);
                    if (error) dispatch(clearBudgetMessages());
                  }}
                  disabled={submitting}
                  autoFocus
                />
                <div className="form-text">
                  Hạn mức tối đa từ 1 đến 10.000.000 VND.
                </div>
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
                ) : editingBudget ? (
                  'Cập Nhật'
                ) : (
                  'Thiết Lập'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BudgetFormModal;
