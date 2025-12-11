using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ithubsec.Data;
using System.Security.Claims;

namespace ithubsec.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DocumentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("ticket/{ticketId}")]
        public async Task<ActionResult> GetDocumentByTicket(Guid ticketId)
        {
            var userId = GetCurrentUserId();
            var userRole = GetCurrentUserRole();

            // Проверяем существование заявки
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
            {
                return NotFound(new { message = "Заявка не найдена" });
            }

            // Проверяем права доступа
            if (userRole != "admin" && ticket.AuthorId != userId)
            {
                return Forbid();
            }

            // Ищем документ для этой заявки
            var document = await _context.Documents
                .FirstOrDefaultAsync(d => d.TicketId == ticketId);

            if (document == null)
            {
                return NotFound(new { message = "Документ не найден" });
            }

            // Проверяем существование файла
            if (!System.IO.File.Exists(document.FilePath))
            {
                return NotFound(new { message = "Файл документа не найден на сервере" });
            }

            // Читаем файл и возвращаем его
            var fileBytes = await System.IO.File.ReadAllBytesAsync(document.FilePath);
            return File(fileBytes, document.ContentType, document.FileName);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetDocument(Guid id)
        {
            var userId = GetCurrentUserId();
            var userRole = GetCurrentUserRole();

            var document = await _context.Documents
                .Include(d => d.Ticket)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (document == null)
            {
                return NotFound(new { message = "Документ не найден" });
            }

            // Проверяем права доступа
            if (userRole != "admin" && document.UserId != userId)
            {
                return Forbid();
            }

            // Проверяем существование файла
            if (!System.IO.File.Exists(document.FilePath))
            {
                return NotFound(new { message = "Файл документа не найден на сервере" });
            }

            // Читаем файл и возвращаем его
            var fileBytes = await System.IO.File.ReadAllBytesAsync(document.FilePath);
            return File(fileBytes, document.ContentType, document.FileName);
        }

        [HttpGet("user/{userId}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserDocuments(Guid userId)
        {
            var documents = await _context.Documents
                .Include(d => d.Ticket)
                .Where(d => d.UserId == userId)
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new
                {
                    d.Id,
                    d.DocumentType,
                    d.FileName,
                    d.FileSize,
                    d.CreatedAt,
                    TicketId = d.Ticket.Id,
                    TicketTitle = d.Ticket.Title
                })
                .ToListAsync();

            return Ok(documents);
        }

        [HttpGet("my-documents")]
        public async Task<ActionResult<IEnumerable<object>>> GetMyDocuments()
        {
            var userId = GetCurrentUserId();

            var documents = await _context.Documents
                .Include(d => d.Ticket)
                .Where(d => d.UserId == userId)
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new
                {
                    d.Id,
                    d.DocumentType,
                    d.FileName,
                    d.FileSize,
                    d.CreatedAt,
                    TicketId = d.Ticket.Id,
                    TicketTitle = d.Ticket.Title
                })
                .ToListAsync();

            return Ok(documents);
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

