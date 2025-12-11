-- Безопасное применение миграции AddDocumentIdToMessage
-- Проверяет существование столбца перед добавлением

DO $$
BEGIN
    -- Проверяем, существует ли столбец DocumentId
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Messages' 
        AND column_name = 'DocumentId'
    ) THEN
        -- Добавляем столбец DocumentId
        ALTER TABLE "Messages" ADD COLUMN "DocumentId" uuid NULL;
        
        RAISE NOTICE 'Столбец DocumentId добавлен в таблицу Messages';
    ELSE
        RAISE NOTICE 'Столбец DocumentId уже существует';
    END IF;

    -- Создаем индекс, если его нет
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'Messages' 
        AND indexname = 'IX_Messages_DocumentId'
    ) THEN
        CREATE INDEX "IX_Messages_DocumentId" ON "Messages" ("DocumentId");
        RAISE NOTICE 'Индекс IX_Messages_DocumentId создан';
    ELSE
        RAISE NOTICE 'Индекс IX_Messages_DocumentId уже существует';
    END IF;

    -- Добавляем внешний ключ, если его нет
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'FK_Messages_Documents_DocumentId'
    ) THEN
        ALTER TABLE "Messages" 
        ADD CONSTRAINT "FK_Messages_Documents_DocumentId" 
        FOREIGN KEY ("DocumentId") 
        REFERENCES "Documents" ("Id") 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Внешний ключ FK_Messages_Documents_DocumentId добавлен';
    ELSE
        RAISE NOTICE 'Внешний ключ FK_Messages_Documents_DocumentId уже существует';
    END IF;

    -- Обновляем историю миграций
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20251211113950_AddDocumentIdToMessage', '8.0.0')
    ON CONFLICT ("MigrationId") DO NOTHING;
    
    RAISE NOTICE 'Миграция применена успешно!';
END $$;

