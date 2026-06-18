using Lure.Api.Feed;
using Lure.Api.Profile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lure.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profile;
    private readonly IFeedService _feed;

    public ProfileController(IProfileService profile, IFeedService feed)
    {
        _profile = profile;
        _feed = feed;
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var id = GetUserId();
        if (id is null) return Unauthorized();
        var profile = await _profile.GetProfileAsync(id.Value);
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpGet("me/tweets")]
    public async Task<IActionResult> MyTweets() => await WithUser(id => _feed.GetUserTweetsAsync(id));

    [HttpGet("me/replies")]
    public async Task<IActionResult> MyReplies() => await WithUser(id => _feed.GetUserRepliesAsync(id));

    [HttpGet("me/likes")]
    public async Task<IActionResult> MyLikes() => await WithUser(id => _feed.GetUserLikesAsync(id));

    [HttpGet("me/followers")]
    public async Task<IActionResult> Followers() => await WithUser(id => _profile.GetFollowersAsync(id));

    [HttpGet("me/following")]
    public async Task<IActionResult> Following() => await WithUser(id => _profile.GetFollowingAsync(id));

    [HttpPatch("me")]
    public async Task<IActionResult> Update([FromBody] UpdateProfileRequest request)
    {
        var id = GetUserId();
        if (id is null) return Unauthorized();
        var updated = await _profile.UpdateProfileAsync(id.Value, request);
        return updated is null ? NotFound() : Ok(updated);
    }

    private async Task<IActionResult> WithUser<T>(Func<int, Task<T>> action)
    {
        var id = GetUserId();
        if (id is null) return Unauthorized();
        return Ok(await action(id.Value));
    }

    private int? GetUserId()
    {
        var uid = User.FindFirst("uid")?.Value;
        return int.TryParse(uid, out var id) ? id : null;
    }
}
