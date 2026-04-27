using ByteCal_Back.DTOs;

namespace ByteCal_Back.Services;

public interface IOpenFoodFactsService
{
    Task<OpenFoodFactsProductDto?> LookupByBarcodeAsync(
        string barcode,
        CancellationToken cancellationToken);
}
