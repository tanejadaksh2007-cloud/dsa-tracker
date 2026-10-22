import { useDailyChallenge } from '../hooks/useDailyChallenge';

export default function DailyChallengeCard() {
  const { challenge, isLoading, error, refetch } = useDailyChallenge();

  return (
    <div className="daily-challenge-card" aria-label="Daily Coding Challenge">
      <div className="dcc-header">
        <div className="dcc-header-title">
          <span className="dcc-icon">⚡</span>
          <div>
            <h2 className="dcc-title">Daily Coding Challenge</h2>
            <div className="dcc-sub">Live LeetCode Challenge &bull; Practice Every Day</div>
          </div>
        </div>

        <button
          type="button"
          className="dcc-refresh-btn"
          onClick={refetch}
          disabled={isLoading}
          aria-label="Refresh daily challenge"
          title="Refresh daily challenge"
        >
          <span className={`dcc-refresh-icon ${isLoading ? 'spinning' : ''}`}>⟳</span>
          <span className="dcc-refresh-label">{isLoading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      {isLoading && (
        <div className="dcc-loading-state" role="status" aria-live="polite">
          <div className="dcc-skeleton-row">
            <div className="dcc-skeleton dcc-sk-title" />
            <div className="dcc-skeleton dcc-sk-badge" />
          </div>
          <div className="dcc-skeleton dcc-sk-tags" />
          <div className="dcc-loading-text">Fetching today&apos;s coding challenge with Axios...</div>
        </div>
      )}

      {!isLoading && error && (
        <div className="dcc-error-state" role="alert">
          <div className="dcc-error-content">
            <span className="dcc-error-icon">⚠️</span>
            <div>
              <div className="dcc-error-title">Unable to load daily challenge</div>
              <p className="dcc-error-msg">{error}</p>
            </div>
          </div>
          <button
            type="button"
            className="dcc-retry-btn"
            onClick={refetch}
            aria-label="Retry loading challenge"
          >
            Retry Challenge
          </button>
        </div>
      )}

      {!isLoading && !error && challenge && (
        <div className="dcc-body">
          <div className="dcc-content-row">
            <div className="dcc-left">
              <div className="dcc-problem-name">
                {challenge.id ? `#${challenge.id} ` : ''}
                {challenge.title}
              </div>
              <div className="dcc-meta-row">
                {challenge.difficulty && (
                  <span
                    className={`q-tag t-${challenge.difficulty.toLowerCase()}`}
                  >
                    {challenge.difficulty}
                  </span>
                )}
                {challenge.date && (
                  <span className="dcc-date">Date: {challenge.date}</span>
                )}
                {challenge.isPaidOnly && (
                  <span className="dcc-paid-badge">Premium Only</span>
                )}
              </div>
            </div>

            {challenge.url && (
              <a
                href={challenge.url}
                target="_blank"
                rel="noopener noreferrer"
                className="dcc-link-btn"
                aria-label={`Open ${challenge.title} on LeetCode in a new tab`}
              >
                Solve on LeetCode ↗
              </a>
            )}
          </div>

          {challenge.tags && challenge.tags.length > 0 && (
            <div className="dcc-tags-list" aria-label="Problem topics">
              {challenge.tags.map((tag) => (
                <span key={tag} className="dcc-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
