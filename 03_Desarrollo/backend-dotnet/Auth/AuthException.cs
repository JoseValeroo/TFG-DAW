namespace Lure.Api.Auth;

/// <summary>Excepción de autenticación que lleva el código HTTP a devolver.</summary>
public class AuthException : Exception
{
    public int StatusCode { get; }

    public AuthException(int statusCode, string message) : base(message)
    {
        StatusCode = statusCode;
    }
}
