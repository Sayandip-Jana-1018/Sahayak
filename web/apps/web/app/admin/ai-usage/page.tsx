'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Brain, DollarSign, Zap, Globe, Calendar } from 'lucide-react';
import { useState } from 'react';
import { apiRequest } from '@/lib/api';

interface AIUsageData {
  summary: { totalCalls: number; totalTokens: number; estimatedCost: number; avgLatency: number };
  byFeature: Array<{ feature: string; calls: number; tokens: number }>;
  daily: Array<{ date: string; calls: number; tokens: number }>;
}

export default function AdminAIUsagePage() {
  const { getToken } = useAuth();
  const [range, setRange] = useState('30d');

  const { data, isLoading } = useQuery<AIUsageData>({
    queryKey: ['admin-ai-usage', range],
    queryFn: () => apiRequest<AIUsageData>(`/api/admin/ai-usage?range=${range}`, getToken),
  });

  const s = data?.summary || { totalCalls: 0, totalTokens: 0, estimatedCost: 0, avgLatency: 0 };

  return (
    <div className="aai">
      <div className="aai__head">
        <h2 className="aai__title"><Brain size={22} /> AI Usage</h2>
        <p className="aai__sub">Token consumption and cost analysis</p>
      </div>

      <div className="aai__range">
        {['7d', '30d', '90d'].map(r => (
          <button key={r} className={`aai__range-btn ${range === r ? 'aai__range-btn--active' : ''}`} onClick={() => setRange(r)}>
            {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
          </button>
        ))}
      </div>

      <div className="aai__stats">
        <div className="aai__stat"><Zap size={18} style={{ color: '#8B5CF6' }} /><span className="aai__stat-val">{s.totalCalls.toLocaleString()}</span><span className="aai__stat-lbl">API Calls</span></div>
        <div className="aai__stat"><Globe size={18} style={{ color: '#10B981' }} /><span className="aai__stat-val">{(s.totalTokens / 1000).toFixed(1)}K</span><span className="aai__stat-lbl">Tokens</span></div>
        <div className="aai__stat"><DollarSign size={18} style={{ color: '#F59E0B' }} /><span className="aai__stat-val">${s.estimatedCost.toFixed(2)}</span><span className="aai__stat-lbl">Est. Cost</span></div>
        <div className="aai__stat"><Calendar size={18} style={{ color: '#EF4444' }} /><span className="aai__stat-val">{s.avgLatency}ms</span><span className="aai__stat-lbl">Avg Latency</span></div>
      </div>

      {/* Usage by Feature */}
      {!isLoading && data?.byFeature && data.byFeature.length > 0 && (
        <div className="aai__section">
          <h3 className="aai__section-title">Usage by Feature</h3>
          {data.byFeature.map((f, i) => {
            const max = data.byFeature[0].calls || 1;
            return (
              <div key={i} className="aai__feature">
                <span className="aai__feature-name">{f.feature}</span>
                <div className="aai__feature-bar-track"><div className="aai__feature-bar" style={{ width: `${(f.calls / max) * 100}%` }} /></div>
                <span className="aai__feature-count">{f.calls} calls</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Daily Chart */}
      {!isLoading && data?.daily && data.daily.length > 0 && (
        <div className="aai__section">
          <h3 className="aai__section-title">Daily API Calls</h3>
          <div className="aai__chart">
            {data.daily.map((d, i) => {
              const max = Math.max(...data.daily.map(x => x.calls), 1);
              return (
                <div key={i} className="aai__bar-col" title={`${d.date}: ${d.calls} calls`}>
                  <div className="aai__bar" style={{ height: `${Math.max((d.calls / max) * 100, 4)}%` }} />
                  <span className="aai__bar-label">{i % 5 === 0 ? d.date.slice(-5) : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isLoading && <div className="aai__skel" style={{ height: 200 }} />}

      <style jsx>{`
        .aai { padding: 8px 0; }
        .aai__head { text-align: center; margin-bottom: 20px; }
        .aai__title { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: clamp(20px, 3vw, 26px) !important; font-weight: 800 !important; color: var(--text-primary); font-family: var(--font-display); margin: 0 0 6px; }
        .aai__sub { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .aai__range { display: flex; gap: 8px; justify-content: center; margin-bottom: 20px; }
        .aai__range-btn { padding: 8px 16px; border-radius: 10px; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .aai__range-btn:hover { color: var(--text-primary); }
        .aai__range-btn--active { background: rgba(139,92,246,0.08) !important; border-color: #8B5CF6 !important; color: #8B5CF6 !important; }
        .aai__stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 14px; margin-bottom: 28px; }
        .aai__stat { display: flex; flex-direction: column; align-items: center; padding: 18px 12px; border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border); }
        .aai__stat-val { font-size: 24px; font-weight: 800; color: var(--text-primary); font-family: var(--font-display); margin: 8px 0 2px; }
        .aai__stat-lbl { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .aai__section { margin-bottom: 28px; }
        .aai__section-title { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0 0 14px; text-align: center; }
        .aai__feature { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
        .aai__feature-name { width: 120px; font-size: 13px; font-weight: 600; color: var(--text-primary); text-align: right; }
        .aai__feature-bar-track { flex: 1; height: 6px; border-radius: 3px; background: var(--glass-bg); }
        .aai__feature-bar { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #8B5CF6, #6366F1); }
        .aai__feature-count { font-size: 12px; font-weight: 600; color: var(--text-secondary); width: 80px; }
        .aai__chart { display: flex; align-items: flex-end; gap: 2px; height: 130px; padding: 12px; border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border); }
        .aai__bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
        .aai__bar { width: 100%; max-width: 16px; border-radius: 3px 3px 0 0; background: linear-gradient(180deg, #8B5CF6, #A78BFA); transition: height 0.3s; }
        .aai__bar-label { font-size: 8px; color: var(--text-muted); margin-top: 3px; min-height: 10px; }
        .aai__skel { border-radius: 16px; background: var(--glass-bg); animation: skelPulse 1.5s ease infinite; }
        @keyframes skelPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.2; } }
        @media (max-width: 500px) { .aai__stats { grid-template-columns: repeat(2, 1fr); } .aai__feature-name { width: 80px; font-size: 11px; } }
      `}</style>
    </div>
  );
}
