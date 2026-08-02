import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Expense, ExpenseQueryParams, PaginationInfo } from '../../types';
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
  error: string | null;
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
  error: null
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
    clearExpenseError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
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
  clearExpenseError
} = expenseSlice.actions;

export default expenseSlice.reducer;
