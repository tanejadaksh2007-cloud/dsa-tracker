import { useState, useRef, useEffect } from 'react';

// Syllabus (Lectures 61-66) & Feature 3: Reusable accessible Dropdown Action Menu
export default function DropdownMenu({
  trigger,
  items = [],
  align = 'right',
  ariaLabel = 'Action menu',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const itemRefs = useRef([]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle Escape key and keyboard navigation within the menu
  function handleKeyDown(event) {
    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(true);
        setTimeout(() => itemRefs.current[0]?.focus(), 0);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    const enabledIndices = items
      .map((item, idx) => (!item.disabled ? idx : null))
      .filter((idx) => idx !== null);

    const activeEl = document.activeElement;
    const currentIndex = itemRefs.current.indexOf(activeEl);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextPos = (enabledIndices.indexOf(currentIndex) + 1) % enabledIndices.length;
      itemRefs.current[enabledIndices[nextPos]]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevPos =
        (enabledIndices.indexOf(currentIndex) - 1 + enabledIndices.length) % enabledIndices.length;
      itemRefs.current[enabledIndices[prevPos]]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      itemRefs.current[enabledIndices[0]]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      itemRefs.current[enabledIndices[enabledIndices.length - 1]]?.focus();
    } else if (event.key === 'Tab') {
      // Close menu if user tabs out
      setIsOpen(false);
    }
  }

  function handleItemClick(item) {
    if (item.disabled) return;
    setIsOpen(false);
    item.onClick();
    triggerRef.current?.focus();
  }

  return (
    <div
      ref={containerRef}
      className={`dropdown-menu-wrapper ${className}`}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={triggerRef}
        tabIndex={0}
        role="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className="dropdown-trigger-box"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
      >
        {trigger}
      </div>

      {isOpen && (
        <ul
          className={`dropdown-popover-menu align-${align}`}
          role="menu"
          aria-label={ariaLabel}
        >
          {items.map((item, idx) => (
            <li key={item.label} role="none">
              <button
                ref={(el) => (itemRefs.current[idx] = el)}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={`dropdown-menu-item ${item.isDanger ? 'item-danger' : ''} ${item.disabled ? 'disabled' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                {item.icon && <span className="item-icon" aria-hidden="true">{item.icon}</span>}
                <span className="item-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
