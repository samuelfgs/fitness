"use client";

import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis } from 'recharts';
import { Flame, TrendingDown, TrendingUp, Target } from 'lucide-react';

interface DailyStat {
  date: string;
  dayName: string;
  consumed: number;
  goal: number;
}

interface FoodWeekStatsProps {
  stats: {
    dailyStats: DailyStat[];
    kcalGoal: number;
    weekTotalConsumed: number;
    weekTotalGoal: number;
    weekBalance: number;
  };
}

export default function FoodWeekStats({ stats }: FoodWeekStatsProps) {
  const { dailyStats, kcalGoal, weekBalance, weekTotalConsumed } = stats;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const balance = data.consumed - data.goal;
      return (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-[20px] shadow-2xl">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-8">
              <span className="text-zinc-500 text-xs font-bold">Consumido</span>
              <span className="text-white text-sm font-black">{data.consumed} kcal</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-zinc-500 text-xs font-bold">Meta</span>
              <span className="text-zinc-400 text-sm font-black">{data.goal} kcal</span>
            </div>
            <div className="flex items-center justify-between gap-8 pt-1 border-t border-zinc-800 mt-1">
              <span className="text-zinc-500 text-xs font-bold">Balanço</span>
              <span className={`text-sm font-black ${balance <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {balance > 0 ? `+${balance}` : balance} kcal
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: `
        .recharts-surface:focus { outline: none !important; }
        .recharts-wrapper:focus { outline: none !important; }
      `}} />
      <h2 className="text-lg font-black text-foreground px-2">Estatísticas da Semana</h2>
      
      <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Balanço Semanal</span>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-black ${weekBalance <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {weekBalance > 0 ? `+${weekBalance}` : weekBalance}
              </span>
              <span className="text-xs font-bold text-muted-foreground mt-2">kcal</span>
            </div>
          </div>
          <div className={`p-4 rounded-3xl ${weekBalance <= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {weekBalance <= 0 ? <TrendingDown size={32} strokeWidth={2.5} /> : <TrendingUp size={32} strokeWidth={2.5} />}
          </div>
        </div>

        <div className="h-64 w-full mt-4 outline-none focus:outline-none [&_*]:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={dailyStats} 
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }} 
              barGap={-24}
              accessibilityLayer={false}
              style={{ outline: 'none' }}
              tabIndex={-1}
            >
              <XAxis 
                dataKey="dayName" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#a1a1aa', fontWeight: '900'}} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#a1a1aa', fontWeight: 'bold'}}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={false}
              />
              {/* Background bar for Goal */}
              <Bar 
                dataKey="goal" 
                fill="#27272a" 
                radius={[8, 8, 0, 0]} 
                barSize={24}
                isAnimationActive={false}
                activeBar={false}
                stroke="none"
              />
              {/* Foreground bar for Consumed */}
              <Bar 
                dataKey={(entry) => {
                  // For the chart: if it's a past day with 0 consumed, 
                  // we show it at goal level to match the balance logic
                  const today = new Date().toLocaleDateString('en-CA');
                  if (entry.date < today && entry.consumed === 0) {
                    return entry.goal;
                  }
                  return entry.consumed;
                }} 
                radius={[8, 8, 0, 0]} 
                barSize={24}
                name="consumed"
                activeBar={false}
                stroke="none"
              >
                {dailyStats.map((entry, index) => {
                  const today = new Date().toLocaleDateString('en-CA');
                  const isFallback = entry.date < today && entry.consumed === 0;
                  const isOverGoal = entry.consumed > entry.goal;
                  
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isFallback ? "#a1a1aa" : (isOverGoal ? "#ef4444" : "#22c55e")} 
                      fillOpacity={isFallback ? 0.3 : (isOverGoal ? 1 : 0.8)}
                      stroke="none"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-muted/50 p-4 rounded-2xl flex flex-col items-center text-center">
            <Target size={16} className="text-muted-foreground mb-2" />
            <span className="text-sm font-black text-foreground">{weekTotalConsumed}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Consumido</span>
          </div>
          <div className="bg-muted/50 p-4 rounded-2xl flex flex-col items-center text-center">
            <Flame size={16} className="text-muted-foreground mb-2" />
            <span className="text-sm font-black text-foreground">{kcalGoal * 7}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Meta da Semana</span>
          </div>
        </div>
      </div>
    </div>
  );
}
