import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchUnread = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnread(res.data.count);
    } catch { /* ignore */ }
  };

  const fetchRecent = async () => {
    try {
      const res = await api.get('/notifications?limit=5');
      setNotifications(res.data.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) fetchRecent();
  }, [open]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" size="sm" className="relative" onClick={() => setOpen(!open)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 min-w-4 flex items-center justify-center px-1">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-card border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b flex justify-between items-center">
            <span className="font-semibold text-sm">Notifications</span>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/notifications')}>View All</Button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No notifications</p>}
            {notifications.map((n) => (
              <div key={n._id} className={cn('p-3 border-b last:border-0 hover:bg-accent/50 cursor-pointer text-sm', !n.read && 'bg-accent/30')} onClick={() => { markRead(n._id); if (n.link) navigate(n.link); }}>
                <p className="font-medium">{n.title}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
