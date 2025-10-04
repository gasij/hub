using System.ComponentModel.DataAnnotations;

namespace ithubsec.DTOs
{
    public class RegisterRequest
    {
        [Required] 
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        public string? Patronymic { get; set; }

        public string Role { get; set; } = "student";

        public string? GroupName { get; set; }
    }

    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }

    public class UserDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Patronymic { get; set; }
        public string Role { get; set; } = string.Empty;
        public string? GroupName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UserSearchDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Patronymic { get; set; }
        public string? GroupName { get; set; }
    }

    public class UpdateUserRequest
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Patronymic { get; set; }

        [MaxLength(50)]
        public string? GroupName { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = string.Empty;
    }

    public class ChangeUserRoleRequest
    {
        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = string.Empty;
    }

    public class CreateUserRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        [MaxLength(100)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Patronymic { get; set; }

        [MaxLength(50)]
        public string? GroupName { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "student";
    }
}
