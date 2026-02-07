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

export interface FoodLogEntry {
  id: string;
  mealName: string;
  totalCalories: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
  date: string; // ISO String
  items: any[];
}

export interface WaterLogEntry {
  id: string;
  amount: number;
  date: string; // ISO String
}

export interface StepsLogEntry {
  id: string;
  count: number;
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
