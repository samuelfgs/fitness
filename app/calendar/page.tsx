import React from 'react';
import { Activity, WeightEntry, ActivityType, FoodLogEntry, WaterLogEntry, StepsLogEntry } from '@/lib/types';
import BottomNav from '@/components/BottomNav';
import { UserAvatar } from '@/components/UserAvatar';
import { createClient } from '@/lib/supabase/server';
import CalendarView from '@/components/CalendarView';
import { db } from '@/lib/db';
import { weightMeasurements, workouts, activities as activitiesSchema, foodLogs, waterLogs, stepsLogs } from '@/lib/db/schema';
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

  // Fetch all data in parallel
  const [
    userWorkouts,
    userWeights,
    userFood,
    userWater,
    userSteps
  ] = await Promise.all([
    db.select({
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
      .orderBy(desc(workouts.startedAt)),

    db.select()
      .from(weightMeasurements)
      .where(eq(weightMeasurements.userId, user.id))
      .orderBy(desc(weightMeasurements.date)),

    db.select()
      .from(foodLogs)
      .where(eq(foodLogs.userId, user.id))
      .orderBy(desc(foodLogs.date)),

    db.select()
      .from(waterLogs)
      .where(eq(waterLogs.userId, user.id))
      .orderBy(desc(waterLogs.date)),

    db.select()
      .from(stepsLogs)
      .where(eq(stepsLogs.userId, user.id))
      .orderBy(desc(stepsLogs.date))
  ]);

  // Map data to interfaces
  const activities: Activity[] = userWorkouts.map(w => ({
    id: w.id,
    type: w.activitySlug as ActivityType,
    name: w.activityName,
    durationMinutes: w.duration || 0,
    caloriesBurned: w.calories || 0,
    date: w.startedAt?.toISOString() || new Date().toISOString(),
  }));

  const weights: WeightEntry[] = userWeights.map(w => ({
    id: w.id,
    weight: (w.weight || 0) / 1000,
    date: w.date.toISOString(),
  }));

  const food: FoodLogEntry[] = userFood.map(f => ({
    id: f.id,
    mealName: f.mealName,
    totalCalories: f.totalCalories,
    totalProtein: f.totalProtein ?? 0,
    totalCarbs: f.totalCarbs ?? 0,
    totalFat: f.totalFat ?? 0,
    date: f.date.toISOString(),
    items: f.content as any[],
  }));

  const water: WaterLogEntry[] = userWater.map(w => ({
    id: w.id,
    amount: w.amount,
    date: w.date.toISOString(),
  }));

  const steps: StepsLogEntry[] = userSteps.map(s => ({
    id: s.id,
    count: s.count,
    date: s.date.toISOString(),
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
        <CalendarView 
          initialActivities={activities} 
          initialWeights={weights} 
          initialFood={food}
          initialWater={water}
          initialSteps={steps}
        />
      </div>
      <BottomNav />
    </div>
  );
}