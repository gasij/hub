using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ithubsec.Data;
using ithubsec.DTOs;
using ithubsec.Models;
using ithubsec.Services;
using System.Security.Claims;

namespace ithubsec.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentService _documentService;

        public TicketsController(ApplicationDbContext context, IDocumentService documentService)
        {
            _context = context;
            _documentService = documentService;
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
                .Include(t => t.Messages)
                    .ThenInclude(m => m.Document)
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

            var messagesDto = ticket.Messages.OrderBy(m => m.CreatedAt).Select(m => new MessageDto
            {
                Id = m.Id,
                TicketId = m.TicketId,
                AuthorId = m.AuthorId,
                Content = m.Content,
                DocumentId = m.DocumentId,
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
            }).ToList();

            Console.WriteLine($"GetTicket: Загружено {messagesDto.Count} сообщений для заявки {id}");
            foreach (var msg in messagesDto)
            {
                Console.WriteLine($"  - Message {msg.Id}, DocumentId: {msg.DocumentId}, HasDocument: {msg.DocumentId.HasValue}, Content: {msg.Content.Substring(0, Math.Min(50, msg.Content.Length))}...");
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
                Messages = messagesDto
            };

            return Ok(ticketDto);
        }

        [HttpPost]
        public async Task<ActionResult<TicketDto>> CreateTicket(CreateTicketRequest request)
        {
            Console.WriteLine($"=== CreateTicket вызван ===");
            Console.WriteLine($"Request.DocumentType: {request.DocumentType}");
            Console.WriteLine($"Request.Title: {request.Title}");
            Console.WriteLine($"Request.Description: {request.Description}");
            
            var userId = GetCurrentUserId();
            Console.WriteLine($"UserId: {userId}");

            // Загружаем пользователя для создания документа
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                Console.WriteLine("❌ Пользователь не найден!");
                return Unauthorized();
            }
            Console.WriteLine($"Пользователь найден: {user.FirstName} {user.LastName}");

            var ticket = new Ticket
            {
                AuthorId = userId,
                Title = request.Title,
                Description = request.Description,
                Status = "new"
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            // Автоматически создаем документ для пользователя
            try
            {
                var documentType = request.DocumentType ?? "application";
                Console.WriteLine($"Начинаем создание документа. Тип: {documentType}, TicketId: {ticket.Id}, UserId: {user.Id}");
                
                var document = await _documentService.GenerateDocumentAsync(ticket, user, documentType);
                Console.WriteLine($"Документ сгенерирован. DocumentId: {document.Id}, FilePath: {document.FilePath}, FileSize: {document.FileSize}");
                
                _context.Documents.Add(document);
                await _context.SaveChangesAsync();
                Console.WriteLine($"Документ сохранен в БД. DocumentId: {document.Id}");

                // Создаем автоматическое сообщение с информацией о документе
                var documentTypeNames = new Dictionary<string, string>
                {
                    { "application", "Заявление" },
                    { "request", "Запрос" },
                    { "complaint", "Жалоба" },
                    { "petition", "Ходатайство" }
                };

                var documentTypeName = documentTypeNames.ContainsKey(documentType.ToLower()) 
                    ? documentTypeNames[documentType.ToLower()] 
                    : "Документ";

                var documentMessage = new Message
                {
                    TicketId = ticket.Id,
                    AuthorId = userId, // Сообщение от имени пользователя, создавшего заявку
                    DocumentId = document.Id, // Связываем сообщение с документом
                    Content = $"📄 Создан документ: {documentTypeName}\n\n" +
                             $"Тип документа: {documentTypeName}\n" +
                             $"Файл: {document.FileName}\n" +
                             $"Размер: {(document.FileSize / 1024.0):F2} КБ"
                };

                Console.WriteLine($"Создаем сообщение. TicketId: {documentMessage.TicketId}, AuthorId: {documentMessage.AuthorId}, DocumentId: {documentMessage.DocumentId}");
                
                _context.Messages.Add(documentMessage);
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"✅ Документ создан и сообщение отправлено. DocumentId: {document.Id}, MessageId: {documentMessage.Id}, Content: {documentMessage.Content.Substring(0, Math.Min(50, documentMessage.Content.Length))}...");
                
                // Проверяем, что сообщение действительно сохранено в БД
                var savedMessage = await _context.Messages.FindAsync(documentMessage.Id);
                if (savedMessage != null)
                {
                    Console.WriteLine($"✅ Сообщение подтверждено в БД. MessageId: {savedMessage.Id}, DocumentId: {savedMessage.DocumentId}, TicketId: {savedMessage.TicketId}");
                }
                else
                {
                    Console.WriteLine($"❌ ОШИБКА: Сообщение не найдено в БД после сохранения!");
                }
            }
            catch (Exception ex)
            {
                // Логируем ошибку, но не прерываем создание заявки
                Console.WriteLine($"❌ ОШИБКА при создании документа: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"InnerException: {ex.InnerException.Message}");
                    Console.WriteLine($"InnerException StackTrace: {ex.InnerException.StackTrace}");
                }
            }

            // Перезагружаем заявку с сообщениями из базы данных
            // Сначала проверяем, есть ли сообщения в БД напрямую
            var messagesCount = await _context.Messages.CountAsync(m => m.TicketId == ticket.Id);
            Console.WriteLine($"Прямой запрос к БД: найдено {messagesCount} сообщений для заявки {ticket.Id}");
            
            if (messagesCount > 0)
            {
                var directMessages = await _context.Messages
                    .Where(m => m.TicketId == ticket.Id)
                    .Include(m => m.Author)
                    .ToListAsync();
                Console.WriteLine($"Прямой запрос сообщений:");
                foreach (var msg in directMessages)
                {
                    Console.WriteLine($"  - Сообщение {msg.Id}, DocumentId: {msg.DocumentId}, AuthorId: {msg.AuthorId}, Content: {msg.Content.Substring(0, Math.Min(50, msg.Content.Length))}...");
                }
            }
            
            ticket = await _context.Tickets
                .Include(t => t.Author)
                .Include(t => t.Messages)
                    .ThenInclude(m => m.Author)
                .FirstOrDefaultAsync(t => t.Id == ticket.Id);

            Console.WriteLine($"Загружено сообщений через Include для заявки {ticket.Id}: {ticket?.Messages?.Count ?? 0}");
            if (ticket?.Messages != null && ticket.Messages.Count > 0)
            {
                foreach (var msg in ticket.Messages)
                {
                    Console.WriteLine($"  - Сообщение {msg.Id}, DocumentId: {msg.DocumentId}, AuthorId: {msg.AuthorId}, Content: {msg.Content.Substring(0, Math.Min(50, msg.Content.Length))}...");
                }
            }
            else
            {
                Console.WriteLine($"⚠️ ВНИМАНИЕ: Сообщения не загружены через Include, хотя в БД их {messagesCount}!");
            }

            var messagesList = ticket.Messages.OrderBy(m => m.CreatedAt).Select(m => new MessageDto
            {
                Id = m.Id,
                TicketId = m.TicketId,
                AuthorId = m.AuthorId,
                Content = m.Content,
                DocumentId = m.DocumentId,
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
            }).ToList();

            Console.WriteLine($"Создано MessageDto: {messagesList.Count}");
            foreach (var msgDto in messagesList)
            {
                Console.WriteLine($"  - MessageDto {msgDto.Id}, DocumentId: {msgDto.DocumentId}, HasDocument: {msgDto.DocumentId.HasValue}");
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
                Messages = messagesList
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
                DocumentId = message.DocumentId,
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
                DocumentId = m.DocumentId,
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
