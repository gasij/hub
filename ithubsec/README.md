# Система управления заявками учащихся

Веб-приложение для управления заявками студентов с ролевой системой доступа.

## Функциональность

### Для студентов:
- Регистрация и вход в систему
- Создание заявок
- Просмотр своих заявок
- Отслеживание статуса заявок

### Для администраторов:
- Просмотр всех заявок в системе
- Изменение статуса заявок
- Поиск пользователей по имени/фамилии
- Фильтрация заявок по автору

## Технологии

- **Backend**: ASP.NET Core 8.0
- **База данных**: PostgreSQL
- **Аутентификация**: JWT токены
- **ORM**: Entity Framework Core
- **Документация API**: Swagger/OpenAPI

## Установка и запуск

### Предварительные требования

1. .NET 8.0 SDK
2. PostgreSQL 12+
3. Visual Studio 2022 или VS Code

### Настройка базы данных

1. Установите PostgreSQL
2. Создайте базу данных:
```sql
CREATE DATABASE student_tickets_system;
```

3. Обновите строку подключения в `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=student_tickets_system;Username=your_username;Password=your_password"
  }
}
```

### Запуск приложения

1. Восстановите пакеты NuGet:
```bash
dotnet restore
```

2. Запустите приложение:
```bash
dotnet run
```

3. Откройте браузер и перейдите по адресу: `https://localhost:7000/swagger`

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход в систему

### Заявки
- `GET /api/tickets` - Получить список заявок
- `POST /api/tickets` - Создать заявку
- `GET /api/tickets/{id}` - Получить детали заявки
- `PATCH /api/tickets/{id}/status` - Обновить статус заявки (только для админов)

### Пользователи
- `GET /api/users/search?searchTerm=Иван` - Поиск пользователей (только для админов)

## Тестовые данные

При первом запуске приложения автоматически создаются тестовые пользователи:

### Администраторы:
- Email: `admin@university.ru`, Password: `admin123`
- Email: `director@university.ru`, Password: `director123`

### Студенты:
- Email: `student1@university.ru`, Password: `student123`
- Email: `student2@university.ru`, Password: `student123`
- Email: `student3@university.ru`, Password: `student123`
- Email: `student4@university.ru`, Password: `student123`
- Email: `ivanov.i@university.ru`, Password: `student123`

## Структура проекта

```
ithubsec/
├── Controllers/          # API контроллеры
├── Data/                # Контекст базы данных и инициализация
├── DTOs/                # Модели для передачи данных
├── Models/              # Модели данных
├── Services/            # Бизнес-логика
└── Program.cs           # Точка входа приложения
```

## Безопасность

- Пароли хешируются с помощью BCrypt
- JWT токены для аутентификации
- Ролевая система доступа
- Валидация входных данных
- CORS настроен для разработки

## Разработка

Для разработки рекомендуется использовать Visual Studio 2022 или VS Code с расширением C#.

### Полезные команды

```bash
# Восстановление пакетов
dotnet restore

# Сборка проекта
dotnet build

# Запуск в режиме разработки
dotnet run

# Создание миграции EF Core
dotnet ef migrations add InitialCreate

# Применение миграций
dotnet ef database update
```
