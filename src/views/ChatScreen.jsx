import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import * as chatApi from '../api/chat';

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const ChatScreen = () => {
  const { navigateTo, currentParams } = useAppContext();
  const matchId = currentParams?.matchId;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const load = async () => {
    if (!matchId) return;
    try {
      setMessages(await chatApi.getMessages(matchId));
    } catch {
      // ignore transient errors during polling
    }
  };

  // Initial load + light polling (REST). WebSocket upgrade is a later step.
  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const msg = await chatApi.sendMessage(matchId, text);
      setMessages((prev) => [...prev, msg]);
      setInput('');
    } catch {
      // keep the text so the user can retry
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: 'calc(100vh - 200px)', backgroundColor: 'var(--bg-light)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigateTo('messages')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', marginRight: '0.5rem' }}>
          <ArrowLeft size={20} color="var(--text-dark)" />
        </button>
        <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-dark)' }}>Handover Chat</div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', borderBottom: '1px solid #FDE68A' }}>
        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div><strong>Privacy Notice:</strong> Arrange the handover here. Do not share extra personal details until you meet to exchange the item and OTP.</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.8rem', marginTop: '2rem' }}>
            No messages yet. Say hello to arrange the handover.
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.is_mine ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: msg.is_mine ? '16px 16px 0 16px' : '16px 16px 16px 0', backgroundColor: msg.is_mine ? 'var(--primary)' : 'white', color: msg.is_mine ? 'white' : 'var(--text-dark)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '0.9rem', lineHeight: '1.4' }}>
              {msg.message}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '4px' }}>
              {msg.is_mine ? 'You' : msg.sender_name} · {formatTime(msg.timestamp)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '1rem', backgroundColor: 'white', borderTop: '1px solid var(--border-light)' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '10px 16px', borderRadius: '20px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-light)', outline: 'none' }} />
          <button type="submit" disabled={!input.trim() || sending} style={{ backgroundColor: input.trim() ? 'var(--primary)' : 'var(--border-light)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default' }}>
            <Send size={18} style={{ marginLeft: '2px' }} />
          </button>
        </form>
      </div>
    </div>
  );
};
