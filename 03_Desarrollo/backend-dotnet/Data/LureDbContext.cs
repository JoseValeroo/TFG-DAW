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
    public DbSet<TweetLike> TweetLikes => Set<TweetLike>();
    public DbSet<TweetComment> TweetComments => Set<TweetComment>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Community> Communities => Set<Community>();
    public DbSet<CommunityMember> CommunityMembers => Set<CommunityMember>();
    public DbSet<UserDetail> UserDetails => Set<UserDetail>();
    public DbSet<Retweet> Retweets => Set<Retweet>();
    public DbSet<SavedTweet> SavedTweets => Set<SavedTweet>();

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

        // tweet_likes: clave compuesta (sin identidad)
        modelBuilder.Entity<TweetLike>(entity =>
            entity.HasKey(l => new { l.UserId, l.TweetId }));

        modelBuilder.Entity<TweetComment>(entity =>
        {
            entity.HasKey(c => c.CommentId);
            entity.Property(c => c.CommentId).ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(m => m.MessageId);
            entity.Property(m => m.MessageId).ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<Community>(entity => entity.HasKey(c => c.CommunityId));

        modelBuilder.Entity<CommunityMember>(entity => entity.HasKey(m => m.Id));

        modelBuilder.Entity<UserDetail>(entity =>
        {
            entity.HasKey(d => d.DetailId);
            entity.Property(d => d.DetailId).ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<Retweet>(entity =>
        {
            entity.HasKey(r => r.RetweetId);
            entity.Property(r => r.RetweetId).ValueGeneratedOnAdd();
        });

        modelBuilder.Entity<SavedTweet>(entity =>
            entity.HasKey(s => new { s.UserId, s.TweetId }));
    }
}
