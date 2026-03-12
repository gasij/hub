-- Добавление колонок для справок в таблицу Users (если миграция не применилась)
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "BirthDate" timestamp with time zone NULL;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "Course" character varying(10) NULL;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "Direction" character varying(200) NULL;
