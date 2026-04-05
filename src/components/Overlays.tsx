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
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CognitiveRecord>(entry.cognitive || {
    trigger: '',
    thought: '',
    emotion: '',
    intensity: 5,
    evidence: '',
    alternative: '',
    outcome: ''
  });

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleSave = () => {
    updateEntry(entry.id, { cognitive: data });
    onClose();
  };

  const handleCancel = () => {
    const hasChanges = JSON.stringify(data) !== JSON.stringify(entry.cognitive || {
      trigger: '',
      thought: '',
      emotion: '',
      intensity: 5,
      evidence: '',
      alternative: '',
      outcome: ''
    });
    
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (showCancelConfirm) {
    return (
      <div className="mt-6 p-6 bg-paper-dim border border-paper-dark space-y-6">
        <h4 className="font-serif italic text-xl text-ink">Discard changes?</h4>
        <p className="text-ink-light">You have unsaved changes in your thought log.</p>
        <div className="flex justify-end gap-4 pt-4">
          <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 text-ink-light hover:text-ink text-xs font-medium uppercase tracking-widest transition-colors">Keep Editing</button>
          <button onClick={onClose} className="px-6 py-2 bg-accent-rust text-paper text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-90">Discard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 p-6 bg-paper-dim border border-paper-dark space-y-6">
      <div>
        <h4 className="font-serif italic text-xl text-ink">Thought Log</h4>
        <p className="text-ink-light text-sm mt-1">Untangle a difficult thought by writing it down.</p>
      </div>
      
      <div className="space-y-5">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <label className="block text-xs font-medium text-ink-light uppercase tracking-widest mb-2">1. The Situation</label>
            <input 
              type="text" 
              value={data.trigger || ''} 
              onChange={e => setData({...data, trigger: e.target.value})}
              className="w-full bg-transparent border-b border-paper-dark px-0 py-2 font-serif text-lg text-ink outline-none focus:border-ink placeholder:text-ink-faint transition-colors"
              placeholder="What happened? Where were you?"
              autoFocus
            />
          </div>
        )}
        
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <label className="block text-xs font-medium text-ink-light uppercase tracking-widest mb-2">2. The Thought</label>
            <textarea 
              value={data.thought || ''} 
              onChange={e => setData({...data, thought: e.target.value})}
              className="w-full bg-transparent border-b border-paper-dark px-0 py-2 font-serif text-lg text-ink outline-none focus:border-ink placeholder:text-ink-faint transition-colors resize-none"
              rows={3}
              placeholder="What went through your mind?"
              autoFocus
            />
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <label className="block text-xs font-medium text-ink-light uppercase tracking-widest mb-2">3. The Feeling</label>
            <div className="flex gap-6">
              <div className="flex-1">
                <input 
                  type="text" 
                  value={data.emotion || ''} 
                  onChange={e => setData({...data, emotion: e.target.value})}
                  className="w-full bg-transparent border-b border-paper-dark px-0 py-2 font-serif text-lg text-ink outline-none focus:border-ink placeholder:text-ink-faint transition-colors"
                  placeholder="Emotion (e.g. Anxious, Sad)"
                  autoFocus
                />
              </div>
              <div className="w-24">
                <input 
                  type="number" 
                  min="1" max="10"
                  value={data.intensity || 5} 
                  onChange={e => setData({...data, intensity: parseInt(e.target.value)})}
                  className="w-full bg-transparent border-b border-paper-dark px-0 py-2 font-serif text-lg text-ink outline-none focus:border-ink transition-colors text-center"
                  placeholder="1-10"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <label className="block text-xs font-medium text-ink-light uppercase tracking-widest mb-2">4. A Different Perspective</label>
            <div>
              <textarea 
                value={data.evidence || ''} 
                onChange={e => setData({...data, evidence: e.target.value})}
                className="w-full bg-transparent border-b border-paper-dark px-0 py-2 font-serif text-lg text-ink outline-none focus:border-ink placeholder:text-ink-faint transition-colors resize-none mb-4"
                rows={2}
                placeholder="Are there facts that don't support this thought?"
                autoFocus
              />
              <textarea 
                value={data.alternative || ''} 
                onChange={e => setData({...data, alternative: e.target.value})}
                className="w-full bg-transparent border-b border-paper-dark px-0 py-2 font-serif text-lg text-ink outline-none focus:border-ink placeholder:text-ink-faint transition-colors resize-none"
                rows={2}
                placeholder="What's a more balanced way to look at it?"
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <label className="block text-xs font-medium text-ink-light uppercase tracking-widest mb-2">5. Your Response</label>
            <div className="flex flex-col gap-4 pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-paper-dark hover:bg-paper transition-colors">
                <input 
                  type="radio" 
                  checked={data.actStance === 'allowed'}
                  onChange={() => setData({...data, actStance: 'allowed'})}
                  className="text-ink focus:ring-ink"
                />
                <span className="text-ink text-sm font-medium uppercase tracking-widest">I allowed it to be there</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-paper-dark hover:bg-paper transition-colors">
                <input 
                  type="radio" 
                  checked={data.actStance === 'resisted'}
                  onChange={() => setData({...data, actStance: 'resisted'})}
                  className="text-ink focus:ring-ink"
                />
                <span className="text-ink text-sm font-medium uppercase tracking-widest">I fought or resisted it</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4">
        <div className="flex gap-2">
          {step > 1 ? (
            <button onClick={prevStep} className="px-4 py-2 text-ink-light hover:text-ink text-xs font-medium uppercase tracking-widest transition-colors">Back</button>
          ) : (
            <button onClick={handleCancel} className="px-4 py-2 text-ink-light hover:text-ink text-xs font-medium uppercase tracking-widest transition-colors">Cancel</button>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-ink-faint mr-2">{step} / 5</span>
          {step < 5 ? (
            <button onClick={nextStep} className="px-6 py-2 bg-ink text-paper text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-90">Next</button>
          ) : (
            <button onClick={handleSave} className="px-6 py-2 bg-ink text-paper text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-90">Save Log</button>
          )}
        </div>
      </div>
    </div>
  );
}

export function InterventionOverlay({ entry, onClose }: OverlayProps) {
  const updateEntry = useJournalStore(s => s.updateEntry);
  const [showDetails, setShowDetails] = useState(false);
  const [data, setData] = useState<Intervention>(entry.intervention || {
    technique: 'Box Breathing',
    urge: '',
    duration: 5,
    stateBefore: 5,
    stateAfter: 5,
    outcome: ''
  });

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const TECHNIQUES = ['Box Breathing', '4-7-8 Breathing', 'Body Scan', '5-4-3-2-1 Grounding', 'Cold Water', 'TIPP', 'Radical Acceptance', 'STOP', 'Other'];

  const handleSave = () => {
    updateEntry(entry.id, { intervention: data });
    onClose();
  };

  const handleCancel = () => {
    const hasChanges = JSON.stringify(data) !== JSON.stringify(entry.intervention || {
      technique: 'Box Breathing',
      urge: '',
      duration: 5,
      stateBefore: 5,
      stateAfter: 5,
      outcome: ''
    });
    
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  if (showCancelConfirm) {
    return (
      <div className="mt-6 p-6 bg-accent-sky-light/10 border border-accent-sky/20 space-y-6">
        <h4 className="font-serif italic text-xl text-accent-sky-dark">Discard changes?</h4>
        <p className="text-accent-sky-dark/70">You have unsaved changes in your intervention log.</p>
        <div className="flex justify-end gap-4 pt-4">
          <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 text-accent-sky-dark/70 hover:text-accent-sky-dark text-xs font-medium uppercase tracking-widest transition-colors">Keep Editing</button>
          <button onClick={onClose} className="px-6 py-2 bg-accent-rust text-paper text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-90">Discard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 p-6 bg-accent-sky-light/10 border border-accent-sky/20 space-y-6">
      <div>
        <h4 className="font-serif italic text-xl text-accent-sky-dark">Calm-down technique</h4>
        <p className="text-accent-sky-dark/70 text-sm mt-1">Log a technique you used to soothe your nervous system.</p>
      </div>
      
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-accent-sky-dark/70 uppercase tracking-widest mb-2">Technique / Skill</label>
          <select 
            value={data.technique}
            onChange={e => setData({...data, technique: e.target.value})}
            className="w-full bg-transparent border-b border-accent-sky/20 px-0 py-2 font-serif text-lg text-accent-sky-dark outline-none focus:border-accent-sky transition-colors"
          >
            {TECHNIQUES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex gap-8">
          <div className="flex-1">
            <label className="block text-xs font-medium text-accent-sky-dark/70 uppercase tracking-widest mb-4">State Before (1-10)</label>
            <input 
              type="range" min="1" max="10" 
              value={data.stateBefore}
              onChange={e => setData({...data, stateBefore: parseInt(e.target.value)})}
              className="w-full accent-accent-sky"
            />
            <div className="text-center font-serif text-xl text-accent-sky-dark mt-2">{data.stateBefore}</div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-accent-sky-dark/70 uppercase tracking-widest mb-4">State After (1-10)</label>
            <input 
              type="range" min="1" max="10" 
              value={data.stateAfter}
              onChange={e => setData({...data, stateAfter: parseInt(e.target.value)})}
              className="w-full accent-accent-sky"
            />
            <div className="text-center font-serif text-xl text-accent-sky-dark mt-2">{data.stateAfter}</div>
          </div>
        </div>

        {!showDetails ? (
          <button 
            onClick={() => setShowDetails(true)}
            className="text-xs font-medium text-accent-sky-dark/70 uppercase tracking-widest hover:text-accent-sky-dark transition-colors"
          >
            + Add optional details
          </button>
        ) : (
          <div className="space-y-5 animate-in fade-in duration-300 border-t border-accent-sky/10 pt-4">
            <div>
              <label className="block text-xs font-medium text-accent-sky-dark/70 uppercase tracking-widest mb-2">Urge (Optional)</label>
              <input 
                type="text" 
                value={data.urge || ''} 
                onChange={e => setData({...data, urge: e.target.value})}
                className="w-full bg-transparent border-b border-accent-sky/20 px-0 py-2 font-serif text-lg text-accent-sky-dark outline-none focus:border-accent-sky placeholder:text-accent-sky-dark/30 transition-colors"
                placeholder="e.g. Avoid, Yell"
              />
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
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button onClick={handleCancel} className="px-4 py-2 text-accent-sky-dark/70 hover:text-accent-sky-dark text-xs font-medium uppercase tracking-widest transition-colors">Cancel</button>
        <button 
          onClick={handleSave} 
          className="px-6 py-2 bg-accent-sky text-paper text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-90"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export function BehaviorOverlay({ entry, onClose }: OverlayProps) {
  const updateEntry = useJournalStore(s => s.updateEntry);
  const values = useJournalStore(s => s.values);
  const [showDetails, setShowDetails] = useState(false);
  const [data, setData] = useState<BehavioralAction>(entry.behavior || {
    action: '',
    value: values[0] || '',
    planned: false,
    completed: false,
    stateBefore: 5,
    stateAfter: 5
  });

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleSave = () => {
    updateEntry(entry.id, { behavior: data });
    onClose();
  };

  const handleCancel = () => {
    const hasChanges = JSON.stringify(data) !== JSON.stringify(entry.behavior || {
      action: '',
      value: values[0] || '',
      planned: false,
      completed: false,
      stateBefore: 5,
      stateAfter: 5
    });
    
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  if (showCancelConfirm) {
    return (
      <div className="mt-6 p-6 bg-accent-sage-light/10 border border-accent-sage/20 space-y-6">
        <h4 className="font-serif italic text-xl text-accent-sage-dark">Discard changes?</h4>
        <p className="text-accent-sage-dark/70">You have unsaved changes in your action plan.</p>
        <div className="flex justify-end gap-4 pt-4">
          <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 text-accent-sage-dark/70 hover:text-accent-sage-dark text-xs font-medium uppercase tracking-widest transition-colors">Keep Editing</button>
          <button onClick={onClose} className="px-6 py-2 bg-accent-rust text-paper text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-90">Discard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 p-6 bg-accent-sage-light/10 border border-accent-sage/20 space-y-6">
      <div>
        <h4 className="font-serif italic text-xl text-accent-sage-dark">Action Plan</h4>
        <p className="text-accent-sage-dark/70 text-sm mt-1">Plan or record an action that challenges your anxiety.</p>
      </div>
      
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-accent-sage-dark/70 uppercase tracking-widest mb-2">Action / Challenge</label>
          <input 
            type="text" 
            value={data.action} 
            onChange={e => setData({...data, action: e.target.value})}
            className="w-full bg-transparent border-b border-accent-sage/20 px-0 py-2 font-serif text-lg text-accent-sage-dark outline-none focus:border-accent-sage placeholder:text-accent-sage-dark/30 transition-colors"
            placeholder="What will you do or face?"
            autoFocus
          />
        </div>
        
        <div className="flex gap-8">
          <div className="flex-1">
            <label className="block text-xs font-medium text-accent-sage-dark/70 uppercase tracking-widest mb-4">Anxiety Before (1-10)</label>
            <input 
              type="range" min="1" max="10" 
              value={data.stateBefore}
              onChange={e => setData({...data, stateBefore: parseInt(e.target.value)})}
              className="w-full accent-accent-sage"
            />
            <div className="text-center font-serif text-xl text-accent-sage-dark mt-2">{data.stateBefore}</div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-accent-sage-dark/70 uppercase tracking-widest mb-4">Anxiety After (1-10)</label>
            <input 
              type="range" min="1" max="10" 
              value={data.stateAfter}
              onChange={e => setData({...data, stateAfter: parseInt(e.target.value)})}
              className="w-full accent-accent-sage"
            />
            <div className="text-center font-serif text-xl text-accent-sage-dark mt-2">{data.stateAfter}</div>
          </div>
        </div>

        {!showDetails ? (
          <button 
            onClick={() => setShowDetails(true)}
            className="text-xs font-medium text-accent-sage-dark/70 uppercase tracking-widest hover:text-accent-sage-dark transition-colors"
          >
            + Add optional details
          </button>
        ) : (
          <div className="space-y-5 animate-in fade-in duration-300 border-t border-accent-sage/10 pt-4">
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

            <div className="flex items-center gap-8 pt-2">
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
        )}
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button onClick={handleCancel} className="px-4 py-2 text-accent-sage-dark/70 hover:text-accent-sage-dark text-xs font-medium uppercase tracking-widest transition-colors">Cancel</button>
        <button 
          onClick={handleSave} 
          disabled={!data.action.trim()}
          className="px-6 py-2 bg-accent-sage text-paper text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
      </div>
    </div>
  );
}

