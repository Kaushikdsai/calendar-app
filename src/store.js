import { configureStore } from '@reduxjs/toolkit';
import eventsReducer from './eventsSlice';
import goalsReducer from './goalsSlice';
import tasksReducer from './tasksSlice';

const store = configureStore({
  reducer: {
    events: eventsReducer,
    goals: goalsReducer,
    tasks: tasksReducer,
  },
});

export default store;
