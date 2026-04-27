namespace ByteCal_Back.Models;

public sealed class FoodEntry
{
    public Guid Id { get; set; }

    public string Barcode { get; set; } = string.Empty;

    public double Calories { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public Guid UserId { get; set; }

    public User? User { get; set; }
}
