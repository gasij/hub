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
    }

}
