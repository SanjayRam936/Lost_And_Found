import React from 'react';
import { Sparkles, Bell, Gift, ShieldAlert, KeyRound, MessageSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ICONS = {
  MATCH_FOUND: { icon: Sparkles, bg: '#EEF2FF', color: '#6366F1' },
  CLAIM_UPDATE: { icon: MessageSquare, bg: '#ECFEFF', color: '#0891B2' },
  OTP_SENT: { icon: KeyRound, bg: '#FEF3C7', color: '#D97706' },
  REWARD_RECEIVED: { icon: Gift, bg: '#D1FAE5', color: '#047857' },
  ESCALATION_ALERT: { icon: ShieldAlert, bg: '#FEE2E2', color: '#DC2626' },
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

export const Notifications = () => {
  const { notifications, fetchNotifications, markAllNotificationsRead } = useAppContext();

  // Refresh on open, then mark everything read so the badge clears.
  React.useEffect(() => {
    (async () => {
      await fetchNotifications();
      await markAllNotificationsRead();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard-wrapper">
       <div className="dashboard-container">
          <div className="reports-header">
            <h1>Notifications</h1>
          </div>
          <div className="notification-list">
             {notifications.length === 0 && (
               <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-gray)' }}>
                 <Bell size={28} style={{ marginBottom: 8, opacity: 0.5 }} />
                 <div>You're all caught up.</div>
               </div>
             )}
             {notifications.map(n => {
               const meta = ICONS[n.notification_type] || { icon: Bell, bg: '#F1F5F9', color: '#475569' };
               const Icon = meta.icon;
               return (
                 <div className={`notification-card ${n.is_read ? '' : 'notification-unread'}`} key={n.id}>
                   <div className="notif-icon-box" style={{ background: meta.bg, color: meta.color }}><Icon size={20} /></div>
                   <div className="notif-content">
                     <div className="notif-title-row">{n.title}</div>
                     <div className="notif-desc">{n.message}</div>
                     <div className="notif-desc" style={{ fontSize: '0.75rem', opacity: 0.7 }}>{timeAgo(n.created_at)}</div>
                   </div>
                 </div>
               );
             })}
          </div>
       </div>
    </div>
  );
};
