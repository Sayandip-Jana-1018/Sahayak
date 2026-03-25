'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { BookOpen, Plus, Trash2, Hospital, Phone, MapPin, Building2 } from 'lucide-react';
import { useState } from 'react';
import { apiRequest, useApiClient } from '@/lib/api';

interface ContentItem {
  id: string;
  category: string;
  name: string;
  phone: string | null;
  address: string | null;
  state: string | null;
}

const CATEGORIES = [
  { value: 'hospitals', label: 'Hospitals', icon: Hospital, color: '#EF4444' },
  { value: 'government_offices', label: 'Govt. Offices', icon: Building2, color: '#6366F1' },
  { value: 'emergency_numbers', label: 'Emergency', icon: Phone, color: '#F59E0B' },
  { value: 'social_services', label: 'Social Services', icon: MapPin, color: '#10B981' },
];

export default function StudioContentPage() {
  const { getToken } = useAuth();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('hospitals');
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ category: 'hospitals', name: '', phone: '', address: '', state: '' });

  const { data, isLoading } = useQuery<{ items: ContentItem[] }>({
    queryKey: ['studio-content'],
    queryFn: () => apiRequest<{ items: ContentItem[] }>('/api/studio/content', getToken),
  });

  const addMutation = useMutation({
    mutationFn: () => api.post('/api/studio/content', newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio-content'] });
      setShowAdd(false);
      setNewItem({ category: activeCategory, name: '', phone: '', address: '', state: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/studio/content/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studio-content'] }),
  });

  const items = (data?.items || []).filter(i => i.category === activeCategory);

  return (
    <div className="sc">
      <div className="sc__head">
        <h2 className="sc__title"><BookOpen size={22} /> Content Library</h2>
        <p className="sc__sub">Local references for your region</p>
      </div>

      {/* Category Tabs */}
      <div className="sc__tabs">
        {CATEGORIES.map(cat => (
          <button key={cat.value}
            className={`sc__tab ${activeCategory === cat.value ? 'sc__tab--active' : ''}`}
            onClick={() => { setActiveCategory(cat.value); setNewItem(p => ({ ...p, category: cat.value })); }}
            style={{ '--tab-color': cat.color } as any}>
            <cat.icon size={14} /> {cat.label}
          </button>
        ))}
      </div>

      <div className="sc__toolbar">
        <button className="sc__add-btn" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} /> {showAdd ? 'Cancel' : 'Add Entry'}
        </button>
      </div>

      {showAdd && (
        <div className="sc__form">
          <div className="sc__form-row">
            <div className="sc__field">
              <label>Name</label>
              <input placeholder="Hospital name, office name..." value={newItem.name}
                onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="sc__field">
              <label>Phone</label>
              <input placeholder="Phone number" value={newItem.phone}
                onChange={e => setNewItem(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
          <div className="sc__field">
            <label>Address</label>
            <input placeholder="Full address" value={newItem.address}
              onChange={e => setNewItem(p => ({ ...p, address: e.target.value }))} />
          </div>
          <div className="sc__field">
            <label>State</label>
            <input placeholder="State" value={newItem.state}
              onChange={e => setNewItem(p => ({ ...p, state: e.target.value }))} />
          </div>
          <button className="sc__save-btn" onClick={() => addMutation.mutate()}
            disabled={!newItem.name || addMutation.isPending}>
            {addMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="sc__grid">{[1,2,3].map(i => <div key={i} className="sc__skel" />)}</div>
      ) : items.length === 0 ? (
        <div className="sc__empty">
          <BookOpen size={28} />
          <p>No entries in this category</p>
        </div>
      ) : (
        <div className="sc__grid">
          {items.map(item => (
            <div key={item.id} className="sc__item">
              <div className="sc__item-top">
                <h4 className="sc__item-name">{item.name}</h4>
                <button className="sc__item-del" onClick={() => deleteMutation.mutate(item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
              {item.phone && <span className="sc__item-phone"><Phone size={12} /> {item.phone}</span>}
              {item.address && <span className="sc__item-addr"><MapPin size={12} /> {item.address}</span>}
              {item.state && <span className="sc__item-state">{item.state}</span>}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .sc { padding: 8px 0; }
        .sc__head { text-align: center; margin-bottom: 20px; }
        .sc__title {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: clamp(20px, 3vw, 26px) !important; font-weight: 800 !important;
          color: var(--text-primary); font-family: var(--font-display); margin: 0 0 6px;
        }
        .sc__sub { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .sc__tabs { display: flex; gap: 8px; justify-content: center; margin-bottom: 16px; flex-wrap: wrap; }
        .sc__tab {
          display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px;
          background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-secondary);
          font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .sc__tab:hover { color: var(--text-primary); border-color: var(--glass-border-hover); }
        .sc__tab--active {
          background: rgba(var(--sah-accent-1-rgb), 0.08) !important;
          border-color: var(--sah-accent-1) !important;
          color: var(--sah-accent-1) !important;
        }
        .sc__toolbar { display: flex; justify-content: center; margin-bottom: 16px; }
        .sc__add-btn {
          display: flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 12px;
          background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
          color: #fff; border: none; cursor: pointer; font-size: 14px; font-weight: 700; transition: all 0.2s;
        }
        .sc__add-btn:hover { transform: translateY(-2px); }
        .sc__form {
          max-width: 500px; margin: 0 auto 20px; padding: 20px; border-radius: 16px;
          background: var(--glass-bg); border: 1px solid var(--glass-border);
          display: flex; flex-direction: column; gap: 12px;
        }
        .sc__form-row { display: flex; gap: 12px; }
        .sc__form-row .sc__field { flex: 1; }
        .sc__field { display: flex; flex-direction: column; gap: 4px; }
        .sc__field label { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; }
        .sc__field input {
          padding: 10px 14px; border-radius: 10px; background: var(--glass-bg); border: 1px solid var(--glass-border);
          color: var(--text-primary); font-size: 14px; outline: none;
        }
        .sc__field input::placeholder { color: var(--text-muted); }
        .sc__save-btn {
          padding: 10px 20px; border-radius: 10px;
          background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
          color: #fff; border: none; cursor: pointer; font-weight: 700; transition: all 0.2s;
        }
        .sc__save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .sc__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
        .sc__item {
          padding: 16px; border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border);
          display: flex; flex-direction: column; gap: 6px; transition: all 0.2s;
        }
        .sc__item:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
        .sc__item-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .sc__item-name { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; }
        .sc__item-del {
          width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        .sc__item-del:hover { color: #FF4B8A; background: rgba(255,75,138,0.08); }
        .sc__item-phone, .sc__item-addr { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-secondary); }
        .sc__item-state { font-size: 11px; color: var(--text-muted); }
        .sc__skel { height: 110px; border-radius: 16px; background: var(--glass-bg); animation: skelPulse 1.5s ease infinite; }
        @keyframes skelPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.2; } }
        .sc__empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 50px 20px; color: var(--text-muted); }
        .sc__empty p { font-size: 14px; font-weight: 600; color: var(--text-secondary); margin: 0; }
        @media (max-width: 500px) { .sc__form-row { flex-direction: column; } }
      `}</style>
    </div>
  );
}
