using ithubsec.DTOs;

namespace ithubsec.Services
{
    public interface IUserService
    {
        Task<IEnumerable<UserSearchDto>> SearchUsersAsync(string searchTerm, int take = 20, int skip = 0);
        Task<IEnumerable<UserDto>> GetAllUsersAsync(int take = 50, int skip = 0);
        Task<UserDto?> GetUserByIdAsync(Guid userId);
        Task<UserDto> UpdateUserAsync(Guid userId, UpdateUserRequest request);
        Task<bool> DeleteUserAsync(Guid userId);
        Task<UserDto> ChangeUserRoleAsync(Guid userId, string newRole);
        Task<UserDto> CreateUserAsync(CreateUserRequest request);
    }
}
