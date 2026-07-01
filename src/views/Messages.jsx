import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { MessageSquare, ChevronRight } from 'lucide-react';
import * as chatApi from '../api/chat';

function timeLabel(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString([], { day: '2-digit', month: 'short' });
}

export const Messages = () => {
  const { navigateTo } = useAppContext();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setThreads(await chatApi.getThreads());
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container" style={{ padding: '0' }}>
        <div className="messages-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Messages</h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Conversations with matched users.</p>
        </div>

        <div className="messages-list">
          {loading ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-gray)' }}>Loading…</div>
          ) : threads.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-gray)' }}>
              <MessageSquare size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No messages yet.</p>
              <p style={{ fontSize: '0.8rem' }}>Conversations appear here once a claim is initiated.</p>
            </div>
          ) : (
            threads.map((t) => (
              <div key={t.match_id} className="conversation-item" onClick={() => navigateTo('chat', null, { matchId: t.match_id })} style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                <div className="avatar-placeholder" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginRight: '1rem' }}>
                  {(t.name || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{t.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{timeLabel(t.time)}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                    {t.last_message || 'Start the conversation'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '4px' }}>Item: {t.item}</div>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--text-light)', marginLeft: '0.5rem' }} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
