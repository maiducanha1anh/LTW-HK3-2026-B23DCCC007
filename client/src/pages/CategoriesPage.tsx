import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchCategories,
  deleteCategory,
  clearCategoryMessages
} from '../features/categories/categorySlice';
import CategoryFormModal from '../components/categories/CategoryFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { SkeletonCard } from '../components/common/Skeleton';
import { renderCategoryIcon } from '../utils/categoryIcon';
import { Category } from '../types';

const CategoriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, deletingId, error, successMessage } = useAppSelector(
    (state) => state.categories
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // State cho ConfirmDialog
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Hiển thị Toast khi có successMessage
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearCategoryMessages());
    }
  }, [successMessage, dispatch]);

  const handleOpenAddModal = () => {
    dispatch(clearCategoryMessages());
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    dispatch(clearCategoryMessages());
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const promptDeleteCategory = (id: string, name: string) => {
    dispatch(clearCategoryMessages());
    setDeleteConfirmTarget({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    const { id } = deleteConfirmTarget;
    await dispatch(deleteCategory(id));
    setDeleteConfirmTarget(null);
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Quản Lý Danh Mục</h2>
          <p className="text-muted mb-0 small">Quản lý các loại danh mục chi tiêu cá nhân</p>
        </div>
        <button className="btn btn-primary px-3 py-2 fw-semibold" onClick={handleOpenAddModal}>
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Thông báo lỗi trang (Fetch hoặc Delete) */}
      {error && !isModalOpen && (
        <div className="alert alert-danger alert-dismissible fade show mb-4 rounded-3" role="alert">
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => dispatch(clearCategoryMessages())}
          ></button>
        </div>
      )}

      {/* Trang đang tải lần đầu: Hiển thị 6 Skeleton Cards */}
      {loading && items.length === 0 ? (
        <div className="row g-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="card shadow-sm border-0 p-5 text-center my-4 rounded-4">
          <FolderOpen className="w-12 h-12 text-muted mb-3 mx-auto" />
          <h4 className="text-muted mb-2">Chưa có danh mục nào</h4>
          <p className="text-muted mb-4 small">Hãy tạo danh mục đầu tiên để bắt đầu phân loại khoản chi.</p>
          <div>
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <Plus className="w-4 h-4" />
              <span>Thêm danh mục ngay</span>
            </button>
          </div>
        </div>
      ) : (
        /* Category Grid Cards */
        <div className="row g-3">
          {items.map((category) => (
            <div key={category._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm border-0 rounded-4 card-hover-effect">
                <div className="card-body d-flex flex-column justify-content-between p-4">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div
                        className="stat-icon-circle"
                        style={{
                          backgroundColor: `${category.color || '#64748b'}20`,
                          color: category.color || '#64748b'
                        }}
                      >
                        {renderCategoryIcon(category.icon, 'w-6 h-6')}
                      </div>
                      <span
                        className="badge rounded-pill px-3 py-2 fw-semibold"
                        style={{
                          backgroundColor: category.color || '#64748b',
                          color: '#fff',
                          fontSize: '0.75rem'
                        }}
                      >
                        {category.color || '#64748b'}
                      </span>
                    </div>
                    <h5 className="card-title fw-bold text-truncate mb-1 text-dark" title={category.name}>
                      {category.name}
                    </h5>
                    <span className="badge bg-light text-secondary border">Chi tiêu (Expense)</span>
                  </div>

                  <div className="d-flex gap-2 mt-4 pt-3 border-top">
                    <button
                      className="btn btn-outline-primary btn-sm flex-fill"
                      onClick={() => handleOpenEditModal(category)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm flex-fill"
                      onClick={() => promptDeleteCategory(category._id, category.name)}
                      disabled={deletingId === category._id}
                    >
                      {deletingId === category._id ? (
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form Thêm/Sửa */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingCategory={editingCategory}
      />

      {/* Confirm Dialog Xóa Category */}
      <ConfirmDialog
        show={!!deleteConfirmTarget}
        title="Xác Nhận Xóa Danh Mục"
        message={`Bạn có chắc chắn muốn xóa danh mục "${deleteConfirmTarget?.name || ''}" không? Hàng loạt khoản chi thuộc danh mục này có thể bị ảnh hưởng.`}
        confirmText="Xóa Danh Mục"
        cancelText="Hủy"
        variant="danger"
        loading={!!deletingId}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmTarget(null)}
      />
    </div>
  );
};

export default CategoriesPage;
