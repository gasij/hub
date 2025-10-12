using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ithubsec.Models
{
    public class Message
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid TicketId { get; set; }

        [Required]
        public Guid AuthorId { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Навигационные свойства
        [ForeignKey("TicketId")]
        public virtual Ticket Ticket { get; set; } = null!;

        [ForeignKey("AuthorId")]
        public virtual User Author { get; set; } = null!;
    }
}
