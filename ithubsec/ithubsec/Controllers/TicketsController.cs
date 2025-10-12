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
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TicketsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets([FromQuery] string? status = null)
        {
            var userId = GetCurrentUserId();
            var userRole = GetCurrentUserRole();

            IQueryable<Ticket> query = _context.Tickets.Include(t => t.Author);

            // Если пользователь не администратор, показываем только его заявки
            if (userRole != "admin")
            {
                query = query.Where(t => t.AuthorId == userId);
            }

            // Фильтрация по статусу, если указан
            if (!string.IsNullOrEmpty(status) && status != "all")
            {
                query = query.Where(t => t.Status == status);
            }

            var tickets = await query
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            var ticketDtos = tickets.Select(t => new TicketDto
            {
                Id = t.Id,
                AuthorId = t.AuthorId,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                Author = new UserDto
                {
                    Id = t.Author.Id,
                    Email = t.Author.Email,
                    FirstName = t.Author.FirstName,
                    LastName = t.Author.LastName,
                    Patronymic = t.Author.Patronymic,
                    Role = t.Author.Role,
                    GroupName = t.Author.GroupName,
                    CreatedAt = t.Author.CreatedAt
                }
            });

            return Ok(ticketDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TicketDto>> GetTicket(Guid id)
        {
            var userId = GetCurrentUserId();
            var userRole = GetCurrentUserRole();

            var ticket = await _context.Tickets
                .Include(t => t.Author)
                .Include(t => t.Messages)
                    .ThenInclude(m => m.Author)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound();
            }

            // Проверяем права доступа
            if (userRole != "admin" && ticket.AuthorId != userId)
            {
                return Forbid();
            }

            var ticketDto = new TicketDto
            {
                Id = ticket.Id,
                AuthorId = ticket.AuthorId,
                Title = ticket.Title,
                Description = ticket.Description,
                Status = ticket.Status,
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
                Author = new UserDto
                {
                    Id = ticket.Author.Id,
                    Email = ticket.Author.Email,
                    FirstName = ticket.Author.FirstName,
                    LastName = ticket.Author.LastName,
                    Patronymic = ticket.Author.Patronymic,
                    Role = ticket.Author.Role,
                    GroupName = ticket.Author.GroupName,
                    CreatedAt = ticket.Author.CreatedAt
                },
                Messages = ticket.Messages.OrderBy(m => m.CreatedAt).Select(m => new MessageDto
                {
                    Id = m.Id,
                    TicketId = m.TicketId,
                    AuthorId = m.AuthorId,
                    Content = m.Content,
                    CreatedAt = m.CreatedAt,
                    Author = new UserDto
                    {
                        Id = m.Author.Id,
                        Email = m.Author.Email,
                        FirstName = m.Author.FirstName,
                        LastName = m.Author.LastName,
                        Patronymic = m.Author.Patronymic,
                        Role = m.Author.Role,
                        GroupName = m.Author.GroupName,
                        CreatedAt = m.Author.CreatedAt
                    }
                }).ToList()
            };

            return Ok(ticketDto);
        }

        [HttpPost]
        public async Task<ActionResult<TicketDto>> CreateTicket(CreateTicketRequest request)
        {
            var userId = GetCurrentUserId();

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

            var ticketDto = new TicketDto
            {
                Id = ticket.Id,
                AuthorId = ticket.AuthorId,
                Title = ticket.Title,
                Description = ticket.Description,
                Status = ticket.Status,
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
                Author = new UserDto
                {
                    Id = ticket.Author.Id,
                    Email = ticket.Author.Email,
                    FirstName = ticket.Author.FirstName,
                    LastName = ticket.Author.LastName,
                    Patronymic = ticket.Author.Patronymic,
                    Role = ticket.Author.Role,
                    GroupName = ticket.Author.GroupName,
                    CreatedAt = ticket.Author.CreatedAt
                }
            };

            return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticketDto);
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<TicketDto>> UpdateTicketStatus(Guid id, UpdateTicketStatusRequest request)
        {
            var ticket = await _context.Tickets
                .Include(t => t.Author)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound();
            }

            // Валидация статуса
            var validStatuses = new[] { "new", "in_progress", "resolved", "rejected", "closed" };
            if (!validStatuses.Contains(request.Status))
            {
                return BadRequest(new { message = "Недопустимый статус заявки" });
            }

            ticket.Status = request.Status;
            ticket.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var ticketDto = new TicketDto
            {
                Id = ticket.Id,
                AuthorId = ticket.AuthorId,
                Title = ticket.Title,
                Description = ticket.Description,
                Status = ticket.Status,
                CreatedAt = ticket.CreatedAt,
                UpdatedAt = ticket.UpdatedAt,
                Author = new UserDto
                {
                    Id = ticket.Author.Id,
                    Email = ticket.Author.Email,
                    FirstName = ticket.Author.FirstName,
                    LastName = ticket.Author.LastName,
                    Patronymic = ticket.Author.Patronymic,
                    Role = ticket.Author.Role,
                    GroupName = ticket.Author.GroupName,
                    CreatedAt = ticket.Author.CreatedAt
                }
            };

            return Ok(ticketDto);
        }

        [HttpPost("{id}/messages")]
        public async Task<ActionResult<MessageDto>> AddMessage(Guid id, CreateMessageRequest request)
        {
            var userId = GetCurrentUserId();
            var userRole = GetCurrentUserRole();

            // Проверяем существование заявки
            var ticket = await _context.Tickets
                .Include(t => t.Author)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound();
            }

            // Проверяем права доступа
            if (userRole != "admin" && ticket.AuthorId != userId)
            {
                return Forbid();
            }

            var message = new Message
            {
                TicketId = id,
                AuthorId = userId,
                Content = request.Content
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Загружаем автора для ответа
            await _context.Entry(message)
                .Reference(m => m.Author)
                .LoadAsync();

            var messageDto = new MessageDto
            {
                Id = message.Id,
                TicketId = message.TicketId,
                AuthorId = message.AuthorId,
                Content = message.Content,
                CreatedAt = message.CreatedAt,
                Author = new UserDto
                {
                    Id = message.Author.Id,
                    Email = message.Author.Email,
                    FirstName = message.Author.FirstName,
                    LastName = message.Author.LastName,
                    Patronymic = message.Author.Patronymic,
                    Role = message.Author.Role,
                    GroupName = message.Author.GroupName,
                    CreatedAt = message.Author.CreatedAt
                }
            };

            return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, messageDto);
        }

        [HttpGet("{id}/messages")]
        public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessages(Guid id)
        {
            var userId = GetCurrentUserId();
            var userRole = GetCurrentUserRole();

            // Проверяем существование заявки
            var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == id);

            if (ticket == null)
            {
                return NotFound();
            }

            // Проверяем права доступа
            if (userRole != "admin" && ticket.AuthorId != userId)
            {
                return Forbid();
            }

            var messages = await _context.Messages
                .Include(m => m.Author)
                .Where(m => m.TicketId == id)
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            var messageDtos = messages.Select(m => new MessageDto
            {
                Id = m.Id,
                TicketId = m.TicketId,
                AuthorId = m.AuthorId,
                Content = m.Content,
                CreatedAt = m.CreatedAt,
                Author = new UserDto
                {
                    Id = m.Author.Id,
                    Email = m.Author.Email,
                    FirstName = m.Author.FirstName,
                    LastName = m.Author.LastName,
                    Patronymic = m.Author.Patronymic,
                    Role = m.Author.Role,
                    GroupName = m.Author.GroupName,
                    CreatedAt = m.Author.CreatedAt
                }
            });

            return Ok(messageDtos);
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return Guid.Parse(userIdClaim?.Value ?? throw new UnauthorizedAccessException());
        }

        private string GetCurrentUserRole()
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role);
            return roleClaim?.Value ?? throw new UnauthorizedAccessException();
        }
    }
}
