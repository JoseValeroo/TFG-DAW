namespace Lure.Api.Feed;

public interface IFeedService
{
    Task<List<TweetDto>> GetForYouAsync(int take = 30);
    Task<List<TweetDto>> GetFollowingAsync(int userId, int take = 30);
    Task<TweetDto?> CreateAsync(int userId, string text);
    Task<List<SuggestionDto>> GetSuggestionsAsync(int? excludeUserId, int take = 3);
    Task<List<TrendDto>> GetTrendsAsync(int take = 5);
}
