import React, { useState } from 'react';
import { Entry, CognitiveRecord, Intervention, BehavioralAction } from '../types';
import { useJournalStore } from '../store';
import { cn } from '../lib/utils';

interface OverlayProps {
  entry: Entry;
  onClose: () => void;
}

export function CognitiveOverlay({ entry, onClose }: OverlayProps) {
  const updateEntry = useJournalStore(s => s.updateEntry);
  const [data, setData] = useState<CognitiveRecord>(entry.cognitive || {
    trigger: '',
    thought: '',
    emotion: '',
    intensity: 5,
    evidence: '',
    alternative: '',
    outcome: ''
  });

  const handleSave = () => {
    updateEntry(entry.id, { cognitive: data });
    onClose();
  };

  return (
    <div className="mt-6 p-6 bg-paper-dim border border-paper-dark space-y-6">
      <h4 className="font-serif italic text-xl text-ink">Cognitive Record</h4>
      
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-ink-light uppercase tracking-widest mb-2">Trigger / Situation</label>
          <input 
            type="text" 
            value={data.trigger || ''} 
            onChange={e => setData({...data, trigger: e.target.value})}
            className="w-full bg-transparent border-b border-paper-dark px-0 py-2 font-serif text-lg text-ink outline-none focus:border-ink placeholder:text-ink-faint transition-colors"
            placeholder="What happened?"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-ink-light uppercase tracking-widest mb-2">Thought / Observation</label>
          <textarea 
            value={data.thought || ''} 
            onChange={e => setData({...data, thought: e.target.value})}
            className="w-full bg-transparent border-b border-paper-dark px-0 py-2 font-serif text-lg text-ink outline-none focus:border-ink placeholder:text-ink-faint transition-colors resize-none"
            rows={2}
            placeholder="What went through your mind?"
          />
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <label className="block text-xs font-medium text-ink-light uppercase tracking-widest mb-2">Emotion</label>
            <input 
              type="text" 
              value={data.emotion || ''} 
              onChange={e => setData({...data, emotion: e.target.value})}
              className="w-full bg-transparent border-b border-paper-dark px-0 py-2 font-serif text-lg text-ink outline-none focus:border-ink placeholder:text-ink-faint transition-colors"
              placeholder="e.g. Anxious"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs font-medium text-ink-light uppercase tracking-widest mb-2">Intensity</label>
            <input 
              type="number" 
              min="1" max="10"
              value={data.intensity || 5} 
              onChange={e => setData({...data, intensity: parseInt(e.target.value)})}
              className="w-full bg-transparent border-b border-paper-dark px-0 py-2 font-serif text-lg text-ink outline-none focus:border-ink transition-colors text-center"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-ink-light uppercase tracking-widest mb-2">Evidence Against</label>
            <textarea 
              value={data.evidence || ''} 
              onChange={e => setData({...data, evidence: e.target.value})}
              className="w-full bg-transparent border-b border-paper-dark px-0 py-2 font-serif text-lg text-ink outline-none focus:border-ink placeholder:text-ink-faint transition-colors resize-none"
              rows={2}
              placeholder="Facts that don't support it"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-light uppercase tracking-widest mb-2">Alternative Thought</label>
            <textarea 
              value={data.alternative || ''} 
              onChange={e => setData({...data, alternative: e.target.value})}
              className="w-full bg-transparent border-b border-paper-dark px-0 py-2 font-serif text-lg text-ink outline-none focus:border-ink placeholder:text-ink-faint transition-colors resize-none"
              rows={2}
              placeholder="A more balanced perspective"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 pt-4 border-t border-paper-dark">
          <span className="text-xs font-medium text-ink-light uppercase tracking-widest">Stance:</span>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="radio" 
              checked={data.actStance === 'allowed'}
              onChange={() => setData({...data, actStance: 'allowed'})}
              className="text-ink focus:ring-ink"
            />
            <span className="text-ink text-sm font-medium uppercase tracking-widest">Allowed / Accepted</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="radio" 
              checked={data.actStance === 'resisted'}
              onChange={() => setData({...data, actStance: 'resisted'})}
              className="text-ink focus:ring-ink"
            />
            <span className="text-ink text-sm font-medium uppercase tracking-widest">Resisted / Fought</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button onClick={onClose} className="px-4 py-2 text-ink-light hover:text-ink text-xs font-medium uppercase tracking-widest transition-colors">Cancel</button>
        <button onClick={handleSave} className="px-6 py-2 bg-ink text-paper text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-90">Save Record</button>
      </div>
    </div>
  );
}

export function InterventionOverlay({ entry, onClose }: OverlayProps) {
  const updateEntry = useJournalStore(s => s.updateEntry);
  const [data, setData] = useState<Intervention>(entry.intervention || {
    technique: 'Box Breathing',
    urge: '',
    duration: 5,
    stateBefore: undefined,
    stateAfter: undefined,
    outcome: ''
  });

  const TECHNIQUES = ['Box Breathing', '4-7-8 Breathing', 'Body Scan', '5-4-3-2-1 Grounding', 'Cold Water', 'TIPP', 'Radical Acceptance', 'STOP', 'Other'];

  const handleSave = () => {
    updateEntry(entry.id, { intervention: data });
    onClose();
  };

  return (
    <div className="mt-6 p-6 bg-accent-sky-light/10 border border-accent-sky/20 space-y-6">
      <h4 className="font-serif italic text-xl text-accent-sky-dark">State Intervention</h4>
      
      <div className="space-y-5">
        <div className="flex gap-6">
          <div className="flex-1">
            <label className="block text-xs font-medium text-accent-sky-dark/70 uppercase tracking-widest mb-2">Technique / Skill</label>
            <select 
              value={data.technique}
              onChange={e => setData({...data, technique: e.target.value})}
              className="w-full bg-transparent border-b border-accent-sky/20 px-0 py-2 font-serif text-lg text-accent-sky-dark outline-none focus:border-accent-sky transition-colors"
            >
              {TECHNIQUES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-accent-sky-dark/70 uppercase tracking-widest mb-2">Urge (Optional)</label>
            <input 
              type="text" 
              value={data.urge || ''} 
              onChange={e => setData({...data, urge: e.target.value})}
              className="w-full bg-transparent border-b border-accent-sky/20 px-0 py-2 font-serif text-lg text-accent-sky-dark outline-none focus:border-accent-sky placeholder:text-accent-sky-dark/30 transition-colors"
              placeholder="e.g. Avoid, Yell"
            />
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <label className="block text-xs font-medium text-accent-sky-dark/70 uppercase tracking-widest mb-4">State Before (1-10)</label>
            <input 
              type="range" min="1" max="10" 
              value={data.stateBefore || 5}
              onChange={e => setData({...data, stateBefore: parseInt(e.target.value)})}
              className="w-full accent-accent-sky"
            />
            <div className="text-center font-serif text-xl text-accent-sky-dark mt-2">{data.stateBefore || '-'}</div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-accent-sky-dark/70 uppercase tracking-widest mb-4">State After (1-10)</label>
            <input 
              type="range" min="1" max="10" 
              value={data.stateAfter || 5}
              onChange={e => setData({...data, stateAfter: parseInt(e.target.value)})}
              className="w-full accent-accent-sky"
            />
            <div className="text-center font-serif text-xl text-accent-sky-dark mt-2">{data.stateAfter || '-'}</div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-accent-sky-dark/70 uppercase tracking-widest mb-2">Outcome / Notes</label>
          <input 
            type="text" 
            value={data.outcome || ''} 
            onChange={e => setData({...data, outcome: e.target.value})}
            className="w-full bg-transparent border-b border-accent-sky/20 px-0 py-2 font-serif text-lg text-accent-sky-dark outline-none focus:border-accent-sky placeholder:text-accent-sky-dark/30 transition-colors"
            placeholder="Did it help?"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button onClick={onClose} className="px-4 py-2 text-accent-sky-dark/70 hover:text-accent-sky-dark text-xs font-medium uppercase tracking-widest transition-colors">Cancel</button>
        <button 
          onClick={handleSave} 
          disabled={data.stateBefore === undefined || data.stateAfter === undefined}
          className="px-6 py-2 bg-accent-sky text-paper text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Intervention
        </button>
      </div>
    </div>
  );
}

export function BehaviorOverlay({ entry, onClose }: OverlayProps) {
  const updateEntry = useJournalStore(s => s.updateEntry);
  const values = useJournalStore(s => s.values);
  const [data, setData] = useState<BehavioralAction>(entry.behavior || {
    action: '',
    value: values[0] || '',
    planned: false,
    completed: false,
    stateBefore: undefined,
    stateAfter: undefined
  });

  const handleSave = () => {
    updateEntry(entry.id, { behavior: data });
    onClose();
  };

  return (
    <div className="mt-6 p-6 bg-accent-sage-light/10 border border-accent-sage/20 space-y-6">
      <h4 className="font-serif italic text-xl text-accent-sage-dark">Behavioral Action / Exposure</h4>
      
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-accent-sage-dark/70 uppercase tracking-widest mb-2">Action / Challenge</label>
          <input 
            type="text" 
            value={data.action} 
            onChange={e => setData({...data, action: e.target.value})}
            className="w-full bg-transparent border-b border-accent-sage/20 px-0 py-2 font-serif text-lg text-accent-sage-dark outline-none focus:border-accent-sage placeholder:text-accent-sage-dark/30 transition-colors"
            placeholder="What will you do or face?"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-accent-sage-dark/70 uppercase tracking-widest mb-2">Aligned Value</label>
          <select 
            value={data.value || ''} 
            onChange={e => setData({...data, value: e.target.value})}
            className="w-full bg-transparent border-b border-accent-sage/20 px-0 py-2 font-serif text-lg text-accent-sage-dark outline-none focus:border-accent-sage transition-colors"
          >
            <option value="">None</option>
            {values.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <label className="block text-xs font-medium text-accent-sage-dark/70 uppercase tracking-widest mb-4">Anxiety/State Before (1-10)</label>
            <input 
              type="range" min="1" max="10" 
              value={data.stateBefore || 5}
              onChange={e => setData({...data, stateBefore: parseInt(e.target.value)})}
              className="w-full accent-accent-sage"
            />
            <div className="text-center font-serif text-xl text-accent-sage-dark mt-2">{data.stateBefore || '-'}</div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-accent-sage-dark/70 uppercase tracking-widest mb-4">Anxiety/State After (1-10)</label>
            <input 
              type="range" min="1" max="10" 
              value={data.stateAfter || 5}
              onChange={e => setData({...data, stateAfter: parseInt(e.target.value)})}
              className="w-full accent-accent-sage"
            />
            <div className="text-center font-serif text-xl text-accent-sage-dark mt-2">{data.stateAfter || '-'}</div>
          </div>
        </div>

        <div className="flex items-center gap-8 pt-4 border-t border-accent-sage/20">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={data.planned}
              onChange={e => setData({...data, planned: e.target.checked})}
              className="w-4 h-4 text-accent-sage border-accent-sage/30 focus:ring-accent-sage"
            />
            <span className="text-accent-sage-dark text-sm font-medium uppercase tracking-widest">Planned Ahead</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={data.completed}
              onChange={e => setData({...data, completed: e.target.checked})}
              className="w-4 h-4 text-accent-sage border-accent-sage/30 focus:ring-accent-sage"
            />
            <span className="text-accent-sage-dark text-sm font-medium uppercase tracking-widest">Completed</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button onClick={onClose} className="px-4 py-2 text-accent-sage-dark/70 hover:text-accent-sage-dark text-xs font-medium uppercase tracking-widest transition-colors">Cancel</button>
        <button 
          onClick={handleSave} 
          disabled={data.stateBefore === undefined || data.stateAfter === undefined || !data.action.trim()}
          className="px-6 py-2 bg-accent-sage text-paper text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Action
        </button>
      </div>
    </div>
  );
}

