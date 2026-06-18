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
    int Comments);

public class CreateTweetRequest
{
    [Required]
    [MaxLength(200, ErrorMessage = "El tweet no puede superar los 200 caracteres")]
    public string Text { get; set; } = string.Empty;
}

public record SuggestionDto(int Id, string Name, string Handle);

public record TrendDto(string Name, int Posts);
