using System.ComponentModel.DataAnnotations.Schema;

namespace Lure.Api.Entities;

[Table("tweets")]
public class Tweet
{
    [Column("tweet_id")]
    public int TweetId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("tweet_text")]
    public string TweetText { get; set; } = string.Empty;

    [Column("num_likes")]
    public int? NumLikes { get; set; }

    [Column("num_retweets")]
    public int? NumRetweets { get; set; }

    [Column("num_comments")]
    public int? NumComments { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    public User? User { get; set; }
}
