-- Проверка состояния миграций и таблиц

-- Проверяем, какие миграции применены
SELECT "MigrationId", "ProductVersion" 
FROM "__EFMigrationsHistory" 
ORDER BY "MigrationId";

-- Проверяем, существует ли таблица Documents
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'Documents'
        ) 
        THEN 'Таблица Documents существует' 
        ELSE 'Таблица Documents НЕ существует' 
    END AS documents_table_status;

-- Проверяем, существует ли столбец DocumentId в Messages
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'Messages' 
            AND column_name = 'DocumentId'
        ) 
        THEN 'Столбец DocumentId существует' 
        ELSE 'Столбец DocumentId НЕ существует' 
    END AS documentid_column_status;

-- Проверяем структуру таблицы Messages
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'Messages'
ORDER BY ordinal_position;

