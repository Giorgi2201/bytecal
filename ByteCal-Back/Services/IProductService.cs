using ByteCal_Back.DTOs;

namespace ByteCal_Back.Services;

public interface IProductService
{
    Task<ProductResponseDto?> GetByBarcodeAsync(string barcode, CancellationToken cancellationToken);

    Task<ProductResponseDto?> CreateManualProductAsync(
        CreateProductRequestDto request,
        CancellationToken cancellationToken);
}
