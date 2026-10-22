/**
 * Computes the windowed array of page numbers and ellipsis tokens.
 * E.g. [1, 2, 3, 4, 5, '...', 9] or [1, '...', 4, 5, 6, '...', 9]
 */
export function getPaginationRange(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If near the beginning
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  // If near the end
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  // In the middle
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

/**
 * Formats a clean human-readable result range text.
 * E.g. "Showing 11–20 of 90 problems" or "Showing 0 of 0 problems"
 */
export function getResultRangeText(totalResults, currentPage, pageSize) {
  if (totalResults === 0) {
    return 'Showing 0 of 0 problems';
  }
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalResults);
  return `Showing ${start}–${end} of ${totalResults} problems`;
}
