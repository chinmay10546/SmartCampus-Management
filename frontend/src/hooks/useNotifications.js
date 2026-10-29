import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsAPI } from '../services/api';

// Shared event bus so Notifications page can tell the header badge to refresh
const listeners = new Set();
export function subscribeToNotifRefresh(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
export function triggerNotifRefresh() {
  listeners.forEach((fn) => fn());
}

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(() => {
    notificationsAPI.unread()
      .then((res) => {
        const d = res.data;
        // Handle multiple response shapes: array, { count }, { unread_count }
        if (Array.isArray(d)) setUnreadCount(d.length);
        else if (typeof d?.count === 'number') setUnreadCount(d.count);
        else if (typeof d?.unread_count === 'number') setUnreadCount(d.unread_count);
        else setUnreadCount(0);
      })
      .catch(() => { /* silently swallow — don't spam errors for background poll */ });
  }, []);

  useEffect(() => {
    fetchUnread();
    const iv = setInterval(fetchUnread, 30000);

    // ── FIX: subscribe to manual refresh triggers from the Notifications page
    const unsub = subscribeToNotifRefresh(fetchUnread);
    return () => {
      clearInterval(iv);
      unsub();
    };
  }, [fetchUnread]);

  return { unreadCount, refreshUnread: fetchUnread };
}
