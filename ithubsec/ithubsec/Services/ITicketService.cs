using ithubsec.DTOs;

namespace ithubsec.Services
{
    public interface ITicketService
    {
        Task<IEnumerable<TicketDto>> GetTicketsAsync(Guid userId, string userRole, string? statusFilter = null);
        Task<TicketDto?> GetTicketByIdAsync(Guid ticketId, Guid userId, string userRole);
        Task<TicketDto> CreateTicketAsync(CreateTicketRequest request, Guid userId);
        Task<TicketDto> UpdateTicketStatusAsync(Guid ticketId, UpdateTicketStatusRequest request);
    }
}
