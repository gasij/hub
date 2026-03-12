using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ithubsec.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Patronymic { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "student";

        [MaxLength(50)]
        public string? GroupName { get; set; }

        /// <summary>Дата рождения для справок (дд.мм.гггг).</summary>
        public DateTime? BirthDate { get; set; }

        /// <summary>Курс обучения (например, 1, 2, 3).</summary>
        [MaxLength(10)]
        public string? Course { get; set; }

        /// <summary>Направление подготовки / специальность.</summary>
        [MaxLength(200)]
        public string? Direction { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Навигационные свойства
        public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}
