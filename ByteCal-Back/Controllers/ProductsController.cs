using ByteCal_Back.DTOs;
using ByteCal_Back.Services;
using Microsoft.AspNetCore.Mvc;

namespace ByteCal_Back.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProductsController(IProductService productService)
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

        var product = await productService.GetByBarcodeAsync(
            barcode.Trim(),
            cancellationToken);

        if (product is null)
        {
            return NotFound(new { message = "Product not found" });
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductRequestDto request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Barcode) ||
            string.IsNullOrWhiteSpace(request.Name) ||
            request.Calories <= 0)
        {
            return BadRequest(new
            {
                message = "Barcode, name and calories are required.",
            });
        }

        var createdProduct = await productService.CreateManualProductAsync(
            request,
            cancellationToken);

        if (createdProduct is null)
        {
            return Conflict(new { message = "Product with this barcode already exists." });
        }

        return CreatedAtAction(
            nameof(GetByBarcode),
            new { barcode = createdProduct.Barcode },
            createdProduct);
    }
}
