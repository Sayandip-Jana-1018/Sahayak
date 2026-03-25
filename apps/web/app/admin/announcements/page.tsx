'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Megaphone, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { apiRequest, useApiClient } from '@/lib/api';

interface Announcement {
  id: string;
  title: string;
  body: string;
  target: string;
  priority: string;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const { getToken } = useAuth();
  const api = useApiClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [priority, setPriority] = useState('info');
  const [sending, setSending] = useState(false);

  const { data, isLoading, refetch } = useQuery<{ announcements: Announcement[] }>({
    queryKey: ['admin-announcements'],
    queryFn: () => apiRequest<{ announcements: Announcement[] }>('/api/admin/announcements', getToken),
  });

  const handleSend = async () => {
    if (!title || !body) return;
    setSending(true);
    try {
      await api.post('/api/admin/announcements', { title, body, target, priority });
      setTitle(''); setBody('');
      refetch();
    } catch { /* handle */ } finally { setSending(false); }
  };

  return (
    <div className="aa">
      <div className="aa__head">
        <h2 className="aa__title"><Megaphone size={22} /> Announcements</h2>
        <p className="aa__sub">Compose and broadcast messages to users</p>
      </div>

      {/* Compose */}
      <div className="aa__compose">
        <h3 className="aa__compose-title">New Announcement</h3>
        <div className="aa__field"><label>Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" /></div>
        <div className="aa__field"><label>Message</label><textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..." rows={3} /></div>
        <div className="aa__field-row">
          <div className="aa__field"><label>Target</label>
            <select value={target} onChange={e => setTarget(e.target.value)}>
              <option value="all">All Users</option><option value="role:ngo_admin">NGO Admins</option><option value="role:family">Family Members</option>
            </select>
          </div>
          <div className="aa__field"><label>Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="info">Info</option><option value="warning">Warning</option><option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <button className="aa__send" onClick={handleSend} disabled={!title || !body || sending}>
          {sending ? <><Loader2 size={16} className="aa__spin" /> Sending...</> : <><Send size={16} /> Broadcast</>}
        </button>
      </div>

      {/* History */}
      <h3 className="aa__section-title">History</h3>
      {isLoading ? <div className="aa__skel" /> : (data?.announcements || []).length === 0 ? (
        <div className="aa__empty"><Megaphone size={28} /><p>No announcements yet</p></div>
      ) : (
        <div className="aa__list">
          {(data?.announcements || []).map(a => (
            <div key={a.id} className="aa__item">
              <div className="aa__item-top">
                <span className={`aa__priority aa__priority--${a.priority}`}>{a.priority}</span>
                <span className="aa__item-date">{new Date(a.createdAt).toLocaleString()}</span>
              </div>
              <h4 className="aa__item-title">{a.title}</h4>
              <p className="aa__item-body">{a.body}</p>
              <span className="aa__item-target">Target: {a.target}</span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .aa { padding: 8px 0; }
        .aa__head { text-align: center; margin-bottom: 20px; }
        .aa__title { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: clamp(20px, 3vw, 26px) !important; font-weight: 800 !important; color: var(--text-primary); font-family: var(--font-display); margin: 0 0 6px; }
        .aa__sub { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .aa__compose { max-width: 500px; margin: 0 auto 28px; padding: 20px; border-radius: 18px; background: var(--glass-bg); border: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 12px; }
        .aa__compose-title { font-size: 14px; font-weight: 700; color: var(--text-primary); margin: 0; text-align: center; }
        .aa__field { display: flex; flex-direction: column; gap: 4px; }
        .aa__field label { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; }
        .aa__field input, .aa__field textarea, .aa__field select { padding: 10px 14px; border-radius: 10px; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); font-size: 14px; outline: none; resize: vertical; }
        .aa__field input::placeholder, .aa__field textarea::placeholder { color: var(--text-muted); }
        .aa__field-row { display: flex; gap: 12px; }
        .aa__field-row .aa__field { flex: 1; }
        .aa__send { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 24px; border-radius: 12px; background: linear-gradient(135deg, #EF4444, #F97316); color: #fff; border: none; cursor: pointer; font-size: 14px; font-weight: 700; transition: all 0.2s; }
        .aa__send:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(239,68,68,0.3); }
        .aa__send:disabled { opacity: 0.5; cursor: not-allowed; }
        @keyframes aaSpin { to { transform: rotate(360deg); } }
        :global(.aa__spin) { animation: aaSpin 0.8s linear infinite; }
        .aa__section-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 14px; text-align: center; }
        .aa__list { display: flex; flex-direction: column; gap: 10px; }
        .aa__item { padding: 16px; border-radius: 14px; background: var(--glass-bg); border: 1px solid var(--glass-border); }
        .aa__item-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .aa__priority { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; }
        .aa__priority--info { background: rgba(99,102,241,0.1); color: #6366F1; }
        .aa__priority--warning { background: rgba(245,158,11,0.1); color: #F59E0B; }
        .aa__priority--critical { background: rgba(239,68,68,0.1); color: #EF4444; }
        .aa__item-date { font-size: 11px; color: var(--text-muted); }
        .aa__item-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
        .aa__item-body { font-size: 13px; color: var(--text-secondary); margin: 0 0 6px; line-height: 1.4; }
        .aa__item-target { font-size: 11px; color: var(--text-muted); }
        .aa__skel { height: 80px; border-radius: 14px; background: var(--glass-bg); animation: skelPulse 1.5s ease infinite; }
        @keyframes skelPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.2; } }
        .aa__empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px 20px; color: var(--text-muted); }
        .aa__empty p { font-size: 14px; font-weight: 600; color: var(--text-secondary); margin: 0; }
        @media (max-width: 500px) { .aa__field-row { flex-direction: column; } }
      `}</style>
    </div>
  );
}
