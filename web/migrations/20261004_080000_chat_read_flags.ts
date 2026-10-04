import { sql, type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "read_by_user" boolean DEFAULT false;
    ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "read_by_organization" boolean DEFAULT false;
    UPDATE "chat_messages" SET "read_by_user" = false WHERE "read_by_user" IS NULL;
    UPDATE "chat_messages" SET "read_by_organization" = false WHERE "read_by_organization" IS NULL;
    CREATE INDEX IF NOT EXISTS "chat_messages_read_by_user_idx" ON "chat_messages" ("read_by_user");
    CREATE INDEX IF NOT EXISTS "chat_messages_read_by_organization_idx" ON "chat_messages" ("read_by_organization");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "chat_messages_read_by_user_idx";
    DROP INDEX IF EXISTS "chat_messages_read_by_organization_idx";
    ALTER TABLE "chat_messages" DROP COLUMN IF EXISTS "read_by_user";
    ALTER TABLE "chat_messages" DROP COLUMN IF EXISTS "read_by_organization";
  `)
}
