'use client';

import React, { useState } from 'react';
import { Activity as ActivityIcon, Waves, Footprints, Dumbbell, Bike, Flame, MoreHorizontal, ArrowLeft, Check, Clock, Flame as FlameIcon, StickyNote, Calendar, LucideIcon, Scale } from 'lucide-react';
import { Activity } from '@/lib/db/schema';
import { logWorkout } from '@/app/actions/workouts';
import { useRouter } from 'next/navigation';

const ICON_MAP: Record<string, LucideIcon> = {
  Activity: ActivityIcon,
  Waves,
  Footprints,
  Dumbbell,
  Bike,
  Flame,
  MoreHorizontal,
  Clock,
  Calendar,
  StickyNote,
  Scale,
};

interface Option {
  label: string;
  value: string;
}

interface Field {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: Option[];
  icon?: string;
  color?: string;
  suffix?: string;
}

interface LogActivityFormProps {
  activities: Activity[];
}

export default function LogActivityForm({ activities }: LogActivityFormProps) {
  const [step, setStep] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const router = useRouter();

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedActivity(null);
    } else {
      router.push('/dashboard');
    }
  };

  const getIcon = (name: string | null) => {
    const Icon = name && ICON_MAP[name] ? ICON_MAP[name] : MoreHorizontal;
    return <Icon size={24} />;
  };

  const getSmallIcon = (name: string | undefined, colorClass: string | undefined) => {
    const Icon = name && ICON_MAP[name] ? ICON_MAP[name] : MoreHorizontal;
    return <Icon size={14} className={colorClass} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="px-6 py-6 border-b border-border flex items-center justify-between">
        <button onClick={handleBack} className="p-2 -ml-2 text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-foreground tracking-tight">
          {step === 1 ? 'Escolha a Atividade' : selectedActivity?.name}
        </h1>
        <div className="w-10" /> 
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32">
        {step === 1 && (
          <div className="flex flex-col gap-3">
            {activities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => handleActivitySelect(activity)}
                className={`py-4 px-4 rounded-2xl flex flex-row items-center gap-4 transition-all border-2 bg-card border-border text-foreground hover:border-primary/50 hover:bg-muted/50`}
              >
                <div className={`p-3 rounded-full ${activity.color?.split(' ')[1] || 'bg-muted'} ${activity.color?.split(' ')[0] || 'text-foreground'}`}>
                  {getIcon(activity.icon)}
                </div>
                <span className="font-bold text-lg">{activity.name}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && selectedActivity && (
          <form id="log-form" action={logWorkout} className="space-y-8">
            <input type="hidden" name="activityId" value={selectedActivity.id} />
            
            {selectedActivity.fields && Array.isArray(selectedActivity.fields) && (selectedActivity.fields as unknown as Field[]).map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                  {field.icon && getSmallIcon(field.icon, field.color)}
                  {field.label}
                </label>
                
                {field.type === 'radio' && (
                  <div className="grid grid-cols-2 gap-3">
                    {field.options?.map((option) => (
                      <label key={option.value} className="cursor-pointer">
                        <input 
                          type="radio" 
                          name={field.name} 
                          value={option.value} 
                          className="peer sr-only" 
                          required={field.required} 
                        />
                        <div className="py-4 px-4 rounded-2xl text-center text-sm font-bold transition-all border-2 bg-card border-border text-muted-foreground peer-checked:bg-primary peer-checked:border-primary peer-checked:text-primary-foreground peer-checked:shadow-xl peer-checked:shadow-primary/20">
                          {option.label}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'datetime-local' && (
                   <input
                     type="datetime-local"
                     name={field.name}
                     required={field.required}
                     defaultValue={new Date().toISOString().slice(0, 16)}
                     className="w-full bg-muted/50 border-none rounded-2xl p-5 text-xl font-bold focus:ring-2 focus:ring-primary text-foreground"
                   />
                )}

                {field.type === 'number' && (
                  <div className="relative">
                    <input
                      type="number"
                      name={field.name}
                      step="any"
                      required={field.required}
                      className={`w-full bg-muted/50 border-none rounded-2xl p-5 text-2xl font-black focus:ring-2 focus:ring-primary text-foreground ${field.suffix ? 'pr-16' : ''}`}
                      placeholder="0"
                    />
                    {field.suffix && (
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm uppercase">
                        {field.suffix}
                      </span>
                    )}
                  </div>
                )}

                {field.type === 'textarea' && (
                  <textarea
                    name={field.name}
                    required={field.required}
                    className="w-full bg-muted/50 border-none rounded-2xl p-5 text-base font-bold focus:ring-2 focus:ring-primary min-h-[120px] placeholder:text-muted-foreground/50 text-foreground"
                    placeholder={`Adicione detalhes sobre seu treino...`}
                  />
                )}

                {field.type === 'text' && (
                  <input
                    type="text"
                    name={field.name}
                    required={field.required}
                    className="w-full bg-muted/50 border-none rounded-2xl p-5 text-xl font-bold focus:ring-2 focus:ring-primary text-foreground"
                  />
                )}
              </div>
            ))}
          </form>
        )}
      </div>

      {step === 2 && selectedActivity && (
        <div className="p-6 fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border max-w-md mx-auto z-10">
          <button
            type="submit"
            form="log-form"
            className="w-full bg-primary text-primary-foreground font-black text-xl py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Check size={28} strokeWidth={3} />
            Salvar Treino
          </button>
        </div>
      )}
    </div>
  );
}