import { createSlice } from '@reduxjs/toolkit';

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: [
    { id: 1, goalId: 1, name: 'AI-based Agents' },
    { id: 2, goalId: 1, name: 'MLE' },
    { id: 3, goalId: 1, name: 'DE Related' },
    { id: 4, goalId: 1, name: 'Basics' },
    { id: 5, goalId: 2, name: 'Workout' },
    { id: 6, goalId: 2, name: 'Meal Prep' },
    { id: 7, goalId: 3, name: 'Call Mom' },
  ],
  reducers: {},
});

export default tasksSlice.reducer;
