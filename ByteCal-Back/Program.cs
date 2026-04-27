using ByteCal_Back.Data;
using ByteCal_Back.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<ByteCalDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ByteCal")));
builder.Services.AddHttpClient<IProductLookupService, OpenFoodFactsProductLookupService>(
    OpenFoodFactsProductLookupService.ConfigureHttpClient);
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentMobileClient", policy =>
    {
        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyOrigin();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors("DevelopmentMobileClient");
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
