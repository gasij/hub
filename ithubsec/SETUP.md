# Инструкция по настройке системы

## 1. Установка PostgreSQL

### Windows:
1. Скачайте PostgreSQL с официального сайта: https://www.postgresql.org/download/windows/
2. Установите PostgreSQL с настройками по умолчанию
3. Запомните пароль для пользователя postgres

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### macOS:
```bash
brew install postgresql
brew services start postgresql
```

## 2. Создание базы данных

1. Откройте командную строку PostgreSQL (psql) или используйте pgAdmin
2. Выполните следующие команды:

```sql
-- Создание базы данных
CREATE DATABASE student_tickets_system;

-- Создание пользователя (опционально)
CREATE USER tickets_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE student_tickets_system TO tickets_user;
```

## 3. Настройка строки подключения

Отредактируйте файл `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=student_tickets_system;Username=postgres;Password=your_password"
  }
}
```

Замените `your_password` на ваш пароль от PostgreSQL.

## 4. Запуск приложения

1. Откройте командную строку в папке проекта
2. Выполните команды:

```bash
# Восстановление пакетов
dotnet restore

# Сборка проекта
dotnet build

# Запуск приложения
dotnet run
```

3. Откройте браузер и перейдите по адресу: `https://localhost:7000/swagger`

## 5. Тестирование API

### Регистрация пользователя:
```bash
curl -X POST "https://localhost:7000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Иван",
    "lastName": "Петров",
    "patronymic": "Сергеевич",
    "role": "student",
    "groupName": "ИТ-21"
  }'
```

### Вход в систему:
```bash
curl -X POST "https://localhost:7000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.ru",
    "password": "admin123"
  }'
```

### Создание заявки (с JWT токеном):
```bash
curl -X POST "https://localhost:7000/api/tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Тестовая заявка",
    "description": "Описание тестовой заявки"
  }'
```

## 6. Тестовые данные

При первом запуске приложения автоматически создаются следующие тестовые пользователи:

### Администраторы:
- **Email**: `admin@university.ru`
- **Password**: `admin123`
- **Роль**: admin

- **Email**: `director@university.ru`
- **Password**: `director123`
- **Роль**: admin

### Студенты:
- **Email**: `student1@university.ru`
- **Password**: `student123`
- **Роль**: student
- **Группа**: ИТ-21

- **Email**: `student2@university.ru`
- **Password**: `student123`
- **Роль**: student
- **Группа**: ИТ-21

- **Email**: `student3@university.ru`
- **Password**: `student123`
- **Роль**: student
- **Группа**: ФИ-22

- **Email**: `student4@university.ru`
- **Password**: `student123`
- **Роль**: student
- **Группа**: ФИ-22

- **Email**: `ivanov.i@university.ru`
- **Password**: `student123`
- **Роль**: student
- **Группа**: МТ-23

## 7. Возможные проблемы

### Ошибка подключения к базе данных:
- Проверьте, что PostgreSQL запущен
- Убедитесь, что строка подключения правильная
- Проверьте, что база данных создана

### Ошибка SSL:
- Добавьте `TrustServerCertificate=true` в строку подключения
- Или отключите SSL в настройках PostgreSQL

### Порт уже используется:
- Измените порт в `launchSettings.json`
- Или остановите другое приложение, использующее тот же порт

## 8. Дополнительные настройки

### Изменение JWT настроек:
Отредактируйте секцию `JwtSettings` в `appsettings.json`:

```json
{
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "StudentTicketsSystem",
    "Audience": "StudentTicketsSystemUsers",
    "ExpiryMinutes": 60
  }
}
```

### Настройка CORS:
В `Program.cs` можно настроить CORS для конкретных доменов:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://yourdomain.com")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```
