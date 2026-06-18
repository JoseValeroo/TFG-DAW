using Lure.Api.Data;
using Lure.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lure.Api.Communities;

public record CommunityDto(int Id, string Name, string? Category, string? Description, int Members, bool IsMember);

public interface ICommunityService
{
    Task<List<CommunityDto>> GetAllAsync(int? userId);
    Task<bool> ToggleMembershipAsync(int userId, int communityId);
}

public class CommunityService : ICommunityService
{
    private readonly LureDbContext _db;

    public CommunityService(LureDbContext db)
    {
        _db = db;
    }

    public async Task<List<CommunityDto>> GetAllAsync(int? userId)
    {
        return await _db.Communities
            .Select(c => new CommunityDto(
                c.CommunityId,
                c.Name ?? "Comunidad",
                c.Category,
                c.Description,
                _db.CommunityMembers.Count(m => m.CommunityId == c.CommunityId),
                userId != null && _db.CommunityMembers.Any(m => m.CommunityId == c.CommunityId && m.UserId == userId)))
            .ToListAsync();
    }

    public async Task<bool> ToggleMembershipAsync(int userId, int communityId)
    {
        var existing = await _db.CommunityMembers
            .FirstOrDefaultAsync(m => m.CommunityId == communityId && m.UserId == userId);

        bool joined;
        if (existing is not null)
        {
            _db.CommunityMembers.Remove(existing);
            joined = false;
        }
        else
        {
            _db.CommunityMembers.Add(new CommunityMember { CommunityId = communityId, UserId = userId });
            joined = true;
        }
        await _db.SaveChangesAsync();
        return joined;
    }
}
