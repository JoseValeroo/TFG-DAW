using Lure.Api.Communities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lure.Api.Controllers;

[ApiController]
[Route("api/communities")]
public class CommunitiesController : ControllerBase
{
    private readonly ICommunityService _communities;

    public CommunitiesController(ICommunityService communities)
    {
        _communities = communities;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _communities.GetAllAsync(GetUserId()));
    }

    [Authorize]
    [HttpPost("{id:int}/membership")]
    public async Task<IActionResult> ToggleMembership(int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var joined = await _communities.ToggleMembershipAsync(userId.Value, id);
        return Ok(new { joined });
    }

    private int? GetUserId()
    {
        var uid = User.FindFirst("uid")?.Value;
        return int.TryParse(uid, out var id) ? id : null;
    }
}
