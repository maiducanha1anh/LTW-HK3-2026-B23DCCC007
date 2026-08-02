import { createSlice } from '@reduxjs/toolkit';
import { Expense } from '../../types';

interface ExpenseState {
  items: Expense[];
  loading: boolean;
  error: string | null;
}

const initialState: ExpenseState = {
  items: [],
  loading: false,
  error: null
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {}
});

export default expenseSlice.reducer;
