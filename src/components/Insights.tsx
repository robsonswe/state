import React, { useMemo, useState } from 'react';
import { useJournalStore } from '../store';
import { format, subDays, isAfter, formatDistanceToNow } from 'date-fns';
import { Brain, Activity, Target, Sparkles, TrendingUp, CheckCircle2, Lightbulb, Heart, Pin, History } from 'lucide-react';
import { cn } from '../lib/utils';

export function Insights() {
  const entries = useJournalStore(s => s.entries);
  const addReflection = useJournalStore(s => s.addReflection);
  const reflections = useJournalStore(s => s.reflections);
  const values = useJournalStore(s => s.values);
  const addValue = useJournalStore(s => s.addValue);
  const removeValue = useJournalStore(s => s.removeValue);

  const [challenge, setChallenge] = useState('');
  const [action, setAction] = useState('');
  const [saved, setSaved] = useState(false);
  const [newValue, setNewValue] = useState('');

  const last7Days = useMemo(() => entries.filter(e => isAfter(new Date(e.timestamp), subDays(new Date(), 7))), [entries]);
  const previous7Days = useMemo(() => entries.filter(e => {
    const d = new Date(e.timestamp);
    return isAfter(d, subDays(new Date(), 14)) && !isAfter(d, subDays(new Date(), 7));
  }), [entries]);

    const stats = useMemo(() => {
    const moodEntries = last7Days.filter(e => e.mood !== undefined);
    const avgMood = moodEntries.length > 0 
      ? (moodEntries.reduce((acc, e) => acc + (e.mood || 0), 0) / moodEntries.length).toFixed(1)
      : '-';

    const prevMoodEntries = previous7Days.filter(e => e.mood !== undefined);
    const prevAvgMood = prevMoodEntries.length > 0 
      ? (prevMoodEntries.reduce((acc, e) => acc + (e.mood || 0), 0) / prevMoodEntries.length).toFixed(1)
      : null;

    const moodTrend = prevAvgMood ? (Number(avgMood) - Number(prevAvgMood)).toFixed(1) : null;

    const emotions = new Map<string, number>();
    const triggers = new Map<string, number>();
    const techniqueEffectiveness = new Map<string, { count: number, totalPercentShift: number }>();
    const valueAlignment = new Map<string, number>();
    
    let interventionPercentShift = 0;
    let interventionCount = 0;
    let behaviorCompleted = 0;
    let behaviorTotal = 0;

    last7Days.forEach(e => {
      if (e.cognitive?.emotion) {
        const em = e.cognitive.emotion.toLowerCase().trim();
        emotions.set(em, (emotions.get(em) || 0) + 1);
      }
      if (e.cognitive?.trigger) {
        const tr = e.cognitive.trigger.toLowerCase().trim();
        triggers.set(tr, (triggers.get(tr) || 0) + 1);
      }
      if (e.intervention?.stateBefore !== undefined && e.intervention?.stateAfter !== undefined) {
        const shift = e.intervention.stateBefore - e.intervention.stateAfter;
        const percentShift = e.intervention.stateBefore > 0 ? (shift / e.intervention.stateBefore) * 100 : 0;
        
        interventionPercentShift += percentShift;
        interventionCount++;
        
        if (e.intervention.technique) {
          const current = techniqueEffectiveness.get(e.intervention.technique) || { count: 0, totalPercentShift: 0 };
          techniqueEffectiveness.set(e.intervention.technique, {
            count: current.count + 1,
            totalPercentShift: current.totalPercentShift + percentShift
          });
        }
      }
      if (e.behavior) {
        behaviorTotal++;
        if (e.behavior.completed) {
          behaviorCompleted++;
          if (e.behavior.value) {
            valueAlignment.set(e.behavior.value, (valueAlignment.get(e.behavior.value) || 0) + 1);
          }
        }
      }
    });

    const topEmotions = Array.from(emotions.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const topTriggers = Array.from(triggers.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const avgInterventionPercentShift = interventionCount > 0 ? Math.round(interventionPercentShift / interventionCount) : null;

    // Find most effective technique
    let bestTechnique = null;
    let maxAvgPercentShift = -Infinity;
    techniqueEffectiveness.forEach((data, technique) => {
      if (data.count >= 1) { // At least 1 use
        const avgPercentShift = data.totalPercentShift / data.count;
        if (avgPercentShift > maxAvgPercentShift) {
          maxAvgPercentShift = avgPercentShift;
          bestTechnique = { technique, avgPercentShift: Math.round(avgPercentShift), count: data.count };
        }
      }
    });

    // Find ineffective techniques
    const ineffectiveTechniques = Array.from(techniqueEffectiveness.entries())
      .filter(([_, data]) => data.count >= 1 && (data.totalPercentShift / data.count) <= 0)
      .map(([technique, data]) => ({ technique, count: data.count }));

    const importantEntries = last7Days.filter(e => 
      e.isPinned || 
      e.mood === 1 || 
      e.mood === 2 || 
      (e.cognitive?.intensity && e.cognitive.intensity >= 8)
    ).slice(0, 3);

    // Resurfaced Insight
    const olderEntries = entries.filter(e => isAfter(subDays(new Date(), 14), new Date(e.timestamp)));
    const successfulOlderInterventions = olderEntries.filter(e => 
      e.intervention && 
      e.intervention.stateBefore !== undefined && 
      e.intervention.stateAfter !== undefined && 
      (e.intervention.stateBefore - e.intervention.stateAfter) >= 2
    );
    
    let resurfacedInsight = null;
    if (successfulOlderInterventions.length > 0) {
      const randomEntry = successfulOlderInterventions[Math.floor(Math.random() * successfulOlderInterventions.length)];
      const shift = randomEntry.intervention!.stateBefore! - randomEntry.intervention!.stateAfter!;
      const percentShift = randomEntry.intervention!.stateBefore! > 0 ? Math.round((shift / randomEntry.intervention!.stateBefore!) * 100) : 0;
      resurfacedInsight = {
        technique: randomEntry.intervention!.technique,
        date: new Date(randomEntry.timestamp),
        percentShift
      };
    }

    return {
      avgMood,
      moodTrend,
      topEmotions,
      topTriggers,
      avgInterventionPercentShift,
      interventionCount,
      bestTechnique,
      ineffectiveTechniques,
      importantEntries,
      resurfacedInsight,
      valueAlignment: Array.from(valueAlignment.entries()).sort((a, b) => b[1] - a[1]),
      behaviorCompletionRate: behaviorTotal > 0 ? Math.round((behaviorCompleted / behaviorTotal) * 100) : null,
      counts: {
        cognitive: last7Days.filter(e => e.cognitive).length,
        intervention: last7Days.filter(e => e.intervention).length,
        behavior: last7Days.filter(e => e.behavior).length,
      }
    };
  }, [last7Days, previous7Days, entries]);

  const handleSaveReflection = () => {
    if (!challenge.trim() && !action.trim()) return;
    addReflection({ challenge, action });
    setSaved(true);
    setTimeout(() => {
      setChallenge('');
      setAction('');
      setSaved(false);
    }, 2000);
  };

  const handleAddValue = (e: React.FormEvent) => {
    e.preventDefault();
    if (newValue.trim()) {
      addValue(newValue.trim());
      setNewValue('');
    }
  };

  const recentReflection = reflections[0];
  const showRecentReflection = recentReflection && isAfter(new Date(recentReflection.timestamp), subDays(new Date(), 7));

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-16 pb-64 sm:pb-72">
      <div>
        <h2 className="font-serif italic text-3xl text-ink mb-2">Weekly Synthesis</h2>
        <p className="text-ink-light font-medium uppercase tracking-widest text-xs">Patterns and reflections from the last 7 days</p>
      </div>

      <div className="grid grid-cols-2 gap-8 border-y border-paper-dark py-8">
        <div>
          <div className="text-xs font-medium text-ink-light uppercase tracking-widest mb-2">Entries</div>
          <div className="font-serif text-5xl text-ink">{last7Days.length}</div>
        </div>
        <div className="relative">
          <div className="text-xs font-medium text-ink-light uppercase tracking-widest mb-2">Avg Mood</div>
          <div className="font-serif text-5xl text-ink">
            {stats.avgMood} <span className="text-2xl text-ink-faint font-normal">/ 5</span>
          </div>
          {stats.moodTrend !== null && (
            <div className={cn(
              "absolute top-0 right-0 text-xs font-medium uppercase tracking-widest",
              Number(stats.moodTrend) > 0 ? 'text-accent-sage' : Number(stats.moodTrend) < 0 ? 'text-accent-rust' : 'text-ink-light'
            )}>
              {Number(stats.moodTrend) > 0 ? '+' : ''}{stats.moodTrend}
            </div>
          )}
        </div>
      </div>

      {/* Forward Guidance */}
      {(stats.bestTechnique || stats.ineffectiveTechniques.length > 0 || stats.resurfacedInsight) && (
        <div className="space-y-6">
          <h3 className="text-xs font-medium text-ink-light uppercase tracking-widest flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5" /> Forward Guidance
          </h3>
          <div className="space-y-6 font-serif text-lg text-ink leading-relaxed">
            {stats.bestTechnique && Number(stats.bestTechnique.avgPercentShift) > 0 && (
              <p>
                You've found good momentum with <strong className="font-medium">{stats.bestTechnique.technique}</strong> recently (avg {stats.bestTechnique.avgPercentShift}% reduction in distress across {stats.bestTechnique.count} entries). This seems to be a reliable tool for you right now.
              </p>
            )}
            {stats.ineffectiveTechniques.length > 0 && (
              <p>
                You've been experimenting with <strong className="font-medium">{stats.ineffectiveTechniques.map(t => `${t.technique} (${t.count}x)`).join(', ')}</strong>. Since these haven't shifted your state much recently, you might try a different approach next time to see what resonates better.
              </p>
            )}
            {stats.resurfacedInsight && (
              <div className="pt-6 border-t border-paper-dark flex items-start gap-4">
                <History className="w-4 h-4 text-ink-light shrink-0 mt-1.5" />
                <p>
                  <strong className="font-medium">Looking back:</strong> About {formatDistanceToNow(stats.resurfacedInsight.date)} ago, <strong className="font-medium">{stats.resurfacedInsight.technique}</strong> helped you reduce distress by {stats.resurfacedInsight.percentShift}%. It could be interesting to try it again.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Heuristics & Patterns */}
      <div className="space-y-8">
        <h3 className="text-xs font-medium text-ink-light uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Emerging Patterns
        </h3>
        
        <div className="space-y-8">
          {stats.topEmotions.length > 0 && (
            <div>
              <div className="text-xs font-medium text-ink-light uppercase tracking-widest mb-3">Most frequent emotions</div>
              <div className="flex flex-wrap gap-3">
                {stats.topEmotions.map(([em, count]) => (
                  <span key={em} className="px-3 py-1.5 bg-paper-dim border border-paper-dark text-ink text-sm font-medium capitalize">
                    {em} <span className="text-ink-light text-xs ml-2">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {stats.topTriggers.length > 0 && (
            <div>
              <div className="text-xs font-medium text-ink-light uppercase tracking-widest mb-3">Common triggers</div>
              <div className="flex flex-wrap gap-3">
                {stats.topTriggers.map(([tr, count]) => (
                  <span key={tr} className="px-3 py-1.5 bg-paper-dim border border-paper-dark text-ink text-sm font-medium capitalize">
                    {tr} <span className="text-ink-light text-xs ml-2">{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {stats.avgInterventionPercentShift !== null && (
            <div className="flex items-start gap-4 py-4 border-y border-paper-dark">
              <TrendingUp className="w-5 h-5 text-accent-sky shrink-0 mt-0.5" />
              <div className="font-serif text-lg text-ink">
                Interventions reduced distress by an average of <strong className="font-medium">{stats.avgInterventionPercentShift}%</strong> this week.
              </div>
            </div>
          )}

          {stats.behaviorCompletionRate !== null && (
            <div className="flex items-start gap-4 py-4 border-b border-paper-dark">
              <Target className="w-5 h-5 text-accent-sage shrink-0 mt-0.5" />
              <div className="font-serif text-lg text-ink">
                You completed <strong className="font-medium">{stats.behaviorCompletionRate}%</strong> of your planned behavioral actions.
              </div>
            </div>
          )}
          
          {stats.topEmotions.length === 0 && stats.topTriggers.length === 0 && stats.avgInterventionPercentShift === null && stats.behaviorCompletionRate === null && (
            <div className="font-serif italic text-lg text-ink-light">Not enough structured data yet to identify patterns. Try adding Cognitive Records or Interventions to your entries.</div>
          )}
        </div>
      </div>

      {/* Values Alignment */}
      <div className="space-y-8">
        <h3 className="text-xs font-medium text-ink-light uppercase tracking-widest flex items-center gap-2">
          <Heart className="w-3.5 h-3.5" /> Core Values
        </h3>
        
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {values.map(v => (
              <span key={v} className="px-3 py-1.5 bg-accent-rust-light/30 text-accent-rust text-sm font-medium uppercase tracking-widest flex items-center gap-3">
                {v}
                <button onClick={() => removeValue(v)} className="text-accent-rust/50 hover:text-accent-rust">&times;</button>
              </span>
            ))}
          </div>
          <form onSubmit={handleAddValue} className="flex gap-3">
            <input 
              type="text" 
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder="Add a core value..."
              className="flex-1 bg-transparent border-b border-paper-dark px-0 py-2 text-lg font-serif outline-none focus:border-ink placeholder:text-ink-faint transition-colors"
            />
            <button type="submit" className="px-6 py-2 bg-ink text-paper text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-90">Add</button>
          </form>

          {stats.valueAlignment.length > 0 && (
            <div className="pt-8 mt-8 border-t border-paper-dark">
              <div className="text-xs font-medium text-ink-light uppercase tracking-widest mb-4">Actions aligned with values this week</div>
              <div className="space-y-3">
                {stats.valueAlignment.map(([val, count]) => (
                  <div key={val} className="flex items-center justify-between font-serif text-lg">
                    <span className="text-ink">{val}</span>
                    <span className="text-ink-light">{count} action{count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reflection Loop */}
      <div className="bg-ink text-paper p-8 -mx-6 sm:mx-0 sm:rounded-2xl">
        <h3 className="text-xs font-medium text-ink-faint uppercase tracking-widest mb-8">Weekly Reflection</h3>

        {/* Important Entries */}
        {stats.importantEntries.length > 0 && (
          <div className="mb-10 space-y-4">
            <div className="text-xs font-medium text-ink-faint uppercase tracking-widest flex items-center gap-2">
              <Pin className="w-3.5 h-3.5" /> Important Entries to Reflect On
            </div>
            <div className="space-y-3">
              {stats.importantEntries.map(entry => (
                <div key={entry.id} className="p-4 bg-paper/5 border border-paper/10">
                  <div className="text-xs font-medium text-ink-faint uppercase tracking-widest mb-2">{format(new Date(entry.timestamp), 'MMM d, h:mm a')}</div>
                  <div className="font-serif text-lg text-paper/90 line-clamp-2">{entry.text || `Mood: ${entry.mood}/5`}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {showRecentReflection && !challenge && !action ? (
          <div className="space-y-8">
            <div>
              <div className="text-xs font-medium text-ink-faint uppercase tracking-widest mb-2">Recent Challenge & Response</div>
              <div className="font-serif text-xl leading-relaxed text-paper/90">{recentReflection.challenge}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-ink-faint uppercase tracking-widest mb-2">Planned Action</div>
              <div className="font-serif text-xl leading-relaxed text-paper/90">{recentReflection.action}</div>
            </div>
            <button 
              onClick={() => { setChallenge(''); setAction(''); }}
              className="text-xs font-medium text-ink-faint uppercase tracking-widest hover:text-paper transition-colors underline underline-offset-4"
            >
              Write a new reflection
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <label className="block font-serif text-xl leading-relaxed text-paper mb-4">
                {['What was the most challenging moment this week, and how did you handle it?', 'What pattern did you notice in your mood or triggers this week?', 'What is one thing you learned about yourself this week?'][new Date().getDay() % 3]}
              </label>
              <textarea 
                value={challenge}
                onChange={e => setChallenge(e.target.value)}
                className="w-full bg-transparent border-b border-paper/20 p-0 py-2 font-serif text-lg text-paper outline-none focus:border-paper/50 resize-none placeholder:text-paper/30 transition-colors" 
                rows={3} 
                placeholder="Reflect here..."
              />
            </div>
            <div>
              <label className="block font-serif text-xl leading-relaxed text-paper mb-4">What is one small action you can take next week aligned with your values?</label>
              <textarea 
                value={action}
                onChange={e => setAction(e.target.value)}
                className="w-full bg-transparent border-b border-paper/20 p-0 py-2 font-serif text-lg text-paper outline-none focus:border-paper/50 resize-none placeholder:text-paper/30 transition-colors" 
                rows={2} 
                placeholder="Plan here..."
              />
            </div>
            <button 
              onClick={handleSaveReflection}
              disabled={!challenge.trim() && !action.trim()}
              className="w-full py-4 bg-paper text-ink font-medium text-xs uppercase tracking-widest hover:bg-paper-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : 'Save Reflection'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-medium text-ink-light uppercase tracking-widest mb-6">Techniques Used</h3>
        <div className="space-y-4">
          <StatRow icon={Brain} label="Cognitive Records" count={stats.counts.cognitive} color="text-ink" />
          <StatRow icon={Activity} label="Interventions" count={stats.counts.intervention} color="text-accent-sky" />
          <StatRow icon={Target} label="Behavioral Actions" count={stats.counts.behavior} color="text-accent-sage" />
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon: Icon, label, count, color }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-paper-dark last:border-0">
      <div className="flex items-center gap-4">
        <Icon className={cn("w-4 h-4", color)} />
        <span className="font-serif text-lg text-ink">{label}</span>
      </div>
      <span className="font-serif text-xl text-ink">{count}</span>
    </div>
  );
}
