using ByteCal_Back.DTOs;

namespace ByteCal_Back.Services;

public interface IProductLookupService
{
    Task<ProductDto?> GetProductByBarcodeAsync(
        string barcode,
        CancellationToken cancellationToken);
}
