using System.ComponentModel.DataAnnotations.Schema;

namespace Lure.Api.Entities;

[Table("topics")]
public class Topic
{
    [Column("topic_id")]
    public int TopicId { get; set; }

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime? CreatedAt { get; set; }
}
