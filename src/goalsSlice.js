import { createSlice } from '@reduxjs/toolkit';

const goalsSlice = createSlice({
  name: 'goals',
  initialState: {
    list: [
      { id: 1, name: 'Learn', color: '#60a5fa' },
      { id: 2, name: 'Health', color: '#a3e635' },
      { id: 3, name: 'Family', color: '#f87171' },
    ],
    selectedGoalId: null,
  },
  reducers: {
    selectGoal: (state, action) => {
      state.selectedGoalId = action.payload;
    },
  },
});

export const { selectGoal } = goalsSlice.actions;
export default goalsSlice.reducer;
