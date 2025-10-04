using Microsoft.EntityFrameworkCore;
using ithubsec.Data;
using ithubsec.DTOs;
using ithubsec.Extensions;
using ithubsec.Models;

namespace ithubsec.Services
{
    public class TicketService : ITicketService
    {
        private readonly ApplicationDbContext _context;

        public TicketService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TicketDto>> GetTicketsAsync(Guid userId, string userRole, string? statusFilter = null)
        {
            IQueryable<Ticket> query = _context.Tickets.Include(t => t.Author);

            // Если пользователь не администратор, показываем только его заявки
            if (userRole != "admin")
            {
                query = query.Where(t => t.AuthorId == userId);
            }

            // Фильтрация по статусу
            if (!string.IsNullOrEmpty(statusFilter))
            {
                var validStatuses = new[] { "new", "in_progress", "resolved", "rejected", "closed" };
                if (validStatuses.Contains(statusFilter))
                {
                    query = query.Where(t => t.Status == statusFilter);
                }
                // Если statusFilter = "all", не применяем фильтр (показываем все)
            }
            else
            {
                // По умолчанию скрываем завершенные задачи для админов
                if (userRole == "admin")
                {
                    query = query.Where(t => t.Status != "closed" && t.Status != "resolved");
                }
            }

            var tickets = await query
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return tickets.Select(t => t.ToTicketDto());
        }

        public async Task<TicketDto?> GetTicketByIdAsync(Guid ticketId, Guid userId, string userRole)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Author)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
            {
                return null;
            }

            // Проверяем права доступа
            if (userRole != "admin" && ticket.AuthorId != userId)
            {
                throw new UnauthorizedAccessException("Нет доступа к данной заявке");
            }

            return ticket.ToTicketDto();
        }

        public async Task<TicketDto> CreateTicketAsync(CreateTicketRequest request, Guid userId)
        {
            var ticket = new Ticket
            {
                AuthorId = userId,
                Title = request.Title,
                Description = request.Description,
                Status = "new"
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            // Загружаем автора для ответа
            await _context.Entry(ticket)
                .Reference(t => t.Author)
                .LoadAsync();

            return ticket.ToTicketDto();
        }

        public async Task<TicketDto> UpdateTicketStatusAsync(Guid ticketId, UpdateTicketStatusRequest request)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Author)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
            {
                throw new InvalidOperationException("Заявка не найдена");
            }

            // Валидация статуса
            var validStatuses = new[] { "new", "in_progress", "resolved", "rejected", "closed" };
            if (!validStatuses.Contains(request.Status))
            {
                throw new ArgumentException("Недопустимый статус заявки");
            }

            ticket.Status = request.Status;
            ticket.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return ticket.ToTicketDto();
        }
    }
}
