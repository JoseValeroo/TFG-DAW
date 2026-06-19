using System.ComponentModel.DataAnnotations;

namespace Lure.Api.Feed;

public record AuthorDto(int Id, string Name, string Handle, string? AvatarUrl);

public record TweetDto(
    int Id,
    string Text,
    DateTime CreatedAt,
    AuthorDto Author,
    int Likes,
    int Retweets,
    int Comments,
    string? MediaType,
    string? MediaUrl,
    bool LikedByMe,
    bool RetweetedByMe,
    bool SavedByMe);

public class CreateTweetRequest
{
    [Required]
    [MaxLength(200, ErrorMessage = "El tweet no puede superar los 200 caracteres")]
    public string Text { get; set; } = string.Empty;
}

public record SuggestionDto(int Id, string Name, string Handle);

public record TrendDto(string Name, int Posts);

public record LikeResult(bool Liked, int Likes);
public record RetweetResult(bool Retweeted, int Retweets);
public record SaveResult(bool Saved);
public record FollowResult(bool Following, int Followers);
public record CommentDto(int Id, string Text, DateTime? CreatedAt, AuthorDto Author);

public record SearchResultDto(List<SuggestionDto> Users, List<TweetDto> Tweets);

// Una respuesta (comentario) del usuario, con el contexto del tweet original.
public record ReplyDto(
    int Id,
    string Text,
    DateTime? CreatedAt,
    int TweetId,
    string TweetAuthorHandle,
    string TweetText);
