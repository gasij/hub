using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ithubsec.DTOs;
using ithubsec.Services;
using System.Security.Claims;

namespace ithubsec.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _ticketService;

        public TicketsController(ITicketService ticketService)
        {
            _ticketService = ticketService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TicketDto>>> GetTickets([FromQuery] string? status = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                var tickets = await _ticketService.GetTicketsAsync(userId, userRole, status);
                return Ok(tickets);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TicketDto>> GetTicket(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                var ticket = await _ticketService.GetTicketByIdAsync(id, userId, userRole);
                
                if (ticket == null)
                {
                    return NotFound();
                }

                return Ok(ticket);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPost]
        public async Task<ActionResult<TicketDto>> CreateTicket(CreateTicketRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var ticket = await _ticketService.CreateTicketAsync(request, userId);
                return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<TicketDto>> UpdateTicketStatus(Guid id, UpdateTicketStatusRequest request)
        {
            try
            {
                var ticket = await _ticketService.UpdateTicketStatusAsync(id, request);
                return Ok(ticket);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Внутренняя ошибка сервера" });
            }
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
