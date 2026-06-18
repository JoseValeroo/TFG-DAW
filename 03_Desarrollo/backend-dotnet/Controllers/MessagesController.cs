using Lure.Api.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lure.Api.Controllers;

[ApiController]
[Route("api/messages")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messages;

    public MessagesController(IMessageService messages)
    {
        _messages = messages;
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> Conversations()
    {
        var id = GetUserId();
        if (id is null) return Unauthorized();
        return Ok(await _messages.GetConversationsAsync(id.Value));
    }

    [HttpGet("thread/{otherUserId:int}")]
    public async Task<IActionResult> Thread(int otherUserId)
    {
        var id = GetUserId();
        if (id is null) return Unauthorized();
        return Ok(await _messages.GetThreadAsync(id.Value, otherUserId));
    }

    [HttpPost]
    public async Task<IActionResult> Send([FromBody] SendMessageRequest request)
    {
        var id = GetUserId();
        if (id is null) return Unauthorized();
        return Ok(await _messages.SendAsync(id.Value, request.ToUserId, request.Content));
    }

    private int? GetUserId()
    {
        var uid = User.FindFirst("uid")?.Value;
        return int.TryParse(uid, out var id) ? id : null;
    }
}
