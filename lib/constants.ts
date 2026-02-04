import { ActivityType } from './types';
import { Activity, Dumbbell, Bike, Waves, Footprints, Flame, MoreHorizontal, LucideIcon } from 'lucide-react';

export const GEMINI_MODEL_ID = 'gemini-2.0-flash'; // Updated to a more standard ID

export const ACTIVITY_ICONS: Record<ActivityType, LucideIcon> = {
  [ActivityType.Running]: Footprints,
  [ActivityType.Cycling]: Bike,
  [ActivityType.Weightlifting]: Dumbbell,
  [ActivityType.Yoga]: Activity,
  [ActivityType.Swimming]: Waves,
  [ActivityType.HIIT]: Flame,
  [ActivityType.Walking]: Footprints,
  [ActivityType.Other]: MoreHorizontal,
};

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  [ActivityType.Running]: 'bg-orange-500/10 text-orange-500',
  [ActivityType.Cycling]: 'bg-blue-500/10 text-blue-500',
  [ActivityType.Weightlifting]: 'bg-stone-500/10 text-stone-500',
  [ActivityType.Yoga]: 'bg-purple-500/10 text-purple-500',
  [ActivityType.Swimming]: 'bg-cyan-500/10 text-cyan-500',
  [ActivityType.HIIT]: 'bg-red-500/10 text-red-500',
  [ActivityType.Walking]: 'bg-emerald-500/10 text-emerald-500',
  [ActivityType.Other]: 'bg-gray-500/10 text-gray-500',
};