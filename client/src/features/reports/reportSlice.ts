import { createSlice } from '@reduxjs/toolkit';

interface ReportState {
  monthSummary: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  monthSummary: null,
  loading: false,
  error: null
};

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {}
});

export default reportSlice.reducer;
