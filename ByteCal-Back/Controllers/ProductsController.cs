using ByteCal_Back.Services;
using Microsoft.AspNetCore.Mvc;

namespace ByteCal_Back.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProductsController(IProductLookupService productLookupService)
    : ControllerBase
{
    [HttpGet("{barcode}")]
    public async Task<IActionResult> GetByBarcode(
        string barcode,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(barcode))
        {
            return BadRequest(new { message = "Barcode is required." });
        }

        var product = await productLookupService.GetProductByBarcodeAsync(
            barcode.Trim(),
            cancellationToken);

        if (product is null)
        {
            return NotFound(new { message = "Product was not found." });
        }

        return Ok(product);
    }
}
