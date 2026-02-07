"use client";

import React, { useState } from 'react';

import { Activity, WeightEntry, FoodLogEntry, WaterLogEntry, StepsLogEntry } from '@/lib/types';

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

import { ptBR } from 'date-fns/locale';

import { ChevronLeft, ChevronRight, Scale, Droplets, Footprints, Utensils, Flame, Zap, Wheat, Droplet as FatIcon } from 'lucide-react';

import ActivityCard from '@/components/ActivityCard';



interface CalendarViewProps {

  initialActivities: Activity[];

  initialWeights: WeightEntry[];

  initialFood: FoodLogEntry[];

  initialWater: WaterLogEntry[];

  initialSteps: StepsLogEntry[];

}



export default function CalendarView({ 

  initialActivities, 

  initialWeights,

  initialFood,

  initialWater,

  initialSteps

}: CalendarViewProps) {

  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedDate, setSelectedDate] = useState(new Date());



  const activities = initialActivities;

  const weights = initialWeights;

  const food = initialFood;

  const water = initialWater;

  const steps = initialSteps;



  const monthStart = startOfMonth(currentDate);

  const monthEnd = endOfMonth(currentDate);

  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start

  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });



  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });



  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));



  const selectedActivities = activities.filter(a => isSameDay(new Date(a.date), selectedDate));

  const selectedWeight = weights.find(w => isSameDay(new Date(w.date), selectedDate));

  const selectedFood = food.filter(f => isSameDay(new Date(f.date), selectedDate));

  const selectedWater = water.filter(w => isSameDay(new Date(w.date), selectedDate));

  const selectedSteps = steps.filter(s => isSameDay(new Date(s.date), selectedDate));



  const totalWaterSelected = selectedWater.reduce((acc, curr) => acc + curr.amount, 0);

  const totalStepsSelected = selectedSteps.reduce((acc, curr) => acc + curr.count, 0);

  const totalCaloriesSelected = selectedFood.reduce((acc, curr) => acc + curr.totalCalories, 0);

  const totalProteinSelected = selectedFood.reduce((acc, curr) => acc + (curr.totalProtein || 0), 0);

  const totalCarbsSelected = selectedFood.reduce((acc, curr) => acc + (curr.totalCarbs || 0), 0);

  const totalFatSelected = selectedFood.reduce((acc, curr) => acc + (curr.totalFat || 0), 0);



  return (

    <div className="space-y-8">

      <div className="flex items-center justify-between">

        <h1 className="text-3xl font-black text-foreground tracking-tight">Histórico</h1>

        <div className="flex items-center space-x-1 bg-card p-1 rounded-2xl shadow-sm border border-border mr-2">

          <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"><ChevronLeft size={20} /></button>

          <span className="text-xs font-black uppercase tracking-widest min-w-[100px] text-center text-foreground">

            {format(currentDate, 'MMM yyyy', { locale: ptBR })}

          </span>

          <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"><ChevronRight size={20} /></button>

        </div>

      </div>



      <div className="bg-card rounded-[2.5rem] p-6 shadow-sm border border-border">

        <div className="grid grid-cols-7 mb-4">

          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (

            <div key={`${day}-${i}`} className="text-center text-[10px] font-black text-muted-foreground/50 py-2">{day}</div>

          ))}

        </div>

        <div className="grid grid-cols-7 gap-2">

          {days.map((day) => {

             const hasActivity = activities.some(a => isSameDay(new Date(a.date), day));

             const hasWeight = weights.some(w => isSameDay(new Date(w.date), day));

             const hasFood = food.some(f => isSameDay(new Date(f.date), day));

             const isSelected = isSameDay(day, selectedDate);

             const isToday = isSameDay(day, new Date());

             const isCurrentMonth = isSameMonth(day, currentDate);



             return (

               <button

                 key={day.toISOString()}

                 onClick={() => setSelectedDate(day)}

                 className={`

                   aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-90

                   ${isSelected ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' : 'hover:bg-muted text-foreground'}

                   ${!isCurrentMonth ? 'opacity-20' : ''}

                   ${isToday && !isSelected ? 'border-2 border-primary/30 bg-primary/10' : ''}

                 `}

               >

                 <span className={`text-sm font-black ${isSelected ? 'text-primary-foreground' : ''}`}>{format(day, 'd')}</span>

                 <div className="flex space-x-0.5 mt-1 h-1.5">

                   {hasActivity && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-orange-500'}`} />}

                   {hasWeight && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground/70' : 'bg-blue-500'}`} />}

                   {hasFood && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground/50' : 'bg-red-500'}`} />}

                 </div>

               </button>

             );

          })}

        </div>

      </div>



      <div className="space-y-4">

        <h3 className="font-black text-muted-foreground text-xs uppercase tracking-[0.2em] ml-1">

            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}

        </h3>

        

        {/* Daily Totals Summary */}

        {(selectedFood.length > 0 || totalWaterSelected > 0 || totalStepsSelected > 0) && (

          <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm space-y-6">

            <div className="grid grid-cols-2 gap-4">

              {totalCaloriesSelected > 0 && (

                <div className="space-y-1">

                  <div className="flex items-center gap-2 text-red-500">

                    <Utensils size={14} />

                    <span className="text-[10px] font-black uppercase tracking-wider">Calorias</span>

                  </div>

                  <div className="flex items-baseline gap-1">

                    <span className="text-2xl font-black text-foreground">{totalCaloriesSelected}</span>

                    <span className="text-[10px] font-bold text-muted-foreground">kcal</span>

                  </div>

                  <div className="flex gap-3 pt-1">

                    <div className="flex flex-col">

                      <span className="text-[8px] font-black text-muted-foreground uppercase">P</span>

                      <span className="text-[10px] font-bold text-foreground">{totalProteinSelected}g</span>

                    </div>

                    <div className="flex flex-col">

                      <span className="text-[8px] font-black text-muted-foreground uppercase">C</span>

                      <span className="text-[10px] font-bold text-foreground">{totalCarbsSelected}g</span>

                    </div>

                    <div className="flex flex-col">

                      <span className="text-[8px] font-black text-muted-foreground uppercase">G</span>

                      <span className="text-[10px] font-bold text-foreground">{totalFatSelected}g</span>

                    </div>

                  </div>

                </div>

              )}



              {totalWaterSelected > 0 && (

                <div className="space-y-1">

                  <div className="flex items-center gap-2 text-blue-500">

                    <Droplets size={14} />

                    <span className="text-[10px] font-black uppercase tracking-wider">Água</span>

                  </div>

                  <div className="flex items-baseline gap-1">

                    <span className="text-2xl font-black text-foreground">{(totalWaterSelected / 1000).toFixed(1)}</span>

                    <span className="text-[10px] font-bold text-muted-foreground">L</span>

                  </div>

                </div>

              )}



              {totalStepsSelected > 0 && (

                <div className="space-y-1 col-span-2 pt-2 border-t border-border/50">

                  <div className="flex items-center gap-2 text-purple-500">

                    <Footprints size={14} />

                    <span className="text-[10px] font-black uppercase tracking-wider">Passos</span>

                  </div>

                  <div className="flex items-baseline gap-1">

                    <span className="text-2xl font-black text-foreground">{totalStepsSelected}</span>

                    <span className="text-[10px] font-bold text-muted-foreground">passos</span>

                  </div>

                </div>

              )}

            </div>

          </div>

        )}



        {selectedWeight && (

          <div className="bg-card p-6 rounded-3xl mb-4 flex justify-between items-center border border-border shadow-sm">

             <div className="flex items-center gap-3">

               <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">

                 <Scale size={20} />

               </div>

               <span className="font-bold text-foreground">Peso Corporal</span>

             </div>

             <span className="font-black text-2xl text-foreground">{selectedWeight.weight} <span className="text-sm text-muted-foreground">kg</span></span>

          </div>

        )}



        <div className="space-y-3">

          {/* Activities List */}

          {selectedActivities.map(a => <ActivityCard key={a.id} activity={a} />)}



          {/* Food List */}

          {selectedFood.map(f => (

            <div key={f.id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">

              <div className="p-5 border-b border-border bg-muted/30 flex justify-between items-center gap-4">

                <div className="flex items-center gap-3 min-w-0">

                  <div className="bg-red-500 p-2 rounded-xl text-white shrink-0">

                    <Utensils size={16} />

                  </div>

                  <div className="min-w-0">

                    <h3 className="font-black text-foreground text-sm truncate">{f.mealName}</h3>

                    <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider -mt-0.5">

                      P: {f.totalProtein || 0}g • C: {f.totalCarbs || 0}g • G: {f.totalFat || 0}g

                    </p>

                  </div>

                </div>

                <div className="text-right whitespace-nowrap">

                  <span className="font-black text-foreground text-sm">{f.totalCalories}</span>

                  <span className="text-[10px] font-bold text-muted-foreground ml-1">kcal</span>

                </div>

              </div>

              

              <div className="p-5 space-y-3">

                {f.items.map((item, idx) => (

                  <div key={idx} className="flex justify-between items-start group">

                    <div className="flex-1">

                      <p className="font-bold text-foreground text-xs">{item.name}</p>

                      <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">

                        {item.quantity} • {item.calories} kcal

                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          ))}

        </div>



        {selectedActivities.length === 0 && selectedFood.length === 0 && !selectedWeight && totalWaterSelected === 0 && totalStepsSelected === 0 && (

          <div className="text-center py-16 bg-card rounded-[2.5rem] border-2 border-dashed border-border">

            <p className="text-muted-foreground/70 font-bold italic uppercase tracking-tighter">Nenhum registro hoje</p>

          </div>

        )}

      </div>

    </div>

  );

}
