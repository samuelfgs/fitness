export enum ActivityType {
  Running = 'Running',
  Cycling = 'Cycling',
  Weightlifting = 'Weightlifting',
  Yoga = 'Yoga',
  Swimming = 'Swimming',
  HIIT = 'HIIT',
  Walking = 'Walking',
  Other = 'Other'
}

export interface Activity {
  id: string;
  type: ActivityType;
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
