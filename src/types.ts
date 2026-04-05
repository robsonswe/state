export type MoodRating = 1 | 2 | 3 | 4 | 5;

export interface CognitiveRecord {
  trigger?: string;
  thought?: string;
  emotion?: string;
  intensity?: number; // 1-10
  evidence?: string;
  alternative?: string;
  actStance?: 'resisted' | 'allowed';
  outcome?: string;
}

export interface Intervention {
  technique: string;
  urge?: string;
  duration?: number; // seconds
  stateBefore?: number; // 1-10
  stateAfter?: number; // 1-10
  outcome?: string;
}

export interface BehavioralAction {
  action: string;
  value?: string;
  planned: boolean;
  completed: boolean;
  stateBefore?: number; // 1-10
  stateAfter?: number; // 1-10
}

export interface Entry {
  id: string;
  timestamp: string; // ISO string
  text: string;
  mood?: MoodRating;
  emotions?: string[];
  tags?: string[];
  isPinned?: boolean;
  linkedEntryId?: string;
  linkedReflectionId?: string;
  
  cognitive?: CognitiveRecord;
  intervention?: Intervention;
  behavior?: BehavioralAction;
}
