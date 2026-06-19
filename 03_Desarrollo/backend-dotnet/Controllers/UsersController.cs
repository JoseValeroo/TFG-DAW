using Lure.Api.Feed;
using Lure.Api.Profile;
using Microsoft.AspNetCore.Mvc;

namespace Lure.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IProfileService _profile;
    private readonly IFeedService _feed;

    public UsersController(IProfileService profile, IFeedService feed)
    {
        _profile = profile;
        _feed = feed;
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var profile = await _profile.GetProfileAsync(id);
        if (profile is null) return NotFound();

        var me = GetUserId();
        var followedByMe = me is not null && me != id && await _profile.IsFollowingAsync(me.Value, id);
        return Ok(new { profile, followedByMe, isMe = me == id });
    }

    [HttpGet("{id:int}/tweets")]
    public async Task<IActionResult> Tweets(int id) => Ok(await _feed.GetUserTweetsAsync(id, GetUserId()));

    [HttpGet("{id:int}/replies")]
    public async Task<IActionResult> Replies(int id) => Ok(await _feed.GetUserRepliesAsync(id));

    [HttpGet("{id:int}/likes")]
    public async Task<IActionResult> Likes(int id) => Ok(await _feed.GetUserLikesAsync(id, GetUserId()));

    [HttpGet("{id:int}/followers")]
    public async Task<IActionResult> Followers(int id) => Ok(await _profile.GetFollowersAsync(id, GetUserId() ?? id));

    [HttpGet("{id:int}/following")]
    public async Task<IActionResult> Following(int id) => Ok(await _profile.GetFollowingAsync(id, GetUserId() ?? id));

    private int? GetUserId()
    {
        var uid = User.FindFirst("uid")?.Value;
        return int.TryParse(uid, out var id) ? id : null;
    }
}
