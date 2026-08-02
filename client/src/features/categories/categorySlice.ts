import { createSlice } from '@reduxjs/toolkit';
import { Category } from '../../types';

interface CategoryState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  items: [],
  loading: false,
  error: null
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {}
});

export default categorySlice.reducer;
