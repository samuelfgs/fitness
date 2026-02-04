import React from 'react';
import { Activity, WeightEntry, ActivityType } from '@/lib/types';
import ActivityCard from '@/components/ActivityCard';
import BottomNav from '@/components/BottomNav';
import { UserAvatar } from '@/components/UserAvatar';
import { TrendingUp, ArrowRight, Activity as ActivityIcon, Droplets, Footprints } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { weightMeasurements, workouts, activities, waterLogs, stepsLogs } from '@/lib/db/schema';
import { desc, eq, and, gte, lte } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  if (!supabase) {
    console.error("Supabase client not initialized. Check environment variables.");
    return redirect("/");
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  // Check if database is initialized
  if (!db || typeof db.select !== 'function') {
    console.error("Database not initialized. Check DATABASE_URL.");
    // In a real app, you might want to show a dedicated error page
    throw new Error("Service unavailable. Please try again later.");
  }

  // Fetch latest weights
  const latestWeights = await db.select()
    .from(weightMeasurements)
    .where(eq(weightMeasurements.userId, user.id))
    .orderBy(desc(weightMeasurements.date))
    .limit(2);

  // Fetch today's activities
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todaysWorkouts = await db.select({
    id: workouts.id,
    duration: workouts.duration,
    calories: workouts.calories,
    startedAt: workouts.startedAt,
    activityName: activities.name,
    activitySlug: activities.slug,
    activityColor: activities.color,
    activityIcon: activities.icon,
  })
    .from(workouts)
    .innerJoin(activities, eq(workouts.activityId, activities.id))
    .where(
      and(
        eq(workouts.userId, user.id),
        gte(workouts.startedAt, todayStart),
        lte(workouts.startedAt, todayEnd)
      )
    )
    .orderBy(desc(workouts.startedAt));

  // Fetch today's water
  const todaysWaterLogs = await db.select()
    .from(waterLogs)
    .where(
        and(
            eq(waterLogs.userId, user.id),
            gte(waterLogs.date, todayStart),
            lte(waterLogs.date, todayEnd)
        )
    );
  
  const totalWater = todaysWaterLogs.reduce((acc, log) => acc + log.amount, 0);

  // Fetch today's steps
  const todaysStepsLogs = await db.select()
    .from(stepsLogs)
    .where(
        and(
            eq(stepsLogs.userId, user.id),
            gte(stepsLogs.date, todayStart),
            lte(stepsLogs.date, todayEnd)
        )
    );
  
  const totalSteps = todaysStepsLogs.reduce((acc, log) => acc + log.count, 0);

  const latestWeight = latestWeights.length > 0 ? latestWeights[0].weight : null;
  const previousWeight = latestWeights.length > 1 ? latestWeights[1].weight : null;
  
  // Weights are stored in grams in DB, need to convert to kg for display
  const latestWeightKg = latestWeight ? latestWeight / 1000 : null;
  const previousWeightKg = previousWeight ? previousWeight / 1000 : null;
  const weightDiff = latestWeightKg && previousWeightKg ? latestWeightKg - previousWeightKg : 0;

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Atleta';
  const userAvatar = user?.user_metadata?.avatar_url || "https://picsum.photos/100/100";

  // Map DB workouts to Activity interface expected by ActivityCard
  const mappedActivities: Activity[] = todaysWorkouts.map(w => ({
    id: w.id,
    type: w.activitySlug as ActivityType, // Casting strictly for now, but slug matches enum loosely
    durationMinutes: w.duration || 0,
    caloriesBurned: w.calories || 0,
    date: w.startedAt?.toISOString() || new Date().toISOString(),
  }));

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-md mx-auto pt-8 px-6 space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Olá, {userName}</h1>
            <p className="text-muted-foreground font-bold text-sm">Bora bater suas metas hoje.</p>
          </div>
          <UserAvatar userAvatar={userAvatar} />
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/weight" className="bg-card p-6 rounded-[2rem] shadow-sm border border-border active:scale-95 transition-all">
            <div className="flex items-center space-x-2 mb-3 text-muted-foreground">
              <TrendingUp size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Peso</span>
            </div>
            <div className="flex items-end space-x-1">
              <span className="text-4xl font-black text-foreground leading-none">{latestWeightKg?.toFixed(1) ?? '--'}</span>
              <span className="text-sm font-bold text-muted-foreground mb-1">kg</span>
            </div>
            {latestWeightKg && previousWeightKg && (
               <div className={`text-xs font-black mt-2 inline-flex items-center px-2 py-1 rounded-lg ${weightDiff <= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
               </div>
            )}
          </Link>

          <div className="bg-card p-6 rounded-[2rem] shadow-sm border border-border">
            <div className="flex items-center space-x-2 mb-3 text-muted-foreground">
              <ActivityIcon size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Ativo</span>
            </div>
            <div className="flex items-end space-x-1">
              <span className="text-4xl font-black text-foreground leading-none">
                {mappedActivities.reduce((acc, curr) => acc + curr.durationMinutes, 0)}
              </span>
              <span className="text-sm font-bold text-muted-foreground mb-1">min</span>
            </div>
            <div className="text-xs font-bold mt-2 text-muted-foreground">
              Total de hoje
            </div>
          </div>

          <Link href="/water" className="bg-card p-6 rounded-[2rem] shadow-sm border border-border active:scale-95 transition-all">
            <div className="flex items-center space-x-2 mb-3 text-muted-foreground">
              <Droplets size={18} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Água</span>
            </div>
            <div className="flex items-end space-x-1">
              <span className="text-4xl font-black text-foreground leading-none">{totalWater}</span>
              <span className="text-sm font-bold text-muted-foreground mb-1">ml</span>
            </div>
            <div className="text-xs font-bold mt-2 text-muted-foreground">
              Total de hoje
            </div>
          </Link>

          <div className="bg-card p-6 rounded-[2rem] shadow-sm border border-border">
            <div className="flex items-center space-x-2 mb-3 text-muted-foreground">
              <Footprints size={18} className="text-purple-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Passos</span>
            </div>
            <div className="flex items-end space-x-1">
              <span className="text-4xl font-black text-foreground leading-none">{totalSteps}</span>
            </div>
            <div className="text-xs font-bold mt-2 text-muted-foreground">
              Meta: 10k
            </div>
          </div>
        </div>

        {/* Today's Log */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-black text-foreground tracking-tight">Atividade de Hoje</h2>
            <Link href="/calendar" className="text-primary text-sm font-black flex items-center bg-primary/10 px-3 py-1.5 rounded-xl hover:bg-primary/20 transition-colors">
              Histórico <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          {mappedActivities.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-[2rem] border-2 border-dashed border-border">
              <p className="text-muted-foreground font-bold mb-4">Nenhuma atividade registrada hoje.</p>
              <Link 
                href="/log"
                className="text-primary font-black text-sm bg-primary/10 px-6 py-3 rounded-2xl inline-block active:scale-95 transition-all hover:bg-primary/20"
              >
                + Registrar Atividade
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {mappedActivities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
