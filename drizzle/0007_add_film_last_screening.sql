ALTER TABLE "film" ADD COLUMN "last_screening_at" timestamp with time zone;--> statement-breakpoint
-- Every film in the table is playing when this runs, so its latest screening is the date to start from.
UPDATE "film" SET "last_screening_at" = "latest"."starts_at"
FROM (
	SELECT "programme_film"."film_id", max("screening"."starts_at") AS "starts_at"
	FROM "programme_film"
	INNER JOIN "screening" ON "screening"."programme_id" = "programme_film"."programme_id"
	GROUP BY "programme_film"."film_id"
) AS "latest"
WHERE "film"."id" = "latest"."film_id";
