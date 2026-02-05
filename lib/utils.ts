import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTodayRange(timezone: string = 'America/Sao_Paulo') {
  const now = new Date();
  
  // Get the current date in the target timezone
  const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  
  const start = new Date(tzDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(tzDate);
  end.setHours(23, 59, 59, 999);

  // Now we need to convert these "local" start/end times back to UTC
  // because the database stores/compares in UTC (or server local time)
  
  // This is a bit tricky with plain JS Date. 
  // A simpler way to think about it:
  // We want all records where the date, when converted to 'timezone', is 'today'.
  
  // But for performance, we want a UTC range to query.
  
  const diff = tzDate.getTime() - now.getTime();
  
  const startUTC = new Date(start.getTime() - diff);
  const endUTC = new Date(end.getTime() - diff);
  
  return { start: startUTC, end: endUTC };
}
