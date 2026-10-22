import { useMemo } from 'react';
import { getPaginationRange, getResultRangeText } from '../utils/paginationUtils';

export { getPaginationRange, getResultRangeText };

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalResults = 0,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  className = '',
}) {
  const pageRange = useMemo(
    () => getPaginationRange(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const rangeText = useMemo(
    () => getResultRangeText(totalResults, currentPage, pageSize),
    [totalResults, currentPage, pageSize]
  );

  if (totalResults === 0) {
    return null;
  }

  return (
    <nav className={`pagination-container ${className}`} aria-label="Problems pagination">
      <div className="pagination-summary">
        <span className="pagination-range-text">{rangeText}</span>
        <span className="pagination-page-indicator">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
      </div>

      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn pagination-prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          ‹ Prev
        </button>

        <div className="pagination-numbers" role="navigation" aria-label="Page navigation">
          {pageRange.map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="pagination-ellipsis" aria-hidden="true">
                  &hellip;
                </span>
              );
            }
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                className={`pagination-num-btn ${isActive ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="pagination-btn pagination-next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          Next ›
        </button>
      </div>

      <div className="pagination-size-wrapper">
        <label htmlFor="pagination-page-size" className="pagination-size-label">
          Per page:
        </label>
        <select
          id="pagination-page-size"
          className="pagination-size-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="Problems per page"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
