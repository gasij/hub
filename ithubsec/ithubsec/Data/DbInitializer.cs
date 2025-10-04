using ithubsec.Models;

namespace ithubsec.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // Проверяем, есть ли уже данные в базе
            if (context.Users.Any())
            {
                return; // База данных уже инициализирована
            }

            // Создаем тестовых пользователей
            var users = new List<User>
            {
                new User
                {
                    Email = "admin@university.ru",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    FirstName = "Алексей",
                    LastName = "Иванов",
                    Patronymic = "Петрович",
                    Role = "admin",
                    GroupName = null
                },
                new User
                {
                    Email = "director@university.ru",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("director123"),
                    FirstName = "Мария",
                    LastName = "Сидорова",
                    Patronymic = "Владимировна",
                    Role = "admin",
                    GroupName = null
                },
                new User
                {
                    Email = "student1@university.ru",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                    FirstName = "Иван",
                    LastName = "Петров",
                    Patronymic = "Сергеевич",
                    Role = "student",
                    GroupName = "ИТ-21"
                },
                new User
                {
                    Email = "student2@university.ru",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                    FirstName = "Петр",
                    LastName = "Иванов",
                    Patronymic = "Александрович",
                    Role = "student",
                    GroupName = "ИТ-21"
                },
                new User
                {
                    Email = "student3@university.ru",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                    FirstName = "Екатерина",
                    LastName = "Смирнова",
                    Patronymic = "Олеговна",
                    Role = "student",
                    GroupName = "ФИ-22"
                },
                new User
                {
                    Email = "student4@university.ru",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                    FirstName = "Анна",
                    LastName = "Кузнецова",
                    Patronymic = "Ивановна",
                    Role = "student",
                    GroupName = "ФИ-22"
                },
                new User
                {
                    Email = "ivanov.i@university.ru",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                    FirstName = "Иван",
                    LastName = "Иванов",
                    Patronymic = "Дмитриевич",
                    Role = "student",
                    GroupName = "МТ-23"
                }
            };

            context.Users.AddRange(users);
            context.SaveChanges();

            // Создаем тестовые заявки
            var tickets = new List<Ticket>
            {
                new Ticket
                {
                    AuthorId = users[2].Id, // student1@university.ru
                    Title = "Проблема с доступом к библиотеке",
                    Description = "Не могу зайти в электронную библиотеку с личного кабинета",
                    Status = "new"
                },
                new Ticket
                {
                    AuthorId = users[2].Id, // student1@university.ru
                    Title = "Запрос справки",
                    Description = "Нужна справка о обучении для банка",
                    Status = "in_progress"
                },
                new Ticket
                {
                    AuthorId = users[3].Id, // student2@university.ru
                    Title = "Восстановление пропуска",
                    Description = "Потерял студенческий пропуск, нужен дубликат",
                    Status = "resolved"
                },
                new Ticket
                {
                    AuthorId = users[4].Id, // student3@university.ru
                    Title = "Вопрос по расписанию",
                    Description = "Уточнить время проведения консультаций по математике",
                    Status = "new"
                },
                new Ticket
                {
                    AuthorId = users[6].Id, // ivanov.i@university.ru
                    Title = "Заявка на общежитие",
                    Description = "Прошу предоставить место в студенческом общежитии",
                    Status = "new"
                }
            };

            context.Tickets.AddRange(tickets);
            context.SaveChanges();
        }
    }
}
