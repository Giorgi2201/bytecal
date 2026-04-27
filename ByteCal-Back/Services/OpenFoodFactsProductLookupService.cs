using System.Net.Http.Headers;
using System.Text.Json;
using ByteCal_Back.DTOs;

namespace ByteCal_Back.Services;

public sealed class OpenFoodFactsProductLookupService(HttpClient httpClient)
    : IProductLookupService
{
    private const string SourceName = "Open Food Facts";

    public async Task<ProductDto?> GetProductByBarcodeAsync(
        string barcode,
        CancellationToken cancellationToken)
    {
        using var response = await httpClient.GetAsync(
            $"api/v2/product/{barcode}.json",
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        var root = document.RootElement;

        if (!root.TryGetProperty("status", out var status) || status.GetInt32() != 1)
        {
            return null;
        }

        if (!root.TryGetProperty("product", out var product))
        {
            return null;
        }

        var productName = GetFirstString(
            product,
            "product_name",
            "product_name_en",
            "generic_name");

        if (string.IsNullOrWhiteSpace(productName))
        {
            productName = $"Product {barcode}";
        }

        var servingSize = GetString(product, "serving_size");
        var calories = TryReadCalories(product, out var caloriesUnit);

        if (calories is null)
        {
            return null;
        }

        return new ProductDto(
            barcode,
            productName,
            calories.Value,
            caloriesUnit,
            servingSize,
            SourceName);
    }

    public static void ConfigureHttpClient(HttpClient client)
    {
        client.BaseAddress = new Uri("https://world.openfoodfacts.org/");
        client.DefaultRequestHeaders.UserAgent.Add(
            new ProductInfoHeaderValue("ByteCal", "1.0"));
        client.DefaultRequestHeaders.Accept.Add(
            new MediaTypeWithQualityHeaderValue("application/json"));
    }

    private static double? TryReadCalories(
        JsonElement product,
        out string caloriesUnit)
    {
        caloriesUnit = "kcal per 100g";

        if (!product.TryGetProperty("nutriments", out var nutriments))
        {
            return null;
        }

        if (TryGetDouble(nutriments, "energy-kcal_serving", out var servingCalories))
        {
            caloriesUnit = "kcal per serving";
            return servingCalories;
        }

        if (TryGetDouble(nutriments, "energy-kcal_100g", out var caloriesPer100g))
        {
            return caloriesPer100g;
        }

        if (TryGetDouble(nutriments, "energy-kcal", out var calories))
        {
            return calories;
        }

        if (TryGetDouble(nutriments, "energy_100g", out var kilojoulesPer100g))
        {
            return Math.Round(kilojoulesPer100g / 4.184, 1);
        }

        return null;
    }

    private static bool TryGetDouble(
        JsonElement element,
        string propertyName,
        out double value)
    {
        value = 0;

        if (!element.TryGetProperty(propertyName, out var property))
        {
            return false;
        }

        if (property.ValueKind == JsonValueKind.Number)
        {
            return property.TryGetDouble(out value);
        }

        if (property.ValueKind == JsonValueKind.String)
        {
            return double.TryParse(property.GetString(), out value);
        }

        return false;
    }

    private static string? GetFirstString(JsonElement element, params string[] propertyNames)
    {
        foreach (var propertyName in propertyNames)
        {
            var value = GetString(element, propertyName);

            if (!string.IsNullOrWhiteSpace(value))
            {
                return value;
            }
        }

        return null;
    }

    private static string? GetString(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        return property.ValueKind == JsonValueKind.String
            ? property.GetString()
            : null;
    }
}
