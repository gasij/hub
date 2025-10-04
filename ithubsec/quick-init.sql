-- Быстрая инициализация базы данных
-- Используйте этот файл для быстрого создания базы данных

-- Создание базы данных
CREATE DATABASE student_tickets_system;

-- Подключение к базе данных
\c student_tickets_system;

-- Включение расширения UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создание таблиц
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

-- Создание индексов
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_tickets_author_id ON tickets(author_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- Вставка тестовых данных
INSERT INTO users (email, password_hash, first_name, last_name, patronymic, role, group_name) VALUES
('admin@university.ru', '$2a$11$rQZ8K7t2vB9mN3pL6sF8COxYzA1bC4dE7fG0hI2jK5mN8pQ1rS4uV7wX0yZ3', 'Алексей', 'Иванов', 'Петрович', 'admin', NULL),
('student1@university.ru', '$2a$11$tSZ0M9v4xD1pP5rN8hH0EQzB3dE6fG9iI2jK4lM7oP0rS3tU6wX9yZ2aB5', 'Иван', 'Петров', 'Сергеевич', 'student', 'ИТ-21'),
('student2@university.ru', '$2a$11$uTA1N0w5yE2qQ6sO9iI1FR0C4eF7gH0jJ3kL5mN8pQ1sT4uV7xY0zA3bC6', 'Петр', 'Иванов', 'Александрович', 'student', 'ИТ-21');

INSERT INTO tickets (author_id, title, description, status) VALUES
((SELECT id FROM users WHERE email = 'student1@university.ru'), 
 'Проблема с доступом к библиотеке', 
 'Не могу зайти в электронную библиотеку', 'new'),
((SELECT id FROM users WHERE email = 'student2@university.ru'), 
 'Восстановление пропуска', 
 'Потерял студенческий пропуск', 'resolved');

-- Проверка
SELECT 'База данных создана успешно!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as ticket_count FROM tickets;
