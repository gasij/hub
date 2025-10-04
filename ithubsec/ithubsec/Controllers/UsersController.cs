using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ithubsec.DTOs;
using ithubsec.Services;

namespace ithubsec.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers(
            [FromQuery] int take = 50,
            [FromQuery] int skip = 0)
        {
            try
            {
                var users = await _userService.GetAllUsersAsync(take, skip);
                return Ok(users);
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

        [HttpGet("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<UserDto>> GetUser(Guid id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound();
                }
                return Ok(user);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<UserDto>> UpdateUser(Guid id, UpdateUserRequest request)
        {
            try
            {
                var user = await _userService.UpdateUserAsync(id, request);
                return Ok(user);
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

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> DeleteUser(Guid id)
        {
            try
            {
                var deleted = await _userService.DeleteUserAsync(id);
                if (!deleted)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPatch("{id}/role")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<UserDto>> ChangeUserRole(Guid id, ChangeUserRoleRequest request)
        {
            try
            {
                var user = await _userService.ChangeUserRoleAsync(id, request.Role);
                return Ok(user);
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

        [HttpGet("search")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<UserSearchDto>>> SearchUsers(
            [FromQuery] string searchTerm,
            [FromQuery] int take = 20,
            [FromQuery] int skip = 0)
        {
            try
            {
                var users = await _userService.SearchUsersAsync(searchTerm, take, skip);
                return Ok(users);
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

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request)
        {
            try
            {
                var user = await _userService.CreateUserAsync(request);
                return Ok(user);
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
    }
}
