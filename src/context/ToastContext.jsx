import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const recentToastsRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    if (!message || !message.trim()) return;

    // Deduplication check: prevent identical toast if triggered within 1 second
    const dedupeKey = `${type}:${message.trim()}`;
    const now = Date.now();
    const lastSeen = recentToastsRef.current.get(dedupeKey);
    if (lastSeen && now - lastSeen < 1000) {
      return;
    }
    recentToastsRef.current.set(dedupeKey, now);

    const id = `${now}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast = { id, message: message.trim(), type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = useMemo(
    () => ({
      success: (msg, duration) => showToast(msg, 'success', duration),
      error: (msg, duration) => showToast(msg, 'error', duration),
      info: (msg, duration) => showToast(msg, 'info', duration),
    }),
    [showToast]
  );

  const contextValue = useMemo(
    () => ({
      toasts,
      showToast,
      toast,
      removeToast,
    }),
    [toasts, showToast, toast, removeToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
