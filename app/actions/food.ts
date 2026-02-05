'use server';

import { db } from "@/lib/db";
import { foodLogs, registeredFoods } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { getTodayRange } from "@/lib/utils";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Prioritized list of models based on testing
const MODELS_TO_TRY = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash"
];

export async function parseFood(rawText: string, history: { role: string, content: string }[] = []) {
  if (!genAI) {
    throw new Error("Gemini API key is not configured");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let registeredFoodsData = [];
  if (user) {
    registeredFoodsData = await db.select()
      .from(registeredFoods)
      .where(eq(registeredFoods.userId, user.id));
  }

  const referenceData = registeredFoodsData.map(f => 
    `- ${f.name}: Serving ${f.servingSize}, Kcal ${f.calories}, Carbs ${f.carbs}, Protein ${f.protein}, Fat ${f.fat}`
  ).join('\n');

  const prompt = `
    Analyze the following food consumption text and extract the meals, items, calories, and macros (protein, carbs, fat).
    Text: "${rawText}"
    
    Current History of this conversation:
    ${history.map(h => `${h.role}: ${h.content}`).join('\n')}

    Reference Data (Use these values if the food matches EXACTLY or CLOSELY, prioritizing these over general estimates):
    ${referenceData || "No registered foods found."}

    Rules for data normalization:
    1. Prettify and Normalize: Convert all names to "Title Case" (e.g., "lanche da tarde" -> "Lanche da Tarde").
    2. Canonical Names: Use standard food names and correct typos (e.g., "ababax" -> "Abacaxi", "frango grelhad" -> "Frango Grelhado").
    3. Language: Keep all names in Portuguese (PT-BR).

    Return the result as a JSON object with the following structure:
    {
      "meals": [
        {
          "mealName": "string",
          "items": [
            { "name": "string", "quantity": "string", "calories": number, "protein": number, "carbs": number, "fat": number }
          ],
          "totalCalories": number,
          "totalProtein": number,
          "totalCarbs": number,
          "totalFat": number
        }
      ]
    }
    
    The output must be ONLY the JSON object, no markdown, no explanation.
    Separate by meal if multiple are mentioned.
    Estimate calories and macros for each item based on typical values for the given portion, unless a matching reference is found.
    Ensure totalCalories/Protein/Carbs/Fat for the meal is the sum of its items.
  `;

  let lastError: any = null;

  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();
      
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not find JSON in AI response");
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED");
      
      if (isQuotaError) {
        console.warn(`Quota exceeded for ${modelName}, trying next model...`);
        continue; // Try next model
      }
      
      // If it's not a quota error, throw it immediately
      throw error;
    }
  }

  // If we exhausted all models
  if (lastError?.message?.includes("429") || lastError?.message?.includes("RESOURCE_EXHAUSTED")) {
    throw new Error("O limite de uso da IA foi atingido em todos os modelos disponíveis. Por favor, tente novamente mais tarde.");
  }
  
  throw lastError || new Error("Erro ao processar sua refeição.");
}

export async function saveFood(meals: any[], rawText: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    for (const meal of meals) {
      await db.insert(foodLogs).values({
        userId: user.id,
        mealName: meal.mealName,
        rawText: rawText,
        content: meal.items,
        totalCalories: Math.round(meal.totalCalories),
        totalProtein: Math.round(meal.totalProtein),
        totalCarbs: Math.round(meal.totalCarbs),
        totalFat: Math.round(meal.totalFat),
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/food");
    return { success: true };
  } catch (error: any) {
    console.error("Error in saveFood:", error);
    throw new Error("Erro ao salvar no banco de dados.");
  }
}

export async function getFoodLogs(date?: Date) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  let start: Date;
  let end: Date;

  if (date) {
    start = new Date(date);
    start.setHours(0, 0, 0, 0);
    end = new Date(date);
    end.setHours(23, 59, 59, 999);
  } else {
    const cookieStore = await cookies();
    const timezone = cookieStore.get('user-timezone')?.value || 'America/Sao_Paulo';
    const range = getTodayRange(timezone);
    start = range.start;
    end = range.end;
  }

  return await db.select()
    .from(foodLogs)
    .where(
        and(
            eq(foodLogs.userId, user.id),
            gte(foodLogs.date, start),
            lte(foodLogs.date, end)
        )
    )
    .orderBy(desc(foodLogs.date));
}

export async function deleteFoodLog(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  try {
    await db.delete(foodLogs).where(and(eq(foodLogs.id, id), eq(foodLogs.userId, user.id)));
    revalidatePath("/dashboard");
    revalidatePath("/food");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteFoodLog:", error);
    throw new Error("Erro ao excluir registro.");
  }
}

export async function deleteFoodItem(logId: string, itemIndex: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  try {
    const [log] = await db.select()
      .from(foodLogs)
      .where(and(eq(foodLogs.id, logId), eq(foodLogs.userId, user.id)))
      .limit(1);

    if (!log) throw new Error("Registro não encontrado.");

    const content = log.content as any[];
    if (content.length <= 1) {
      // If it's the last item, delete the whole log
      return await deleteFoodLog(logId);
    }

    const itemToDelete = content[itemIndex];
    const newContent = content.filter((_, i) => i !== itemIndex);

    // Recalculate totals
    const newTotalCalories = log.totalCalories - (itemToDelete.calories || 0);
    const newTotalProtein = (log.totalProtein || 0) - (itemToDelete.protein || 0);
    const newTotalCarbs = (log.totalCarbs || 0) - (itemToDelete.carbs || 0);
    const newTotalFat = (log.totalFat || 0) - (itemToDelete.fat || 0);

    await db.update(foodLogs)
      .set({
        content: newContent,
        totalCalories: Math.max(0, newTotalCalories),
        totalProtein: Math.max(0, newTotalProtein),
        totalCarbs: Math.max(0, newTotalCarbs),
        totalFat: Math.max(0, newTotalFat),
      })
      .where(eq(foodLogs.id, logId));

    revalidatePath("/dashboard");
    revalidatePath("/food");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteFoodItem:", error);
    throw new Error("Erro ao excluir item.");
  }
}

export async function getRecentFoodItems(limit: number = 40) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const logs = await db.select()
    .from(foodLogs)
    .where(eq(foodLogs.userId, user.id))
    .orderBy(desc(foodLogs.date))
    .limit(limit * 2);

  const uniqueItems: any[] = [];
  const seen = new Set();

  for (const log of logs) {
    const items = log.content as any[];
    for (const item of items) {
      // Create a unique key based on name and quantity to avoid exact duplicates
      const key = `${item.name}-${item.quantity}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueItems.push(item);
      }
      if (uniqueItems.length >= limit) break;
    }
    if (uniqueItems.length >= limit) break;
  }

  return uniqueItems;
}

export async function getRecentMeals(limit: number = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const logs = await db.select()
    .from(foodLogs)
    .where(eq(foodLogs.userId, user.id))
    .orderBy(desc(foodLogs.date))
    .limit(limit * 5); // Fetch more to filter duplicates in JS

  const uniqueMeals: any[] = [];
  const seen = new Set();

  for (const log of logs) {
    // Create a unique key based on meal name and items content
    const contentStr = JSON.stringify(log.content);
    const key = `${log.mealName}-${contentStr}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      uniqueMeals.push({
        id: log.id,
        mealName: log.mealName,
        items: log.content,
        totalCalories: log.totalCalories,
        totalProtein: log.totalProtein,
        totalCarbs: log.totalCarbs,
        totalFat: log.totalFat
      });
    }
    
    if (uniqueMeals.length >= limit) break;
  }

  return uniqueMeals;
}

export async function registerFood(formData: { 
  name: string; 
  servingSize: string; 
  calories: number; 
  protein?: number; 
  carbs?: number; 
  fat?: number; 
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  try {
    await db.insert(registeredFoods).values({
      userId: user.id,
      name: formData.name,
      servingSize: formData.servingSize,
      calories: Math.round(formData.calories),
      protein: formData.protein ? Math.round(formData.protein) : 0,
      carbs: formData.carbs ? Math.round(formData.carbs) : 0,
      fat: formData.fat ? Math.round(formData.fat) : 0,
    });

    revalidatePath("/log/food");
    return { success: true };
  } catch (error: any) {
    console.error("Error in registerFood:", error);
    throw new Error("Erro ao registrar alimento.");
  }
}

export async function getRegisteredFoods() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  return await db.select()
    .from(registeredFoods)
    .where(eq(registeredFoods.userId, user.id))
    .orderBy(desc(registeredFoods.createdAt));
}

export async function deleteRegisteredFood(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  try {
    await db.delete(registeredFoods).where(and(eq(registeredFoods.id, id), eq(registeredFoods.userId, user.id)));
    revalidatePath("/log/food");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteRegisteredFood:", error);
    throw new Error("Erro ao excluir alimento registrado.");
  }
}