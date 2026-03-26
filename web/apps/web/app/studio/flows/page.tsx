'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Mic, Plus, Trash2, Edit, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { apiRequest, useApiClient } from '@/lib/api';

interface VoiceCommand {
  id: string;
  triggerPhrase: string;
  responseType: string;
  responseValue: string;
  language: string;
  isActive: boolean;
}

export default function StudioFlowsPage() {
  const { getToken } = useAuth();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newCmd, setNewCmd] = useState({ triggerPhrase: '', responseType: 'text_response', responseValue: '', language: 'hi' });

  const { data, isLoading } = useQuery<{ commands: VoiceCommand[] }>({
    queryKey: ['studio-commands'],
    queryFn: () => apiRequest<{ commands: VoiceCommand[] }>('/api/studio/commands', getToken),
  });

  const addMutation = useMutation({
    mutationFn: () => api.post('/api/studio/commands', newCmd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio-commands'] });
      setShowAdd(false);
      setNewCmd({ triggerPhrase: '', responseType: 'text_response', responseValue: '', language: 'hi' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/studio/commands/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['studio-commands'] }),
  });

  const commands = data?.commands || [];

  return (
    <div className="sf">
      <div className="sf__head">
        <h2 className="sf__title"><Mic size={22} /> Voice Flows</h2>
        <p className="sf__sub">Custom voice commands for your organization</p>
      </div>

      <div className="sf__toolbar">
        <button className="sf__add-btn" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} /> {showAdd ? 'Cancel' : 'Add Command'}
        </button>
      </div>

      {/* Inline Add Form */}
      {showAdd && (
        <div className="sf__form">
          <div className="sf__form-row">
            <div className="sf__field">
              <label>Trigger Phrase</label>
              <input placeholder='e.g. "Call the doctor"' value={newCmd.triggerPhrase}
                onChange={e => setNewCmd(p => ({ ...p, triggerPhrase: e.target.value }))} />
            </div>
            <div className="sf__field">
              <label>Response Type</label>
              <select value={newCmd.responseType} onChange={e => setNewCmd(p => ({ ...p, responseType: e.target.value }))}>
                <option value="text_response">Text Response</option>
                <option value="phone_call">Phone Call</option>
                <option value="sms">SMS</option>
                <option value="url">Open URL</option>
              </select>
            </div>
          </div>
          <div className="sf__field">
            <label>Response Value</label>
            <input placeholder="Response text, phone number, or URL" value={newCmd.responseValue}
              onChange={e => setNewCmd(p => ({ ...p, responseValue: e.target.value }))} />
          </div>
          <button className="sf__save-btn" onClick={() => addMutation.mutate()}
            disabled={!newCmd.triggerPhrase || !newCmd.responseValue || addMutation.isPending}>
            {addMutation.isPending ? 'Saving...' : 'Save Command'}
          </button>
        </div>
      )}

      {/* Commands List */}
      {isLoading ? (
        <div className="sf__grid">{[1,2].map(i => <div key={i} className="sf__skel" />)}</div>
      ) : commands.length === 0 ? (
        <div className="sf__empty">
          <Volume2 size={32} />
          <p>No custom commands yet</p>
          <span>Add your first voice command above</span>
        </div>
      ) : (
        <div className="sf__grid">
          {commands.map(cmd => (
            <div key={cmd.id} className="sf__cmd">
              <div className="sf__cmd-top">
                <span className="sf__cmd-trigger">&ldquo;{cmd.triggerPhrase}&rdquo;</span>
                <button className="sf__cmd-del" onClick={() => deleteMutation.mutate(cmd.id)} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="sf__cmd-meta">
                <span className="sf__cmd-type">{cmd.responseType.replace('_', ' ')}</span>
                <span className="sf__cmd-lang">{cmd.language}</span>
              </div>
              <p className="sf__cmd-value">{cmd.responseValue}</p>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .sf { padding: 8px 0; }
        .sf__head { text-align: center; margin-bottom: 20px; }
        .sf__title {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: clamp(20px, 3vw, 26px) !important; font-weight: 800 !important;
          color: var(--text-primary); font-family: var(--font-display); margin: 0 0 6px;
        }
        .sf__sub { font-size: 14px; color: var(--text-secondary); margin: 0; }
        .sf__toolbar { display: flex; justify-content: center; margin-bottom: 16px; }
        .sf__add-btn {
          display: flex; align-items: center; gap: 6px; padding: 10px 20px;
          border-radius: 12px; background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
          color: #fff; border: none; cursor: pointer; font-size: 14px; font-weight: 700;
          transition: all 0.2s ease;
        }
        .sf__add-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(var(--sah-accent-1-rgb), 0.3); }
        .sf__form {
          max-width: 500px; margin: 0 auto 20px; padding: 20px;
          border-radius: 16px; background: var(--glass-bg); border: 1px solid var(--glass-border);
          display: flex; flex-direction: column; gap: 12px;
        }
        .sf__form-row { display: flex; gap: 12px; }
        .sf__form-row .sf__field { flex: 1; }
        .sf__field { display: flex; flex-direction: column; gap: 4px; }
        .sf__field label { font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
        .sf__field input, .sf__field select {
          padding: 10px 14px; border-radius: 10px; background: var(--glass-bg); border: 1px solid var(--glass-border);
          color: var(--text-primary); font-size: 14px; outline: none; transition: border 0.2s;
        }
        .sf__field input:focus, .sf__field select:focus { border-color: var(--glass-border-hover); }
        .sf__field input::placeholder { color: var(--text-muted); }
        .sf__save-btn {
          padding: 10px 20px; border-radius: 10px;
          background: linear-gradient(135deg, var(--sah-accent-1), var(--sah-accent-2));
          color: #fff; border: none; cursor: pointer; font-size: 14px; font-weight: 700;
          transition: all 0.2s;
        }
        .sf__save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .sf__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .sf__cmd {
          padding: 16px; border-radius: 16px;
          background: var(--glass-bg); border: 1px solid var(--glass-border);
          display: flex; flex-direction: column; gap: 8px; transition: all 0.2s;
        }
        .sf__cmd:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
        .sf__cmd-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .sf__cmd-trigger { font-size: 15px; font-weight: 700; color: var(--text-primary); font-style: italic; }
        .sf__cmd-del {
          width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; color: var(--text-muted); cursor: pointer; transition: all 0.2s;
        }
        .sf__cmd-del:hover { color: var(--sah-rose); background: rgba(255,75,138,0.08); }
        .sf__cmd-meta { display: flex; gap: 8px; }
        .sf__cmd-type, .sf__cmd-lang {
          font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px;
          background: rgba(var(--sah-accent-1-rgb), 0.08); color: var(--sah-accent-1);
          text-transform: uppercase; letter-spacing: 0.03em;
        }
        .sf__cmd-lang { background: rgba(99,102,241,0.08); color: #6366F1; }
        .sf__cmd-value { font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.4; }
        .sf__skel { height: 120px; border-radius: 16px; background: var(--glass-bg); animation: skelPulse 1.5s ease infinite; }
        @keyframes skelPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.2; } }
        .sf__empty {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 50px 20px; color: var(--text-muted); text-align: center;
        }
        .sf__empty p { font-size: 14px; font-weight: 600; color: var(--text-secondary); margin: 0; }
        .sf__empty span { font-size: 12px; }
        @media (max-width: 500px) { .sf__form-row { flex-direction: column; } }
      `}</style>
    </div>
  );
}
