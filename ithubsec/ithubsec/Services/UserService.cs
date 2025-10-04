using Microsoft.EntityFrameworkCore;
using ithubsec.Data;
using ithubsec.DTOs;
using ithubsec.Extensions;
using ithubsec.Models;

namespace ithubsec.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserSearchDto>> SearchUsersAsync(string searchTerm, int take = 20, int skip = 0)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                throw new ArgumentException("Поисковый запрос не может быть пустым", nameof(searchTerm));
            }

            if (skip < 0 || take < 0 || take > 100)
            {
                throw new ArgumentException("Невалидные skip / take", nameof(take));
            }

            var searchTermLower = searchTerm.ToLower();

            var users = await _context.Users
                .Where(u => 
                    u.FirstName.ToLower().Contains(searchTermLower) ||
                    u.LastName.ToLower().Contains(searchTermLower) ||
                    (u.Patronymic != null && u.Patronymic.ToLower().Contains(searchTermLower)))
                .OrderBy(u => u.LastName)
                .ThenBy(u => u.FirstName)
                .Skip(skip)
                .Take(take)
                .Select(u => u.ToUserSearchDto())
                .ToListAsync();

            return users;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync(int take = 50, int skip = 0)
        {
            if (skip < 0 || take < 0 || take > 100)
            {
                throw new ArgumentException("Невалидные skip / take", nameof(take));
            }

            var users = await _context.Users
                .OrderBy(u => u.LastName)
                .ThenBy(u => u.FirstName)
                .Skip(skip)
                .Take(take)
                .Select(u => u.ToUserDto())
                .ToListAsync();

            return users;
        }

        public async Task<UserDto?> GetUserByIdAsync(Guid userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user?.ToUserDto();
        }

        public async Task<UserDto> UpdateUserAsync(Guid userId, UpdateUserRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("Пользователь не найден");
            }

            // Валидация роли
            var validRoles = new[] { "student", "admin" };
            if (!validRoles.Contains(request.Role))
            {
                throw new ArgumentException("Недопустимая роль пользователя");
            }

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Patronymic = request.Patronymic;
            user.GroupName = request.GroupName;
            user.Role = request.Role;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return user.ToUserDto();
        }

        public async Task<bool> DeleteUserAsync(Guid userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return false;
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<UserDto> ChangeUserRoleAsync(Guid userId, string newRole)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new InvalidOperationException("Пользователь не найден");
            }

            // Валидация роли
            var validRoles = new[] { "student", "admin" };
            if (!validRoles.Contains(newRole))
            {
                throw new ArgumentException("Недопустимая роль пользователя");
            }

            user.Role = newRole;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return user.ToUserDto();
        }

        public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
        {
            // Проверяем, существует ли пользователь с таким email
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null) throw new ArgumentException("Пользователь с таким email уже существует");

            // Валидация роли
            var validRoles = new[] { "student", "admin" };
            if (!validRoles.Contains(request.Role)) throw new ArgumentException("Недопустимая роль пользователя");

            // Хешируем пароль
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Создаем нового пользователя
            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                PasswordHash = passwordHash,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Patronymic = request.Patronymic,
                GroupName = request.GroupName,
                Role = request.Role,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return newUser.ToUserDto();
        }
    }
}
