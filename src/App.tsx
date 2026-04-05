/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Timeline } from './components/Timeline';
import { Composer } from './components/Composer';
import { Insights } from './components/Insights';
import { cn } from './lib/utils';

export default function App() {
  const [view, setView] = useState<'timeline' | 'insights'>('timeline');

  return (
    <div className="min-h-screen bg-paper font-sans text-ink selection:bg-paper-dark">
      <header className="bg-paper/90 backdrop-blur-md border-b border-paper-dark sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="font-serif italic text-2xl text-ink tracking-tight">State</h1>
          
          <div className="flex gap-6">
            <button 
              onClick={() => setView('timeline')}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors uppercase",
                view === 'timeline' ? "text-ink border-b border-ink pb-0.5" : "text-ink-light hover:text-ink"
              )}
            >
              Timeline
            </button>
            <button 
              onClick={() => setView('insights')}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors uppercase",
                view === 'insights' ? "text-ink border-b border-ink pb-0.5" : "text-ink-light hover:text-ink"
              )}
            >
              Insights
            </button>
          </div>
        </div>
      </header>

      <main>
        {view === 'timeline' ? <Timeline /> : <Insights />}
      </main>

      {view === 'timeline' && <Composer />}
    </div>
  );
}
