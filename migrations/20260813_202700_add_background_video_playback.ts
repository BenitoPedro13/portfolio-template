import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Hand-written for the same reason as 20260813_200358_fix_form_and_video_playback:
 * this project has only ever used Payload's dev "push" mode, so `migrate:create`
 * has no real snapshot to diff against. Adds the boomerang playback toggle for
 * the desktop/lock-screen background video (Site → Identity).
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_site_background_video_playback" AS ENUM('normal', 'boomerang');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    ALTER TABLE "site" ADD COLUMN IF NOT EXISTS "background_video_playback" "enum_site_background_video_playback" DEFAULT 'normal';
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site" DROP COLUMN IF EXISTS "background_video_playback";
    DROP TYPE IF EXISTS "public"."enum_site_background_video_playback";
  `)
}
