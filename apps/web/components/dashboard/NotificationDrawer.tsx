'use client';

import { useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Pill, Smartphone, MapPin, Info, CheckCheck } from 'lucide-react';
import { useNotificationStore, type Notification } from '@/store/notificationStore';
import Link from 'next/link';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  sos: <AlertTriangle size={14} />,
  medication: <Pill size={14} />,
  device: <Smartphone size={14} />,
  location: <MapPin size={14} />,
  general: <Info size={14} />,
};

const COLOR_MAP: Record<string, string> = {
  sos: 'var(--sah-rose, #FF4B8A)',
  medication: 'var(--sah-gold, #F5C842)',
  device: 'var(--sah-indigo, #3B28CC)',
  location: 'var(--sah-jade, #00B67A)',
  general: 'var(--text-secondary)',
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationDrawer({ isOpen, onClose }: Props) {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotificationStore();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay listener to avoid immediate close from the bell click
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div ref={panelRef} className="nf-pop" role="dialog" aria-label="Notifications">
        {/* Arrow pointer */}
        <div className="nf-pop__arrow" />

        {/* Header */}
        <div className="nf-pop__head">
          <div className="nf-pop__head-left">
            <Bell size={15} />
            <span className="nf-pop__title">Notifications</span>
            {unreadCount > 0 && <span className="nf-pop__badge">{unreadCount}</span>}
          </div>
          {unreadCount > 0 && (
            <button className="nf-pop__mark-all" onClick={markAllRead} title="Mark all read">
              <CheckCheck size={14} />
            </button>
          )}
        </div>

        {/* List */}
        <div className="nf-pop__list">
          {notifications.length === 0 ? (
            <div className="nf-pop__empty">
              <Bell size={24} />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.slice(0, 8).map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={() => markRead(n.id)} onClose={onClose} />
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="nf-pop__foot">
            <button className="nf-pop__clear" onClick={clearAll}>Clear all</button>
          </div>
        )}
      </div>

      <style jsx global>{`
        .nf-pop {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 999;
          width: min(340px, calc(100vw - 40px));
          max-height: 440px;
          display: flex;
          flex-direction: column;
          background: var(--glass-bg, rgba(15, 15, 30, 0.88));
          backdrop-filter: blur(32px) saturate(160%);
          -webkit-backdrop-filter: blur(32px) saturate(160%);
          border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
          border-radius: 16px;
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.05) inset;
          animation: nfPopIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          overflow: hidden;
        }

        @keyframes nfPopIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .nf-pop__arrow {
          position: absolute;
          top: -6px;
          right: 24px;
          width: 12px;
          height: 12px;
          background: var(--glass-bg, rgba(15, 15, 30, 0.88));
          border-top: 1px solid var(--glass-border);
          border-left: 1px solid var(--glass-border);
          transform: rotate(45deg);
          z-index: 1;
        }

        .nf-pop__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid var(--glass-border);
        }

        .nf-pop__head-left {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-primary);
        }

        .nf-pop__title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .nf-pop__badge {
          font-size: 10px;
          font-weight: 700;
          background: var(--sah-rose, #FF4B8A);
          color: #fff;
          padding: 1px 6px;
          border-radius: 8px;
          min-width: 16px;
          text-align: center;
        }

        .nf-pop__mark-all {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          border: none;
          background: var(--glass-bg);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nf-pop__mark-all:hover {
          background: var(--glass-bg-hover, rgba(255, 255, 255, 0.08));
          color: var(--text-primary);
        }

        .nf-pop__list {
          flex: 1;
          overflow-y: auto;
          padding: 6px 8px;
        }

        .nf-pop__list::-webkit-scrollbar { width: 3px; }
        .nf-pop__list::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 3px; }

        .nf-pop__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 40px 16px;
          color: var(--text-muted);
          font-size: 13px;
        }

        /* Notification Item */
        .nf-item {
          display: flex;
          gap: 10px;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 2px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .nf-item:hover {
          background: var(--glass-bg-hover, rgba(255, 255, 255, 0.04));
          border-color: var(--glass-border);
        }

        .nf-item--unread {
          background: rgba(var(--sah-accent-1-rgb, 99, 102, 241), 0.04);
        }

        .nf-item__icon {
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nf-item__body { flex: 1; min-width: 0; }

        .nf-item__title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1px;
          line-height: 1.3;
        }

        .nf-item__text {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .nf-item__time {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 3px;
        }

        .nf-item__dot {
          flex-shrink: 0;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-top: 4px;
        }

        .nf-pop__foot {
          padding: 10px 14px;
          border-top: 1px solid var(--glass-border);
          text-align: center;
        }

        .nf-pop__clear {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .nf-pop__clear:hover {
          color: var(--sah-rose, #FF4B8A);
        }

        /* Mobile: position below bottom of screen, wider */
        @media (max-width: 768px) {
          .nf-pop {
            top: auto;
            bottom: 72px;
            right: 12px;
            left: 12px;
            width: auto;
          }
          .nf-pop__arrow { display: none; }
        }
      `}</style>
    </>
  );
}

function NotificationItem({ notification: n, onRead, onClose }: { notification: Notification; onRead: () => void; onClose: () => void }) {
  const color = COLOR_MAP[n.type] || COLOR_MAP.general;
  const icon = ICON_MAP[n.type] || ICON_MAP.general;

  const handleClick = () => {
    if (!n.read) onRead();
    onClose();
  };

  const inner = (
    <div className={`nf-item ${!n.read ? 'nf-item--unread' : ''}`} onClick={handleClick}>
      <div className="nf-item__icon" style={{ background: `${color}15`, color }}>
        {icon}
      </div>
      <div className="nf-item__body">
        <div className="nf-item__title">{n.title}</div>
        <div className="nf-item__text">{n.body}</div>
        <div className="nf-item__time">{timeAgo(n.timestamp)}</div>
      </div>
      {!n.read && <div className="nf-item__dot" style={{ background: color }} />}
    </div>
  );

  if (n.link) {
    return <Link href={n.link} style={{ textDecoration: 'none' }}>{inner}</Link>;
  }
  return inner;
}
