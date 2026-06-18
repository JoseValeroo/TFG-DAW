namespace Lure.Api.Profile;

public interface IProfileService
{
    Task<ProfileDto?> GetProfileAsync(int userId);
    Task<List<FollowUserDto>> GetFollowersAsync(int userId);
    Task<List<FollowUserDto>> GetFollowingAsync(int userId);
    Task<ProfileDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request);
}
