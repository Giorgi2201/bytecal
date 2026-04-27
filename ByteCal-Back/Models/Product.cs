namespace ByteCal_Back.Models;

public sealed class Product
{
    public int Id { get; set; }

    public string Barcode { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public float Calories { get; set; }

    public string Source { get; set; } = "LOCAL";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
