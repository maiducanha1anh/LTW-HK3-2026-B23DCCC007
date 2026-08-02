import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Category, CategoryPayload } from '../../types';
import categoryApi from '../../api/categoryApi';

interface CategoryState {
  items: Category[];
  loading: boolean;
  submitting: boolean;
  deletingId: string | null;
  error: string | null;
  successMessage: string | null;
}

const initialState: CategoryState = {
  items: [],
  loading: false,
  submitting: false,
  deletingId: null,
  error: null,
  successMessage: null
};

// Async Thunks
export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>('categories/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await categoryApi.getCategories();
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi lấy danh sách danh mục';
    return rejectWithValue(message);
  }
});

export const createCategory = createAsyncThunk<
  Category,
  CategoryPayload,
  { rejectValue: string }
>('categories/createCategory', async (payload, { rejectWithValue }) => {
  try {
    const response = await categoryApi.createCategory(payload);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi tạo danh mục';
    return rejectWithValue(message);
  }
});

export const updateCategory = createAsyncThunk<
  Category,
  { id: string; payload: CategoryPayload },
  { rejectValue: string }
>('categories/updateCategory', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await categoryApi.updateCategory(id, payload);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi cập nhật danh mục';
    return rejectWithValue(message);
  }
});

export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('categories/deleteCategory', async (id, { rejectWithValue }) => {
  try {
    await categoryApi.deleteCategory(id);
    return id;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi xóa danh mục';
    return rejectWithValue(message);
  }
});

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    // fetchCategories
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload; // Replace entire array safely
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Lỗi khi lấy danh sách danh mục';
    });

    // createCategory
    builder.addCase(createCategory.pending, (state) => {
      state.submitting = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(createCategory.fulfilled, (state, action) => {
      state.submitting = false;
      state.items.unshift(action.payload);
      state.successMessage = 'Tạo danh mục thành công';
    });
    builder.addCase(createCategory.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload || 'Lỗi khi tạo danh mục';
    });

    // updateCategory
    builder.addCase(updateCategory.pending, (state) => {
      state.submitting = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(updateCategory.fulfilled, (state, action) => {
      state.submitting = false;
      const index = state.items.findIndex((item) => item._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      state.successMessage = 'Cập nhật danh mục thành công';
    });
    builder.addCase(updateCategory.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload || 'Lỗi khi cập nhật danh mục';
    });

    // deleteCategory
    builder.addCase(deleteCategory.pending, (state, action) => {
      state.deletingId = action.meta.arg;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.deletingId = null;
      state.items = state.items.filter((item) => item._id !== action.payload);
      state.successMessage = 'Xóa danh mục thành công';
    });
    builder.addCase(deleteCategory.rejected, (state, action) => {
      state.deletingId = null;
      state.error = action.payload || 'Lỗi khi xóa danh mục';
    });
  }
});

export const { clearCategoryMessages } = categorySlice.actions;
export default categorySlice.reducer;
