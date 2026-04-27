using ByteCal_Back.Data;
using ByteCal_Back.DTOs;
using ByteCal_Back.Models;
using Microsoft.EntityFrameworkCore;

namespace ByteCal_Back.Services;

public sealed class ProductService(
    ByteCalDbContext dbContext,
    IOpenFoodFactsService openFoodFactsService) : IProductService
{
    public async Task<ProductResponseDto?> GetByBarcodeAsync(
        string barcode,
        CancellationToken cancellationToken)
    {
        var normalizedBarcode = barcode.Trim();
        await LogScanAsync(normalizedBarcode, cancellationToken);

        var localProduct = await dbContext.Products
            .AsNoTracking()
            .SingleOrDefaultAsync(
                product => product.Barcode == normalizedBarcode,
                cancellationToken);

        if (localProduct is not null)
        {
            return MapProduct(localProduct);
        }

        var fetchedProduct = await openFoodFactsService.LookupByBarcodeAsync(
            normalizedBarcode,
            cancellationToken);

        if (fetchedProduct is null)
        {
            return null;
        }

        var newProduct = new Product
        {
            Barcode = fetchedProduct.Barcode,
            Name = fetchedProduct.Name,
            Calories = fetchedProduct.Calories,
            Source = "OFF",
            CreatedAt = DateTime.UtcNow,
        };

        dbContext.Products.Add(newProduct);
        await dbContext.SaveChangesAsync(cancellationToken);

        return MapProduct(newProduct);
    }

    public async Task<ProductResponseDto?> CreateManualProductAsync(
        CreateProductRequestDto request,
        CancellationToken cancellationToken)
    {
        var normalizedBarcode = request.Barcode.Trim();
        var existingProduct = await dbContext.Products
            .AsNoTracking()
            .SingleOrDefaultAsync(
                product => product.Barcode == normalizedBarcode,
                cancellationToken);

        if (existingProduct is not null)
        {
            return null;
        }

        var product = new Product
        {
            Barcode = normalizedBarcode,
            Name = request.Name.Trim(),
            Calories = request.Calories,
            Source = "LOCAL",
            CreatedAt = DateTime.UtcNow,
        };

        dbContext.Products.Add(product);
        await dbContext.SaveChangesAsync(cancellationToken);

        return MapProduct(product);
    }

    private async Task LogScanAsync(string barcode, CancellationToken cancellationToken)
    {
        dbContext.ScanLogs.Add(new ScanLog
        {
            Barcode = barcode,
            Timestamp = DateTime.UtcNow,
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static ProductResponseDto MapProduct(Product product) =>
        new(
            product.Id,
            product.Barcode,
            product.Name,
            product.Calories,
            product.Source,
            product.CreatedAt);
}
