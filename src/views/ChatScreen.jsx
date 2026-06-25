import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Send, Paperclip, Image as ImageIcon, MapPin, Gift, AlertTriangle, MoreVertical, Trash2, Video, FileText, Camera } from 'lucide-react';

export const ChatScreen = () => {
  const { navigateTo, currentParams, chatMessages, chatInput, setChatInput, handleSendMessage, handleSendAttachment, handleDeleteMessage, imageInputRef, fileInputRef } = useAppContext();
  const messagesEndRef = useRef(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', backgroundColor: 'var(--bg-light)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', backgroundColor: 'white', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => navigateTo('messages')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', marginRight: '0.5rem' }}>
          <ArrowLeft size={20} color="var(--text-dark)" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '0.75rem', position: 'relative' }}>
            S
            <div style={{ position: 'absolute', bottom: '0px', right: '0px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', border: '2px solid white' }}></div>
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-dark)' }}>Sarah M.</div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600' }}>Online</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#FEF3C7', color: '#92400E', fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', borderBottom: '1px solid #FDE68A' }}>
        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Privacy Notice:</strong> For your security, do not share personal contact information or addresses until the verified handover process is complete.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.75rem', margin: '1rem 0' }}>Today</div>
        
        {chatMessages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.type === 'sent' ? 'flex-end' : 'flex-start' }}>
            {msg.isSystem ? (
              <div style={{ backgroundColor: '#EEF2FF', color: 'var(--primary)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px dashed var(--primary)' }}>
                <Gift size={16} /> {msg.text}
                {msg.type === 'sent' && <Trash2 size={14} style={{ cursor: 'pointer', marginLeft: '8px' }} onClick={() => handleDeleteMessage(msg.id)} />}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: msg.type === 'sent' ? 'row-reverse' : 'row' }}>
                <div style={{ maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: msg.type === 'sent' ? '16px 16px 0 16px' : '16px 16px 16px 0', backgroundColor: msg.type === 'sent' ? 'var(--primary)' : 'white', color: msg.type === 'sent' ? 'white' : 'var(--text-dark)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontSize: '0.9rem', lineHeight: '1.4', position: 'relative' }}>
                  {msg.text}
                </div>
                {msg.type === 'sent' && (
                  <button onClick={() => handleDeleteMessage(msg.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', opacity: 0.7, padding: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
            <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {msg.time}
              {msg.type === 'sent' && msg.read && <span style={{ color: 'var(--primary)' }}>✓✓</span>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '1rem', backgroundColor: 'white', borderTop: '1px solid var(--border-light)', position: 'relative' }}>
        
        {showAttachMenu && (
          <div style={{ position: 'absolute', bottom: '70px', left: '16px', backgroundColor: 'white', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 20 }}>
            <button type="button" onClick={() => { handleSendAttachment('photo'); setShowAttachMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-dark)', borderRadius: '8px', width: '100%', textAlign: 'left' }}><Camera size={16} color="#3B82F6" /> Photos</button>
            <button type="button" onClick={() => { handleSendAttachment('video'); setShowAttachMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-dark)', borderRadius: '8px', width: '100%', textAlign: 'left' }}><Video size={16} color="#8B5CF6" /> Videos</button>
            <button type="button" onClick={() => { handleSendAttachment('document'); setShowAttachMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-dark)', borderRadius: '8px', width: '100%', textAlign: 'left' }}><FileText size={16} color="#F59E0B" /> Documents</button>
            <button type="button" onClick={() => { handleSendAttachment('reward'); setShowAttachMenu(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-dark)', borderRadius: '8px', width: '100%', textAlign: 'left' }}><Gift size={16} color="#10B981" /> Send Reward</button>
          </div>
        )}

        <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button type="button" onClick={() => setShowAttachMenu(!showAttachMenu)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: showAttachMenu ? 'var(--primary)' : 'var(--text-gray)' }}><Paperclip size={20} /></button>
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '10px 16px', borderRadius: '20px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-light)', outline: 'none' }} />
          <button type="submit" disabled={!chatInput.trim()} style={{ backgroundColor: chatInput.trim() ? 'var(--primary)' : 'var(--border-light)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: chatInput.trim() ? 'pointer' : 'default', transition: 'background-color 0.2s' }}>
            <Send size={18} style={{ marginLeft: '2px' }} />
          </button>
        </form>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => handleSendAttachment('file', e)} />
        <input type="file" accept="image/*" ref={imageInputRef} style={{ display: 'none' }} onChange={(e) => handleSendAttachment('image', e)} />
      </div>
    </div>
  );
};
