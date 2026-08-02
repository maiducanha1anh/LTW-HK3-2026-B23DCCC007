import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  fetchCategories,
  deleteCategory,
  clearCategoryMessages
} from '../features/categories/categorySlice';
import CategoryFormModal from '../components/categories/CategoryFormModal';
import Loading from '../components/common/Loading';
import { Category } from '../types';

const getIconEmoji = (iconName: string): string => {
  switch (iconName) {
    case 'utensils':
      return '🍽️';
    case 'shopping-bag':
      return '🛍️';
    case 'film':
      return '🎬';
    case 'car':
      return '🚗';
    case 'graduation-cap':
      return '🎓';
    case 'home':
      return '🏠';
    case 'plane':
      return '✈️';
    case 'hospital':
      return '🏥';
    default:
      return '🏷️';
  }
};

const CategoriesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, deletingId, error, successMessage } = useAppSelector(
    (state) => state.categories
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Tự động clear successMessage sau 3 giây
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearCategoryMessages());
      }, 3000);
      return () => clearTimeout(timer);
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

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) {
      dispatch(clearCategoryMessages());
      await dispatch(deleteCategory(id));
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1">Quản Lý Danh Mục</h2>
          <p className="text-muted mb-0">Quản lý các loại danh mục chi tiêu cá nhân</p>
        </div>
        <button className="btn btn-primary px-3 py-2 fw-semibold" onClick={handleOpenAddModal}>
          ➕ Thêm danh mục
        </button>
      </div>

      {/* Thông báo thành công */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => dispatch(clearCategoryMessages())}
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
            onClick={() => dispatch(clearCategoryMessages())}
          ></button>
        </div>
      )}

      {/* Trang đang tải */}
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="card shadow-sm border-0 p-5 text-center my-4">
          <div className="display-4 mb-3">📁</div>
          <h4 className="text-muted mb-2">Chưa có danh mục nào</h4>
          <p className="text-muted mb-4">Hãy tạo danh mục đầu tiên để bắt đầu phân loại khoản chi.</p>
          <div>
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              Thêm danh mục ngay
            </button>
          </div>
        </div>
      ) : (
        /* Category Grid Cards */
        <div className="row g-3">
          {items.map((category) => (
            <div key={category._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm border-0 rounded-3">
                <div className="card-body d-flex flex-column justify-content-between p-3">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="fs-2">{getIconEmoji(category.icon)}</span>
                      <span
                        className="badge rounded-pill px-3 py-2"
                        style={{
                          backgroundColor: category.color || '#6c757d',
                          color: '#fff',
                          fontSize: '0.75rem'
                        }}
                      >
                        {category.color || '#6c757d'}
                      </span>
                    </div>
                    <h5 className="card-title fw-bold text-truncate mb-1" title={category.name}>
                      {category.name}
                    </h5>
                    <span className="badge bg-light text-dark border">Chi tiêu (Expense)</span>
                  </div>

                  <div className="d-flex gap-2 mt-3 pt-2 border-top">
                    <button
                      className="btn btn-outline-primary btn-sm flex-fill"
                      onClick={() => handleOpenEditModal(category)}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm flex-fill"
                      onClick={() => handleDelete(category._id, category.name)}
                      disabled={deletingId === category._id}
                    >
                      {deletingId === category._id ? (
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
    </div>
  );
};

export default CategoriesPage;
