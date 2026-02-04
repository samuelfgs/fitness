"use client";

import React, { useState } from 'react';

import { Activity, WeightEntry } from '@/lib/types';

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

import { ptBR } from 'date-fns/locale';

import { ChevronLeft, ChevronRight, Scale } from 'lucide-react';

import ActivityCard from '@/components/ActivityCard';



interface CalendarViewProps {

  initialActivities: Activity[];

  initialWeights: WeightEntry[];

}



export default function CalendarView({ initialActivities, initialWeights }: CalendarViewProps) {

  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedDate, setSelectedDate] = useState(new Date());



  const activities = initialActivities;

  const weights = initialWeights;



  const monthStart = startOfMonth(currentDate);

  const monthEnd = endOfMonth(currentDate);

  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start

  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });



  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });



  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));



  const selectedActivities = activities.filter(a => isSameDay(new Date(a.date), selectedDate));

  const selectedWeight = weights.find(w => isSameDay(new Date(w.date), selectedDate));



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



        {selectedActivities.length > 0 ? (

          <div className="space-y-1">

             {selectedActivities.map(a => <ActivityCard key={a.id} activity={a} />)}

          </div>

        ) : (

          !selectedWeight && (

            <div className="text-center py-16 bg-card rounded-[2.5rem] border-2 border-dashed border-border">

              <p className="text-muted-foreground/70 font-bold italic uppercase tracking-tighter">Nenhum registro hoje</p>

            </div>

          )

        )}

      </div>

    </div>

  );

}
