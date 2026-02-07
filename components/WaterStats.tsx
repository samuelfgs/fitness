"use client";

import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, YAxis } from 'recharts';
import { Droplets, Target, Info } from 'lucide-react';

interface DailyStat {
  date: string;
  dayName: string;
  consumed: number;
  goal: number;
}

interface WaterStatsProps {
  stats: {
    dailyStats: DailyStat[];
    waterGoal: number;
    weekTotalConsumed: number;
    weekTotalGoal: number;
  };
}

export default function WaterStats({ stats }: WaterStatsProps) {
  const { dailyStats, waterGoal, weekTotalConsumed, weekTotalGoal } = stats;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const progress = (data.consumed / data.goal) * 100;
      return (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-[20px] shadow-2xl">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-8">
              <span className="text-zinc-500 text-xs font-bold">Consumido</span>
              <span className="text-white text-sm font-black">{data.consumed} ml</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-zinc-500 text-xs font-bold">Meta</span>
              <span className="text-zinc-400 text-sm font-black">{data.goal} ml</span>
            </div>
            <div className="flex items-center justify-between gap-8 pt-1 border-t border-zinc-800 mt-1">
              <span className="text-zinc-500 text-xs font-bold">Progresso</span>
              <span className={`text-sm font-black ${progress >= 100 ? 'text-blue-500' : 'text-zinc-400'}`}>
                {progress.toFixed(0)}%
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
      <h2 className="text-lg font-black text-foreground px-2">Estatísticas da Semana</h2>
      
      <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total da Semana</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-blue-500">
                {(weekTotalConsumed / 1000).toFixed(1)}
              </span>
              <span className="text-xs font-bold text-muted-foreground mt-2">Litros</span>
            </div>
          </div>
          <div className="p-4 rounded-3xl bg-blue-500/10 text-blue-500">
            <Droplets size={32} strokeWidth={2.5} />
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
                dataKey="consumed"
                radius={[8, 8, 0, 0]} 
                barSize={24}
                activeBar={false}
                stroke="none"
              >
                {dailyStats.map((entry, index) => {
                  const isMet = entry.consumed >= entry.goal;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isMet ? "#3b82f6" : "#60a5fa"} 
                      fillOpacity={isMet ? 1 : 0.8}
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
            <span className="text-sm font-black text-foreground">{weekTotalGoal / 1000}L</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Meta Semanal</span>
          </div>
          <div className="bg-muted/50 p-4 rounded-2xl flex flex-col items-center text-center">
            <Info size={16} className="text-muted-foreground mb-2" />
            <span className="text-sm font-black text-foreground">{waterGoal}ml</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Meta Diária</span>
          </div>
        </div>
      </div>
    </div>
  );
}
