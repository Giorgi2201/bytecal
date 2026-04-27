namespace ByteCal_Back.DTOs;

public sealed record CreateProductRequestDto(
    string Barcode,
    string Name,
    float Calories);
