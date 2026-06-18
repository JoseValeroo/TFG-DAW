using Lure.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lure.Api.Data;

public class LureDbContext : DbContext
{
    public LureDbContext(DbContextOptions<LureDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Tweet> Tweets => Set<Tweet>();
    public DbSet<Topic> Topics => Set<Topic>();
    public DbSet<Follower> Followers => Set<Follower>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.UserId);
            entity.Property(u => u.UserId).ValueGeneratedOnAdd();
            entity.Property(u => u.CreatedAt)
                .ValueGeneratedOnAdd()
                .HasDefaultValueSql("getdate()");
        });

        modelBuilder.Entity<Tweet>(entity =>
        {
            entity.HasKey(t => t.TweetId);
            entity.Property(t => t.TweetId).ValueGeneratedOnAdd();
            entity.Property(t => t.CreatedAt)
                .ValueGeneratedOnAdd()
                .HasDefaultValueSql("getdate()");
            entity.HasOne(t => t.User)
                .WithMany()
                .HasForeignKey(t => t.UserId);
        });

        modelBuilder.Entity<Topic>(entity => entity.HasKey(t => t.TopicId));

        // followers: clave compuesta (sin identidad)
        modelBuilder.Entity<Follower>(entity =>
            entity.HasKey(f => new { f.FollowerId, f.FollowingId }));
    }
}
