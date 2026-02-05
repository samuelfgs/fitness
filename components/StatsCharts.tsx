"use client";

import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, WeightEntry } from '@/lib/types';

interface StatsChartsProps {
  activities: Activity[];
  weights: WeightEntry[];
}

export default function StatsCharts({ activities, weights }: StatsChartsProps) {
  // Prepare Weight Data (Last 30 days)
  const weightData = weights
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10) // Take last 10 entries for cleaner chart
    .map(w => ({
      date: format(new Date(w.date), 'dd/MM'),
      weight: w.weight
    }));

  // Prepare Activity Data (Last 7 days duration)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return {
      date: format(d, 'EEE', { locale: ptBR }),
      fullDate: d,
      duration: 0
    };
  });

  last7Days.forEach(day => {
    const dayActs = activities.filter(a => new Date(a.date).toDateString() === day.fullDate.toDateString());
    day.duration = dayActs.reduce((sum, act) => sum + act.durationMinutes, 0);
  });

  return (
    <>
      {/* Weight Chart */}
      <div className="bg-card p-6 rounded-[2rem] shadow-sm border border-border">
        <h3 className="font-black text-foreground mb-6 uppercase tracking-widest text-xs">Tendência de Peso</h3>
        <div className="h-64 w-full outline-none focus:outline-none [&_*]:outline-none">
          {weightData.length > 1 ? (
             <ResponsiveContainer width="100%" height="100%">
             <AreaChart 
               data={weightData}
               accessibilityLayer={false}
               style={{ outline: 'none' }}
               tabIndex={-1}
             >
               <defs>
                 <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                   <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a1a1aa', fontWeight: 'bold'}} />
               <Tooltip 
                 contentStyle={{borderRadius: '20px', border: '1px solid #3f3f46', backgroundColor: '#18181b', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.5)', fontWeight: 'bold'}}
                 itemStyle={{color: '#22c55e', fontWeight: 'bold'}}
                 labelStyle={{color: '#fafafa'}}
                 formatter={(value: number) => [`${value} kg`, 'Peso']}
               />
               <Area type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorWeight)" />
             </AreaChart>
           </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground font-bold text-sm">
              Registre seu peso para ver a tendência.
            </div>
          )}
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-card p-6 rounded-[2rem] shadow-sm border border-border">
        <h3 className="font-black text-foreground mb-6 uppercase tracking-widest text-xs">Atividade (Últimos 7 Dias)</h3>
        <div className="h-64 w-full outline-none focus:outline-none [&_*]:outline-none">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart 
               data={last7Days}
               accessibilityLayer={false}
               style={{ outline: 'none' }}
               tabIndex={-1}
             >
               <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a1a1aa', fontWeight: 'bold'}} />
               <Tooltip 
                 cursor={{fill: '#27272a'}}
                 contentStyle={{borderRadius: '20px', border: '1px solid #3f3f46', backgroundColor: '#18181b', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.5)', fontWeight: 'bold'}}
                 formatter={(value: number) => [`${value} min`, 'Duração']}
                 labelStyle={{color: '#fafafa'}}
               />
               <Bar dataKey="duration" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={24} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
