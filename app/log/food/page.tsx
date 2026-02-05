'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Utensils, Sparkles, Loader2, Check, X, MessageSquare, Plus, Trash2, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { parseFood, saveFood, getRegisteredFoods, deleteRegisteredFood } from "@/app/actions/food";
import { Button } from "@/components/ui/Button";
import { RegisterFoodForm } from "@/components/RegisterFoodForm";

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  mealName: string;
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export default function LogFoodPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{ meals: Meal[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registeredFoods, setRegisteredFoods] = useState<any[]>([]);
  const [editingFood, setEditingFood] = useState<any>(null);

  useEffect(() => {
    const pending = sessionStorage.getItem('pending_meals');
    if (pending) {
      try {
        const meals = JSON.parse(pending);
        setPreviewData({ meals });
        setText('Repetido de histórico');
        sessionStorage.removeItem('pending_meals');
      } catch (e) {
        console.error('Failed to parse pending meals', e);
      }
    }
  }, []);

  useEffect(() => {
    if (showRegisterForm) {
      loadRegisteredFoods();
    }
  }, [showRegisterForm]);

  async function loadRegisteredFoods() {
    try {
      const foods = await getRegisteredFoods();
      setRegisteredFoods(foods);
    } catch (err) {
      console.error('Failed to load registered foods', err);
    }
  }

  async function handleDeleteRegistered(id: string) {
    if (!confirm('Tem certeza que deseja excluir este alimento registrado?')) return;
    try {
      await deleteRegisteredFood(id);
      loadRegisteredFoods();
    } catch (err) {
      alert('Erro ao excluir alimento.');
    }
  }

  function handleEditFood(food: any) {
    setEditingFood(food);
    // Ensure we scroll to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleAnalyze(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await parseFood(text);
      setPreviewData(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao analisar sua refeição.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFollowUp(e: React.FormEvent) {
    e.preventDefault();
    if (!followUp.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const history = [
        { role: 'user', content: text },
        { role: 'assistant', content: `Current state: ${JSON.stringify(previewData)}` }
      ];
      const data = await parseFood(followUp, history);
      setPreviewData(data);
      setFollowUp('');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar sua alteração.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!previewData) return;

    setIsLoading(true);
    setError(null);

    try {
      await saveFood(previewData.meals, text);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar sua refeição.');
      setIsLoading(false);
    }
  }

  function handleDiscard() {
    setPreviewData(null);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-12">
      <div className="px-6 py-6 flex items-center justify-between">
        <Link 
          href="/log" 
          className="p-2 -ml-2 text-foreground bg-muted rounded-xl hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-black text-foreground tracking-tight">Registro de Alimentação</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6">
        {showRegisterForm ? (
          <div className="space-y-6">
            <RegisterFoodForm 
              initialData={editingFood}
              onSuccess={() => {
                if (!editingFood) setShowRegisterForm(false);
                setEditingFood(null);
                loadRegisteredFoods();
              }}
              onCancel={() => {
                setShowRegisterForm(false);
                setEditingFood(null);
              }}
            />

            <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
              <h3 className="text-xl font-black text-foreground tracking-tight px-1">Seus Alimentos</h3>
              <div className="space-y-3">
                {registeredFoods.length === 0 ? (
                  <p className="text-muted-foreground text-sm px-1 font-medium italic">Nenhum alimento cadastrado ainda.</p>
                ) : (
                  registeredFoods.map((food) => (
                    <div key={food.id} className="bg-muted/50 rounded-2xl p-4 flex items-center justify-between group">
                      <div className="space-y-1">
                        <div className="font-bold text-foreground">{food.name}</div>
                        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                          {food.servingSize} • {food.calories} kcal • P:{food.protein}g C:{food.carbs}g G:{food.fat}g
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditFood(food)}
                          className="p-2 text-muted-foreground hover:text-blue-500 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteRegistered(food.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : !previewData ? (
          <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6 shadow-sm">
            <div className="bg-red-500/10 w-16 h-16 rounded-2xl flex items-center justify-center text-red-500 mb-2">
              <Utensils size={32} strokeWidth={2.5} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground tracking-tight">O que você comeu?</h2>
              <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                Descreva sua refeição e nossa IA cuidará do resto.
              </p>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-6">
              <div className="space-y-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  placeholder="Ex: Almoco - Arroz 100g, Feijão 100g, Frango Grelhado 150g"
                  className="w-full bg-muted border-none rounded-3xl p-6 text-foreground font-medium placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-red-500 transition-all resize-none"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold leading-relaxed">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  type="submit"
                  loading={isLoading}
                  disabled={!text.trim()}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-8 rounded-3xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} />
                  ANALISAR COM IA
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Link href="/log/food/recent" className="w-full">
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full border-2 border-muted hover:bg-muted font-black py-8 rounded-3xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Utensils size={20} />
                      REPETIR
                    </Button>
                  </Link>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowRegisterForm(true)}
                    className="w-full border-2 border-muted hover:bg-muted font-black py-8 rounded-3xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    CADASTRAR
                  </Button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black text-foreground">Confirmar Refeição</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={handleDiscard}
                    className="p-3 bg-muted rounded-2xl text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {previewData.meals.map((meal, idx) => (
                  <div key={idx} className="bg-muted/50 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-border/50 pb-4 gap-2">
                      <h3 className="font-black text-foreground truncate">{meal.mealName}</h3>
                      <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-3 py-1 rounded-full uppercase whitespace-nowrap">
                        {meal.totalCalories} kcal
                      </span>
                    </div>
                    <div className="space-y-3">
                      {meal.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{item.name}</span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                              P: {item.protein}g • C: {item.carbs}g • G: {item.fat}g
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-muted-foreground font-black">{item.quantity}</span>
                            <span className="text-[10px] text-red-500 font-bold">{item.calories} kcal</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <form onSubmit={handleFollowUp} className="relative">
                  <input 
                    type="text"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder="Algo errado? Peça para ajustar..."
                    className="w-full bg-muted border-none rounded-2xl py-4 pl-5 pr-12 text-sm font-medium focus:ring-2 focus:ring-red-500"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit"
                    disabled={isLoading || !followUp.trim()}
                    className="absolute right-2 top-2 p-2 bg-foreground text-background rounded-xl disabled:opacity-50"
                  >
                    <MessageSquare size={16} />
                  </button>
                </form>

                <Button 
                  onClick={handleSave}
                  loading={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-8 rounded-3xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  SALVAR REGISTRO
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-muted/30 rounded-[2rem] p-6 border border-dashed border-border">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
            <Sparkles size={12} className="text-red-500" />
            Como funciona?
          </h3>
          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
            Nossa IA analisa seu texto, estima porções e valores nutricionais. Você pode revisar tudo antes de salvar e até pedir ajustes se algo estiver errado.
          </p>
        </div>
      </div>
    </div>
  );
}