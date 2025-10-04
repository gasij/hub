using ithubsec.DTOs;
using ithubsec.Models;

namespace ithubsec.Extensions
{
    public static class MappingExtensions
    {
        public static TicketDto ToTicketDto(this Ticket t)
        {
            return new TicketDto
            {
                Id = t.Id,
                AuthorId = t.AuthorId,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                Author = t.Author.ToUserDto()
            };
        }

        public static UserDto ToUserDto(this User u)
        {
            return new UserDto
            {
                Id = u.Id,
                Email = u.Email,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Patronymic = u.Patronymic,
                Role = u.Role,
                GroupName = u.GroupName,
                CreatedAt = u.CreatedAt
            };
        }

        public static UserSearchDto ToUserSearchDto(this User u)
        {
            return new UserSearchDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Patronymic = u.Patronymic,
                GroupName = u.GroupName
            };
        }
    }
}