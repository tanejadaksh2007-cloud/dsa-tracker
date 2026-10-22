import { createSlice } from '@reduxjs/toolkit';
import { TOPICS } from '../data.js';
import { calcScore, solvedCount, overallStats } from '../utils/scoring.js';


const STORAGE_KEY = 'dsa_tracker_v2';

function loadInitialProgress() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    }
  } catch (err) {
    console.warn('Failed to parse saved progress from localStorage:', err);
  }
  return {};
}


const initialState = {
  byTopic: loadInitialProgress(),
};

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setQuestionStatus: (state, action) => {
      const { topicId, qName, status } = action.payload;
      if (!topicId || !qName) return;

      if (!state.byTopic[topicId]) {
        state.byTopic[topicId] = {};
      }
      state.byTopic[topicId][qName] = status;
    },
    resetProgress: (state) => {
      state.byTopic = {};
    },
  },
});

export const { setQuestionStatus, resetProgress } = progressSlice.actions;

// Selectors
export const selectProgressState = (state) => state.progress.byTopic;

export const selectQuestionStatus = (state, topicId, qName) => {
  return state.progress.byTopic[topicId]?.[qName] || 'none';
};

export const selectTopicScore = (state, topic) => {
  return calcScore(topic, state.progress.byTopic);
};

export const selectTopicSolvedCount = (state, topic) => {
  return solvedCount(topic, state.progress.byTopic);
};

export const selectOverallStats = (state) => {
  return overallStats(TOPICS, state.progress.byTopic);
};

export default progressSlice.reducer;
