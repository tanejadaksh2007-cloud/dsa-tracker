const DIFFICULTY_WEIGHT = {
  easy: 1,
  medium: 2,
  hard: 3,
};

/**
 * Extracts all predefined roadmap questions into a flat list with topic and section metadata.
 * Does not mutate the original data.
 */
export function getAllRoadmapProblems(topics) {
  const list = [];
  topics.forEach((topic) => {
    topic.sections.forEach((section) => {
      section.questions.forEach((q) => {
        list.push({
          ...q,
          topicId: topic.id,
          topicName: topic.name,
          topicIcon: topic.icon,
          sectionTitle: section.title,
        });
      });
    });
  });
  return list;
}

/**
 * Filters and sorts problems based on search, difficulty, topic, status, and sort criteria.
 * Pure function: does not mutate the input array.
 */
export function filterAndSortProblems(problems, filters, progressState = {}) {
  const {
    search = '',
    difficulty = 'all',
    topicId = 'all',
    status = 'all',
    sortBy = 'default',
  } = filters;

  const trimmedQuery = search.trim().toLowerCase();

  // 1. FILTERING
  const filtered = problems.filter((problem) => {
    // Search filter (title & concept, case-insensitive)
    if (trimmedQuery) {
      const titleMatch = problem.name?.toLowerCase().includes(trimmedQuery);
      const conceptMatch = problem.concept?.toLowerCase().includes(trimmedQuery);
      const topicMatch = problem.topicName?.toLowerCase().includes(trimmedQuery);
      const sectionMatch = problem.sectionTitle?.toLowerCase().includes(trimmedQuery);
      if (!titleMatch && !conceptMatch && !topicMatch && !sectionMatch) {
        return false;
      }
    }

    // Difficulty filter
    if (difficulty !== 'all') {
      if (problem.tag?.toLowerCase() !== difficulty.toLowerCase()) {
        return false;
      }
    }

    // Topic filter
    if (topicId !== 'all') {
      if (problem.topicId !== topicId) {
        return false;
      }
    }

    // Status filter (from Redux progress state)
    if (status !== 'all') {
      const currentStatus = progressState[problem.topicId]?.[problem.name] || 'none';
      if (status === 'solved' && currentStatus !== 'solved') {
        return false;
      }
      if (status === 'attempted' && currentStatus !== 'attempted') {
        return false;
      }
      if (status === 'unsolved' && (currentStatus === 'solved' || currentStatus === 'attempted')) {
        return false;
      }
    }

    return true;
  });

  // 2. SORTING (without mutating the filtered array)
  if (sortBy === 'default') {
    return filtered;
  }

  const sorted = [...filtered];

  if (sortBy === 'title-asc') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'title-desc') {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortBy === 'diff-asc') {
    sorted.sort((a, b) => {
      const weightA = DIFFICULTY_WEIGHT[a.tag?.toLowerCase()] || 0;
      const weightB = DIFFICULTY_WEIGHT[b.tag?.toLowerCase()] || 0;
      return weightA - weightB;
    });
  } else if (sortBy === 'diff-desc') {
    sorted.sort((a, b) => {
      const weightA = DIFFICULTY_WEIGHT[a.tag?.toLowerCase()] || 0;
      const weightB = DIFFICULTY_WEIGHT[b.tag?.toLowerCase()] || 0;
      return weightB - weightA;
    });
  }

  return sorted;
}
