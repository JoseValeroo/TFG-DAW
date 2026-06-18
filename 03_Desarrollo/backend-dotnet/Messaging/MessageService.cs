using System.ComponentModel.DataAnnotations;
using Lure.Api.Data;
using Lure.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lure.Api.Messaging;

public record ConversationDto(int UserId, string Name, string Handle, string LastMessage, DateTime? LastAt);
public record MessageDto(int Id, bool FromMe, string Content, DateTime? SentAt);

public class SendMessageRequest
{
    [Required]
    public int ToUserId { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;
}

public interface IMessageService
{
    Task<List<ConversationDto>> GetConversationsAsync(int userId);
    Task<List<MessageDto>> GetThreadAsync(int userId, int otherUserId);
    Task<MessageDto> SendAsync(int userId, int toUserId, string content);
}

public class MessageService : IMessageService
{
    private readonly LureDbContext _db;

    public MessageService(LureDbContext db)
    {
        _db = db;
    }

    public async Task<List<ConversationDto>> GetConversationsAsync(int userId)
    {
        var msgs = await _db.Messages
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .OrderByDescending(m => m.SentAt)
            .ToListAsync();

        // Última conversación por cada interlocutor.
        var lastByOther = msgs
            .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
            .Select(g => g.First())
            .ToList();

        var otherIds = lastByOther
            .Select(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
            .ToList();

        var users = await _db.Users
            .Where(u => otherIds.Contains(u.UserId))
            .ToDictionaryAsync(u => u.UserId);

        return lastByOther.Select(m =>
        {
            var otherId = m.SenderId == userId ? m.ReceiverId : m.SenderId;
            users.TryGetValue(otherId, out var u);
            var name = u is null ? $"Usuario {otherId}" : Name(u);
            return new ConversationDto(otherId, name, u?.UserHandle ?? "", m.Content, m.SentAt);
        }).ToList();
    }

    public async Task<List<MessageDto>> GetThreadAsync(int userId, int otherUserId)
    {
        var msgs = await _db.Messages
            .Where(m =>
                (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                (m.SenderId == otherUserId && m.ReceiverId == userId))
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        return msgs
            .Select(m => new MessageDto(m.MessageId, m.SenderId == userId, m.Content, m.SentAt))
            .ToList();
    }

    public async Task<MessageDto> SendAsync(int userId, int toUserId, string content)
    {
        var msg = new Message
        {
            SenderId = userId,
            ReceiverId = toUserId,
            Content = content.Trim(),
            SentAt = DateTime.Now,
            IsRead = false,
        };
        _db.Messages.Add(msg);
        await _db.SaveChangesAsync();
        return new MessageDto(msg.MessageId, true, msg.Content, msg.SentAt);
    }

    private static string Name(User u)
    {
        var full = $"{u.FirstName} {u.LastName}".Trim();
        return string.IsNullOrEmpty(full) ? u.UserHandle : full;
    }
}
