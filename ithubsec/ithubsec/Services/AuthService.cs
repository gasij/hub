using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ithubsec.Data;
using ithubsec.DTOs;
using ithubsec.Extensions;
using ithubsec.Models;

namespace ithubsec.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // Проверяем, существует ли пользователь с таким email
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                throw new InvalidOperationException("Пользователь с таким email уже существует");
            }

            // Хешируем пароль
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Создаем пользователя
            var user = new User
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Patronymic = request.Patronymic,
                Role = "student", // Принудительно устанавливаем роль "student" для всех новых пользователей
                GroupName = request.GroupName
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Генерируем JWT токен
            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Token = token,
                User = user.ToUserDto()
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            // Находим пользователя по email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                throw new InvalidOperationException("Неверный email или пароль");
            }

            // Проверяем пароль
            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new InvalidOperationException("Неверный email или пароль");
            }

            // Генерируем JWT токен
            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                Token = token,
                User = user.ToUserDto()
            };
        }

        public string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];
            var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "60");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName),
                new Claim("patronymic", user.Patronymic ?? ""),
                new Claim("groupName", user.GroupName ?? "")
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
