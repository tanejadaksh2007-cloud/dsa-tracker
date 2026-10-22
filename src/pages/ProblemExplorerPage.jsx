import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { TOPICS } from '../data';
import { selectProgressState } from '../store/progressSlice';
import { getAllRoadmapProblems, filterAndSortProblems } from '../utils/filterProblems';
import { useDebounce } from '../hooks/useDebounce';
import QuestionCard from '../components/QuestionCard';
import Input from '../components/Input';
import Select from '../components/Select';
import Pagination from '../components/Pagination';

const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'All Difficulties' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'solved', label: 'Solved' },
  { value: 'attempted', label: 'Attempted' },
  { value: 'unsolved', label: 'Unsolved' },
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Default (Roadmap Order)' },
  { value: 'title-asc', label: 'Title: A → Z' },
  { value: 'title-desc', label: 'Title: Z → A' },
  { value: 'diff-asc', label: 'Difficulty: Easy → Hard' },
  { value: 'diff-desc', label: 'Difficulty: Hard → Easy' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function ProblemExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const progressState = useSelector(selectProgressState);

  // Read initial topic from URL query if present, e.g. /problems?topic=arrays
  const initialTopic = searchParams.get('topic') || 'all';

  // Local filter, sort, and pagination states
  const [searchInput, setSearchInput] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [topicId, setTopicId] = useState(initialTopic);
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [openCards, setOpenCards] = useState({});

  // Debounce search query with 300ms delay to keep typing responsive
  const debouncedSearch = useDebounce(searchInput, 300);

  // Sync topicId if URL query changes
  useEffect(() => {
    const urlTopic = searchParams.get('topic');
    if (urlTopic && urlTopic !== topicId) {
      setTopicId(urlTopic);
    }
  }, [searchParams]);

  // Step 1: Extract all predefined roadmap questions (memoized, does not duplicate data)
  const allProblems = useMemo(() => getAllRoadmapProblems(TOPICS), []);

  // Topic filter options from the real dataset
  const topicOptions = useMemo(() => [
    { value: 'all', label: 'All Topics' },
    ...TOPICS.map((t) => ({ value: t.id, label: `${t.icon || '◈'} ${t.name}` })),
  ], []);

  // Steps 2, 3, 4: Debounced search, difficulty, topic, status filters, and sorting
  const filteredProblems = useMemo(() => {
    return filterAndSortProblems(
      allProblems,
      {
        search: debouncedSearch,
        difficulty,
        topicId,
        status,
        sortBy,
      },
      progressState
    );
  }, [allProblems, debouncedSearch, difficulty, topicId, status, sortBy, progressState]);

  // Pagination calculations based on the filtered results
  const totalResults = filteredProblems.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));

  // Step 5: Paginate the resulting list (safe slicing within clamped range)
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = totalResults === 0 ? 0 : (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);

  const paginatedProblems = useMemo(() => {
    return filteredProblems.slice(startIndex, endIndex);
  }, [filteredProblems, startIndex, endIndex]);

  // Requirement 4: Automatically return to page 1 when search, filters, sorting, or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, difficulty, topicId, status, sortBy, pageSize]);

  // Clamp current page if totalPages decreases below currentPage
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Determine if any filter or custom sort is currently active
  const hasActiveFilters = Boolean(
    searchInput.trim() ||
    difficulty !== 'all' ||
    topicId !== 'all' ||
    status !== 'all' ||
    sortBy !== 'default' ||
    pageSize !== 10
  );

  const isDebouncing = searchInput.trim() !== debouncedSearch.trim();

  // Clear all search, filter, and sorting controls (resets to page 1)
  function handleClearAll() {
    setSearchInput('');
    setDifficulty('all');
    setTopicId('all');
    setStatus('all');
    setSortBy('default');
    setPageSize(10);
    setCurrentPage(1);
    if (searchParams.get('topic')) {
      setSearchParams({});
    }
  }

  function toggleCard(key) {
    setOpenCards((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleTopicChange(newTopicId) {
    setTopicId(newTopicId);
    if (newTopicId === 'all') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('topic');
      setSearchParams(nextParams);
    } else {
      setSearchParams({ topic: newTopicId });
    }
  }

  function handlePageChange(newPage) {
    const clamped = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(clamped);
  }

  function handlePageSizeChange(newSize) {
    setPageSize(newSize);
    setCurrentPage(1);
  }

  return (
    <div className="explorer-page">
      <div className="topic-nav-row">
        <Link to="/" className="back-btn">← Back to Overview</Link>
      </div>

      <header className="explorer-hero">
        <div className="explorer-hero-left">
          <div className="th-icon">⌕</div>
          <div>
            <h1 className="th-title">Problem Explorer</h1>
            <p className="th-why">
              Search, filter, and sort across all {allProblems.length} predefined roadmap challenges.
            </p>
          </div>
        </div>
      </header>

      {/* Explorer Controls Card */}
      <section className="explorer-controls-card" aria-label="Problem Search and Filters">
        <div className="explorer-search-wrapper">
          <Input
            id="explorer-search"
            name="search"
            placeholder="Search problems by title, concept, topic, or keyword..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onClear={() => setSearchInput('')}
            className="explorer-search-input"
          />
        </div>

        <div className="explorer-filters-grid">
          <Select
            id="filter-topic"
            name="topic"
            label="Topic"
            value={topicId}
            onChange={(e) => handleTopicChange(e.target.value)}
            options={topicOptions}
          />

          <Select
            id="filter-difficulty"
            name="difficulty"
            label="Difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            options={DIFFICULTY_OPTIONS}
          />

          <Select
            id="filter-status"
            name="status"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />

          <Select
            id="filter-sort"
            name="sortBy"
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={SORT_OPTIONS}
          />
        </div>

        <div className="explorer-meta-row">
          <div className="explorer-results-count">
            {totalResults === 0 ? (
              <span>Showing <strong>0</strong> of {allProblems.length} problems</span>
            ) : (
              <span>
                Showing <strong>{startIndex + 1}–{endIndex}</strong> of {totalResults} problems
                {totalResults !== allProblems.length && (
                  <span className="explorer-total-unfiltered"> ({allProblems.length} total)</span>
                )}
              </span>
            )}
            {isDebouncing && <span className="explorer-debouncing-badge"> updating...</span>}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="explorer-clear-btn"
              onClick={handleClearAll}
              aria-label="Clear all filters and reset sorting"
            >
              ✕ Clear all filters
            </button>
          )}
        </div>
      </section>

      {/* Step 6: Problems List or Empty State */}
      <section className="explorer-results-section" aria-label="Roadmap Problems">
        {filteredProblems.length === 0 ? (
          <div className="explorer-empty-box">
            <div className="explorer-empty-icon">🔍</div>
            <h2 className="explorer-empty-title">No matching problems found</h2>
            <p className="explorer-empty-desc">
              {searchInput
                ? `No roadmap problems matched your query "${searchInput}".`
                : 'No problems match the current filter combination.'}
            </p>
            <button
              type="button"
              className="action-btn btn-primary"
              onClick={handleClearAll}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="explorer-cards-list">
              {paginatedProblems.map((problem) => {
                const cardKey = `${problem.topicId}-${problem.name}`;
                return (
                  <QuestionCard
                    key={cardKey}
                    topicId={problem.topicId}
                    question={problem}
                    cardKey={cardKey}
                    isOpen={!!openCards[cardKey]}
                    onToggle={() => toggleCard(cardKey)}
                  />
                );
              })}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalResults={totalResults}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </section>
    </div>
  );
}
