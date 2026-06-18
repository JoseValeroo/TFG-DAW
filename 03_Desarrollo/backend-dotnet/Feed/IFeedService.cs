namespace Lure.Api.Feed;

public interface IFeedService
{
    Task<List<TweetDto>> GetForYouAsync(int take = 30);
    Task<List<TweetDto>> GetFollowingAsync(int userId, int take = 30);
    Task<TweetDto?> CreateAsync(int userId, string text);
    Task<List<SuggestionDto>> GetSuggestionsAsync(int? excludeUserId, int take = 3);
    Task<List<TrendDto>> GetTrendsAsync(int take = 5);

    Task<LikeResult> ToggleLikeAsync(int userId, int tweetId);
    Task<List<TweetDto>> GetUserTweetsAsync(int userId, int take = 50);
    Task<List<TweetDto>> GetUserLikesAsync(int userId, int take = 50);
    Task<List<ReplyDto>> GetUserRepliesAsync(int userId, int take = 50);
}
