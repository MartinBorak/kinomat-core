ALTER TABLE "film_override" ADD COLUMN "alias" text;--> statement-breakpoint
ALTER TABLE "film" ADD COLUMN "alias" text;--> statement-breakpoint
CREATE UNIQUE INDEX "film_alias_key" ON "film" USING btree ("alias");