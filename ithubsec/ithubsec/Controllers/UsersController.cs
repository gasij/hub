using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ithubsec.Data;
using ithubsec.DTOs;
using ithubsec.Models;
using System.Security.Claims;

namespace ithubsec.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Patronymic = u.Patronymic,
                    Role = u.Role,
                    GroupName = u.GroupName,
                    CreatedAt = u.CreatedAt
                })
                .OrderBy(u => u.LastName)
                .ThenBy(u => u.FirstName)
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("search")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<UserSearchDto>>> SearchUsers([FromQuery] string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return BadRequest(new { message = "Поисковый запрос не может быть пустым" });
            }

            var searchTermLower = searchTerm.ToLower();

            var users = await _context.Users
                .Where(u => 
                    u.FirstName.ToLower().Contains(searchTermLower) ||
                    u.LastName.ToLower().Contains(searchTermLower) ||
                    (u.Patronymic != null && u.Patronymic.ToLower().Contains(searchTermLower)))
                .Select(u => new UserSearchDto
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Patronymic = u.Patronymic,
                    GroupName = u.GroupName
                })
                .OrderBy(u => u.LastName)
                .ThenBy(u => u.FirstName)
                .Take(20) // Ограничиваем количество результатов
                .ToListAsync();

            return Ok(users);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<UserDto>> UpdateUser(Guid id, UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Обновляем только разрешенные поля
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Patronymic = request.Patronymic;
            user.Role = request.Role;
            user.GroupName = request.GroupName;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Patronymic = user.Patronymic,
                Role = user.Role,
                GroupName = user.GroupName,
                CreatedAt = user.CreatedAt
            };

            return Ok(userDto);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Проверяем, что не удаляем последнего админа
            var adminCount = await _context.Users.CountAsync(u => u.Role == "admin");
            if (user.Role == "admin" && adminCount <= 1)
            {
                return BadRequest(new { message = "Нельзя удалить последнего администратора" });
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserRequest request)
        {
            // Проверяем, что email уникален
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Пользователь с таким email уже существует" });
            }

            // Хешируем пароль
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Patronymic = request.Patronymic,
                Role = request.Role,
                GroupName = request.GroupName,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Patronymic = user.Patronymic,
                Role = user.Role,
                GroupName = user.GroupName,
                CreatedAt = user.CreatedAt
            };

            return CreatedAtAction(nameof(GetAllUsers), new { id = user.Id }, userDto);
        }


        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim);
        }
    }
}
