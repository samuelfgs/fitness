import React from 'react';
import { Activity, WeightEntry, ActivityType } from '@/lib/types';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import BottomNav from '@/components/BottomNav';
import { UserAvatar } from '@/components/UserAvatar';
import { createClient } from '@/lib/supabase/server';
import StatsCharts from '@/components/StatsCharts';

export default async function StatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userAvatar = user?.user_metadata?.avatar_url || "https://picsum.photos/100/100";

  // Mock data for initial view
  const activities: Activity[] = [
    { id: '1', type: ActivityType.Running, durationMinutes: 30, caloriesBurned: 300, date: subDays(new Date(), 1).toISOString() },
    { id: '2', type: ActivityType.Weightlifting, durationMinutes: 45, caloriesBurned: 200, date: subDays(new Date(), 2).toISOString() },
    { id: '3', type: ActivityType.Cycling, durationMinutes: 60, caloriesBurned: 500, date: subDays(new Date(), 3).toISOString() },
    { id: '4', type: ActivityType.Yoga, durationMinutes: 20, caloriesBurned: 50, date: subDays(new Date(), 4).toISOString() },
  ];

  const weights: WeightEntry[] = [
    { id: '1', weight: 75.5, date: new Date().toISOString() },
    { id: '2', weight: 75.8, date: subDays(new Date(), 3).toISOString() },
    { id: '3', weight: 76.2, date: subDays(new Date(), 7).toISOString() },
    { id: '4', weight: 76.5, date: subDays(new Date(), 10).toISOString() },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-md mx-auto pt-8 px-6 space-y-8">
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Análise</h1>
            <p className="text-muted-foreground font-bold text-sm">Visualize seu progresso ao longo do tempo.</p>
          </div>
          <UserAvatar userAvatar={userAvatar} />
        </header>

        <StatsCharts activities={activities} weights={weights} />
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pb-4">
          <div className="bg-purple-500/10 p-6 rounded-3xl border border-purple-500/20">
             <p className="text-purple-500 text-[10px] font-black uppercase tracking-widest">Total de Treinos</p>
             <p className="text-3xl font-black text-foreground mt-1">{activities.length}</p>
          </div>
          <div className="bg-orange-500/10 p-6 rounded-3xl border border-orange-500/20">
             <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest">Calorias Queimadas</p>
             <p className="text-3xl font-black text-foreground mt-1">
               {(activities.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0) / 1000).toFixed(1)}k
             </p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}