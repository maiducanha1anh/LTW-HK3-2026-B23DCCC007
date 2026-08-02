import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Budget, BudgetFormPayload, CurrentBudgetInfo } from '../../types';
import budgetApi from '../../api/budgetApi';

interface BudgetState {
  items: Budget[];
  currentBudget: CurrentBudgetInfo | null;
  loading: boolean;
  submitting: boolean;
  deletingId: string | null;
  error: string | null;
  successMessage: string | null;
}

const initialState: BudgetState = {
  items: [],
  currentBudget: null,
  loading: false,
  submitting: false,
  deletingId: null,
  error: null,
  successMessage: null
};

// Sắp xếp mảng Budget theo Năm giảm dần, sau đó Tháng giảm dần
const sortBudgets = (budgets: Budget[]): Budget[] => {
  return [...budgets].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.month - a.month;
  });
};

// Async Thunks
export const fetchBudgets = createAsyncThunk<
  Budget[],
  void,
  { rejectValue: string }
>('budgets/fetchBudgets', async (_, { rejectWithValue }) => {
  try {
    const response = await budgetApi.getBudgets();
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi lấy danh sách định mức';
    return rejectWithValue(message);
  }
});

export const fetchCurrentBudget = createAsyncThunk<
  CurrentBudgetInfo,
  { month?: number; year?: number } | void,
  { rejectValue: string }
>('budgets/fetchCurrentBudget', async (params, { rejectWithValue }) => {
  try {
    const response = await budgetApi.getCurrentBudget(params || undefined);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi lấy định mức hiện tại';
    return rejectWithValue(message);
  }
});

export const createBudget = createAsyncThunk<
  Budget,
  BudgetFormPayload,
  { rejectValue: string }
>('budgets/createBudget', async (payload, { rejectWithValue, dispatch }) => {
  try {
    const response = await budgetApi.createBudget(payload);
    // Tự động cập nhật lại Current Budget để giữ đồng bộ card trên cùng
    dispatch(fetchCurrentBudget());
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi thiết lập định mức';
    return rejectWithValue(message);
  }
});

export const updateBudget = createAsyncThunk<
  Budget,
  { id: string; payload: BudgetFormPayload },
  { rejectValue: string }
>('budgets/updateBudget', async ({ id, payload }, { rejectWithValue, dispatch }) => {
  try {
    const response = await budgetApi.updateBudget(id, payload);
    dispatch(fetchCurrentBudget());
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi cập nhật định mức';
    return rejectWithValue(message);
  }
});

export const deleteBudget = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('budgets/deleteBudget', async (id, { rejectWithValue, dispatch }) => {
  try {
    await budgetApi.deleteBudget(id);
    dispatch(fetchCurrentBudget());
    return id;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi xóa định mức';
    return rejectWithValue(message);
  }
});

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearBudgetMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    // fetchBudgets
    builder.addCase(fetchBudgets.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBudgets.fulfilled, (state, action) => {
      state.loading = false;
      state.items = sortBudgets(action.payload);
    });
    builder.addCase(fetchBudgets.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Lỗi khi lấy danh sách định mức';
    });

    // fetchCurrentBudget
    builder.addCase(fetchCurrentBudget.fulfilled, (state, action) => {
      state.currentBudget = action.payload;
    });

    // createBudget
    builder.addCase(createBudget.pending, (state) => {
      state.submitting = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(createBudget.fulfilled, (state, action) => {
      state.submitting = false;
      state.items = sortBudgets([action.payload, ...state.items]);
      state.successMessage = 'Thiết lập định mức thành công';
    });
    builder.addCase(createBudget.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload || 'Lỗi khi thiết lập định mức';
    });

    // updateBudget
    builder.addCase(updateBudget.pending, (state) => {
      state.submitting = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(updateBudget.fulfilled, (state, action) => {
      state.submitting = false;
      const index = state.items.findIndex((item) => item._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
        state.items = sortBudgets(state.items);
      }
      state.successMessage = 'Cập nhật định mức thành công';
    });
    builder.addCase(updateBudget.rejected, (state, action) => {
      state.submitting = false;
      state.error = action.payload || 'Lỗi khi cập nhật định mức';
    });

    // deleteBudget
    builder.addCase(deleteBudget.pending, (state, action) => {
      state.deletingId = action.meta.arg;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(deleteBudget.fulfilled, (state, action) => {
      state.deletingId = null;
      state.items = state.items.filter((item) => item._id !== action.payload);
      state.successMessage = 'Xóa định mức thành công';
    });
    builder.addCase(deleteBudget.rejected, (state, action) => {
      state.deletingId = null;
      state.error = action.payload || 'Lỗi khi xóa định mức';
    });
  }
});

export const { clearBudgetMessages } = budgetSlice.actions;
export default budgetSlice.reducer;
