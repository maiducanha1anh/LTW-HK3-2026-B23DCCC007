import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Expense, ExpenseFormPayload, ExpenseQueryParams, PaginationInfo } from '../../types';
import expenseApi from '../../api/expenseApi';

interface ExpenseFiltersState {
  keyword: string;
  categoryId: string;
  month: number;
  year: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

interface ExpenseState {
  items: Expense[];
  pagination: PaginationInfo;
  filters: ExpenseFiltersState;
  loading: boolean;
  submitting: boolean;
  deletingId: string | null;
  error: string | null;
  successMessage: string | null;
}

const currentDate = new Date();

const initialFilters: ExpenseFiltersState = {
  keyword: '',
  categoryId: '',
  month: currentDate.getMonth() + 1,
  year: currentDate.getFullYear(),
  sortBy: 'expenseDate',
  sortOrder: 'desc',
  page: 1,
  limit: 10
};

const initialState: ExpenseState = {
  items: [],
  pagination: {
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
    limit: 10
  },
  filters: initialFilters,
  loading: false,
  submitting: false,
  deletingId: null,
  error: null,
  successMessage: null
};

// Async Thunks
export const fetchExpenses = createAsyncThunk<
  { items: Expense[]; pagination: PaginationInfo },
  ExpenseQueryParams | void,
  { rejectValue: string }
>('expenses/fetchExpenses', async (params, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { expenses: ExpenseState };
    const currentFilters = state.expenses.filters;

    const queryParams: ExpenseQueryParams = {
      ...currentFilters,
      ...(params || {})
    };

    const response = await expenseApi.getExpenses(queryParams);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi lấy danh sách khoản chi';
    return rejectWithValue(message);
  }
});

export const createExpenseThunk = createAsyncThunk<
  Expense,
  ExpenseFormPayload,
  { rejectValue: string }
>('expenses/createExpense', async (payload, { rejectWithValue }) => {
  try {
    const response = await expenseApi.createExpense(payload);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi thêm khoản chi';
    return rejectWithValue(message);
  }
});

export const updateExpenseThunk = createAsyncThunk<
  Expense,
  { id: string; payload: ExpenseFormPayload },
  { rejectValue: string }
>('expenses/updateExpense', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await expenseApi.updateExpense(id, payload);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi cập nhật khoản chi';
    return rejectWithValue(message);
  }
});

export const deleteExpenseThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('expenses/deleteExpense', async (id, { rejectWithValue }) => {
  try {
    await expenseApi.deleteExpense(id);
    return id;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi xóa khoản chi';
    return rejectWithValue(message);
  }
});

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setKeyword: (state, action: PayloadAction<string>) => {
      state.filters.keyword = action.payload;
      state.filters.page = 1;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.filters.categoryId = action.payload;
      state.filters.page = 1;
    },
    setMonth: (state, action: PayloadAction<number>) => {
      state.filters.month = action.payload;
      state.filters.page = 1;
    },
    setYear: (state, action: PayloadAction<number>) => {
      state.filters.year = action.payload;
      state.filters.page = 1;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.filters.sortBy = action.payload;
      state.filters.page = 1;
    },
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.filters.sortOrder = action.payload;
      state.filters.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },
    resetFilters: (state) => {
      const now = new Date();
      state.filters = {
        keyword: '',
        categoryId: '',
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        sortBy: 'expenseDate',
        sortOrder: 'desc',
        page: 1,
        limit: 10
      };
    },
    clearExpenseMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    // fetchExpenses
    builder.addCase(fetchExpenses.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchExpenses.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.items;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchExpenses.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Lỗi khi lấy danh sách khoản chi';
    });

    // createExpenseThunk
    builder.addCase(createExpenseThunk.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(createExpenseThunk.fulfilled, (state) => {
      state.submitting = false;
      state.successMessage = 'Thêm khoản chi thành công';
    });
    builder.addCase(createExpenseThunk.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload || 'Lỗi khi thêm khoản chi';
    });

    // updateExpenseThunk
    builder.addCase(updateExpenseThunk.pending, (state) => {
      state.submitting = true;
      state.error = null;
    });
    builder.addCase(updateExpenseThunk.fulfilled, (state, action) => {
      state.submitting = false;
      state.successMessage = 'Cập nhật khoản chi thành công';
      const index = state.items.findIndex((item) => item._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });
    builder.addCase(updateExpenseThunk.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload || 'Lỗi khi cập nhật khoản chi';
    });

    // deleteExpenseThunk
    builder.addCase(deleteExpenseThunk.pending, (state, action) => {
      state.deletingId = action.meta.arg;
      state.error = null;
    });
    builder.addCase(deleteExpenseThunk.fulfilled, (state, action) => {
      state.deletingId = null;
      state.successMessage = 'Xóa khoản chi thành công';
      state.items = state.items.filter((item) => item._id !== action.payload);
      if (state.pagination.totalItems > 0) {
        state.pagination.totalItems -= 1;
      }
    });
    builder.addCase(deleteExpenseThunk.rejected, (state, action) => {
      state.deletingId = null;
      state.error = action.payload || 'Lỗi khi xóa khoản chi';
    });
  }
});

export const {
  setKeyword,
  setCategoryFilter,
  setMonth,
  setYear,
  setSortBy,
  setSortOrder,
  setPage,
  resetFilters,
  clearExpenseMessages
} = expenseSlice.actions;

export default expenseSlice.reducer;
