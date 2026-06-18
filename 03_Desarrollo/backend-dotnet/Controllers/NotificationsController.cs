using Lure.Api.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lure.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notifications;

    public NotificationsController(INotificationService notifications)
    {
        _notifications = notifications;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var uid = User.FindFirst("uid")?.Value;
        if (!int.TryParse(uid, out var id)) return Unauthorized();
        return Ok(await _notifications.GetAsync(id));
    }
}
