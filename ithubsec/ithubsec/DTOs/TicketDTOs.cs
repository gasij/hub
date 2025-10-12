using System.ComponentModel.DataAnnotations;

namespace ithubsec.DTOs
{
    public class CreateTicketRequest
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateTicketStatusRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }

    public class TicketDto
    {
        public Guid Id { get; set; }
        public Guid AuthorId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public UserDto Author { get; set; } = null!;
        public List<MessageDto> Messages { get; set; } = new List<MessageDto>();
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
        [StringLength(50, MinimumLength = 2)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string LastName { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Patronymic { get; set; }

        [Required]
        public string Role { get; set; } = "student";

        [StringLength(20)]
        public string? GroupName { get; set; }
    }

    public class CreateUserRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string LastName { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Patronymic { get; set; }

        [Required]
        public string Role { get; set; } = "student";

        [StringLength(20)]
        public string? GroupName { get; set; }
    }

    public class CreateMessageRequest
    {
        [Required]
        public Guid TicketId { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
    }

    public class MessageDto
    {
        public Guid Id { get; set; }
        public Guid TicketId { get; set; }
        public Guid AuthorId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public UserDto Author { get; set; } = null!;
    }

}
