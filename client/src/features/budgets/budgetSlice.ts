import { createSlice } from '@reduxjs/toolkit';
import { Budget, CurrentBudgetInfo } from '../../types';

interface BudgetState {
  items: Budget[];
  currentBudget: CurrentBudgetInfo | null;
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  items: [],
  currentBudget: null,
  loading: false,
  error: null
};

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {}
});

export default budgetSlice.reducer;
