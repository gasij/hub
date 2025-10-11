using Microsoft.EntityFrameworkCore;
using ithubsec.Models;

namespace ithubsec.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Ticket> Tickets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Настройка индексов для оптимизации поиска
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Role);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.GroupName);

            // Составной индекс для поиска по ФИО
            modelBuilder.Entity<User>()
                .HasIndex(u => new { u.FirstName, u.LastName, u.Patronymic })
                .HasDatabaseName("IX_Users_Name_Search");

            modelBuilder.Entity<Ticket>()
                .HasIndex(t => t.AuthorId);

            modelBuilder.Entity<Ticket>()
                .HasIndex(t => t.Status);

            modelBuilder.Entity<Ticket>()
                .HasIndex(t => t.CreatedAt);

            // Настройка связей
            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.Author)
                .WithMany(u => u.Tickets)
                .HasForeignKey(t => t.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);

            // Настройка ограничений
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<Ticket>()
                .Property(t => t.Status)
                .HasConversion<string>();

            // Настройка автоматического обновления UpdatedAt
            modelBuilder.Entity<User>()
                .Property(u => u.UpdatedAt)
                .ValueGeneratedOnUpdate();

            modelBuilder.Entity<Ticket>()
                .Property(t => t.UpdatedAt)
                .ValueGeneratedOnUpdate();
        }
    }
}
