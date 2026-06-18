using System.ComponentModel.DataAnnotations.Schema;

namespace Lure.Api.Entities;

/// <summary>
/// Mapea la tabla existente dbo.users de la base de datos LURE (SQL Server).
/// No se usan migraciones: el esquema ya existe y no debe modificarse.
/// </summary>
[Table("users")]
public class User
{
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("user_handle")]
    public string UserHandle { get; set; } = string.Empty;

    [Column("email_address")]
    public string EmailAddress { get; set; } = string.Empty;

    [Column("first_name")]
    public string FirstName { get; set; } = string.Empty;

    [Column("last_name")]
    public string LastName { get; set; } = string.Empty;

    [Column("password")]
    public string? Password { get; set; }

    [Column("follower_count")]
    public int FollowerCount { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("avatar_url")]
    public string? AvatarUrl { get; set; }

    [Column("bio")]
    public string? Bio { get; set; }

    [Column("user_role")]
    public string? UserRole { get; set; }
}
