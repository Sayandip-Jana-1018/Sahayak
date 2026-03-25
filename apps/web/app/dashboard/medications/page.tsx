'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Pill, Plus, Clock, Check, X, Camera, Loader2, Sparkles } from 'lucide-react';
import { useState, useRef } from 'react';
import { apiRequest, useApiClient } from '@/lib/api';

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
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResults, setOcrResults] = useState<Array<{ name: string; dosage: string; frequency: string }> | null>(null);
  const [ocrError, setOcrError] = useState('');
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const { getToken } = useAuth();
  const api = useApiClient();

  const { data, isLoading, refetch } = useQuery<{ medications: Medication[] }>({
    queryKey: ['medications'],
    queryFn: () => apiRequest<{ medications: Medication[] }>('/api/medications?elderlyProfileId=default', getToken),
  });

  const meds = data?.medications || [];
  const totalToday = meds.reduce((sum, m) => sum + (m.todayLogs?.length || 0), 0);
  const takenToday = meds.reduce((sum, m) => sum + (m.todayLogs?.filter(l => l.status === 'taken').length || 0), 0);
  const missedToday = meds.reduce((sum, m) => sum + (m.todayLogs?.filter(l => l.status === 'missed').length || 0), 0);
  const takenPct = totalToday > 0 ? (takenToday / totalToday) * 100 : 0;
  const missedPct = totalToday > 0 ? (missedToday / totalToday) * 100 : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/api/medications', { ...newMed, elderlyProfileId: 'default' });
      setShowModal(false);
      setNewMed({ medicineName: '', dosage: '', unit: 'mg', frequency: 'Once daily', reminderTimes: ['08:00'], instructions: '' });
      refetch();
    } catch { /* handled */ } finally {
      setSaving(false);
    }
  };

  const handleOcrUpload = async (file: File) => {
    setOcrLoading(true);
    setOcrError('');
    setOcrResults(null);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/ai/prescription-ocr`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData }
      );
      const data = await res.json();
      if (data.medicines && data.medicines.length > 0) {
        setOcrResults(data.medicines);
      } else {
        setOcrError('No medicines detected. Try a clearer photo or enter manually.');
      }
    } catch {
      setOcrError('OCR failed. Please enter details manually.');
    } finally {
      setOcrLoading(false);
    }
  };

  return (
    <div className="mp">
      {/* Header */}
      <div className="mp__head">
        <div>
          <h2 className="mp__title">Medications</h2>
          <p className="mp__sub">Track doses and set reminders</p>
        </div>
        <button className="mp__add-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Adherence Card */}
      <div className="mp__adherence">
        <div className="mp__adherence-top">
          <span className="mp__adherence-label">Today&apos;s Progress</span>
          <span className="mp__adherence-val">{takenToday}/{totalToday || 0} doses</span>
        </div>
        <div className="mp__adherence-track">
          <div className="mp__adherence-fill mp__adherence-fill--taken" style={{ width: `${takenPct}%` }} />
          <div className="mp__adherence-fill mp__adherence-fill--missed" style={{ width: `${missedPct}%` }} />
        </div>
        {missedToday > 0 && <span className="mp__adherence-missed">{missedToday} missed</span>}
      </div>

      {/* Medication List */}
      {isLoading ? (
        <div className="mp__grid">
          {[1, 2].map(i => (
            <div key={i} className="mp__skel">
              <div className="mp__skel-line mp__skel-line--lg" />
              <div className="mp__skel-line mp__skel-line--sm" />
              <div className="mp__skel-line mp__skel-line--md" />
            </div>
          ))}
        </div>
      ) : meds.length === 0 ? (
        <div className="mp__empty">
          <div className="mp__empty-icon"><Pill size={32} strokeWidth={1.5} /></div>
          <p>No medications added yet</p>
          <span>Add medications to track doses and get reminders.</span>
          <button className="mp__empty-btn" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add your first medication
          </button>
        </div>
      ) : (
        <div className="mp__grid">
          {meds.map((med) => (
            <div key={med.id} className="mp__card">
              <div className="mp__card-top">
                <div className="mp__card-icon"><Pill size={18} /></div>
                <div className="mp__card-info">
                  <h3 className="mp__card-name">{med.medicineName}</h3>
                  {med.dosage && <span className="mp__card-dose">{med.dosage}</span>}
                </div>
              </div>
              <div className="mp__card-freq">
                <Clock size={13} />
                <span>{med.frequency || 'Daily'} — {(med.reminderTimes || []).join(', ')}</span>
              </div>
              {med.todayLogs && med.todayLogs.length > 0 && (
                <div className="mp__card-logs">
                  {med.todayLogs.map((log, i) => (
                    <div key={i} className={`mp__card-chip mp__card-chip--${log.status}`}>
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
        <div className="mp__modal-overlay" onClick={() => setShowModal(false)}>
          <div className="mp__modal" onClick={e => e.stopPropagation()}>
            <h3 className="mp__modal-title">Add Medication</h3>

            {/* ── OCR Upload Zone ── */}
            <div className="mp__ocr-zone">
              <input ref={ocrInputRef} type="file" accept="image/*" capture="environment" hidden
                onChange={e => { const f = e.target.files?.[0]; if (f) handleOcrUpload(f); e.target.value = ''; }} />
              <button className="mp__ocr-btn" onClick={() => ocrInputRef.current?.click()} disabled={ocrLoading}>
                {ocrLoading ? <Loader2 size={18} className="mp__ocr-spin" /> : <Camera size={18} />}
                {ocrLoading ? 'Scanning...' : 'Scan Prescription Photo'}
              </button>
              {ocrError && <p className="mp__ocr-error">{ocrError}</p>}
              {ocrResults && ocrResults.length > 0 && (
                <div className="mp__ocr-results">
                  <p className="mp__ocr-found"><Sparkles size={14} /> {ocrResults.length} medicine{ocrResults.length > 1 ? 's' : ''} detected</p>
                  {ocrResults.map((m, i) => (
                    <div key={i} className="mp__ocr-item">
                      <div className="mp__ocr-item-info">
                        <span className="mp__ocr-item-name">{m.name}</span>
                        <span className="mp__ocr-item-dose">{m.dosage} · {m.frequency}</span>
                      </div>
                      <button className="mp__ocr-use" onClick={() => {
                        setNewMed(p => ({ ...p, medicineName: m.name, dosage: m.dosage || '', frequency: m.frequency || 'Once daily' }));
                        setOcrResults(null);
                      }}>Use</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mp__ocr-divider"><span>or enter manually</span></div>

            <div className="mp__field">
              <label>Medicine Name</label>
              <input type="text" placeholder="e.g. Metformin" value={newMed.medicineName}
                onChange={e => setNewMed(p => ({ ...p, medicineName: e.target.value }))} />
            </div>

            <div className="mp__field-row">
              <div className="mp__field">
                <label>Dosage</label>
                <input type="text" placeholder="500" value={newMed.dosage}
                  onChange={e => setNewMed(p => ({ ...p, dosage: e.target.value }))} />
              </div>
              <div className="mp__field">
                <label>Unit</label>
                <select value={newMed.unit} onChange={e => setNewMed(p => ({ ...p, unit: e.target.value }))}>
                  <option>mg</option><option>ml</option><option>tablet</option><option>drops</option>
                </select>
              </div>
            </div>

            <div className="mp__field">
              <label>Frequency</label>
              <div className="mp__freq-row">
                {['Once daily', 'Twice daily', 'Thrice daily'].map(f => (
                  <button key={f} className={`mp__freq-chip ${newMed.frequency === f ? 'mp__freq-chip--active' : ''}`}
                    onClick={() => setNewMed(p => ({ ...p, frequency: f }))}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="mp__field">
              <label>Instructions (optional)</label>
              <textarea placeholder="Take with food..." value={newMed.instructions}
                onChange={e => setNewMed(p => ({ ...p, instructions: e.target.value }))} />
            </div>

            <div className="mp__modal-actions">
              <button className="mp__modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="mp__modal-save" onClick={handleSave} disabled={!newMed.medicineName || saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`${medStyles}`}</style>
    </div>
  );
}

const medStyles = `
  /* ─── HEADER ─── */
  .mp__head {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    margin-bottom: 24px;
  }

  .mp__title {
    font-size: clamp(20px, 3vw, 26px) !important;
    font-weight: 800 !important;
    color: var(--text-primary);
    margin: 0;
    font-family: var(--font-display);
    letter-spacing: -0.03em;
  }

  .mp__sub {
    font-size: 13px;
    color: var(--text-muted);
    margin: 2px 0 0;
    font-family: var(--font-display);
  }

  .mp__add-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
    color: #fff;
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-size: 13px;
    font-family: var(--font-display);
    transition: all var(--duration-fast) var(--ease-fluid);
    box-shadow: 0 4px 16px rgba(var(--sah-accent-1-rgb), 0.25);
  }

  .mp__add-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(var(--sah-accent-1-rgb), 0.35);
  }

  /* ─── ADHERENCE ─── */
  .mp__adherence {
    padding: 18px 20px;
    border-radius: var(--radius-lg);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    margin-bottom: 20px;
  }

  .mp__adherence-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .mp__adherence-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-family: var(--font-display);
  }

  .mp__adherence-val {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
    font-family: var(--font-display);
  }

  .mp__adherence-track {
    height: 6px;
    border-radius: 3px;
    background: var(--glass-border);
    display: flex;
    overflow: hidden;
    margin-bottom: 6px;
  }

  .mp__adherence-fill--taken {
    background: var(--sah-accent-2);
    transition: width var(--duration-slow) var(--ease-fluid);
  }

  .mp__adherence-fill--missed {
    background: rgba(239, 68, 68, 0.85);
    transition: width var(--duration-slow) var(--ease-fluid);
  }

  .mp__adherence-missed {
    font-size: 12px;
    color: rgba(239, 68, 68, 0.9);
    font-weight: 500;
    font-family: var(--font-display);
  }

  /* ─── GRID ─── */
  .mp__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  /* ─── CARD ─── */
  .mp__card {
    padding: 20px;
    border-radius: var(--radius-lg);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    transition: all var(--duration-normal) var(--ease-fluid);
  }

  .mp__card:hover {
    border-color: var(--glass-border-hover);
    transform: translateY(-2px);
    box-shadow: var(--glass-shadow);
  }

  .mp__card-top {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .mp__card-icon {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(var(--sah-accent-1-rgb), 0.15), rgba(var(--sah-accent-1-rgb), 0.05));
    color: var(--sah-accent-1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .mp__card-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .mp__card-name {
    font-size: 15px !important;
    font-weight: 700 !important;
    color: var(--text-primary);
    margin: 0;
    font-family: var(--font-display);
  }

  .mp__card-dose {
    font-size: 12px;
    color: var(--sah-accent-1);
    font-weight: 600;
    font-family: var(--font-display);
  }

  .mp__card-freq {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    font-family: var(--font-display);
  }

  .mp__card-logs {
    display: flex;
    gap: 6px;
    justify-content: center;
  }

  .mp__card-chip {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mp__card-chip--taken {
    background: rgba(var(--sah-accent-2-rgb), 0.15);
    color: var(--sah-accent-2);
  }

  .mp__card-chip--missed {
    background: rgba(239, 68, 68, 0.12);
    color: rgba(239, 68, 68, 0.9);
  }

  .mp__card-chip--pending {
    background: var(--glass-border);
    color: var(--text-muted);
  }

  /* ─── EMPTY ─── */
  .mp__empty {
    text-align: center;
    padding: 60px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--text-muted);
  }

  .mp__empty-icon {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-lg);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }

  .mp__empty p {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-secondary);
    margin: 0;
    font-family: var(--font-display);
  }

  .mp__empty span {
    font-size: 13px;
    max-width: 280px;
  }

  .mp__empty-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: var(--radius-full);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-display);
    margin-top: 8px;
    transition: all var(--duration-fast) var(--ease-fluid);
  }

  .mp__empty-btn:hover {
    background: var(--glass-bg-hover);
    border-color: var(--glass-border-hover);
    color: var(--text-primary);
  }

  /* ─── SKELETON ─── */
  .mp__skel {
    padding: 20px;
    border-radius: var(--radius-lg);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mp__skel-line {
    border-radius: 6px;
    background: linear-gradient(90deg, var(--glass-bg) 0%, var(--glass-bg-hover) 50%, var(--glass-bg) 100%);
    background-size: 200%;
    animation: mp-shimmer 1.5s infinite;
  }

  .mp__skel-line--sm { height: 12px; width: 50%; }
  .mp__skel-line--md { height: 14px; width: 70%; }
  .mp__skel-line--lg { height: 18px; width: 80%; }

  @keyframes mp-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ─── MODAL ─── */
  .mp__modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 999;
    background: var(--glass-bg);
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    animation: mp-fade-in 0.2s ease;
  }

  @keyframes mp-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .mp__modal {
    width: 100%;
    max-width: 520px;
    padding: 32px;
    border-radius: 24px;
    background: var(--glass-bg);
    backdrop-filter: blur(60px) saturate(200%);
    -webkit-backdrop-filter: blur(60px) saturate(200%);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
    animation: mp-modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
  }

  .mp__modal::before {
    content: '';
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 50%;
    height: 1px;
    background: linear-gradient(90deg,
      transparent,
      rgba(var(--sah-accent-1-rgb), 0.4),
      rgba(var(--sah-accent-2-rgb), 0.4),
      transparent
    );
  }

  @keyframes mp-modal-in {
    from { opacity: 0; transform: scale(0.96) translateY(8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  .mp__modal-title {
    font-size: 22px !important;
    font-weight: 800 !important;
    color: var(--text-primary);
    margin: 0 0 28px;
    font-family: var(--font-display);
    letter-spacing: -0.02em;
  }

  .mp__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }

  .mp__field label {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-family: var(--font-display);
  }

  .mp__field input,
  .mp__field select,
  .mp__field textarea {
    padding: 12px 16px;
    border-radius: 14px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-primary);
    font-size: 14px;
    font-family: var(--font-display);
    outline: none;
    transition: all 0.25s ease;
  }

  .mp__field input:focus,
  .mp__field select:focus,
  .mp__field textarea:focus {
    border-color: var(--glass-border-hover);
    box-shadow: 0 0 0 3px rgba(var(--sah-accent-1-rgb), 0.08);
  }

  .mp__field input::placeholder,
  .mp__field textarea::placeholder {
    color: var(--text-muted);
  }

  .mp__field textarea {
    min-height: 64px;
    resize: vertical;
  }

  .mp__field-row {
    display: flex;
    gap: 12px;
  }

  .mp__field-row .mp__field {
    flex: 1;
  }

  .mp__freq-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .mp__freq-chip {
    padding: 9px 18px;
    border-radius: var(--radius-full);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-display);
    transition: all 0.2s ease;
  }

  .mp__freq-chip:hover {
    border-color: var(--glass-border-hover);
    background: var(--glass-bg-hover);
  }

  .mp__freq-chip--active {
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2)) !important;
    border-color: transparent !important;
    color: #fff !important;
    box-shadow: 0 4px 16px rgba(var(--sah-accent-1-rgb), 0.25);
  }

  .mp__modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid var(--glass-border);
  }

  .mp__modal-cancel {
    padding: 11px 22px;
    border-radius: var(--radius-full);
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    color: var(--text-secondary);
    cursor: pointer;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .mp__modal-cancel:hover {
    background: var(--glass-bg-hover);
    border-color: var(--glass-border-hover);
    color: var(--text-primary);
  }

  .mp__modal-save {
    padding: 11px 28px;
    border-radius: var(--radius-full);
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
    color: #fff;
    border: none;
    cursor: pointer;
    font-weight: 700;
    font-size: 14px;
    font-family: var(--font-display);
    box-shadow: 0 4px 20px rgba(var(--sah-accent-1-rgb), 0.25);
    transition: all 0.2s ease;
  }

  .mp__modal-save:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 30px rgba(var(--sah-accent-1-rgb), 0.35);
  }

  .mp__modal-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 700px) {
    .mp__grid {
      grid-template-columns: 1fr;
    }
  }

  /* ─── OCR UPLOAD ─── */
  .mp__ocr-zone {
    margin-bottom: 8px;
  }

  .mp__ocr-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    border-radius: 14px;
    border: 2px dashed var(--glass-border);
    background: var(--glass-bg);
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
    font-family: var(--font-display);
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .mp__ocr-btn:hover:not(:disabled) {
    border-color: var(--sah-accent-1);
    color: var(--sah-accent-1);
    background: rgba(var(--sah-accent-1-rgb), 0.06);
  }

  .mp__ocr-btn:disabled {
    opacity: 0.7;
    cursor: wait;
  }

  @keyframes ocrSpin {
    to { transform: rotate(360deg); }
  }

  .mp__ocr-spin {
    animation: ocrSpin 0.8s linear infinite;
  }

  .mp__ocr-error {
    margin: 8px 0 0;
    font-size: 12px;
    color: var(--sah-rose, #FF4B8A);
    text-align: center;
  }

  .mp__ocr-results {
    margin-top: 10px;
    padding: 12px;
    border-radius: 12px;
    background: rgba(var(--sah-accent-1-rgb), 0.04);
    border: 1px solid rgba(var(--sah-accent-1-rgb), 0.12);
  }

  .mp__ocr-found {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--sah-jade, #00B67A);
    margin: 0 0 8px;
  }

  .mp__ocr-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    margin-bottom: 6px;
  }

  .mp__ocr-item:last-child {
    margin-bottom: 0;
  }

  .mp__ocr-item-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mp__ocr-item-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .mp__ocr-item-dose {
    font-size: 11px;
    color: var(--text-secondary);
  }

  .mp__ocr-use {
    padding: 5px 14px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
    color: #fff;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    font-family: var(--font-display);
    transition: all 0.2s ease;
  }

  .mp__ocr-use:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--sah-accent-1-rgb), 0.3);
  }

  .mp__ocr-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 12px 0 16px;
    font-size: 12px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .mp__ocr-divider::before,
  .mp__ocr-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--glass-border);
  }
`;
