namespace Lure.Api.Profile;

public record ProfileDto(
    int Id,
    string Username,
    string Name,
    string Email,
    string? Bio,
    string? Location,
    string? Birthday,
    string? BirthdayIso,
    string? AvatarUrl,
    int Followers,
    int Following,
    int TweetsCount,
    int RepliesCount,
    int LikesCount,
    List<string> Logros,
    List<string> Intereses,
    List<string> Habilidades);

public record FollowUserDto(int Id, string Name, string Handle, bool FollowedByMe);

public class UpdateProfileRequest
{
    public string? Name { get; set; }
    public string? Bio { get; set; }
    public string? Location { get; set; }
    public string? Birthday { get; set; } // yyyy-MM-dd (vacío = borrar)
    public List<string>? Logros { get; set; }
    public List<string>? Intereses { get; set; }
    public List<string>? Habilidades { get; set; }
}
