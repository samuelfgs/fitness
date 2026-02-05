import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(), // e.g., 'tennis', 'running'
  icon: varchar("icon", { length: 50 }), // Lucide icon name
  color: varchar("color", { length: 100 }), // Tailwind color class
  fields: jsonb("fields"), // Schema for custom form fields
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const workouts = pgTable(
  "workouts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    activityId: uuid("activity_id").references(() => activities.id),
    duration: integer("duration"), // in minutes
    calories: integer("calories"),
    startedAt: timestamp("started_at"),
    details: jsonb("details"), // For custom fields like { type: "aula" | "jogo" }
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_workouts_user_id").on(table.userId),
    activityIdIdx: index("idx_workouts_activity_id").on(table.activityId),
  })
);

export const exercises = pgTable(
  "exercises",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workoutId: uuid("workout_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    sets: integer("sets"),
    reps: integer("reps"),
    weight: integer("weight"), // in grams or whatever unit
    notes: text("notes"),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    workoutIdIdx: index("idx_exercises_workout_id").on(table.workoutId),
  })
);

export const weightMeasurements = pgTable(
  "weight_measurements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    weight: integer("weight"), // stored in grams
    date: timestamp("date").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_weight_measurements_user_id").on(table.userId),
  })
);

export const waterLogs = pgTable(
  "water_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    amount: integer("amount").notNull(), // stored in ml
    date: timestamp("date").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_water_logs_user_id").on(table.userId),
  })
);

export const stepsLogs = pgTable(
  "steps_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    count: integer("count").notNull(),
    date: timestamp("date").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_steps_logs_user_id").on(table.userId),
  })
);

export const foodLogs = pgTable(
  "food_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    mealName: varchar("meal_name", { length: 255 }).notNull(),
    rawText: text("raw_text"),
    content: jsonb("content").notNull(), // Detailed items
    totalCalories: integer("total_calories").notNull(),
    totalProtein: integer("total_protein"),
    totalCarbs: integer("total_carbs"),
    totalFat: integer("total_fat"),
    date: timestamp("date").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_food_logs_user_id").on(table.userId),
  })
);

export const registeredFoods = pgTable(
  "registered_foods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    servingSize: varchar("serving_size", { length: 255 }), // e.g., "100g", "1 cup"
    calories: integer("calories").notNull(),
    protein: integer("protein"),
    carbs: integer("carbs"),
    fat: integer("fat"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_registered_foods_user_id").on(table.userId),
  })
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(), // Match auth.users id
    age: integer("age"),
    height: integer("height"), // in cm
    desiredWeight: integer("desired_weight"), // in grams
    kcalGoal: integer("kcal_goal"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }
);

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type WeightMeasurement = typeof weightMeasurements.$inferSelect;
export type NewWeightMeasurement = typeof weightMeasurements.$inferInsert;
export type WaterLog = typeof waterLogs.$inferSelect;
export type NewWaterLog = typeof waterLogs.$inferInsert;
export type StepsLog = typeof stepsLogs.$inferSelect;
export type NewStepsLog = typeof stepsLogs.$inferInsert;
export type FoodLog = typeof foodLogs.$inferSelect;
export type NewFoodLog = typeof foodLogs.$inferInsert;
export type RegisteredFood = typeof registeredFoods.$inferSelect;
export type NewRegisteredFood = typeof registeredFoods.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;