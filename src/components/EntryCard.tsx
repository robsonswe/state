import React, { useState } from 'react';
import { format } from 'date-fns';
import { Entry } from '../types';
import { Brain, Activity, Target, Plus, Trash2, Pin, Link as LinkIcon } from 'lucide-react';
import { CognitiveOverlay, InterventionOverlay, BehaviorOverlay } from './Overlays';
import { cn } from '../lib/utils';
import { useJournalStore } from '../store';

interface EntryCardProps {
  key?: React.Key;
  entry: Entry;
}

export function EntryCard({ entry }: EntryCardProps) {
  const [activeOverlay, setActiveOverlay] = useState<'cognitive' | 'intervention' | 'behavior' | 'link' | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteEntry = useJournalStore(s => s.deleteEntry);
  const updateEntry = useJournalStore(s => s.updateEntry);
  const entries = useJournalStore(s => s.entries);

  const hasCognitive = !!entry.cognitive;
  const hasIntervention = !!entry.intervention;
  const hasBehavior = !!entry.behavior;

  const isLowMood = entry.mood === 1 || entry.mood === 2;
  const hasStrongEmotion = /(anxious|sad|angry|overwhelmed|hopeless|worthless|guilty|panic|scared|terrified|furious|depressed)/i.test(entry.text);

  let suggestion = null;
  if (!hasCognitive && hasStrongEmotion) {
    suggestion = { type: 'cognitive' as const, label: 'Record Thought', icon: Brain, color: 'text-ink bg-paper-dark hover:bg-stone-200' };
  } else if (!hasIntervention && isLowMood) {
    suggestion = { type: 'intervention' as const, label: 'Try Intervention', icon: Activity, color: 'text-accent-sky bg-accent-sky-light hover:bg-blue-100' };
  } else if (!hasBehavior && isLowMood) {
    suggestion = { type: 'behavior' as const, label: 'Plan Action', icon: Target, color: 'text-accent-sage bg-accent-sage-light hover:bg-emerald-100' };
  }

  const moodColors: Record<number, string> = {
    1: 'text-accent-rust',
    2: 'text-accent-rust',
    3: 'text-ink-light',
    4: 'text-accent-sage',
    5: 'text-accent-sky',
  };

  const hasStructure = hasCognitive || hasIntervention || hasBehavior;
  const linkedEntry = entry.linkedEntryId ? entries.find(e => e.id === entry.linkedEntryId) : null;

  return (
    <div className={cn(
      "relative group transition-all",
      entry.isPinned ? "bg-accent-rust-light/30 -mx-6 px-6 py-4 rounded-xl" : ""
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-ink-light uppercase tracking-widest">
            {format(new Date(entry.timestamp), 'h:mm a')}
          </span>
          {entry.mood && (
            <div className={cn(
              "text-xs font-medium tracking-widest uppercase",
              moodColors[entry.mood]
            )}>
              Mood: {entry.mood}/5
            </div>
          )}
          {entry.isPinned && (
            <Pin className="w-3.5 h-3.5 text-accent-rust fill-accent-rust" />
          )}
        </div>
      </div>

      <div className="absolute top-0 right-0 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
        {isDeleting ? (
          <div className="flex items-center gap-2 bg-paper-dim px-2 py-1 rounded border border-accent-rust/20">
            <span className="text-xs font-medium text-accent-rust uppercase tracking-widest">Delete?</span>
            <button 
              onClick={() => deleteEntry(entry.id)}
              className="text-xs font-medium text-accent-rust hover:text-red-700 px-1"
            >
              Yes
            </button>
            <button 
              onClick={() => setIsDeleting(false)}
              className="text-xs font-medium text-ink-light hover:text-ink px-1"
            >
              No
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={() => updateEntry(entry.id, { isPinned: !entry.isPinned })}
              className="p-1.5 text-ink-light hover:text-accent-rust transition-colors"
              title={entry.isPinned ? "Unpin" : "Pin"}
            >
              <Pin className={cn("w-4 h-4", entry.isPinned && "fill-accent-rust text-accent-rust")} />
            </button>
            <button 
              onClick={() => setIsDeleting(true)}
              className="p-1.5 text-ink-light hover:text-accent-rust transition-colors"
              title="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {entry.text && (
        <p className="font-serif text-xl leading-relaxed text-ink mb-6 whitespace-pre-wrap">
          {entry.text}
        </p>
      )}

      {/* Render existing structured data */}
      {hasCognitive && !activeOverlay && (
        <div className="mb-6 pl-4 border-l-2 border-paper-dark cursor-pointer hover:border-ink-light transition-colors" onClick={() => setActiveOverlay('cognitive')}>
          <div className="flex items-center gap-2 mb-3 text-ink-light">
            <Brain className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-widest">Cognitive Record</span>
          </div>
          <div className="space-y-3 font-serif text-lg text-ink">
            {entry.cognitive?.trigger && (
              <div><span className="text-ink-light italic mr-2">Trigger:</span> {entry.cognitive.trigger}</div>
            )}
            {entry.cognitive?.thought && (
              <div><span className="text-ink-light italic mr-2">Thought:</span> {entry.cognitive.thought}</div>
            )}
            {entry.cognitive?.alternative && (
              <div><span className="text-ink-light italic mr-2">Alternative:</span> {entry.cognitive.alternative}</div>
            )}
          </div>
        </div>
      )}

      {hasIntervention && !activeOverlay && (
        <div className="mb-6 pl-4 border-l-2 border-accent-sky-light cursor-pointer hover:border-accent-sky transition-colors" onClick={() => setActiveOverlay('intervention')}>
          <div className="flex items-center gap-2 mb-3 text-accent-sky">
            <Activity className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-widest">Intervention</span>
          </div>
          <div className="font-serif text-lg text-ink">
            Used <strong className="font-medium">{entry.intervention?.technique}</strong>. 
            State shifted from {entry.intervention?.stateBefore} to {entry.intervention?.stateAfter}.
          </div>
        </div>
      )}

      {hasBehavior && !activeOverlay && (
        <div className="mb-6 pl-4 border-l-2 border-accent-sage-light cursor-pointer hover:border-accent-sage transition-colors" onClick={() => setActiveOverlay('behavior')}>
          <div className="flex items-center gap-2 mb-3 text-accent-sage">
            <Target className="w-3.5 h-3.5" />
            <span className="text-xs font-medium uppercase tracking-widest">Behavioral Action</span>
          </div>
          <div className="font-serif text-lg text-ink flex items-center justify-between">
            <span>{entry.behavior?.action}</span>
            <div className="flex items-center gap-4 font-sans">
              <span className={cn("text-xs font-medium uppercase tracking-widest", entry.behavior?.completed ? "text-accent-sage" : "text-ink-light")}>
                {entry.behavior?.completed ? 'Completed' : 'Pending'}
              </span>
              {entry.behavior?.value && <span className="text-ink-light text-xs uppercase tracking-widest">Value: {entry.behavior.value}</span>}
            </div>
          </div>
        </div>
      )}

      {linkedEntry && !activeOverlay && (
        <div className="mb-6 pl-4 border-l-2 border-paper-dark flex items-start gap-4">
          <LinkIcon className="w-4 h-4 text-ink-light shrink-0 mt-1" />
          <div>
            <div className="text-ink-light text-xs font-medium uppercase tracking-widest mb-1">Linked to entry from {format(new Date(linkedEntry.timestamp), 'MMM d, h:mm a')}</div>
            <div className="font-serif text-lg text-ink line-clamp-2">{linkedEntry.text || 'Mood check-in'}</div>
          </div>
          <button 
            onClick={() => updateEntry(entry.id, { linkedEntryId: undefined })}
            className="ml-auto p-1 text-ink-light hover:text-accent-rust"
            title="Remove link"
          >
            &times;
          </button>
        </div>
      )}

      {/* Overlays */}
      {activeOverlay === 'cognitive' && <CognitiveOverlay entry={entry} onClose={() => setActiveOverlay(null)} />}
      {activeOverlay === 'intervention' && <InterventionOverlay entry={entry} onClose={() => setActiveOverlay(null)} />}
      {activeOverlay === 'behavior' && <BehaviorOverlay entry={entry} onClose={() => setActiveOverlay(null)} />}
      {activeOverlay === 'link' && (
        <div className="mt-6 p-6 bg-paper-dim border border-paper-dark space-y-6">
          <h4 className="font-serif text-xl italic text-ink">Link to Recent Entry</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {entries.filter(e => e.id !== entry.id).slice(0, 10).map(e => (
              <button
                key={e.id}
                onClick={() => {
                  updateEntry(entry.id, { linkedEntryId: e.id });
                  setActiveOverlay(null);
                }}
                className="w-full text-left p-3 hover:bg-paper-dark transition-colors border-b border-paper-dark last:border-0"
              >
                <div className="text-xs font-medium uppercase tracking-widest text-ink-light mb-2">{format(new Date(e.timestamp), 'MMM d, h:mm a')}</div>
                <div className="font-serif text-lg text-ink truncate">{e.text || `Mood: ${e.mood}/5`}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t border-paper-dark">
            <button onClick={() => setActiveOverlay(null)} className="text-sm font-medium uppercase tracking-widest text-ink-light hover:text-ink">Cancel</button>
          </div>
        </div>
      )}

      {/* Action Bar */}
      {!activeOverlay && (
        <div className="mt-4 relative flex items-center gap-4">
          {suggestion && (
            <button
              onClick={() => setActiveOverlay(suggestion.type)}
              className={cn("flex items-center gap-2 px-3 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors", suggestion.color)}
            >
              <suggestion.icon className="w-3.5 h-3.5" />
              {suggestion.label}
            </button>
          )}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-ink-light hover:text-ink transition-colors py-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {hasStructure || suggestion ? 'More' : 'Add structure'}
            </button>
            
            {showMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-paper border border-paper-dark shadow-xl z-10 py-2">
                {!hasCognitive && (
                  <button 
                    onClick={() => { setActiveOverlay('cognitive'); setShowMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium uppercase tracking-widest text-ink hover:bg-paper-dim flex items-center gap-3"
                  >
                    <Brain className="w-4 h-4 text-ink-light" /> Cognitive Record
                  </button>
                )}
                {!hasIntervention && (
                  <button 
                    onClick={() => { setActiveOverlay('intervention'); setShowMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium uppercase tracking-widest text-ink hover:bg-paper-dim flex items-center gap-3"
                  >
                    <Activity className="w-4 h-4 text-accent-sky" /> State Intervention
                  </button>
                )}
                {!hasBehavior && (
                  <button 
                    onClick={() => { setActiveOverlay('behavior'); setShowMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium uppercase tracking-widest text-ink hover:bg-paper-dim flex items-center gap-3"
                  >
                    <Target className="w-4 h-4 text-accent-sage" /> Behavioral Action
                  </button>
                )}
                {!entry.linkedEntryId && (
                  <button 
                    onClick={() => { setActiveOverlay('link'); setShowMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium uppercase tracking-widest text-ink hover:bg-paper-dim flex items-center gap-3 border-t border-paper-dark mt-1 pt-3"
                  >
                    <LinkIcon className="w-4 h-4 text-ink-light" /> Link to Entry
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

