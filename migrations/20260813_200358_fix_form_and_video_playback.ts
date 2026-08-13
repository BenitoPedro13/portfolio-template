import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Hand-written, not generated: this project has only ever used Payload's dev
 * "push" mode against the database, never `payload migrate`, so `migrate:create`
 * has no prior snapshot to diff against and produces a full from-scratch
 * schema (every table, including ones that already exist in production).
 *
 * Everything here is guarded (`IF NOT EXISTS` / duplicate_object trapped) so
 * it only creates what commits 20260813 through f10490c actually added — the
 * contact form's `site_form_reasons` table and related columns, and
 * `projects.video_playback` — and is safe to re-run.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_projects_video_playback" AS ENUM('normal', 'boomerang');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "video_playback" "enum_projects_video_playback" DEFAULT 'normal';

    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "form_enabled" boolean DEFAULT false;
    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "form_recipient" varchar;

    ALTER TABLE "site_locales" ADD COLUMN IF NOT EXISTS "form_heading" varchar DEFAULT 'Send a message';
    ALTER TABLE "site_locales" ADD COLUMN IF NOT EXISTS "form_intro" varchar;
    ALTER TABLE "site_locales" ADD COLUMN IF NOT EXISTS "form_success_message" varchar DEFAULT 'Thanks — message sent. I''ll get back to you soon.';

    CREATE TABLE IF NOT EXISTS "site_form_reasons" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "site_form_reasons_locales" (
      "label" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" varchar NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "site_form_reasons" ADD CONSTRAINT "site_form_reasons_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "site_form_reasons_locales" ADD CONSTRAINT "site_form_reasons_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."site_form_reasons"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE INDEX IF NOT EXISTS "site_form_reasons_order_idx" ON "site_form_reasons" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "site_form_reasons_parent_id_idx" ON "site_form_reasons" USING btree ("_parent_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "site_form_reasons_locales_locale_parent_id_unique" ON "site_form_reasons_locales" USING btree ("_locale","_parent_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "projects" DROP COLUMN IF EXISTS "video_playback";
    DROP TYPE IF EXISTS "public"."enum_projects_video_playback";

    ALTER TABLE "site" DROP COLUMN IF EXISTS "form_enabled";
    ALTER TABLE "site" DROP COLUMN IF EXISTS "form_recipient";

    ALTER TABLE "site_locales" DROP COLUMN IF EXISTS "form_heading";
    ALTER TABLE "site_locales" DROP COLUMN IF EXISTS "form_intro";
    ALTER TABLE "site_locales" DROP COLUMN IF EXISTS "form_success_message";

    DROP TABLE IF EXISTS "site_form_reasons_locales" CASCADE;
    DROP TABLE IF EXISTS "site_form_reasons" CASCADE;
  `)
}
