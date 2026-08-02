import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  CategorySummaryItem,
  DashboardData,
  MonthSummaryData,
  YearSummaryItem
} from '../../types';
import reportApi from '../../api/reportApi';

interface ReportState {
  dashboard: DashboardData | null;
  loading: boolean;
  error: string | null;

  monthSummary: MonthSummaryData | null;
  categorySummary: CategorySummaryItem[];
  yearSummary: YearSummaryItem[];

  loadingMonth: boolean;
  loadingCategory: boolean;
  loadingYear: boolean;

  errorMonth: string | null;
  errorCategory: string | null;
  errorYear: string | null;
}

const initialState: ReportState = {
  dashboard: null,
  loading: false,
  error: null,

  monthSummary: null,
  categorySummary: [],
  yearSummary: [],

  loadingMonth: false,
  loadingCategory: false,
  loadingYear: false,

  errorMonth: null,
  errorCategory: null,
  errorYear: null
};

// Async Thunks
export const fetchDashboard = createAsyncThunk<
  DashboardData,
  void,
  { rejectValue: string }
>('reports/fetchDashboard', async (_, { rejectWithValue }) => {
  try {
    const response = await reportApi.getDashboard();
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi lấy dữ liệu Dashboard';
    return rejectWithValue(message);
  }
});

export const fetchMonthSummary = createAsyncThunk<
  MonthSummaryData,
  { month?: number; year?: number } | void,
  { rejectValue: string }
>('reports/fetchMonthSummary', async (params, { rejectWithValue }) => {
  try {
    const response = await reportApi.getMonthSummary(params || undefined);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi lấy báo cáo tổng hợp tháng';
    return rejectWithValue(message);
  }
});

export const fetchCategorySummary = createAsyncThunk<
  CategorySummaryItem[],
  { month?: number; year?: number } | void,
  { rejectValue: string }
>('reports/fetchCategorySummary', async (params, { rejectWithValue }) => {
  try {
    const response = await reportApi.getCategorySummary(params || undefined);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi lấy báo cáo theo danh mục';
    return rejectWithValue(message);
  }
});

export const fetchYearSummary = createAsyncThunk<
  YearSummaryItem[],
  { year?: number } | void,
  { rejectValue: string }
>('reports/fetchYearSummary', async (params, { rejectWithValue }) => {
  try {
    const response = await reportApi.getYearSummary(params || undefined);
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Lỗi khi lấy báo cáo 12 tháng';
    return rejectWithValue(message);
  }
});

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReportError: (state) => {
      state.error = null;
      state.errorMonth = null;
      state.errorCategory = null;
      state.errorYear = null;
    }
  },
  extraReducers: (builder) => {
    // fetchDashboard
    builder.addCase(fetchDashboard.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboard.fulfilled, (state, action) => {
      state.loading = false;
      state.dashboard = action.payload;
    });
    builder.addCase(fetchDashboard.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Lỗi khi lấy dữ liệu Dashboard';
    });

    // fetchMonthSummary
    builder.addCase(fetchMonthSummary.pending, (state) => {
      state.loadingMonth = true;
      state.errorMonth = null;
    });
    builder.addCase(fetchMonthSummary.fulfilled, (state, action) => {
      state.loadingMonth = false;
      state.monthSummary = action.payload;
    });
    builder.addCase(fetchMonthSummary.rejected, (state, action) => {
      state.loadingMonth = false;
      state.errorMonth = action.payload || 'Lỗi khi lấy báo cáo tháng';
    });

    // fetchCategorySummary
    builder.addCase(fetchCategorySummary.pending, (state) => {
      state.loadingCategory = true;
      state.errorCategory = null;
    });
    builder.addCase(fetchCategorySummary.fulfilled, (state, action) => {
      state.loadingCategory = false;
      state.categorySummary = action.payload;
    });
    builder.addCase(fetchCategorySummary.rejected, (state, action) => {
      state.loadingCategory = false;
      state.errorCategory = action.payload || 'Lỗi khi lấy báo cáo danh mục';
    });

    // fetchYearSummary
    builder.addCase(fetchYearSummary.pending, (state) => {
      state.loadingYear = true;
      state.errorYear = null;
    });
    builder.addCase(fetchYearSummary.fulfilled, (state, action) => {
      state.loadingYear = false;
      state.yearSummary = action.payload;
    });
    builder.addCase(fetchYearSummary.rejected, (state, action) => {
      state.loadingYear = false;
      state.errorYear = action.payload || 'Lỗi khi lấy báo cáo 12 tháng';
    });
  }
});

export const { clearReportError } = reportSlice.actions;
export default reportSlice.reducer;
