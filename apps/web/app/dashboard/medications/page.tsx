'use client';

import { useQuery } from '@tanstack/react-query';
import { Pill, Plus, Clock, Check, X, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface Medication {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  reminderTimes: string[];
  isActive: boolean;
  todayLogs: Array<{ scheduledAt: string; status: string; takenAt: string | null }>;
}

export default function MedicationsPage() {
  const [showModal, setShowModal] = useState(false);
  const [newMed, setNewMed] = useState({ medicineName: '', dosage: '', unit: 'mg', frequency: 'Once daily', reminderTimes: ['08:00'], instructions: '' });
  const [saving, setSaving] = useState(false);

  const { data, isLoading, refetch } = useQuery<{ medications: Medication[] }>({
    queryKey: ['medications'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/medications?elderlyProfileId=default`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const meds = data?.medications || [];
  const totalToday = meds.reduce((sum, m) => sum + (m.todayLogs?.length || 0), 0);
  const takenToday = meds.reduce((sum, m) => sum + (m.todayLogs?.filter(l => l.status === 'taken').length || 0), 0);
  const missedToday = meds.reduce((sum, m) => sum + (m.todayLogs?.filter(l => l.status === 'missed').length || 0), 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMed, elderlyProfileId: 'default' }),
      });
      setShowModal(false);
      setNewMed({ medicineName: '', dosage: '', unit: 'mg', frequency: 'Once daily', reminderTimes: ['08:00'], instructions: '' });
      refetch();
    } catch { /* handled */ } finally {
      setSaving(false);
    }
  };

  return (
    <div className="meds-page">
      {/* Header */}
      <div className="meds-page__header">
        <h2 className="meds-page__title">Medications</h2>
        <button className="meds-page__add" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Medication
        </button>
      </div>

      {/* Adherence banner */}
      <div className="meds-page__adherence">
        <div className="meds-page__adherence-bar">
          <div className="meds-page__adherence-fill meds-page__adherence-fill--taken" style={{ width: `${totalToday > 0 ? (takenToday / totalToday) * 100 : 0}%` }} />
          <div className="meds-page__adherence-fill meds-page__adherence-fill--missed" style={{ width: `${totalToday > 0 ? (missedToday / totalToday) * 100 : 0}%` }} />
        </div>
        <div className="meds-page__adherence-labels">
          <span>{takenToday}/{totalToday || 0} doses taken today</span>
          {missedToday > 0 && <span className="meds-page__adherence-missed">{missedToday} missed</span>}
        </div>
      </div>

      {/* Medication cards */}
      {isLoading ? (
        <div className="meds-page__grid">
          {[1, 2].map(i => (
            <div key={i} className="med-card med-card--skeleton">
              <div className="skeleton-line skeleton-line--lg" />
              <div className="skeleton-line skeleton-line--sm" />
              <div className="skeleton-line skeleton-line--md" />
            </div>
          ))}
        </div>
      ) : meds.length === 0 ? (
        <div className="meds-page__empty">
          <Pill size={32} />
          <p>No medications added yet</p>
          <button className="meds-page__add meds-page__add--inline" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add your first medication
          </button>
        </div>
      ) : (
        <div className="meds-page__grid">
          {meds.map((med) => (
            <div key={med.id} className="med-card">
              <div className="med-card__header">
                <div>
                  <h3 className="med-card__name">{med.medicineName}</h3>
                  {med.dosage && <span className="med-card__dosage">{med.dosage}</span>}
                </div>
              </div>
              <div className="med-card__freq">
                <Clock size={14} />
                <span>{med.frequency || 'Daily'} — {(med.reminderTimes || []).join(', ')}</span>
              </div>
              {med.todayLogs && med.todayLogs.length > 0 && (
                <div className="med-card__pills">
                  {med.todayLogs.map((log, i) => (
                    <div key={i} className={`med-card__pill med-card__pill--${log.status}`}>
                      {log.status === 'taken' ? <Check size={12} /> : log.status === 'missed' ? <X size={12} /> : <Clock size={12} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="med-modal__overlay" onClick={() => setShowModal(false)}>
          <div className="med-modal" onClick={e => e.stopPropagation()}>
            <h3 className="med-modal__title">Add Medication</h3>

            <div className="med-modal__field">
              <label>Medicine Name</label>
              <input type="text" placeholder="e.g. Metformin" value={newMed.medicineName}
                onChange={e => setNewMed(p => ({ ...p, medicineName: e.target.value }))} />
            </div>

            <div className="med-modal__row">
              <div className="med-modal__field">
                <label>Dosage</label>
                <input type="text" placeholder="500" value={newMed.dosage}
                  onChange={e => setNewMed(p => ({ ...p, dosage: e.target.value }))} />
              </div>
              <div className="med-modal__field">
                <label>Unit</label>
                <select value={newMed.unit} onChange={e => setNewMed(p => ({ ...p, unit: e.target.value }))}>
                  <option>mg</option>
                  <option>ml</option>
                  <option>tablet</option>
                  <option>drops</option>
                </select>
              </div>
            </div>

            <div className="med-modal__field">
              <label>Frequency</label>
              <div className="med-modal__freq-btns">
                {['Once daily', 'Twice daily', 'Thrice daily'].map(f => (
                  <button key={f} className={`med-modal__freq-btn ${newMed.frequency === f ? 'med-modal__freq-btn--active' : ''}`}
                    onClick={() => setNewMed(p => ({ ...p, frequency: f }))}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="med-modal__field">
              <label>Instructions (optional)</label>
              <textarea placeholder="Take with food..." value={newMed.instructions}
                onChange={e => setNewMed(p => ({ ...p, instructions: e.target.value }))} />
            </div>

            <div className="med-modal__actions">
              <button className="med-modal__cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="med-modal__save" onClick={handleSave} disabled={!newMed.medicineName || saving}>
                {saving ? 'Saving...' : 'Save Medication'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .meds-page { max-width: 900px; }

        .meds-page__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .meds-page__title { font-size: 22px !important; font-weight: 700 !important; color: var(--text-primary); margin: 0; }
        .meds-page__add { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 12px; background: linear-gradient(135deg, #FF6B2C, #FF8F5E); color: white; border: none; cursor: pointer; font-weight: 600; font-size: 14px; font-family: var(--font-body); }
        .meds-page__add:hover { box-shadow: 0 4px 16px rgba(255,107,44,0.3); }
        .meds-page__add--inline { background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-secondary); margin-top: 12px; }

        .meds-page__adherence { margin-bottom: 24px; padding: 16px; border-radius: 14px; background: var(--glass-bg); border: 1px solid var(--glass-border); }
        .meds-page__adherence-bar { height: 8px; border-radius: 4px; background: rgba(255,255,255,0.06); display: flex; overflow: hidden; margin-bottom: 8px; }
        :global(.light) .meds-page__adherence-bar { background: rgba(27,42,74,0.06); }
        .meds-page__adherence-fill--taken { background: #2D6A4F; transition: width 0.5s; }
        .meds-page__adherence-fill--missed { background: #E63946; transition: width 0.5s; }
        .meds-page__adherence-labels { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); }
        .meds-page__adherence-missed { color: #E63946; }

        .meds-page__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .meds-page__empty { text-align: center; padding: 60px; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 12px; }

        .med-card { padding: 20px; border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border); }
        .med-card--skeleton { display: flex; flex-direction: column; gap: 12px; }
        .med-card__header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; }
        .med-card__name { font-size: 16px !important; font-weight: 600 !important; color: var(--text-primary); margin: 0; }
        .med-card__dosage { font-size: 12px; padding: 2px 8px; border-radius: 6px; background: rgba(255,107,44,0.1); color: #FF6B2C; font-weight: 500; }
        .med-card__freq { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }
        .med-card__pills { display: flex; gap: 8px; }
        .med-card__pill { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .med-card__pill--taken { background: rgba(45,106,79,0.15); color: #2D6A4F; }
        .med-card__pill--missed { background: rgba(230,57,70,0.15); color: #E63946; }
        .med-card__pill--pending { background: rgba(255,255,255,0.06); color: var(--text-muted); }

        /* Modal */
        .med-modal__overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .med-modal { width: 100%; max-width: 560px; padding: 28px; border-radius: 20px; background: var(--bg-secondary); border: 1px solid var(--glass-border); }
        :global(.light) .med-modal { background: #FFFFFF; }
        .med-modal__title { font-size: 20px !important; font-weight: 700 !important; color: var(--text-primary); margin: 0 0 24px; }
        .med-modal__field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
        .med-modal__field label { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
        .med-modal__field input, .med-modal__field select, .med-modal__field textarea { padding: 10px 14px; border-radius: 10px; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary); font-size: 14px; font-family: var(--font-body); outline: none; }
        .med-modal__field input:focus, .med-modal__field textarea:focus { border-color: #FF6B2C; }
        .med-modal__field textarea { min-height: 60px; resize: vertical; }
        .med-modal__row { display: flex; gap: 12px; }
        .med-modal__row .med-modal__field { flex: 1; }
        .med-modal__freq-btns { display: flex; gap: 8px; flex-wrap: wrap; }
        .med-modal__freq-btn { padding: 8px 16px; border-radius: 10px; background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-secondary); cursor: pointer; font-size: 13px; font-family: var(--font-body); transition: all 0.15s; }
        .med-modal__freq-btn--active { background: #FF6B2C !important; border-color: #FF6B2C !important; color: white !important; }
        .med-modal__actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; }
        .med-modal__cancel { padding: 10px 20px; border-radius: 10px; background: transparent; border: 1px solid var(--glass-border); color: var(--text-secondary); cursor: pointer; font-family: var(--font-body); }
        .med-modal__save { padding: 10px 24px; border-radius: 10px; background: linear-gradient(135deg, #FF6B2C, #FF8F5E); color: white; border: none; cursor: pointer; font-weight: 600; font-family: var(--font-body); }
        .med-modal__save:disabled { opacity: 0.5; cursor: not-allowed; }

        .skeleton-line { border-radius: 6px; background: linear-gradient(90deg, var(--glass-bg) 0%, var(--glass-bg-hover) 50%, var(--glass-bg) 100%); background-size: 200%; animation: shimmer 1.5s infinite; }
        .skeleton-line--sm { height: 12px; width: 50%; }
        .skeleton-line--md { height: 14px; width: 70%; }
        .skeleton-line--lg { height: 18px; width: 80%; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        @media (max-width: 700px) { .meds-page__grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
