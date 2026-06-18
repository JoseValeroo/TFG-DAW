using System.ComponentModel.DataAnnotations.Schema;

namespace Lure.Api.Entities;

[Table("followers")]
public class Follower
{
    [Column("follower_id")]
    public int FollowerId { get; set; }

    [Column("following_id")]
    public int FollowingId { get; set; }
}
