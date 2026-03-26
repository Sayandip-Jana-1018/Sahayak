'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Users, Search, Shield, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { apiRequest, useApiClient } from '@/lib/api';

interface User {
  id: string;
  clerkId: string;
  email?: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { getToken } = useAuth();
  const api = useApiClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery<{ users: User[] }>({
    queryKey: ['admin-users'],
    queryFn: () => apiRequest<{ users: User[] }>('/api/admin/users', getToken),
  });

  const users = (data?.users || []).filter(u =>
    u.clerkId.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
    refetch();
  };

  const ROLES = ['family', 'ngo_admin', 'sys_admin'];

  return (
    <div className="au">
      <div className="au__head">
        <h2 className="au__title"><Users size={22} /> User Management</h2>
        <p className="au__sub">View and manage all platform users</p>
      </div>

      <div className="au__toolbar">
        <div className="au__search">
          <Search size={16} />
          <input placeholder="Search by email or role..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="au__count">{users.length} users</span>
      </div>

      {isLoading ? (
        <div className="au__list">{[1,2,3].map(i => <div key={i} className="au__skel" />)}</div>
      ) : (
        <div className="au__list">
          {users.map(u => (
            <div key={u.id} className="au__row">
              <div className="au__row-info">
                <span className="au__row-email">{u.email || u.clerkId}</span>
                <span className="au__row-date">Joined {new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="au__row-actions">
                <select className="au__role-select" value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <span className={`au__role-badge au__role-badge--${u.role}`}>
                  {u.role === 'sys_admin' ? <ShieldCheck size={12} /> : <Shield size={12} />}
                  {u.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .au { padding: 8px 0; }
        .au__head { text-align: center; margin-bottom: 20px; }
        .au__title {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: clamp(20px, 3vw, 26px) !important; font-weight: 800 !important;
          color: var(--text-primary); font-family: var(--font-display); margin: 0 0 6px;
        }
        .au__sub { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .au__toolbar { display: flex; gap: 10px; justify-content: center; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
        .au__search {
          display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 12px;
          background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-secondary); flex: 1; max-width: 340px;
        }
        .au__search input { flex: 1; background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 14px; }
        .au__search input::placeholder { color: var(--text-muted); }
        .au__count { font-size: 13px; color: var(--text-muted); font-weight: 600; }
        .au__list { display: flex; flex-direction: column; gap: 8px; }
        .au__row {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 14px 16px; border-radius: 14px; background: var(--glass-bg); border: 1px solid var(--glass-border);
          transition: all 0.2s;
        }
        .au__row:hover { background: var(--glass-bg-hover); }
        .au__row-info { display: flex; flex-direction: column; gap: 2px; }
        .au__row-email { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .au__row-date { font-size: 11px; color: var(--text-muted); }
        .au__row-actions { display: flex; align-items: center; gap: 8px; }
        .au__role-select {
          padding: 6px 10px; border-radius: 8px; background: var(--glass-bg); border: 1px solid var(--glass-border);
          color: var(--text-primary); font-size: 12px; cursor: pointer; outline: none;
        }
        .au__role-badge {
          display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
        }
        .au__role-badge--family { background: rgba(16,185,129,0.1); color: #10B981; }
        .au__role-badge--ngo_admin { background: rgba(245,158,11,0.1); color: #F59E0B; }
        .au__role-badge--sys_admin { background: rgba(239,68,68,0.1); color: #EF4444; }
        .au__skel { height: 60px; border-radius: 14px; background: var(--glass-bg); animation: skelPulse 1.5s ease infinite; }
        @keyframes skelPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.2; } }
        @media (max-width: 600px) { .au__row { flex-direction: column; align-items: flex-start; } .au__row-actions { width: 100%; justify-content: space-between; } }
      `}</style>
    </div>
  );
}
