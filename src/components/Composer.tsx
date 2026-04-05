import React, { useState, useRef, useEffect } from 'react';
import { useJournalStore } from '../store';
import { MoodRating } from '../types';
import { Smile, Frown, Meh, Send, Link as LinkIcon, Angry, Laugh, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { differenceInMinutes } from 'date-fns';

const MOODS: { value: MoodRating; icon: React.ElementType; label: string; color: string }[] = [
  { value: 1, icon: Angry, label: 'Awful', color: 'text-accent-rust bg-accent-rust-light' },
  { value: 2, icon: Frown, label: 'Bad', color: 'text-accent-rust bg-accent-rust-light' },
  { value: 3, icon: Meh, label: 'Okay', color: 'text-ink-light bg-paper-dark' },
  { value: 4, icon: Smile, label: 'Good', color: 'text-accent-sage bg-accent-sage-light' },
  { value: 5, icon: Laugh, label: 'Great', color: 'text-accent-sky bg-accent-sky-light' },
];

export function Composer() {
  const [text, setText] = useState('');
  const [mood, setMood] = useState<MoodRating | undefined>();
  const [linkToRecent, setLinkToRecent] = useState(false);
  
  const [isSaved, setIsSaved] = useState(false);
  
  const addEntry = useJournalStore((s) => s.addEntry);
  const entries = useJournalStore((s) => s.entries);
  const values = useJournalStore((s) => s.values);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mostRecentEntry = entries[0];
  const isRecent = mostRecentEntry && differenceInMinutes(new Date(), new Date(mostRecentEntry.timestamp)) < 30;

  // Auto-enable linking if the last entry was very recent (e.g. < 5 mins)
  useEffect(() => {
    if (mostRecentEntry && differenceInMinutes(new Date(), new Date(mostRecentEntry.timestamp)) < 5) {
      setLinkToRecent(true);
    } else {
      setLinkToRecent(false);
    }
  }, [mostRecentEntry]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSave = () => {
    if (!text.trim() && !mood) return;
    addEntry({ 
      text: text.trim(), 
      mood,
      linkedEntryId: linkToRecent && mostRecentEntry ? mostRecentEntry.id : undefined
    });
    setText('');
    setMood(undefined);
    setLinkToRecent(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-md border-t border-paper-dark p-4 sm:p-6 pb-8 sm:pb-8 z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        {values.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide items-center">
            <span className="text-xs text-ink-light font-medium uppercase tracking-widest shrink-0">Living by:</span>
            {values.map(v => (
              <span key={v} className="text-ink text-xs uppercase tracking-widest font-medium">
                {v}
              </span>
            ))}
          </div>
        )}

        {isRecent && (
          <button 
            onClick={() => setLinkToRecent(!linkToRecent)}
            className={cn(
              "flex items-center gap-2 text-xs font-medium uppercase tracking-widest w-fit transition-colors",
              linkToRecent ? "text-ink" : "text-ink-light hover:text-ink"
            )}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            {linkToRecent ? "Linking to previous entry" : "Link to previous entry?"}
          </button>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          className="w-full resize-none outline-none text-lg font-serif leading-relaxed bg-paper border border-paper-dark rounded-2xl p-4 shadow-sm placeholder:text-ink-faint text-ink max-h-[200px] overflow-y-auto focus:border-ink/30 focus:ring-1 focus:ring-ink/10 transition-all"
          rows={1}
        />
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {MOODS.map((m) => {
              const Icon = m.icon;
              const isSelected = mood === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => setMood(isSelected ? undefined : m.value)}
                  className={cn(
                    "p-2 rounded-full transition-all duration-200",
                    isSelected ? m.color : "text-ink-light hover:bg-paper-dark"
                  )}
                  title={m.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSave}
            disabled={!mood || isSaved}
            className={cn(
              "p-3 rounded-full transition-all duration-300",
              isSaved ? "bg-accent-sage text-paper" : "bg-ink text-paper disabled:opacity-30"
            )}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
