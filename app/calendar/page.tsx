import React from 'react';
import { Activity, WeightEntry, ActivityType } from '@/lib/types';
import BottomNav from '@/components/BottomNav';
import { UserAvatar } from '@/components/UserAvatar';
import { createClient } from '@/lib/supabase/server';
import CalendarView from '@/components/CalendarView';
import { db } from '@/lib/db';
import { weightMeasurements, workouts, activities as activitiesSchema } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function CalendarPage() {
  const supabase = await createClient();
  
  if (!supabase) {
    return redirect("/");
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  if (!db || typeof db.select !== 'function') {
    throw new Error("Service unavailable");
  }

  const userAvatar = user?.user_metadata?.avatar_url || "https://picsum.photos/100/100";

  // Fetch all workouts
  const userWorkouts = await db.select({
    id: workouts.id,
    duration: workouts.duration,
    calories: workouts.calories,
    startedAt: workouts.startedAt,
    activityName: activitiesSchema.name,
    activitySlug: activitiesSchema.slug,
  })
    .from(workouts)
    .innerJoin(activitiesSchema, eq(workouts.activityId, activitiesSchema.id))
    .where(eq(workouts.userId, user.id))
    .orderBy(desc(workouts.startedAt));

  // Map workouts to Activity interface
  const activities: Activity[] = userWorkouts.map(w => ({
    id: w.id,
    type: w.activitySlug as ActivityType,
    durationMinutes: w.duration || 0,
    caloriesBurned: w.calories || 0,
    date: w.startedAt?.toISOString() || new Date().toISOString(),
  }));

  // Fetch all weights
  const userWeights = await db.select()
    .from(weightMeasurements)
    .where(eq(weightMeasurements.userId, user.id))
    .orderBy(desc(weightMeasurements.date));

  // Map weights to WeightEntry interface
  const weights: WeightEntry[] = userWeights.map(w => ({
    id: w.id,
    weight: (w.weight || 0) / 1000, // Convert grams to kg
    date: w.date.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-md mx-auto pt-8 px-6">
        <header className="flex items-start justify-between mb-8">
          <div className="flex-1">
             {/* Calendar title and controls are inside CalendarView */}
          </div>
          <div className="pt-1">
            <UserAvatar userAvatar={userAvatar} />
          </div>
        </header>
        <CalendarView initialActivities={activities} initialWeights={weights} />
      </div>
      <BottomNav />
    </div>
  );
}