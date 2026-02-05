export enum ActivityType {
  Running = 'running',
  Cycling = 'cycling',
  Weightlifting = 'weightlifting',
  Yoga = 'yoga',
  Swimming = 'swimming',
  HIIT = 'hiit',
  Walking = 'walking',
  Tennis = 'tennis',
  Other = 'other'
}

export interface Activity {
  id: string;
  type: ActivityType;
  name?: string;
  durationMinutes: number;
  caloriesBurned?: number;
  date: string; // ISO String
  notes?: string;
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string; // ISO String
}

export interface DailyStats {
  date: string;
  totalDuration: number;
  totalCalories: number;
  weight?: number;
  activities: Activity[];
}

export type ViewState = 'dashboard' | 'log-activity' | 'log-weight' | 'calendar' | 'stats';
