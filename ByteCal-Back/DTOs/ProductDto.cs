namespace ByteCal_Back.DTOs;

public sealed record ProductDto(
    string Barcode,
    string Name,
    double Calories,
    string CaloriesUnit,
    string? ServingSize,
    string Source);
