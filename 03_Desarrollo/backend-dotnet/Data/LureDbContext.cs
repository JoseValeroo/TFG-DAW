using Lure.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lure.Api.Data;

public class LureDbContext : DbContext
{
    public LureDbContext(DbContextOptions<LureDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.UserId);

            // user_id es IDENTITY en la BD.
            entity.Property(u => u.UserId).ValueGeneratedOnAdd();

            // created_at lo rellena la BD con su default (getdate()).
            entity.Property(u => u.CreatedAt)
                .ValueGeneratedOnAdd()
                .HasDefaultValueSql("getdate()");
        });
    }
}
