import React, { useEffect } from 'react';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  show,
  title,
  message,
  confirmText = 'Xác Nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel
}) => {
  // Lock body scroll when modal is open and handle ESC key press
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !loading) {
          onCancel();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [show, loading, onCancel]);

  if (!show) return null;

  const getVariantBtnClass = () => {
    switch (variant) {
      case 'warning':
        return 'btn-warning text-dark';
      case 'primary':
        return 'btn-primary';
      default:
        return 'btn-danger';
    }
  };

  const getIconHeader = () => {
    switch (variant) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'primary':
        return <Info className="w-5 h-5 text-primary" />;
      default:
        return <Trash2 className="w-5 h-5 text-danger" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050 }}
        onClick={() => {
          if (!loading) onCancel();
        }}
      />

      {/* Modal Container */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow border-0 rounded-4">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2" id="confirm-dialog-title">
                {getIconHeader()}
                <span>{title}</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Đóng"
                onClick={onCancel}
                disabled={loading}
              ></button>
            </div>

            <div className="modal-body py-3" id="confirm-dialog-message">
              <p className="text-secondary mb-0">{message}</p>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-secondary fw-semibold"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`btn ${getVariantBtnClass()} fw-semibold px-4`}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Đang xử lý...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
