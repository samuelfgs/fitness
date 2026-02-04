"use client";

import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { format } from 'date-fns';
import { WeightMeasurement } from '@/lib/db/schema';

interface WeightEvolutionChartProps {
  weights: WeightMeasurement[];
}

export default function WeightEvolutionChart({ weights }: WeightEvolutionChartProps) {
  const chartData = [...weights]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(w => ({
      date: format(new Date(w.date), 'dd/MM'),
      weight: (w.weight ?? 0) / 1000
    }));

  if (chartData.length < 2) {
    return (
      <div className="h-64 bg-card rounded-[2rem] border border-border flex flex-col items-center justify-center mb-8 shadow-sm p-6 text-center">
        <p className="text-muted-foreground font-bold">Adicione pelo menos 2 registros para ver o gráfico.</p>
      </div>
    );
  }

  // Calculate min and max for Y axis to make the chart look better
  const weightValues = chartData.map(d => d.weight);
  const minWeight = Math.min(...weightValues);
  const maxWeight = Math.max(...weightValues);
  
  // Ensure we have a reasonable range even if weights are close together
  // A 4kg minimum range (2kg above/below) makes 100g changes look proportional
  const range = maxWeight - minWeight;
  const preferredRange = Math.max(range * 2, 4); 
  const midPoint = (maxWeight + minWeight) / 2;
  const domainMin = Math.floor(midPoint - preferredRange / 2);
  const domainMax = Math.ceil(midPoint + preferredRange / 2);

  return (
    <div className="h-64 bg-card rounded-[2rem] border border-border mb-8 shadow-sm p-4 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 10, fill: '#a1a1aa', fontWeight: 'bold'}} 
            dy={10}
          />
          <YAxis 
            hide={false}
            axisLine={false}
            tickLine={false}
            tick={{fontSize: 10, fill: '#a1a1aa', fontWeight: 'bold'}}
            domain={[domainMin, domainMax]}
            width={35}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{
                borderRadius: '20px', 
                border: '1px solid #3f3f46', 
                backgroundColor: '#18181b', 
                boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.5)', 
                fontWeight: 'bold',
                fontSize: '12px'
            }}
            itemStyle={{color: '#22c55e', fontWeight: 'bold'}}
            labelStyle={{color: '#fafafa', marginBottom: '4px'}}
            formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Peso']}
          />
          <Area 
            type="monotone" 
            dataKey="weight" 
            stroke="#22c55e" 
            strokeWidth={4} 
            fillOpacity={1} 
            fill="url(#colorWeight)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
