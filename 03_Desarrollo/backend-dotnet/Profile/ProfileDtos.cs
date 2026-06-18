namespace Lure.Api.Profile;

public record ProfileDto(
    int Id,
    string Username,
    string Name,
    string Email,
    string? Bio,
    string? Location,
    string? Birthday,
    string? AvatarUrl,
    int Followers,
    int Following,
    int TweetsCount,
    int RepliesCount,
    int LikesCount);

public record FollowUserDto(int Id, string Name, string Handle);

public class UpdateProfileRequest
{
    public string? Name { get; set; }
    public string? Bio { get; set; }
    public string? Location { get; set; }
}
