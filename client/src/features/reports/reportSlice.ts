import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DashboardData } from '../../types';
import reportApi from '../../api/reportApi';

interface ReportState {
  dashboard: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  dashboard: null,
  loading: false,
  error: null
};

// Async Thunk
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

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReportError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
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
  }
});

export const { clearReportError } = reportSlice.actions;
export default reportSlice.reducer;
