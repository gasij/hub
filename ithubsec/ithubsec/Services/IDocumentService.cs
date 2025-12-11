using ithubsec.Models;

namespace ithubsec.Services
{
    public interface IDocumentService
    {
        Task<ithubsec.Models.Document> GenerateDocumentAsync(Ticket ticket, User user, string documentType);
    }
}

