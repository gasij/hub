-- Исправление размера поля ContentType в таблице Documents
-- Проблема: значение "application/vnd.openxmlformats-officedocument.wordprocessingml.document" (60 символов) 
-- не помещается в character varying(50)

ALTER TABLE "Documents" 
ALTER COLUMN "ContentType" TYPE character varying(100);

