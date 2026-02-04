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

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type WeightMeasurement = typeof weightMeasurements.$inferSelect;
export type NewWeightMeasurement = typeof weightMeasurements.$inferInsert;