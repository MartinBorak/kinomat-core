CREATE TABLE "city" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
-- Every cinema seeded so far is in Bratislava: the default fills those rows, then goes, so the seed must name a city.
INSERT INTO "city" ("id", "name") VALUES ('bratislava', 'Bratislava');--> statement-breakpoint
ALTER TABLE "cinema" ADD COLUMN "city_id" text NOT NULL DEFAULT 'bratislava';--> statement-breakpoint
ALTER TABLE "cinema" ALTER COLUMN "city_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "cinema" ADD CONSTRAINT "cinema_city_id_city_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."city"("id") ON DELETE no action ON UPDATE no action;