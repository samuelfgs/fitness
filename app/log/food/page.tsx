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
  baseQuantity?: number | null;
  baseCalories?: number;
  baseProtein?: number;
  baseCarbs?: number;
  baseFat?: number;
  unit?: string;
  currentAmount?: number | null;
}

interface Meal {
  mealName: string;
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

function parseQuantity(str: string) {
  const numMatch = str.match(/(\d+(?:\.\d+)?)/);
  if (!numMatch) return { amount: null, unit: str };
  
  const amount = parseFloat(numMatch[0]);
  const unit = str.replace(numMatch[0], '').trim();
  return { amount, unit };
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
    const draft = sessionStorage.getItem('draft_meal');
    const pending = sessionStorage.getItem('pending_meals');
    
    if (draft || pending) {
      try {
        let currentPreview: { meals: Meal[] } | null = null;
        
        if (draft) {
          currentPreview = JSON.parse(draft);
          sessionStorage.removeItem('draft_meal');
        }
        
        if (pending) {
          const newMeals = JSON.parse(pending);
          sessionStorage.removeItem('pending_meals');
          
          if (!currentPreview) {
            currentPreview = { meals: newMeals };
          } else {
            const mergedMeals = [...currentPreview.meals];
            newMeals.forEach((m: Meal) => {
              if (mergedMeals.length > 0) {
                // Merge items into the first meal if it exists
                mergedMeals[0].items = [...mergedMeals[0].items, ...m.items];
                const totals = recalculateMealTotals(mergedMeals[0].items);
                mergedMeals[0].totalCalories = totals.calories;
                mergedMeals[0].totalProtein = totals.protein;
                mergedMeals[0].totalCarbs = totals.carbs;
                mergedMeals[0].totalFat = totals.fat;
              } else {
                mergedMeals.push(m);
              }
            });
            currentPreview = { meals: mergedMeals };
          }
        }
        
        if (currentPreview) {
          setPreviewData(currentPreview);
          if (!text) setText('Refeição em edição');
        }
      } catch (e) {
        console.error('Failed to parse meals', e);
      }
    }
  }, []);

  const handleRepetir = () => {
    if (previewData) {
      sessionStorage.setItem('draft_meal', JSON.stringify(previewData));
    }
    router.push('/log/food/recent');
  };

  const recalculateMealTotals = (items: FoodItem[]) => {
    return items.reduce((acc, curr) => ({
      calories: acc.calories + (curr.calories || 0),
      protein: acc.protein + (curr.protein || 0),
      carbs: acc.carbs + (curr.carbs || 0),
      fat: acc.fat + (curr.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const updateMealItem = (mealIdx: number, itemIdx: number, newAmount: number) => {
    if (!previewData) return;
    
    const newMeals = [...previewData.meals];
    const meal = { ...newMeals[mealIdx] };
    const items = [...meal.items];
    const item = { ...items[itemIdx] };
    
    // If we don't have base values, try to initialize them from current state
    if (item.baseQuantity === undefined) {
      const { amount, unit } = parseQuantity(item.quantity);
      item.baseQuantity = amount;
      item.currentAmount = amount;
      item.unit = unit;
      item.baseCalories = item.calories;
      item.baseProtein = item.protein;
      item.baseCarbs = item.carbs;
      item.baseFat = item.fat;
    }

    if (item.baseQuantity && item.baseQuantity > 0) {
      const ratio = newAmount / item.baseQuantity;
      item.currentAmount = newAmount;
      item.quantity = `${newAmount}${item.unit || ''}`;
      item.calories = Math.round((item.baseCalories || 0) * ratio);
      item.protein = Math.round((item.baseProtein || 0) * ratio * 10) / 10;
      item.carbs = Math.round((item.baseCarbs || 0) * ratio * 10) / 10;
      item.fat = Math.round((item.baseFat || 0) * ratio * 10) / 10;
      
      items[itemIdx] = item;
      meal.items = items;
      
      const totals = recalculateMealTotals(items);
      meal.totalCalories = totals.calories;
      meal.totalProtein = totals.protein;
      meal.totalCarbs = totals.carbs;
      meal.totalFat = totals.fat;
      
      newMeals[mealIdx] = meal;
      setPreviewData({ meals: newMeals });
    }
  };

  const deleteMealItem = (mealIdx: number, itemIdx: number) => {
    if (!previewData) return;
    
    const newMeals = [...previewData.meals];
    const meal = { ...newMeals[mealIdx] };
    meal.items = meal.items.filter((_, i) => i !== itemIdx);
    
    if (meal.items.length === 0) {
      newMeals.splice(mealIdx, 1);
    } else {
      const totals = recalculateMealTotals(meal.items);
      meal.totalCalories = totals.calories;
      meal.totalProtein = totals.protein;
      meal.totalCarbs = totals.carbs;
      meal.totalFat = totals.fat;
      newMeals[mealIdx] = meal;
    }
    
    setPreviewData(newMeals.length > 0 ? { meals: newMeals } : null);
  };

  const addRegisteredFoodToMeal = (food: any) => {
    const { amount, unit } = parseQuantity(food.servingSize);
    const newItem: FoodItem = {
      name: food.name,
      quantity: food.servingSize,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      baseQuantity: amount,
      currentAmount: amount,
      unit: unit,
      baseCalories: food.calories,
      baseProtein: food.protein,
      baseCarbs: food.carbs,
      baseFat: food.fat
    };

    setPreviewData(prev => {
      const meals = prev ? [...prev.meals] : [];
      if (meals.length > 0) {
        meals[0].items = [...meals[0].items, newItem];
        const totals = recalculateMealTotals(meals[0].items);
        meals[0].totalCalories = totals.calories;
        meals[0].totalProtein = totals.protein;
        meals[0].totalCarbs = totals.carbs;
        meals[0].totalFat = totals.fat;
      } else {
        meals.push({
          mealName: 'Nova Refeição',
          items: [newItem],
          totalCalories: newItem.calories,
          totalProtein: newItem.protein,
          totalCarbs: newItem.carbs,
          totalFat: newItem.fat
        });
      }
      return { meals };
    });
    
    setShowRegisterForm(false);
    if (!text) setText('Adicionado de alimentos registrados');
  };

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
                          onClick={() => addRegisteredFoodToMeal(food)}
                          className="p-2 text-muted-foreground hover:text-green-500 transition-colors"
                          title="Adicionar à refeição"
                        >
                          <Plus size={18} />
                        </button>
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
                    <div className="flex justify-between items-start border-b border-border/50 pb-4 gap-2">
                      <div className="min-w-0">
                        <h3 className="font-black text-foreground truncate">{meal.mealName}</h3>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                          P: {meal.totalProtein || 0}g • C: {meal.totalCarbs || 0}g • G: {meal.totalFat || 0}g
                        </p>
                      </div>
                      <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-3 py-1 rounded-full uppercase whitespace-nowrap">
                        {meal.totalCalories} kcal
                      </span>
                    </div>
                    <div className="space-y-4">
                      {meal.items.map((item, i) => (
                        <div key={i} className="flex flex-col gap-2 border-b border-border/20 last:border-0 pb-3 last:pb-0">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-foreground block truncate">{item.name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center bg-black/5 rounded-xl px-3 py-1.5 transition-all">
                                  <input 
                                    type="number"
                                    value={item.currentAmount || parseQuantity(item.quantity).amount || ''}
                                    onChange={(e) => updateMealItem(idx, i, parseFloat(e.target.value) || 0)}
                                    className="bg-transparent border-none outline-none p-0 text-sm text-foreground font-black w-14 focus:ring-0"
                                  />
                                  <span className="text-xs text-muted-foreground font-bold uppercase ml-1">
                                    {item.unit || parseQuantity(item.quantity).unit}
                                  </span>
                                </div>
                                <span className="text-xs text-red-500 font-bold">{item.calories} kcal</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => deleteMealItem(idx, i)}
                              className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="flex gap-4 px-1">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-muted-foreground font-black uppercase">Prot</span>
                              <span className="text-sm font-bold">{item.protein}g</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-muted-foreground font-black uppercase">Carbs</span>
                              <span className="text-sm font-bold">{item.carbs}g</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-muted-foreground font-black uppercase">Gord</span>
                              <span className="text-sm font-bold">{item.fat}g</span>
                            </div>
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

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleRepetir}
                    className="w-full border-2 border-muted hover:bg-muted font-black py-6 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Utensils size={16} />
                    REPETIR
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowRegisterForm(true)}
                    className="w-full border-2 border-muted hover:bg-muted font-black py-6 rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    CADASTRAR
                  </Button>
                </div>

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