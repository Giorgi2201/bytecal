using ByteCal_Back.Models;
using Microsoft.EntityFrameworkCore;

namespace ByteCal_Back.Data;

public sealed class ByteCalDbContext(DbContextOptions<ByteCalDbContext> options)
    : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<FoodEntry> FoodEntries => Set<FoodEntry>();

    public DbSet<Product> Products => Set<Product>();

    public DbSet<ScanLog> ScanLogs => Set<ScanLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.Id);
            entity.HasIndex(user => user.Email).IsUnique();
            entity.Property(user => user.Email).HasMaxLength(256).IsRequired();
            entity.Property(user => user.DisplayName).HasMaxLength(120).IsRequired();
            entity.Property(user => user.PasswordHash).HasMaxLength(512).IsRequired();
        });

        modelBuilder.Entity<FoodEntry>(entity =>
        {
            entity.HasKey(entry => entry.Id);
            entity.Property(entry => entry.Barcode).HasMaxLength(32).IsRequired();
            entity.Property(entry => entry.Calories).IsRequired();
            entity.Property(entry => entry.Timestamp).IsRequired();
            entity.HasOne(entry => entry.User)
                .WithMany(user => user.FoodEntries)
                .HasForeignKey(entry => entry.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(product => product.Id);
            entity.HasIndex(product => product.Barcode).IsUnique();
            entity.Property(product => product.Barcode).HasMaxLength(64).IsRequired();
            entity.Property(product => product.Name).HasMaxLength(256).IsRequired();
            entity.Property(product => product.Calories).IsRequired();
            entity.Property(product => product.Source).HasMaxLength(16).IsRequired();
            entity.Property(product => product.CreatedAt).IsRequired();
        });

        modelBuilder.Entity<ScanLog>(entity =>
        {
            entity.HasKey(scanLog => scanLog.Id);
            entity.Property(scanLog => scanLog.Barcode).HasMaxLength(64).IsRequired();
            entity.Property(scanLog => scanLog.Timestamp).IsRequired();
            entity.HasIndex(scanLog => scanLog.Barcode);
            entity.HasIndex(scanLog => scanLog.Timestamp);
        });
    }
}
