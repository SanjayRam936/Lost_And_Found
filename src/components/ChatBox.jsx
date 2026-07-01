import React, { useEffect, useRef, useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import * as chatApi from '../api/chat';

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// A self-contained, per-match chat box meant to be embedded inside the claim
// pages (below the OTP). Real-time via light polling (REST).
export const ChatBox = ({ matchId, heading = 'Chat', height = 280 }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const load = async () => {
    if (!matchId) return;
    try {
      setMessages(await chatApi.getMessages(matchId));
    } catch {
      // ignore transient polling errors
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  // Scroll only the chat's own list to the bottom — never the whole page.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = async (e) => {
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
    <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-alt)', fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem' }}>
        <MessageSquare size={16} color="var(--primary)" /> {heading}
      </div>

      <div ref={listRef} style={{ height, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'var(--bg-light)' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.78rem', marginTop: '1rem' }}>
            No messages yet. Use this chat to arrange where and when to meet.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.is_mine ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '85%', padding: '0.5rem 0.8rem', borderRadius: m.is_mine ? '14px 14px 0 14px' : '14px 14px 14px 0', backgroundColor: m.is_mine ? 'var(--primary)' : 'white', color: m.is_mine ? 'white' : 'var(--text-dark)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '0.85rem', lineHeight: 1.4 }}>
              {m.message}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', marginTop: '3px' }}>
              {m.is_mine ? 'You' : m.sender_name} · {formatTime(m.timestamp)}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', borderTop: '1px solid var(--border-light)', background: 'white' }}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" style={{ flex: 1, padding: '9px 14px', borderRadius: '20px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-light)', outline: 'none', fontSize: '0.85rem' }} />
        <button type="submit" disabled={!input.trim() || sending} style={{ backgroundColor: input.trim() ? 'var(--primary)' : 'var(--border-light)', color: 'white', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
          <Send size={16} style={{ marginLeft: '2px' }} />
        </button>
      </form>
    </div>
  );
};
