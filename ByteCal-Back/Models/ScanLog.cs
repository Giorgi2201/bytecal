namespace ByteCal_Back.Models;

public sealed class ScanLog
{
    public int Id { get; set; }

    public string Barcode { get; set; } = string.Empty;

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
