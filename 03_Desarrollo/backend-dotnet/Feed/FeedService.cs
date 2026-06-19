using System.Text.Json;
using Lure.Api.Data;
using Lure.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lure.Api.Feed;

public class FeedService : IFeedService
{
    private readonly LureDbContext _db;

    public FeedService(LureDbContext db)
    {
        _db = db;
    }

    // ---------------- Feeds ----------------
    public async Task<List<TweetDto>> GetForYouAsync(int? me, int take = 30)
    {
        var rows = await BaseQuery(me).OrderByDescending(t => t.CreatedAt).Take(take).ToListAsync();
        return rows.Select(ToDto).ToList();
    }

    public async Task<List<TweetDto>> GetFollowingAsync(int userId, int take = 30)
    {
        var followingIds = _db.Followers.Where(f => f.FollowerId == userId).Select(f => f.FollowingId);
        var rows = await BaseQuery(userId)
            .Where(t => followingIds.Contains(t.UserId))
            .OrderByDescending(t => t.CreatedAt)
            .Take(take)
            .ToListAsync();
        return rows.Select(ToDto).ToList();
    }

    public async Task<TweetDto?> CreateAsync(int userId, string text)
    {
        var tweet = new Tweet
        {
            UserId = userId,
            TweetText = text.Trim(),
            NumLikes = 0,
            NumRetweets = 0,
            NumComments = 0,
        };
        _db.Tweets.Add(tweet);
        await _db.SaveChangesAsync();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user is null) return null;

        return new TweetDto(
            tweet.TweetId, tweet.TweetText, tweet.CreatedAt,
            new AuthorDto(user.UserId, BuildName(user.FirstName, user.LastName, user.UserHandle), user.UserHandle, user.AvatarUrl),
            0, 0, 0, null, null, false, false, false);
    }

    public async Task<List<SuggestionDto>> GetSuggestionsAsync(int? excludeUserId, int take = 3)
    {
        return await _db.Users
            .Where(u => excludeUserId == null || u.UserId != excludeUserId)
            .OrderByDescending(u => u.FollowerCount)
            .Take(take)
            .Select(u => new SuggestionDto(u.UserId, ((u.FirstName + " " + u.LastName).Trim() == "" ? u.UserHandle : (u.FirstName + " " + u.LastName).Trim()), u.UserHandle))
            .ToListAsync();
    }

    public async Task<List<TrendDto>> GetTrendsAsync(int take = 5)
    {
        var topics = await _db.Topics.OrderByDescending(t => t.CreatedAt).Take(take).Select(t => t.Name).ToListAsync();
        var texts = await _db.Tweets.Select(t => t.TweetText).ToListAsync();
        return topics.Select(name => new TrendDto(name, texts.Count(tx => tx.Contains(name, StringComparison.OrdinalIgnoreCase)))).ToList();
    }

    // ---------------- Interacciones ----------------
    public async Task<LikeResult> ToggleLikeAsync(int userId, int tweetId)
    {
        var tweet = await _db.Tweets.FirstOrDefaultAsync(t => t.TweetId == tweetId);
        if (tweet is null) return new LikeResult(false, 0);

        var existing = await _db.TweetLikes.FirstOrDefaultAsync(l => l.UserId == userId && l.TweetId == tweetId);
        bool liked;
        if (existing is not null) { _db.TweetLikes.Remove(existing); tweet.NumLikes = Math.Max(0, (tweet.NumLikes ?? 0) - 1); liked = false; }
        else { _db.TweetLikes.Add(new TweetLike { UserId = userId, TweetId = tweetId }); tweet.NumLikes = (tweet.NumLikes ?? 0) + 1; liked = true; }

        await _db.SaveChangesAsync();
        return new LikeResult(liked, tweet.NumLikes ?? 0);
    }

    public async Task<RetweetResult> ToggleRetweetAsync(int userId, int tweetId)
    {
        var tweet = await _db.Tweets.FirstOrDefaultAsync(t => t.TweetId == tweetId);
        if (tweet is null) return new RetweetResult(false, 0);

        var existing = await _db.Retweets.FirstOrDefaultAsync(r => r.UserId == userId && r.OriginalTweetId == tweetId);
        bool retweeted;
        if (existing is not null) { _db.Retweets.Remove(existing); tweet.NumRetweets = Math.Max(0, (tweet.NumRetweets ?? 0) - 1); retweeted = false; }
        else { _db.Retweets.Add(new Retweet { UserId = userId, OriginalTweetId = tweetId, CreatedAt = DateTime.Now }); tweet.NumRetweets = (tweet.NumRetweets ?? 0) + 1; retweeted = true; }

        await _db.SaveChangesAsync();
        return new RetweetResult(retweeted, tweet.NumRetweets ?? 0);
    }

    public async Task<SaveResult> ToggleSaveAsync(int userId, int tweetId)
    {
        var existing = await _db.SavedTweets.FirstOrDefaultAsync(s => s.UserId == userId && s.TweetId == tweetId);
        bool saved;
        if (existing is not null) { _db.SavedTweets.Remove(existing); saved = false; }
        else { _db.SavedTweets.Add(new SavedTweet { UserId = userId, TweetId = tweetId, SavedAt = DateTime.Now }); saved = true; }

        await _db.SaveChangesAsync();
        return new SaveResult(saved);
    }

    public async Task<FollowResult> ToggleFollowAsync(int userId, int targetId)
    {
        if (userId == targetId)
        {
            var self = await _db.Followers.CountAsync(f => f.FollowingId == targetId);
            return new FollowResult(false, self);
        }

        var existing = await _db.Followers.FirstOrDefaultAsync(f => f.FollowerId == userId && f.FollowingId == targetId);
        bool following;
        if (existing is not null) { _db.Followers.Remove(existing); following = false; }
        else { _db.Followers.Add(new Follower { FollowerId = userId, FollowingId = targetId }); following = true; }
        await _db.SaveChangesAsync();

        var count = await _db.Followers.CountAsync(f => f.FollowingId == targetId);
        var target = await _db.Users.FirstOrDefaultAsync(u => u.UserId == targetId);
        if (target is not null) { target.FollowerCount = count; await _db.SaveChangesAsync(); }

        return new FollowResult(following, count);
    }

    public async Task<List<TweetDto>> GetSavedAsync(int userId, int take = 50)
    {
        var savedIds = _db.SavedTweets.Where(s => s.UserId == userId).Select(s => s.TweetId);
        var rows = await BaseQuery(userId)
            .Where(t => savedIds.Contains(t.TweetId))
            .OrderByDescending(t => t.CreatedAt)
            .Take(take)
            .ToListAsync();
        return rows.Select(ToDto).ToList();
    }

    public async Task<List<CommentDto>> GetCommentsAsync(int tweetId)
    {
        var query =
            from c in _db.TweetComments
            where c.TweetId == tweetId
            join u in _db.Users on c.UserId equals u.UserId
            orderby c.CreatedAt
            select new CommentDto(c.CommentId, c.CommentText, c.CreatedAt,
                new AuthorDto(u.UserId, ((u.FirstName + " " + u.LastName).Trim() == "" ? u.UserHandle : (u.FirstName + " " + u.LastName).Trim()), u.UserHandle, u.AvatarUrl));
        return await query.ToListAsync();
    }

    public async Task<CommentDto?> AddCommentAsync(int userId, int tweetId, string text)
    {
        var tweet = await _db.Tweets.FirstOrDefaultAsync(t => t.TweetId == tweetId);
        if (tweet is null) return null;

        var comment = new TweetComment { TweetId = tweetId, UserId = userId, CommentText = text.Trim(), CreatedAt = DateTime.Now };
        _db.TweetComments.Add(comment);
        tweet.NumComments = (tweet.NumComments ?? 0) + 1;
        await _db.SaveChangesAsync();

        var u = await _db.Users.FirstOrDefaultAsync(x => x.UserId == userId);
        if (u is null) return null;
        return new CommentDto(comment.CommentId, comment.CommentText, comment.CreatedAt,
            new AuthorDto(u.UserId, BuildName(u.FirstName, u.LastName, u.UserHandle), u.UserHandle, u.AvatarUrl));
    }

    // ---------------- Perfil / búsqueda ----------------
    public async Task<List<TweetDto>> GetUserTweetsAsync(int userId, int? me, int take = 50)
    {
        var rows = await BaseQuery(me).Where(r => r.UserId == userId).OrderByDescending(r => r.CreatedAt).Take(take).ToListAsync();
        return rows.Select(ToDto).ToList();
    }

    public async Task<List<TweetDto>> GetUserLikesAsync(int userId, int? me, int take = 50)
    {
        var likedIds = _db.TweetLikes.Where(l => l.UserId == userId).Select(l => l.TweetId);
        var rows = await BaseQuery(me).Where(r => likedIds.Contains(r.TweetId)).OrderByDescending(r => r.CreatedAt).Take(take).ToListAsync();
        return rows.Select(ToDto).ToList();
    }

    public async Task<List<ReplyDto>> GetUserRepliesAsync(int userId, int take = 50)
    {
        var query =
            from c in _db.TweetComments
            where c.UserId == userId
            join t in _db.Tweets on c.TweetId equals t.TweetId
            join u in _db.Users on t.UserId equals u.UserId
            orderby c.CreatedAt descending
            select new ReplyDto(c.CommentId, c.CommentText, c.CreatedAt, t.TweetId, u.UserHandle, t.TweetText);
        return await query.Take(take).ToListAsync();
    }

    public async Task<SearchResultDto> SearchAsync(string query, int? me)
    {
        var q = (query ?? string.Empty).Trim();
        if (q.Length == 0) return new SearchResultDto(new(), new());

        var users = await _db.Users
            .Where(u => u.UserHandle.Contains(q) || (u.FirstName + " " + u.LastName).Contains(q))
            .OrderByDescending(u => u.FollowerCount)
            .Take(10)
            .Select(u => new SuggestionDto(u.UserId, ((u.FirstName + " " + u.LastName).Trim() == "" ? u.UserHandle : (u.FirstName + " " + u.LastName).Trim()), u.UserHandle))
            .ToListAsync();

        var rows = await BaseQuery(me).Where(r => r.Text.Contains(q)).OrderByDescending(r => r.CreatedAt).Take(30).ToListAsync();
        return new SearchResultDto(users, rows.Select(ToDto).ToList());
    }

    // ---------------- Helpers ----------------
    private IQueryable<TweetRow> BaseQuery(int? me) =>
        _db.Tweets.Select(t => new TweetRow
        {
            TweetId = t.TweetId,
            Text = t.TweetText,
            CreatedAt = t.CreatedAt,
            UserId = t.User!.UserId,
            FirstName = t.User.FirstName,
            LastName = t.User.LastName,
            Handle = t.User.UserHandle,
            AvatarUrl = t.User.AvatarUrl,
            Likes = t.NumLikes,
            Retweets = t.NumRetweets,
            Comments = t.NumComments,
            MediaUrls = t.MediaUrls,
            LikedByMe = _db.TweetLikes.Any(l => l.TweetId == t.TweetId && l.UserId == me),
            RetweetedByMe = _db.Retweets.Any(r => r.OriginalTweetId == t.TweetId && r.UserId == me),
            SavedByMe = _db.SavedTweets.Any(s => s.TweetId == t.TweetId && s.UserId == me),
        });

    private static TweetDto ToDto(TweetRow r)
    {
        var (mediaType, mediaUrl) = ParseMedia(r.MediaUrls);
        return new TweetDto(
            r.TweetId, r.Text, r.CreatedAt,
            new AuthorDto(r.UserId, BuildName(r.FirstName, r.LastName, r.Handle), r.Handle, r.AvatarUrl),
            r.Likes ?? 0, r.Retweets ?? 0, r.Comments ?? 0,
            mediaType, mediaUrl,
            r.LikedByMe, r.RetweetedByMe, r.SavedByMe);
    }

    private static (string? type, string? url) ParseMedia(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return (null, null);
        try
        {
            using var doc = JsonDocument.Parse(raw);
            if (doc.RootElement.ValueKind == JsonValueKind.Object &&
                doc.RootElement.TryGetProperty("type", out var t) &&
                doc.RootElement.TryGetProperty("url", out var u))
                return (t.GetString(), u.GetString());
        }
        catch { /* formato no reconocido */ }
        return (null, null);
    }

    private static string BuildName(string firstName, string lastName, string handle)
    {
        var full = $"{firstName} {lastName}".Trim();
        return string.IsNullOrEmpty(full) ? handle : full;
    }

    private sealed class TweetRow
    {
        public int TweetId { get; set; }
        public string Text { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Handle { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public int? Likes { get; set; }
        public int? Retweets { get; set; }
        public int? Comments { get; set; }
        public string? MediaUrls { get; set; }
        public bool LikedByMe { get; set; }
        public bool RetweetedByMe { get; set; }
        public bool SavedByMe { get; set; }
    }
}
