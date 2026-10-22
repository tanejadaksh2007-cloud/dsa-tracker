import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchDailyChallenge } from '../services/challengeApi';

/**
 * Custom hook to manage Daily Coding Challenge state:
 * - Loading, success, and error states
 * - In-flight request deduplication
 * - AbortController cleanup on unmount or refresh
 * - Safe manual retry and refetch without infinite loops
 */
export function useDailyChallenge() {
  const [challenge, setChallenge] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track active in-flight AbortController
  const abortControllerRef = useRef(null);
  // Track ongoing request to avoid duplicate concurrent calls
  const isFetchingRef = useRef(false);

  const loadChallenge = useCallback(async () => {
    // Prevent duplicate concurrent requests
    if (isFetchingRef.current) {
      return;
    }

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    isFetchingRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchDailyChallenge(controller.signal);
      setChallenge(data);
      setError(null);
    } catch (err) {
      // Ignore cancellations from unmounts or subsequent refetches
      if (err.isCanceled || controller.signal.aborted) {
        return;
      }
      setError(err.message || "Failed to load today's coding challenge.");
    } finally {
      // Only clear fetching flags if this controller is still active
      if (abortControllerRef.current === controller) {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadChallenge();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadChallenge]);

  const refetch = useCallback(() => {
    return loadChallenge();
  }, [loadChallenge]);

  return {
    challenge,
    isLoading,
    error,
    refetch,
  };
}
