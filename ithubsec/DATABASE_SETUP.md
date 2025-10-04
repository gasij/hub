# Настройка базы данных

## Варианты инициализации

### 1. Автоматическая инициализация (рекомендуется)
Приложение автоматически создает базу данных и таблицы при первом запуске. Просто запустите:
```bash
dotnet run
```

### 2. Ручная инициализация через SQL файлы

#### Полная инициализация (init.sql)
Используйте для полной настройки с тестовыми данными:

```bash
# Подключение к PostgreSQL
psql -U postgres

# Выполнение SQL скрипта
\i init.sql
```

#### Быстрая инициализация (quick-init.sql)
Для быстрого создания минимальной базы данных:

```bash
psql -U postgres -f quick-init.sql
```

## Структура SQL файлов

### init.sql
- ✅ Создание всех таблиц с полными индексами
- ✅ Триггеры для автоматического обновления updated_at
- ✅ Полный набор тестовых данных
- ✅ Статистика и проверка данных
- ✅ Оптимизированные индексы для поиска

### quick-init.sql
- ✅ Базовые таблицы
- ✅ Основные индексы
- ✅ Минимальный набор тестовых данных
- ✅ Быстрое выполнение

## Тестовые данные

### Администраторы
- **admin@university.ru** / **admin123**
- **director@university.ru** / **director123**

### Студенты
- **student1@university.ru** / **student123** (группа ИТ-21)
- **student2@university.ru** / **student123** (группа ИТ-21)
- **student3@university.ru** / **student123** (группа ФИ-22)
- **student4@university.ru** / **student123** (группа ФИ-22)
- **ivanov.i@university.ru** / **student123** (группа МТ-23)

## Пароли

Все тестовые пароли хешированы с помощью BCrypt. Для входа используйте:
- **admin123** для администраторов
- **student123** для студентов

## Проверка установки

После выполнения SQL скрипта проверьте:

```sql
-- Проверка пользователей
SELECT email, first_name, last_name, role, group_name FROM users;

-- Проверка заявок
SELECT t.title, t.status, u.first_name, u.last_name 
FROM tickets t 
JOIN users u ON t.author_id = u.id;

-- Статистика
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as students
FROM users;
```

## Устранение проблем

### Ошибка "database does not exist"
```sql
CREATE DATABASE student_tickets_system;
\c student_tickets_system;
```

### Ошибка "extension uuid-ossp does not exist"
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Ошибка прав доступа
```sql
GRANT ALL PRIVILEGES ON DATABASE student_tickets_system TO your_username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
```

### Пересоздание базы данных
```sql
DROP DATABASE IF EXISTS student_tickets_system;
CREATE DATABASE student_tickets_system;
\c student_tickets_system;
-- Затем выполните init.sql
```

## Настройка подключения

Обновите строку подключения в `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=student_tickets_system;Username=postgres;Password=your_password"
  }
}
```

## Резервное копирование

### Создание резервной копии
```bash
pg_dump -U postgres student_tickets_system > backup.sql
```

### Восстановление из резервной копии
```bash
psql -U postgres -d student_tickets_system < backup.sql
```
