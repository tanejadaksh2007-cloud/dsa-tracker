import { useRef } from 'react';

// Syllabus (Lectures 61-66) & Feature 3: Reusable accessible Tabs component
export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  ariaLabel = 'Tab list',
  className = '',
}) {
  const tabRefs = useRef([]);

  function handleKeyDown(event, index) {
    const enabledIndices = tabs
      .map((t, i) => (!t.disabled ? i : null))
      .filter((i) => i !== null);

    const currentPos = enabledIndices.indexOf(index);
    if (currentPos === -1) return;

    let targetIndex = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const nextPos = (currentPos + 1) % enabledIndices.length;
      targetIndex = enabledIndices[nextPos];
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const prevPos = (currentPos - 1 + enabledIndices.length) % enabledIndices.length;
      targetIndex = enabledIndices[prevPos];
    } else if (event.key === 'Home') {
      event.preventDefault();
      targetIndex = enabledIndices[0];
    } else if (event.key === 'End') {
      event.preventDefault();
      targetIndex = enabledIndices[enabledIndices.length - 1];
    }

    if (targetIndex !== null) {
      tabRefs.current[targetIndex]?.focus();
      onChange(tabs[targetIndex].id);
    }
  }

  return (
    <div
      className={`tabs-container ${className}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.id;
        const isDisabled = Boolean(tab.disabled);

        return (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[idx] = el)}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={isDisabled}
            tabIndex={isActive ? 0 : -1}
            disabled={isDisabled}
            className={`tab-btn ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
            onClick={() => {
              if (!isDisabled) onChange(tab.id);
            }}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            {tab.icon && <span className="tab-icon" aria-hidden="true">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`tab-count ${isActive ? 'active' : ''}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
