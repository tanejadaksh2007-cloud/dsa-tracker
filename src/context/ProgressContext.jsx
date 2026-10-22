import { createContext, useContext, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectProgressState,
  selectOverallStats,
  setQuestionStatus,
  resetProgress,
} from '../store/progressSlice';

const ProgressContext = createContext(null);

/**
 * Compatibility layer backed directly by Redux Toolkit as the single source of truth.
 * Maintains the exact same interface (state, getStatus, setStatus, resetAll, stats)
 * without maintaining any duplicate or independent state.
 */
export function ProgressProvider({ children }) {
  const dispatch = useDispatch();
  const state = useSelector(selectProgressState);
  const stats = useSelector(selectOverallStats);

  const getStatus = useCallback(
    (topicId, qName) => state[topicId]?.[qName] || 'none',
    [state]
  );

  const setStatus = useCallback(
    (topicId, qName, next) => {
      dispatch(setQuestionStatus({ topicId, qName, status: next }));
    },
    [dispatch]
  );

  const resetAll = useCallback(() => {
    dispatch(resetProgress());
  }, [dispatch]);

  const value = useMemo(
    () => ({ state, getStatus, setStatus, resetAll, stats }),
    [state, getStatus, setStatus, resetAll, stats]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
