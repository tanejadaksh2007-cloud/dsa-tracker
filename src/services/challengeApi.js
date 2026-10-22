import axios from 'axios';

// Default endpoint for LeetCode Daily Challenge (CORS-enabled public API, no auth required)
const DEFAULT_API_URL = 'https://alfa-leetcode-api.onrender.com/daily';

// Optional non-secret environment variable override (e.g. for custom proxies or staging)
const API_URL = (import.meta.env && import.meta.env.VITE_CHALLENGE_API_URL) || DEFAULT_API_URL;

// Axios instance with default configuration and timeout
const apiClient = axios.create({
  timeout: 10000, // 10 second timeout
  headers: {
    Accept: 'application/json',
  },
});

/**
 * Normalizes raw API response into a consistent challenge model.
 * Handles missing or optional fields safely.
 */
export function normalizeChallenge(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Received malformed response from challenge API.');
  }

  // Extract title
  const title =
    data.questionTitle ||
    data.title ||
    (data.question && data.question.title) ||
    'Daily Challenge';

  // Extract difficulty (Easy, Medium, Hard)
  const rawDifficulty =
    data.difficulty ||
    (data.question && data.question.difficulty) ||
    '';
  const difficulty = rawDifficulty
    ? rawDifficulty.charAt(0).toUpperCase() + rawDifficulty.slice(1).toLowerCase()
    : 'Unknown';

  // Extract problem URL
  const url =
    data.questionLink ||
    data.link ||
    (data.titleSlug ? `https://leetcode.com/problems/${data.titleSlug}/` : null);

  // Extract topic tags
  let tags = [];
  if (Array.isArray(data.topicTags)) {
    tags = data.topicTags.map((tag) => (typeof tag === 'object' ? tag.name : tag)).filter(Boolean);
  } else if (Array.isArray(data.tags)) {
    tags = data.tags.filter(Boolean);
  }

  // Extract date if provided
  const date = data.date || null;

  // Extract question ID if provided
  const questionId = data.questionFrontendId || data.questionId || null;

  return {
    id: questionId,
    title,
    difficulty,
    url,
    tags,
    date,
    isPaidOnly: Boolean(data.isPaidOnly),
  };
}

/**
 * Fetches the daily coding challenge using Axios.
 * Accepts an optional AbortSignal for cancellation.
 */
export async function fetchDailyChallenge(signal) {
  try {
    const response = await apiClient.get(API_URL, {
      signal,
    });

    if (!response.data) {
      throw new Error('No data returned from coding challenge service.');
    }

    return normalizeChallenge(response.data);
  } catch (error) {
    // If the request was cancelled via AbortSignal, mark as canceled
    if (axios.isCancel(error) || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
      const cancelErr = new Error('Request was canceled');
      cancelErr.isCanceled = true;
      throw cancelErr;
    }

    let message = "Unable to load today's coding challenge.";

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message = 'Request timed out. The challenge service took too long to respond.';
    } else if (error.response) {
      // Server responded with 4xx / 5xx
      message = `Server responded with status ${error.response.status}: ${error.response.statusText || 'Error'}`;
    } else if (error.request) {
      // No response received (network failure, CORS blockage, or offline)
      message = 'Network error: Unable to reach the coding challenge service. Check your internet connection.';
    } else if (error.message) {
      message = error.message;
    }

    const err = new Error(message);
    err.originalError = error;
    throw err;
  }
}
