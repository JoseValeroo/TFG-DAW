namespace Lure.Api.Profile;

public interface IProfileService
{
    Task<ProfileDto?> GetProfileAsync(int userId);
    Task<bool> IsFollowingAsync(int viewerId, int targetId);
    Task<List<FollowUserDto>> GetFollowersAsync(int ownerId, int viewerId);
    Task<List<FollowUserDto>> GetFollowingAsync(int ownerId, int viewerId);
    Task<ProfileDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request);
    Task<ProfileDto?> SetAvatarUrlAsync(int userId, string url);
}
