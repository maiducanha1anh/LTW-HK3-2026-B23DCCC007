import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  createCategory,
  updateCategory,
  clearCategoryMessages
} from '../../features/categories/categorySlice';
import { Category } from '../../types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: Category | null;
}

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}){1,2}$/;

const PRESET_ICONS = [
  { name: 'tag', label: '🏷️ Thẻ' },
  { name: 'utensils', label: '🍽️ Ăn uống' },
  { name: 'shopping-bag', label: '🛍️ Mua sắm' },
  { name: 'film', label: '🎬 Giải trí' },
  { name: 'car', label: '🚗 Đi lại' },
  { name: 'graduation-cap', label: '🎓 Học tập' },
  { name: 'home', label: '🏠 Nhà cửa' },
  { name: 'plane', label: '✈️ Du lịch' },
  { name: 'hospital', label: '🏥 Sức khỏe' }
];

const PRESET_COLORS = [
  '#6c757d',
  '#ff5722',
  '#e91e63',
  '#9c27b0',
  '#3f51b5',
  '#2196f3',
  '#009688',
  '#4caf50',
  '#ff9800'
];

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  editingCategory
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('tag');
  const [color, setColor] = useState('#6c757d');
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const { submitting, error } = useAppSelector((state) => state.categories);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearCategoryMessages());
      setValidationError(null);
      if (editingCategory) {
        setName(editingCategory.name);
        setIcon(editingCategory.icon || 'tag');
        setColor(editingCategory.color || '#6c757d');
      } else {
        setName('');
        setIcon('tag');
        setColor('#6c757d');
      }
    }
  }, [isOpen, editingCategory, dispatch]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedColor = color.trim();

    if (!trimmedName) {
      setValidationError('Tên danh mục không được để rỗng');
      return;
    }

    if (trimmedColor && !HEX_COLOR_REGEX.test(trimmedColor)) {
      setValidationError('Mã màu không hợp lệ. Định dạng chuẩn Hex: #6c757d');
      return;
    }

    const payload = {
      name: trimmedName,
      icon: icon.trim() || 'tag',
      color: trimmedColor || '#6c757d',
      type: 'expense'
    };

    try {
      if (editingCategory) {
        await dispatch(
          updateCategory({ id: editingCategory._id, payload })
        ).unwrap();
      } else {
        await dispatch(createCategory(payload)).unwrap();
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
              {editingCategory ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {(validationError || error) && (
                <div className="alert alert-danger py-2 small mb-3" role="alert">
                  {validationError || error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold">Tên danh mục *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Ăn uống, Mua sắm..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setValidationError(null);
                    if (error) dispatch(clearCategoryMessages());
                  }}
                  disabled={submitting}
                  autoFocus
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Biểu tượng (Icon)</label>
                <select
                  className="form-select"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  disabled={submitting}
                >
                  {PRESET_ICONS.map((i) => (
                    <option key={i.name} value={i.name}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Màu sắc</label>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={color.startsWith('#') && color.length === 7 ? color : '#6c757d'}
                    onChange={(e) => setColor(e.target.value)}
                    disabled={submitting}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="#6c757d"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="d-flex gap-1 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="btn btn-sm rounded-circle p-2"
                      style={{
                        backgroundColor: c,
                        border: color === c ? '2px solid #000' : 'none',
                        width: '24px',
                        height: '24px'
                      }}
                      onClick={() => setColor(c)}
                    />
                  ))}
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
                ) : editingCategory ? (
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

export default CategoryFormModal;
