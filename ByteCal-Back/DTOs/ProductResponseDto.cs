namespace ByteCal_Back.DTOs;

public sealed record ProductResponseDto(
    int Id,
    string Barcode,
    string Name,
    float Calories,
    string Source,
    DateTime CreatedAt);
