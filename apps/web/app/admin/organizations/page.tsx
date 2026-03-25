'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Building2, Search, Plus, Edit, Users } from 'lucide-react';
import { useState } from 'react';
import { apiRequest, useApiClient } from '@/lib/api';

interface Organization {
  id: string;
  name: string;
  type: string;
  state: string;
  memberCount: number;
  createdAt: string;
}

export default function AdminOrganizationsPage() {
  const { getToken } = useAuth();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: '', type: 'ngo', state: '' });

  const { data, isLoading } = useQuery<{ organizations: Organization[] }>({
    queryKey: ['admin-orgs'],
    queryFn: () => apiRequest<{ organizations: Organization[] }>('/api/admin/organizations', getToken),
  });

  const addMutation = useMutation({
    mutationFn: () => api.post('/api/admin/organizations', newOrg),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-orgs'] }); setShowAdd(false); setNewOrg({ name: '', type: 'ngo', state: '' }); },
  });

  const orgs = (data?.organizations || []).filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) || o.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="aorg">
      <div className="aorg__head">
        <h2 className="aorg__title"><Building2 size={22} /> Organizations</h2>
        <p className="aorg__sub">Manage partner NGOs and organizations</p>
      </div>

      <div className="aorg__toolbar">
        <div className="aorg__search"><Search size={16} /><input placeholder="Search organizations..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <button className="aorg__add-btn" onClick={() => setShowAdd(!showAdd)}><Plus size={16} /> {showAdd ? 'Cancel' : 'Add Org'}</button>
      </div>

      {showAdd && (
        <div className="aorg__form">
          <div className="aorg__form-row">
            <div className="aorg__field"><label>Name</label><input value={newOrg.name} onChange={e => setNewOrg(p => ({ ...p, name: e.target.value }))} placeholder="Organization name" /></div>
            <div className="aorg__field"><label>Type</label>
              <select value={newOrg.type} onChange={e => setNewOrg(p => ({ ...p, type: e.target.value }))}>
                <option value="ngo">NGO</option><option value="government">Government</option><option value="private">Private</option>
              </select>
            </div>
          </div>
          <div className="aorg__field"><label>State</label><input value={newOrg.state} onChange={e => setNewOrg(p => ({ ...p, state: e.target.value }))} placeholder="State / Region" /></div>
          <button className="aorg__save" onClick={() => addMutation.mutate()} disabled={!newOrg.name || addMutation.isPending}>
            {addMutation.isPending ? 'Saving...' : 'Create Organization'}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="aorg__grid">{[1,2,3].map(i => <div key={i} className="aorg__skel" />)}</div>
      ) : orgs.length === 0 ? (
        <div className="aorg__empty"><Building2 size={28} /><p>No organizations found</p></div>
      ) : (
        <div className="aorg__grid">
          {orgs.map(org => (
            <div key={org.id} className="aorg__card">
              <div className="aorg__card-top">
                <h3 className="aorg__card-name">{org.name}</h3>
                <span className="aorg__card-type">{org.type}</span>
              </div>
              <div className="aorg__card-meta">
                <span><Users size={12} /> {org.memberCount} members</span>
                <span>{org.state}</span>
              </div>
              <span className="aorg__card-date">Created {new Date(org.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .aorg { padding: 8px 0; }
        .aorg__head { text-align: center; margin-bottom: 20px; }
        .aorg__title { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: clamp(20px, 3vw, 26px) !important; font-weight: 800 !important; color: var(--text-primary); font-family: var(--font-display); margin: 0 0 6px; }
        .aorg__sub { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .aorg__toolbar { display: flex; gap: 10px; justify-content: center; margin-bottom: 16px; flex-wrap: wrap; }
        .aorg__search { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 12px; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-secondary); flex: 1; max-width: 300px; }
        .aorg__search input { flex: 1; background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 14px; }
        .aorg__search input::placeholder { color: var(--text-muted); }
        .aorg__add-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 12px; background: linear-gradient(135deg, #F59E0B, #F97316); color: #fff; border: none; cursor: pointer; font-size: 14px; font-weight: 700; transition: all 0.2s; }
        .aorg__add-btn:hover { transform: translateY(-2px); }
        .aorg__form { max-width: 480px; margin: 0 auto 20px; padding: 20px; border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 12px; }
        .aorg__form-row { display: flex; gap: 12px; }
        .aorg__form-row .aorg__field { flex: 1; }
        .aorg__field { display: flex; flex-direction: column; gap: 4px; }
        .aorg__field label { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; }
        .aorg__field input, .aorg__field select { padding: 10px 14px; border-radius: 10px; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); font-size: 14px; outline: none; }
        .aorg__field input::placeholder { color: var(--text-muted); }
        .aorg__save { padding: 10px 20px; border-radius: 10px; background: linear-gradient(135deg, #F59E0B, #F97316); color: #fff; border: none; cursor: pointer; font-weight: 700; transition: all 0.2s; }
        .aorg__save:disabled { opacity: 0.5; cursor: not-allowed; }
        .aorg__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
        .aorg__card { padding: 18px; border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border); display: flex; flex-direction: column; gap: 6px; transition: all 0.2s; }
        .aorg__card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
        .aorg__card-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .aorg__card-name { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0; }
        .aorg__card-type { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: rgba(245,158,11,0.1); color: #F59E0B; text-transform: uppercase; }
        .aorg__card-meta { display: flex; gap: 12px; font-size: 12px; color: var(--text-secondary); }
        .aorg__card-meta span { display: flex; align-items: center; gap: 4px; }
        .aorg__card-date { font-size: 11px; color: var(--text-muted); }
        .aorg__skel { height: 120px; border-radius: 16px; background: var(--glass-bg); animation: skelPulse 1.5s ease infinite; }
        @keyframes skelPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.2; } }
        .aorg__empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 50px 20px; color: var(--text-muted); }
        .aorg__empty p { font-size: 14px; font-weight: 600; color: var(--text-secondary); margin: 0; }
        @media (max-width: 500px) { .aorg__form-row { flex-direction: column; } }
      `}</style>
    </div>
  );
}
