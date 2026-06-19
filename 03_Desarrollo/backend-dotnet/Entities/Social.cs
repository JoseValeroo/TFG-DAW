using System.ComponentModel.DataAnnotations.Schema;

namespace Lure.Api.Entities;

[Table("tweet_likes")]
public class TweetLike
{
    [Column("user_id")] public int UserId { get; set; }
    [Column("tweet_id")] public int TweetId { get; set; }
}

[Table("tweet_comments")]
public class TweetComment
{
    [Column("comment_id")] public int CommentId { get; set; }
    [Column("tweet_id")] public int TweetId { get; set; }
    [Column("user_id")] public int UserId { get; set; }
    [Column("comment_text")] public string CommentText { get; set; } = string.Empty;
    [Column("created_at")] public DateTime? CreatedAt { get; set; }
}

[Table("messages")]
public class Message
{
    [Column("message_id")] public int MessageId { get; set; }
    [Column("sender_id")] public int SenderId { get; set; }
    [Column("receiver_id")] public int ReceiverId { get; set; }
    [Column("content")] public string Content { get; set; } = string.Empty;
    [Column("sent_at")] public DateTime? SentAt { get; set; }
    [Column("is_read")] public bool? IsRead { get; set; }
}

[Table("communities")]
public class Community
{
    [Column("community_id")] public int CommunityId { get; set; }
    [Column("name")] public string? Name { get; set; }
    [Column("category")] public string? Category { get; set; }
    [Column("description")] public string? Description { get; set; }
}

[Table("community_members")]
public class CommunityMember
{
    [Column("id")] public int Id { get; set; }
    [Column("community_id")] public int? CommunityId { get; set; }
    [Column("user_id")] public int? UserId { get; set; }
}

[Table("retweets")]
public class Retweet
{
    [Column("retweet_id")] public int RetweetId { get; set; }
    [Column("user_id")] public int UserId { get; set; }
    [Column("original_tweet_id")] public int OriginalTweetId { get; set; }
    [Column("created_at")] public DateTime? CreatedAt { get; set; }
}

[Table("saved_tweets")]
public class SavedTweet
{
    [Column("user_id")] public int UserId { get; set; }
    [Column("tweet_id")] public int TweetId { get; set; }
    [Column("saved_at")] public DateTime? SavedAt { get; set; }
}

[Table("user_details")]
public class UserDetail
{
    [Column("detail_id")] public int DetailId { get; set; }
    [Column("user_id")] public int UserId { get; set; }
    [Column("category")] public string Category { get; set; } = string.Empty;
    [Column("detail_text")] public string DetailText { get; set; } = string.Empty;
}
