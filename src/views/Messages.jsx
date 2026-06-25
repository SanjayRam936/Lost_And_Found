import React from 'react';
import { useAppContext } from '../context/AppContext';
import { MessageSquare, Search, ChevronRight } from 'lucide-react';

export const Messages = () => {
  const { conversations, navigateTo } = useAppContext();

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container" style={{ padding: '0' }}>
        <div className="messages-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Messages</h1>
          <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>Conversations with matched users.</p>
          
          <div className="search-bar" style={{ marginTop: '1rem', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-light)' }} />
            <input type="text" placeholder="Search conversations..." style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '12px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-light)' }} />
          </div>
        </div>
        
        <div className="messages-list">
          {conversations.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-gray)' }}>
              <MessageSquare size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No messages yet.</p>
              <p style={{ fontSize: '0.8rem' }}>Matches will appear here once initiated.</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div key={conv.id} className="conversation-item" onClick={() => navigateTo('chat', null, { chatId: conv.id })} style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                <div className="avatar-placeholder" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', marginRight: '1rem', position: 'relative' }}>
                  {conv.name.charAt(0)}
                  {conv.isOnline && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981', border: '2px solid white' }}></div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{conv.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{conv.time}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: conv.unread ? 'var(--text-dark)' : 'var(--text-gray)', fontWeight: conv.unread ? '600' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{conv.lastMessage}</span>
                    {conv.unread > 0 && (
                      <span style={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 'bold' }}>{conv.unread}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '4px' }}>Item: {conv.item}</div>
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
