using Lure.Api.Feed;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lure.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedController : ControllerBase
{
    private readonly IFeedService _feed;

    public FeedController(IFeedService feed)
    {
        _feed = feed;
    }

    // "Para ti" (público; si hay sesión incluye estado like/retweet/guardado).
    [HttpGet("tweets")]
    public async Task<IActionResult> ForYou() => Ok(await _feed.GetForYouAsync(GetUserId()));

    [Authorize]
    [HttpGet("following")]
    public async Task<IActionResult> Following()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        return Ok(await _feed.GetFollowingAsync(userId.Value));
    }

    [Authorize]
    [HttpPost("tweets")]
    public async Task<IActionResult> Create([FromBody] CreateTweetRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var tweet = await _feed.CreateAsync(userId.Value, request.Text);
        return tweet is null ? Unauthorized() : Ok(tweet);
    }

    // ---- Interacciones ----
    [Authorize]
    [HttpPost("tweets/{id:int}/like")]
    public Task<IActionResult> ToggleLike(int id) => WithUser(uid => _feed.ToggleLikeAsync(uid, id));

    [Authorize]
    [HttpPost("tweets/{id:int}/retweet")]
    public Task<IActionResult> ToggleRetweet(int id) => WithUser(uid => _feed.ToggleRetweetAsync(uid, id));

    [Authorize]
    [HttpPost("tweets/{id:int}/save")]
    public Task<IActionResult> ToggleSave(int id) => WithUser(uid => _feed.ToggleSaveAsync(uid, id));

    [Authorize]
    [HttpPost("users/{id:int}/follow")]
    public Task<IActionResult> ToggleFollow(int id) => WithUser(uid => _feed.ToggleFollowAsync(uid, id));

    [Authorize]
    [HttpGet("saved")]
    public Task<IActionResult> Saved() => WithUser(uid => _feed.GetSavedAsync(uid));

    // ---- Comentarios ----
    [HttpGet("tweets/{id:int}/comments")]
    public async Task<IActionResult> Comments(int id) => Ok(await _feed.GetCommentsAsync(id));

    [Authorize]
    [HttpPost("tweets/{id:int}/comments")]
    public async Task<IActionResult> AddComment(int id, [FromBody] CreateTweetRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var comment = await _feed.AddCommentAsync(userId.Value, id, request.Text);
        return comment is null ? NotFound() : Ok(comment);
    }

    // ---- Descubrir ----
    [HttpGet("suggestions")]
    public async Task<IActionResult> Suggestions() => Ok(await _feed.GetSuggestionsAsync(GetUserId()));

    [HttpGet("trends")]
    public async Task<IActionResult> Trends() => Ok(await _feed.GetTrendsAsync());

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q) => Ok(await _feed.SearchAsync(q, GetUserId()));

    private async Task<IActionResult> WithUser<T>(Func<int, Task<T>> action)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        return Ok(await action(userId.Value));
    }

    private int? GetUserId()
    {
        var uid = User.FindFirst("uid")?.Value;
        return int.TryParse(uid, out var id) ? id : null;
    }
}
