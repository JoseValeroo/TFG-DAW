using System.Globalization;
using Lure.Api.Data;
using Lure.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lure.Api.Profile;

public class ProfileService : IProfileService
{
    private static readonly CultureInfo Es = new("es-ES");
    private readonly LureDbContext _db;

    public ProfileService(LureDbContext db)
    {
        _db = db;
    }

    public async Task<ProfileDto?> GetProfileAsync(int userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user is null) return null;

        // Seguidores = quienes me siguen; Seguidos = a quienes sigo.
        var followers = await _db.Followers.CountAsync(f => f.FollowingId == userId);
        var following = await _db.Followers.CountAsync(f => f.FollowerId == userId);
        var tweets = await _db.Tweets.CountAsync(t => t.UserId == userId);
        var replies = await _db.TweetComments.CountAsync(c => c.UserId == userId);
        var likes = await _db.TweetLikes.CountAsync(l => l.UserId == userId);

        return Map(user, followers, following, tweets, replies, likes);
    }

    public async Task<List<FollowUserDto>> GetFollowersAsync(int userId)
    {
        var ids = _db.Followers.Where(f => f.FollowingId == userId).Select(f => f.FollowerId);
        return await UsersToDto(ids);
    }

    public async Task<List<FollowUserDto>> GetFollowingAsync(int userId)
    {
        var ids = _db.Followers.Where(f => f.FollowerId == userId).Select(f => f.FollowingId);
        return await UsersToDto(ids);
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

        await _db.SaveChangesAsync();
        return await GetProfileAsync(userId);
    }

    private async Task<List<FollowUserDto>> UsersToDto(IQueryable<int> userIds)
    {
        return await _db.Users
            .Where(u => userIds.Contains(u.UserId))
            .Select(u => new FollowUserDto(u.UserId, BuildNameSql(u), u.UserHandle))
            .ToListAsync();
    }

    private static ProfileDto Map(User u, int followers, int following, int tweets, int replies, int likes) => new(
        u.UserId,
        u.UserHandle,
        BuildName(u.FirstName, u.LastName, u.UserHandle),
        u.EmailAddress,
        u.Bio,
        u.Location,
        u.DateOfBirth?.ToString("d 'de' MMMM 'de' yyyy", Es),
        u.AvatarUrl,
        followers,
        following,
        tweets,
        replies,
        likes);

    // Para usar dentro de una proyección SQL (sin Trim/condicionales complejos).
    private static string BuildNameSql(User u) =>
        (u.FirstName + " " + u.LastName).Trim() == "" ? u.UserHandle : (u.FirstName + " " + u.LastName).Trim();

    private static string BuildName(string firstName, string lastName, string handle)
    {
        var full = $"{firstName} {lastName}".Trim();
        return string.IsNullOrEmpty(full) ? handle : full;
    }
}
