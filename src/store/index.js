import { configureStore } from '@reduxjs/toolkit';
import progressReducer from './progressSlice.js';


const STORAGE_KEY = 'dsa_tracker_v2';

export const store = configureStore({
  reducer: {
    progress: progressReducer,
  },
});

// Subscribe to store updates to persist progress in localStorage
let previousProgress = store.getState().progress.byTopic;
store.subscribe(() => {
  const currentProgress = store.getState().progress.byTopic;
  if (previousProgress !== currentProgress) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProgress));
      }
    } catch (err) {
      console.warn('Failed to save progress to localStorage:', err);
    }
    previousProgress = currentProgress;
  }
});

