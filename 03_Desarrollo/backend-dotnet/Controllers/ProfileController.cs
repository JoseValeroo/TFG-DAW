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
    private readonly IWebHostEnvironment _env;

    public ProfileController(IProfileService profile, IFeedService feed, IWebHostEnvironment env)
    {
        _profile = profile;
        _feed = feed;
        _env = env;
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
    public async Task<IActionResult> MyTweets() => await WithUser(id => _feed.GetUserTweetsAsync(id, id));

    [HttpGet("me/replies")]
    public async Task<IActionResult> MyReplies() => await WithUser(id => _feed.GetUserRepliesAsync(id));

    [HttpGet("me/likes")]
    public async Task<IActionResult> MyLikes() => await WithUser(id => _feed.GetUserLikesAsync(id, id));

    [HttpGet("me/followers")]
    public async Task<IActionResult> Followers() => await WithUser(id => _profile.GetFollowersAsync(id, id));

    [HttpGet("me/following")]
    public async Task<IActionResult> Following() => await WithUser(id => _profile.GetFollowingAsync(id, id));

    [HttpPatch("me")]
    public async Task<IActionResult> Update([FromBody] UpdateProfileRequest request)
    {
        var id = GetUserId();
        if (id is null) return Unauthorized();
        var updated = await _profile.UpdateProfileAsync(id.Value, request);
        return updated is null ? NotFound() : Ok(updated);
    }

    // Sube una foto de perfil: guarda el archivo en wwwroot/uploads/avatars
    // y persiste su URL en users.avatar_url.
    [HttpPost("me/avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        var id = GetUserId();
        if (id is null) return Unauthorized();
        if (file is null || file.Length == 0) return BadRequest(new { message = "Archivo vacío" });
        if (file.Length > 5 * 1024 * 1024) return BadRequest(new { message = "La imagen no puede superar 5 MB" });
        if (!(file.ContentType ?? string.Empty).StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "El archivo debe ser una imagen" });

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext) || ext.Length > 5) ext = ".png";

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var dir = Path.Combine(webRoot, "uploads", "avatars");
        Directory.CreateDirectory(dir);

        var fileName = $"{id}_{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(dir, fileName);
        await using (var stream = System.IO.File.Create(fullPath))
        {
            await file.CopyToAsync(stream);
        }

        var url = $"{Request.Scheme}://{Request.Host}/uploads/avatars/{fileName}";
        var profile = await _profile.SetAvatarUrlAsync(id.Value, url);
        return profile is null ? NotFound() : Ok(profile);
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
