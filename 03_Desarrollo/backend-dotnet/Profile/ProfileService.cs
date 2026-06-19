using System.Globalization;
using Lure.Api.Data;
using Lure.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lure.Api.Profile;

public class ProfileService : IProfileService
{
    private static readonly CultureInfo Es = new("es-ES");
    private const string CatAchievement = "achievement";
    private const string CatInterest = "interest";
    private const string CatSkill = "skill";

    private readonly LureDbContext _db;

    public ProfileService(LureDbContext db)
    {
        _db = db;
    }

    public async Task<ProfileDto?> GetProfileAsync(int userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user is null) return null;

        var followers = await _db.Followers.CountAsync(f => f.FollowingId == userId);
        var following = await _db.Followers.CountAsync(f => f.FollowerId == userId);
        var tweets = await _db.Tweets.CountAsync(t => t.UserId == userId);
        var replies = await _db.TweetComments.CountAsync(c => c.UserId == userId);
        var likes = await _db.TweetLikes.CountAsync(l => l.UserId == userId);

        var details = await _db.UserDetails.Where(d => d.UserId == userId).ToListAsync();
        List<string> ByCat(string cat) =>
            details.Where(d => d.Category == cat).Select(d => d.DetailText).ToList();

        return new ProfileDto(
            user.UserId,
            user.UserHandle,
            BuildName(user.FirstName, user.LastName, user.UserHandle),
            user.EmailAddress,
            user.Bio,
            user.Location,
            user.DateOfBirth?.ToString("d 'de' MMMM 'de' yyyy", Es),
            user.DateOfBirth?.ToString("yyyy-MM-dd"),
            user.AvatarUrl,
            followers,
            following,
            tweets,
            replies,
            likes,
            ByCat(CatAchievement),
            ByCat(CatInterest),
            ByCat(CatSkill));
    }

    public Task<bool> IsFollowingAsync(int viewerId, int targetId) =>
        _db.Followers.AnyAsync(f => f.FollowerId == viewerId && f.FollowingId == targetId);

    public async Task<List<FollowUserDto>> GetFollowersAsync(int ownerId, int viewerId)
    {
        var ids = _db.Followers.Where(f => f.FollowingId == ownerId).Select(f => f.FollowerId);
        return await UsersToDto(ids, viewerId);
    }

    public async Task<List<FollowUserDto>> GetFollowingAsync(int ownerId, int viewerId)
    {
        var ids = _db.Followers.Where(f => f.FollowerId == ownerId).Select(f => f.FollowingId);
        return await UsersToDto(ids, viewerId);
    }

    public async Task<ProfileDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user is null) return null;

        if (request.Name is not null)
        {
            user.FirstName = request.Name.Trim();
            user.LastName = string.Empty;
        }
        if (request.Bio is not null) user.Bio = request.Bio;
        if (request.Location is not null) user.Location = request.Location;
        if (request.Birthday is not null)
        {
            user.DateOfBirth = DateTime.TryParse(request.Birthday, CultureInfo.InvariantCulture,
                DateTimeStyles.None, out var d) ? d : null;
        }

        await ReplaceDetailsAsync(userId, CatAchievement, request.Logros);
        await ReplaceDetailsAsync(userId, CatInterest, request.Intereses);
        await ReplaceDetailsAsync(userId, CatSkill, request.Habilidades);

        await _db.SaveChangesAsync();
        return await GetProfileAsync(userId);
    }

    public async Task<ProfileDto?> SetAvatarUrlAsync(int userId, string url)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user is null) return null;
        user.AvatarUrl = url.Length > 255 ? url[..255] : url;
        await _db.SaveChangesAsync();
        return await GetProfileAsync(userId);
    }

    // Si la lista viene (no null), se reemplaza por completo esa categoría.
    private async Task ReplaceDetailsAsync(int userId, string category, List<string>? items)
    {
        if (items is null) return;

        var existing = await _db.UserDetails
            .Where(d => d.UserId == userId && d.Category == category)
            .ToListAsync();
        _db.UserDetails.RemoveRange(existing);

        foreach (var raw in items)
        {
            var text = (raw ?? string.Empty).Trim();
            if (text.Length == 0) continue;
            if (text.Length > 255) text = text[..255];
            _db.UserDetails.Add(new UserDetail { UserId = userId, Category = category, DetailText = text });
        }
    }

    private async Task<List<FollowUserDto>> UsersToDto(IQueryable<int> userIds, int me)
    {
        return await _db.Users
            .Where(u => userIds.Contains(u.UserId))
            .Select(u => new FollowUserDto(
                u.UserId,
                (u.FirstName + " " + u.LastName).Trim() == "" ? u.UserHandle : (u.FirstName + " " + u.LastName).Trim(),
                u.UserHandle,
                _db.Followers.Any(f => f.FollowerId == me && f.FollowingId == u.UserId)))
            .ToListAsync();
    }

    private static string BuildName(string firstName, string lastName, string handle)
    {
        var full = $"{firstName} {lastName}".Trim();
        return string.IsNullOrEmpty(full) ? handle : full;
    }
}
