import React, { useState, useMemo } from 'react';
import { useJournalStore } from '../store';
import { EntryCard } from './EntryCard';
import { format, isSameDay } from 'date-fns';
import { Search, Pin, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

export function Timeline() {
  const entries = useJournalStore(s => s.entries);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState<number | null>(null);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = searchQuery === '' || 
        entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.cognitive?.thought?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.intervention?.technique?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.behavior?.action?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesMood = filterMood === null || entry.mood === filterMood;
      const matchesPinned = !showPinnedOnly || entry.isPinned;
      
      return matchesSearch && matchesMood && matchesPinned;
    });
  }, [entries, searchQuery, filterMood, showPinnedOnly]);

  // Group entries by day
  const groupedEntries = filteredEntries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const date = new Date(entry.timestamp);
    const dateKey = format(date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl mx-auto pb-48">
      {/* Refined Search/Filter Bar */}
      <div className="px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-light" />
            <input 
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-4 py-2 bg-transparent border-b border-paper-dark focus:border-ink outline-none transition-colors text-ink placeholder:text-ink-faint font-serif text-lg"
            />
          </div>
          
          <div className="flex items-center gap-6 text-xs font-medium uppercase tracking-widest text-ink-light">
            <button 
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={cn(
                "flex items-center gap-1.5 transition-colors",
                showPinnedOnly ? "text-ink" : "hover:text-ink"
              )}
            >
              <Pin className="w-3.5 h-3.5" />
              Pinned
            </button>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              <select 
                value={filterMood || ''} 
                onChange={e => setFilterMood(e.target.value ? parseInt(e.target.value) : null)}
                className="bg-transparent outline-none cursor-pointer hover:text-ink transition-colors appearance-none"
              >
                <option value="">All Moods</option>
                <option value="5">5 - Great</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Okay</option>
                <option value="2">2 - Bad</option>
                <option value="1">1 - Awful</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-16">
        {Object.entries(groupedEntries).map(([dateKey, dayEntries]) => {
          const date = new Date(dateKey);
          const isToday = isSameDay(date, new Date());
          const entriesForDay = dayEntries as typeof entries;
          
          return (
            <div key={dateKey} className="space-y-8">
              <h3 className="font-serif text-xl italic text-ink-light flex items-center gap-4">
                <span>{isToday ? 'Today' : format(date, 'EEEE, MMMM d')}</span>
                <div className="h-px bg-paper-dark flex-1" />
              </h3>
              <div className="space-y-12">
                {entriesForDay.map(entry => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-ink-faint font-serif italic text-lg">
            <p>{entries.length === 0 ? "No entries yet." : "No entries match your search."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
