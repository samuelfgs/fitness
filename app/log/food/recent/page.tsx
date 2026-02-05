'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Utensils, Loader2, Check, Search, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getRecentFoodItems } from "@/app/actions/food";
import { Button } from "@/components/ui/Button";

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function RecentFoodItemsPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedItems, setSelectedItems] = useState<FoodItem[]>([]);
  const [mealTitle, setMealTitle] = useState('');
  const [search, setSearch] = useState('');

  const { data: items, isLoading } = useQuery({
    queryKey: ['recentFoodItems'],
    queryFn: () => getRecentFoodItems(50),
  });

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (!search.trim()) return items;
    const s = search.toLowerCase();
    return items.filter((item: FoodItem) => 
      item.name.toLowerCase().includes(s) || 
      item.quantity.toLowerCase().includes(s)
    );
  }, [items, search]);

  const toggleItem = (item: FoodItem) => {
    const isSelected = selectedItems.some(i => i.name === item.name && i.quantity === item.quantity);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(i => !(i.name === item.name && i.quantity === item.quantity)));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const totals = useMemo(() => {
    return selectedItems.reduce((acc, curr) => ({
      calories: acc.calories + (curr.calories || 0),
      protein: acc.protein + (curr.protein || 0),
      carbs: acc.carbs + (curr.carbs || 0),
      fat: acc.fat + (curr.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [selectedItems]);

  const handleConfirm = () => {
    if (selectedItems.length === 0 || !mealTitle.trim()) return;

    const meal = {
      mealName: mealTitle,
      items: selectedItems,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat
    };

    sessionStorage.setItem('pending_meals', JSON.stringify([meal]));
    router.push('/log/food');
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-24">
        <div className="px-6 py-6 flex items-center justify-between">
          <button 
            onClick={() => setStep(1)}
            className="p-2 -ml-2 text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-black text-foreground tracking-tight">Nova Refeição</h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 px-6 space-y-6">
          <div className="bg-card border-2 border-border rounded-[2.5rem] p-6 shadow-sm space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-black text-muted-foreground uppercase px-2">Dê um nome para esta refeição</label>
              <input 
                autoFocus
                type="text"
                value={mealTitle}
                onChange={(e) => setMealTitle(e.target.value)}
                placeholder="Ex: Almoço de Domingo, Lanche Pré-Treino"
                className="w-full bg-muted border-none rounded-2xl py-5 px-6 text-lg font-bold focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-muted-foreground uppercase px-2">Itens Selecionados</h3>
              <div className="bg-muted/50 rounded-3xl p-4 space-y-3">
                {selectedItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-border/30 last:border-0 pb-3 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase">{item.quantity}</span>
                    </div>
                    <span className="text-red-500 font-black">{item.calories} kcal</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2">
              <div className="bg-muted/50 rounded-2xl p-3 text-center">
                <span className="block text-[10px] text-muted-foreground font-bold uppercase">Kcal</span>
                <span className="font-black text-sm">{totals.calories}</span>
              </div>
              <div className="bg-muted/50 rounded-2xl p-3 text-center">
                <span className="block text-[10px] text-muted-foreground font-bold uppercase">Prot</span>
                <span className="font-black text-sm">{totals.protein}g</span>
              </div>
              <div className="bg-muted/50 rounded-2xl p-3 text-center">
                <span className="block text-[10px] text-muted-foreground font-bold uppercase">Carbs</span>
                <span className="font-black text-sm">{totals.carbs}g</span>
              </div>
              <div className="bg-muted/50 rounded-2xl p-3 text-center">
                <span className="block text-[10px] text-muted-foreground font-bold uppercase">Gord</span>
                <span className="font-black text-sm">{totals.fat}g</span>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
          <div className="max-w-md mx-auto p-6 bg-gradient-to-t from-background via-background to-transparent pointer-events-auto">
            <Button 
              onClick={handleConfirm}
              disabled={!mealTitle.trim()}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-8 rounded-3xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Check size={20} />
              SALVAR NO REGISTRO
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <div className="px-6 py-6 flex items-center justify-between">
        <Link 
          href="/log/food" 
          className="p-2 -ml-2 text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-black text-foreground tracking-tight">Itens Recentes</h1>
        <div className="w-10" />
      </div>

      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nos seus itens..."
            className="w-full bg-muted border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="flex-1 px-6 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-red-500" size={40} />
            <p className="text-muted-foreground font-bold">Buscando seus itens...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredItems.map((item, idx) => {
              const isSelected = selectedItems.some(i => i.name === item.name && i.quantity === item.quantity);
              return (
                <button
                  key={idx}
                  onClick={() => toggleItem(item)}
                  className={`w-full text-left bg-card border-2 rounded-3xl p-4 transition-all active:scale-[0.98] flex items-center justify-between ${
                    isSelected 
                      ? 'border-red-500 bg-red-500/5' 
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{item.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground font-medium uppercase">{item.quantity}</span>
                      <span className="text-xs text-red-500 font-bold">{item.calories} kcal</span>
                    </div>
                  </div>
                  <div className={`p-2 rounded-xl transition-colors ${
                    isSelected ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isSelected ? <Minus size={18} /> : <Plus size={18} />}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-muted/30 rounded-[2.5rem] p-12 text-center space-y-4 border-2 border-dashed border-border">
            <div className="bg-muted w-16 h-16 rounded-2xl flex items-center justify-center text-muted-foreground mx-auto">
              <Utensils size={32} />
            </div>
            <div>
              <h3 className="font-black text-foreground">Nenhum item encontrado</h3>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                Itens de refeições registradas aparecerão aqui.
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
          <div className="max-w-md mx-auto p-6 bg-gradient-to-t from-background via-background to-transparent pt-12 pointer-events-auto">
            <div className="bg-foreground text-background rounded-3xl p-6 mb-4 flex items-center justify-between shadow-xl">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase opacity-60">Selecionados</span>
                <span className="text-lg font-black">{selectedItems.length} {selectedItems.length === 1 ? 'item' : 'itens'}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase opacity-60">Total</span>
                <span className="text-lg font-black">{totals.calories} kcal</span>
              </div>
            </div>
            <Button 
              onClick={() => setStep(2)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-8 rounded-3xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              PRÓXIMO
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}