-- Инициализация базы данных для системы управления заявками учащихся
-- Версия: 1.0
-- Дата: 2024

-- Создание базы данных (раскомментируйте если нужно)
-- CREATE DATABASE student_tickets_system;
-- \c student_tickets_system;

-- Создание расширения для UUID (если не установлено)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Удаление таблиц если существуют (для пересоздания)
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Таблица пользователей
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    patronymic VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'admin', 'teacher')),
    group_name VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заявок
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('new', 'in_progress', 'resolved', 'rejected', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Индексы для оптимизации
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_group ON users(group_name);
CREATE INDEX idx_users_name_search ON users(first_name, last_name, patronymic);

CREATE INDEX idx_tickets_author_id ON tickets(author_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);

-- Составной индекс для полнотекстового поиска по ФИО
CREATE INDEX idx_users_full_name_search ON users USING gin (
    to_tsvector('russian', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(patronymic, ''))
);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставка тестовых данных
-- Администраторы
INSERT INTO users (email, password_hash, first_name, last_name, patronymic, role, group_name) VALUES
('admin@university.ru', '$2a$11$rQZ8K7t2vB9mN3pL6sF8COxYzA1bC4dE7fG0hI2jK5mN8pQ1rS4uV7wX0yZ3', 'Алексей', 'Иванов', 'Петрович', 'admin', NULL),
('director@university.ru', '$2a$11$sRZ9L8u3wC0nO4qM7gG9DPyA2cD5eF8gH1iJ3kL6nO9qR2sT5vW8xY1zA4', 'Мария', 'Сидорова', 'Владимировна', 'admin', NULL);

-- Студенты
INSERT INTO users (email, password_hash, first_name, last_name, patronymic, role, group_name) VALUES
('student1@university.ru', '$2a$11$tSZ0M9v4xD1pP5rN8hH0EQzB3dE6fG9iI2jK4lM7oP0rS3tU6wX9yZ2aB5', 'Иван', 'Петров', 'Сергеевич', 'student', 'ИТ-21'),
('student2@university.ru', '$2a$11$uTA1N0w5yE2qQ6sO9iI1FR0C4eF7gH0jJ3kL5mN8pQ1sT4uV7xY0zA3bC6', 'Петр', 'Иванов', 'Александрович', 'student', 'ИТ-21'),
('student3@university.ru', '$2a$11$vUB2O1x6zF3rR7tP0jJ2GS1D5fG8hI1kK4lL6nO9qR2tU5vW8yZ1aB4cD7', 'Екатерина', 'Смирнова', 'Олеговна', 'student', 'ФИ-22'),
('student4@university.ru', '$2a$11$wVC3P2y7AG4sS8uQ1kK3HT2E6gH9iJ2lL5mO7pR0sU3vW6xZ2aB5cE8', 'Анна', 'Кузнецова', 'Ивановна', 'student', 'ФИ-22'),
('ivanov.i@university.ru', '$2a$11$xWD4Q3z8BH5tT9vR2lL4IU3F7hI0jK3mN6pO8qS1tV4wX7yA3bC6dF9', 'Иван', 'Иванов', 'Дмитриевич', 'student', 'МТ-23');

-- Тестовые заявки
INSERT INTO tickets (author_id, title, description, status) VALUES
((SELECT id FROM users WHERE email = 'student1@university.ru'), 
 'Проблема с доступом к библиотеке', 
 'Не могу зайти в электронную библиотеку с личного кабинета', 'new'),

((SELECT id FROM users WHERE email = 'student1@university.ru'), 
 'Запрос справки', 
 'Нужна справка о обучении для банка', 'in_progress'),

((SELECT id FROM users WHERE email = 'student2@university.ru'), 
 'Восстановление пропуска', 
 'Потерял студенческий пропуск, нужен дубликат', 'resolved'),

((SELECT id FROM users WHERE email = 'student3@university.ru'), 
 'Вопрос по расписанию', 
 'Уточнить время проведения консультаций по математике', 'new'),

((SELECT id FROM users WHERE email = 'ivanov.i@university.ru'), 
 'Заявка на общежитие', 
 'Прошу предоставить место в студенческом общежитии', 'new');

-- Создание пользователя для приложения (опционально)
-- CREATE USER tickets_app_user WITH PASSWORD 'secure_password_123';
-- GRANT ALL PRIVILEGES ON DATABASE student_tickets_system TO tickets_app_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tickets_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tickets_app_user;

-- Проверка данных
SELECT 'Пользователи:' as info;
SELECT id, email, first_name, last_name, patronymic, role, group_name FROM users ORDER BY role, last_name;

SELECT 'Заявки:' as info;
SELECT t.id, t.title, t.status, u.first_name, u.last_name, u.group_name 
FROM tickets t 
JOIN users u ON t.author_id = u.id 
ORDER BY t.created_at DESC;

-- Статистика
SELECT 
    'Статистика:' as info,
    (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_count,
    (SELECT COUNT(*) FROM users WHERE role = 'student') as student_count,
    (SELECT COUNT(*) FROM tickets) as total_tickets,
    (SELECT COUNT(*) FROM tickets WHERE status = 'new') as new_tickets,
    (SELECT COUNT(*) FROM tickets WHERE status = 'in_progress') as in_progress_tickets,
    (SELECT COUNT(*) FROM tickets WHERE status = 'resolved') as resolved_tickets;
