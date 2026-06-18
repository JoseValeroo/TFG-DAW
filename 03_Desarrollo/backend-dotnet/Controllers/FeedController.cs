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

    // "Para ti": tweets más recientes (público).
    [HttpGet("tweets")]
    public async Task<IActionResult> ForYou()
    {
        return Ok(await _feed.GetForYouAsync());
    }

    // "Siguiendo": tweets de las cuentas que sigue el usuario autenticado.
    [Authorize]
    [HttpGet("following")]
    public async Task<IActionResult> Following()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        return Ok(await _feed.GetFollowingAsync(userId.Value));
    }

    // Crear un tweet (requiere sesión).
    [Authorize]
    [HttpPost("tweets")]
    public async Task<IActionResult> Create([FromBody] CreateTweetRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        var tweet = await _feed.CreateAsync(userId.Value, request.Text);
        return tweet is null ? Unauthorized() : Ok(tweet);
    }

    // Dar/quitar me gusta a un tweet.
    [Authorize]
    [HttpPost("tweets/{id:int}/like")]
    public async Task<IActionResult> ToggleLike(int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();
        return Ok(await _feed.ToggleLikeAsync(userId.Value, id));
    }

    // "A quién seguir" (público; excluye al usuario si hay sesión).
    [HttpGet("suggestions")]
    public async Task<IActionResult> Suggestions()
    {
        return Ok(await _feed.GetSuggestionsAsync(GetUserId()));
    }

    // "Qué está pasando" (tendencias).
    [HttpGet("trends")]
    public async Task<IActionResult> Trends()
    {
        return Ok(await _feed.GetTrendsAsync());
    }

    private int? GetUserId()
    {
        var uid = User.FindFirst("uid")?.Value;
        return int.TryParse(uid, out var id) ? id : null;
    }
}
