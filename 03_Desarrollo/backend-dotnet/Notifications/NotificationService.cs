using Lure.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Lure.Api.Notifications;

public record NotificationDto(string Type, string Handle, string Text, DateTime? At);

public interface INotificationService
{
    Task<List<NotificationDto>> GetAsync(int userId);
}

public class NotificationService : INotificationService
{
    private readonly LureDbContext _db;

    public NotificationService(LureDbContext db)
    {
        _db = db;
    }

    // No hay tabla de notificaciones: se derivan de la actividad sobre el contenido del usuario.
    public async Task<List<NotificationDto>> GetAsync(int userId)
    {
        // Respuestas a mis tweets.
        var replies = await (
            from c in _db.TweetComments
            join t in _db.Tweets on c.TweetId equals t.TweetId
            join u in _db.Users on c.UserId equals u.UserId
            where t.UserId == userId && c.UserId != userId
            orderby c.CreatedAt descending
            select new NotificationDto("reply", u.UserHandle, "respondió a tu tweet", c.CreatedAt)
        ).Take(20).ToListAsync();

        // Me gusta a mis tweets.
        var likes = await (
            from l in _db.TweetLikes
            join t in _db.Tweets on l.TweetId equals t.TweetId
            join u in _db.Users on l.UserId equals u.UserId
            where t.UserId == userId && l.UserId != userId
            select new NotificationDto("like", u.UserHandle, "le dio me gusta a tu tweet", (DateTime?)null)
        ).Take(20).ToListAsync();

        // Nuevos seguidores.
        var follows = await (
            from f in _db.Followers
            join u in _db.Users on f.FollowerId equals u.UserId
            where f.FollowingId == userId
            select new NotificationDto("follow", u.UserHandle, "te empezó a seguir", (DateTime?)null)
        ).Take(20).ToListAsync();

        return replies
            .Concat(likes)
            .Concat(follows)
            .OrderByDescending(n => n.At ?? DateTime.MinValue)
            .ToList();
    }
}
