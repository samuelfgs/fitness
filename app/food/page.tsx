'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Utensils, Flame, Zap, Wheat, Droplet, Trash2, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { getFoodLogs, deleteFoodLog, deleteFoodItem, getWeeklyFoodStats } from "@/app/actions/food";
import { useRouter } from 'next/navigation';
import FoodWeekStats from "@/components/FoodWeekStats";

export default function FoodBreakdownPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [weekStats, setWeekStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      const [logsData, statsData] = await Promise.all([
        getFoodLogs(),
        getWeeklyFoodStats()
      ]);
      setLogs(logsData);
      setWeekStats(statsData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDeleteLog(id: string) {
    if (!confirm('Excluir esta refeição inteira?')) return;
    setActionId(id);
    try {
      await deleteFoodLog(id);
      await loadData();
    } catch (error) {
      alert('Erro ao excluir');
    } finally {
      setActionId(null);
    }
  }

  async function handleDeleteItem(logId: string, itemIndex: number, itemName: string) {
    if (!confirm(`Excluir "${itemName}"?`)) return;
    setActionId(`${logId}-${itemIndex}`);
    try {
      await deleteFoodItem(logId, itemIndex);
      await loadData();
    } catch (error) {
      alert('Erro ao excluir item');
    } finally {
      setActionId(null);
    }
  }

  const totals = logs.reduce((acc, log) => ({
    calories: acc.calories + log.totalCalories,
    protein: acc.protein + (log.totalProtein || 0),
    carbs: acc.carbs + (log.totalCarbs || 0),
    fat: acc.fat + (log.totalFat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  if (isLoading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-red-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-12">
      <div className="px-6 py-6 flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="p-2 -ml-2 text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-black text-foreground tracking-tight">Consumo de Hoje</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 space-y-6">
        {/* Daily Summary Card */}
        <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total do Dia</span>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-foreground">{totals.calories}</span>
                <span className="text-sm font-bold text-muted-foreground mb-2">kcal</span>
              </div>
            </div>
            <div className="bg-red-500/10 p-4 rounded-3xl text-red-500">
              <Flame size={32} strokeWidth={2.5} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/50 p-4 rounded-2xl flex flex-col items-center text-center">
              <Zap size={16} className="text-orange-500 mb-2" />
              <span className="text-sm font-black text-foreground">{totals.protein}g</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Proteína</span>
            </div>
            <div className="bg-muted/50 p-4 rounded-2xl flex flex-col items-center text-center">
              <Wheat size={16} className="text-amber-500 mb-2" />
              <span className="text-sm font-black text-foreground">{totals.carbs}g</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Carbos</span>
            </div>
            <div className="bg-muted/50 p-4 rounded-2xl flex flex-col items-center text-center">
              <Droplet size={16} className="text-yellow-600 mb-2" />
              <span className="text-sm font-black text-foreground">{totals.fat}g</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gordura</span>
            </div>
          </div>
        </div>

        {/* Weekly Stats */}
        {weekStats && <FoodWeekStats stats={weekStats} />}

        {/* Meals List */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-foreground px-2">Refeições</h2>
          
          {logs.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-[2.5rem] border-2 border-dashed border-border">
              <p className="text-muted-foreground font-bold mb-4">Nenhuma refeição registrada hoje.</p>
              <Link 
                href="/log/food"
                className="text-red-500 font-black text-sm bg-red-500/10 px-6 py-3 rounded-2xl inline-block active:scale-95 transition-all hover:bg-red-500/20"
              >
                + Registrar Refeição
              </Link>
            </div>
          ) : (
            logs.map((meal) => (
              <div key={meal.id} className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-red-500 p-2 rounded-xl text-white shrink-0">
                      <Utensils size={16} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-foreground text-lg truncate">{meal.mealName}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider -mt-1">
                        P: {meal.totalProtein || 0}g • C: {meal.totalCarbs || 0}g • G: {meal.totalFat || 0}g
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right whitespace-nowrap">
                      <span className="font-black text-foreground">{meal.totalCalories}</span>
                      <span className="text-xs font-bold text-muted-foreground ml-1">kcal</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteLog(meal.id)}
                      disabled={actionId === meal.id}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {actionId === meal.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {(meal.content as any[]).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex-1">
                        <p className="font-bold text-foreground text-sm">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          P: {item.protein}g • C: {item.carbs}g • G: {item.fat}g • {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-black text-foreground">{item.calories} kcal</p>
                        <button 
                          onClick={() => handleDeleteItem(meal.id, idx, item.name)}
                          disabled={actionId === `${meal.id}-${idx}`}
                          className="p-1.5 text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                        >
                          {actionId === `${meal.id}-${idx}` ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
