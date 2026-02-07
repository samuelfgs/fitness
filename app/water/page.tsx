import React from 'react';
import { ArrowLeft, Plus, Droplets, Target, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { waterLogs, profiles, weightMeasurements } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { getTodayRange, cn } from '@/lib/utils';
import { DeleteWaterLogButton } from '@/components/DeleteWaterLogButton';
import WaterStats from '@/components/WaterStats';
import { updateProfile } from '@/app/actions/profile';

import { redirect } from 'next/navigation';

export default async function WaterPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const timezone = cookieStore.get('user-timezone')?.value || 'America/Sao_Paulo';
  
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

  // Fetch profile for water goal and latest weight
  const [profile, latestWeightEntry] = await Promise.all([
    db.query.profiles.findFirst({
      where: eq(profiles.id, user.id)
    }),
    db.select()
      .from(weightMeasurements)
      .where(eq(weightMeasurements.userId, user.id))
      .orderBy(desc(weightMeasurements.date))
      .limit(1)
  ]);

  const waterGoal = profile?.waterGoal || 2000;
  const latestWeight = latestWeightEntry.length > 0 ? latestWeightEntry[0].weight : 70000; // default 70kg if none found
  const recommendedGoal = Math.round((latestWeight / 1000) * 35);

  const logs = await db.select()
    .from(waterLogs)
    .where(eq(waterLogs.userId, user.id))
    .orderBy(desc(waterLogs.date));

  // Calculate today's total using timezone-aware range
  const { start, end } = getTodayRange(timezone);
  const todayTotal = logs
    .filter(log => {
      const logDate = new Date(log.date);
      return logDate >= start && logDate <= end;
    })
    .reduce((acc, log) => acc + log.amount, 0);

  // Calculate weekly stats
  const dailyStats = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
    
    // Get range for this day in the user's timezone
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const dayTotal = logs
      .filter(log => {
        const logDate = new Date(log.date);
        return logDate >= dayStart && logDate <= dayEnd;
      })
      .reduce((acc, log) => acc + log.amount, 0);

    dailyStats.push({
      date: dateStr,
      dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', ''),
      consumed: dayTotal,
      goal: waterGoal,
    });
  }

  const weekTotalConsumed = dailyStats.reduce((acc, day) => acc + day.consumed, 0);
  const weekTotalGoal = waterGoal * 7;

  return (
    <div className="min-h-screen flex flex-col bg-background pb-32">
      <div className="px-6 py-6 border-b border-border flex items-center justify-between">
        <Link href="/dashboard" className="p-2 -ml-2 text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-black text-foreground tracking-tight">Hidratação</h1>
        <Link href="/log/water" className="p-2 -mr-2 text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors">
          <Plus size={24} />
        </Link>
      </div>

      <div className="flex-1 p-6 space-y-8">
        {/* Today's Summary */}
        <div className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 flex items-center justify-between relative overflow-hidden group">
            <div className="relative z-10">
                <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest mb-2">Total Hoje</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-5xl font-black text-primary">{(todayTotal / 1000).toFixed(1)}</p>
                  <span className="text-xl font-black text-muted-foreground">L</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 w-32 bg-primary/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${Math.min((todayTotal / waterGoal) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {Math.round((todayTotal / waterGoal) * 100)}% da meta
                  </span>
                </div>
            </div>
            <div className="h-20 w-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-500 transform group-hover:scale-110 transition-transform duration-500">
                <Droplets size={40} fill="currentColor" className="opacity-50" />
            </div>
        </div>

        {/* Goal Info */}
        <div className="bg-card border border-border rounded-[2rem] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Target size={18} className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">Meta Diária</h3>
                <p className="text-lg font-black text-foreground">{waterGoal}<span className="text-xs text-muted-foreground ml-1">ml</span></p>
              </div>
            </div>
            <Link 
              href="/profile"
              className="p-3 bg-muted text-muted-foreground rounded-xl hover:text-primary transition-colors"
            >
              <Settings2 size={20} />
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground font-medium">
              Sua meta recomendada é de {recommendedGoal}ml baseada no seu peso.
            </p>
          </div>
        </div>

        {/* Stats Chart */}
        <WaterStats stats={{ dailyStats, waterGoal, weekTotalConsumed, weekTotalGoal }} />

        {/* History */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-foreground px-2">Histórico</h2>
          
          {logs.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-[2.5rem] border-2 border-dashed border-border">
              <p className="text-muted-foreground font-bold mb-4">Nenhum registro encontrado.</p>
              <Link 
                href="/log/water"
                className="text-primary font-black text-sm bg-primary/10 px-6 py-3 rounded-2xl inline-block active:scale-95 transition-all hover:bg-primary/20"
              >
                + Beber Água
              </Link>
            </div>
          ) : (
            <div className="bg-card rounded-[2rem] border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {logs.map((entry) => (
                  <div key={entry.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-foreground">
                        {new Date(entry.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {new Date(entry.date).toLocaleDateString('pt-BR', { 
                          weekday: 'short',
                          day: '2-digit', 
                          month: '2-digit' 
                        }).replace('.', '')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-black text-primary">
                        {entry.amount}<span className="text-xs text-muted-foreground ml-1 font-bold">ml</span>
                      </p>
                      <DeleteWaterLogButton id={entry.id} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}