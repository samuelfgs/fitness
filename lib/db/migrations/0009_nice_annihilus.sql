CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"age" integer,
	"height" integer,
	"desired_weight" integer,
	"kcal_goal" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
