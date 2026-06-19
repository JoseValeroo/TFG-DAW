using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Lure.Api.Data;
using Lure.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Lure.Api.Auth;

public class AuthService : IAuthService
{
    private readonly LureDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(LureDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var email = request.Email.Trim();
        var handle = request.Username.Trim();

        if (await _db.Users.AnyAsync(u => u.EmailAddress == email))
            throw new AuthException(StatusCodes.Status409Conflict, "El email ya está registrado");

        if (await _db.Users.AnyAsync(u => u.UserHandle == handle))
            throw new AuthException(StatusCodes.Status409Conflict, "El nombre de usuario ya está en uso");

        var user = new User
        {
            UserHandle = handle,
            EmailAddress = email,
            // El formulario solo pide usuario/email/contraseña; rellenamos los
            // campos NOT NULL del esquema con valores por defecto razonables.
            FirstName = handle,
            LastName = string.Empty,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FollowerCount = 0,
            UserRole = "user",
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return BuildResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var handle = request.Username.Trim();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserHandle == handle);

        if (user is null || string.IsNullOrEmpty(user.Password) || !VerifyPassword(request.Password, user.Password))
            throw new AuthException(StatusCodes.Status401Unauthorized, "Credenciales incorrectas");

        return BuildResponse(user);
    }

    public async Task<UserDto?> GetByIdAsync(int userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        return user is null ? null : new UserDto(user.UserId, user.UserHandle, user.EmailAddress, user.AvatarUrl);
    }

    private static bool VerifyPassword(string plain, string stored)
    {
        try
        {
            // Los usuarios creados por esta API guardan un hash bcrypt válido.
            // Si un registro previo tuviera otro formato, Verify lanzaría: lo tratamos como inválido.
            return BCrypt.Net.BCrypt.Verify(plain, stored);
        }
        catch
        {
            return false;
        }
    }

    private AuthResponse BuildResponse(User user)
    {
        var token = GenerateToken(user);
        return new AuthResponse(token, new UserDto(user.UserId, user.UserHandle, user.EmailAddress, user.AvatarUrl));
    }

    private string GenerateToken(User user)
    {
        var jwt = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Secret"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("uid", user.UserId.ToString()),
            new Claim("username", user.UserHandle),
        };

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
