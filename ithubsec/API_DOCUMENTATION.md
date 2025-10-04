# API Документация - Система управления заявками учащихся

## Базовый URL
```
https://localhost:7000/api
```

## Аутентификация

API использует JWT токены для аутентификации. Получите токен через эндпоинты `/api/auth/register` или `/api/auth/login`, затем включите его в заголовок `Authorization: Bearer <token>`.

## Эндпоинты

### 1. Аутентификация

#### POST /api/auth/register
Регистрация нового пользователя.

**Запрос:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Иван",
  "lastName": "Петров",
  "patronymic": "Сергеевич",
  "role": "student",
  "groupName": "ИТ-21"
}
```

**Ответ:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "Иван",
    "lastName": "Петров",
    "patronymic": "Сергеевич",
    "role": "student",
    "groupName": "ИТ-21",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /api/auth/login
Вход в систему.

**Запрос:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:** Аналогичен ответу регистрации.

### 2. Заявки

#### GET /api/tickets
Получить список заявок.

**Права доступа:** Все авторизованные пользователи
- Студенты видят только свои заявки
- Администраторы видят все заявки

**Заголовки:**
```
Authorization: Bearer <token>
```

**Ответ:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "authorId": "123e4567-e89b-12d3-a456-426614174001",
    "title": "Проблема с доступом к библиотеке",
    "description": "Не могу зайти в электронную библиотеку",
    "status": "new",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "author": {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "email": "student@example.com",
      "firstName": "Иван",
      "lastName": "Петров",
      "patronymic": "Сергеевич",
      "role": "student",
      "groupName": "ИТ-21",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
]
```

#### POST /api/tickets
Создать новую заявку.

**Права доступа:** Все авторизованные пользователи

**Запрос:**
```json
{
  "title": "Проблема с доступом к Wi-Fi",
  "description": "Не могу подключиться к университетской сети Wi-Fi"
}
```

**Ответ:** Аналогичен элементу массива в GET /api/tickets

#### GET /api/tickets/{id}
Получить детали конкретной заявки.

**Права доступа:** 
- Владелец заявки
- Администраторы

**Ответ:** Аналогичен элементу массива в GET /api/tickets

#### PATCH /api/tickets/{id}/status
Обновить статус заявки.

**Права доступа:** Только администраторы

**Запрос:**
```json
{
  "status": "in_progress"
}
```

**Возможные статусы:**
- `new` - новая заявка
- `in_progress` - в работе
- `resolved` - решена
- `rejected` - отклонена
- `closed` - закрыта

**Ответ:** Аналогичен элементу массива в GET /api/tickets

### 3. Пользователи

#### GET /api/users/search
Поиск пользователей по имени, фамилии или отчеству.

**Права доступа:** Только администраторы

**Параметры запроса:**
- `searchTerm` (string, обязательный) - поисковый запрос

**Пример запроса:**
```
GET /api/users/search?searchTerm=Иван
```

**Ответ:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "firstName": "Иван",
    "lastName": "Петров",
    "patronymic": "Сергеевич",
    "groupName": "ИТ-21"
  },
  {
    "id": "123e4567-e89b-12d3-a456-426614174002",
    "firstName": "Иван",
    "lastName": "Иванов",
    "patronymic": "Дмитриевич",
    "groupName": "МТ-23"
  }
]
```

## Коды ответов

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Ресурс создан |
| 400 | Неверный запрос |
| 401 | Не авторизован |
| 403 | Доступ запрещен |
| 404 | Ресурс не найден |
| 500 | Внутренняя ошибка сервера |

## Ошибки

### Формат ошибки
```json
{
  "message": "Описание ошибки"
}
```

### Примеры ошибок

#### 400 - Неверный запрос
```json
{
  "message": "Пользователь с таким email уже существует"
}
```

#### 401 - Не авторизован
```json
{
  "message": "Неверный email или пароль"
}
```

#### 403 - Доступ запрещен
```json
{
  "message": "Доступ запрещен"
}
```

#### 404 - Ресурс не найден
```json
{
  "message": "Заявка не найдена"
}
```

## Примеры использования

### 1. Полный цикл работы студента

```bash
# 1. Регистрация
curl -X POST "https://localhost:7000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "firstName": "Иван",
    "lastName": "Петров",
    "patronymic": "Сергеевич",
    "role": "student",
    "groupName": "ИТ-21"
  }'

# 2. Вход (если уже зарегистрирован)
curl -X POST "https://localhost:7000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'

# 3. Создание заявки (используйте токен из предыдущего ответа)
curl -X POST "https://localhost:7000/api/tickets" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Проблема с доступом к Wi-Fi",
    "description": "Не могу подключиться к университетской сети Wi-Fi в аудитории 101"
  }'

# 4. Просмотр своих заявок
curl -X GET "https://localhost:7000/api/tickets" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Работа администратора

```bash
# 1. Вход как администратор
curl -X POST "https://localhost:7000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.ru",
    "password": "admin123"
  }'

# 2. Просмотр всех заявок
curl -X GET "https://localhost:7000/api/tickets" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Поиск пользователей
curl -X GET "https://localhost:7000/api/users/search?searchTerm=Иван" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Изменение статуса заявки
curl -X PATCH "https://localhost:7000/api/tickets/TICKET_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "in_progress"
  }'
```

## Тестирование с помощью Swagger

1. Запустите приложение
2. Откройте https://localhost:7000/swagger
3. Нажмите "Authorize" и введите JWT токен
4. Тестируйте API прямо в браузере

## Ограничения

- Максимальная длина поискового запроса: 100 символов
- Максимальное количество результатов поиска: 20
- Время жизни JWT токена: 60 минут (настраивается)
- Максимальная длина заголовка заявки: 200 символов
- Максимальная длина описания заявки: 10000 символов
