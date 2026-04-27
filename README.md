# ByteCal

ByteCal is a React Native CLI + ASP.NET Core MVP for scanning food barcodes, looking products up through Open Food Facts, and tracking the current day's calorie total in local app state.

## Project Structure

- `ByteCal/` - React Native CLI mobile app with TypeScript.
- `ByteCal-Back/` - ASP.NET Core Web API.
- `ByteCal-Back/Controllers` - API endpoints.
- `ByteCal-Back/Services` - Open Food Facts product lookup logic.
- `ByteCal-Back/DTOs` - API response contracts.
- `ByteCal-Back/Models` - EF Core-ready `User` and `FoodEntry` models.
- `ByteCal-Back/Data` - EF Core `ByteCalDbContext`.

## Requirements

- Node.js 22+
- React Native CLI iOS environment on macOS
- Xcode
- CocoaPods
- .NET SDK 10
- SQL Server for future persistence work

The app does not use Expo.

## Backend Setup

From the backend folder:

```sh
cd ../ByteCal-Back
dotnet restore
dotnet run --launch-profile http
```

The API runs at:

```txt
http://localhost:5166
```

Product lookup endpoint:

```txt
GET http://localhost:5166/api/products/{barcode}
```

Example:

```sh
curl http://localhost:5166/api/products/737628064502
```

The backend is already wired for SQL Server through EF Core. Update the connection string in `ByteCal-Back/appsettings.json` if your SQL Server instance differs:

```json
"ConnectionStrings": {
  "ByteCal": "Server=localhost;Database=ByteCal;Trusted_Connection=True;TrustServerCertificate=True"
}
```

When persistence endpoints are added later, create the database with:

```sh
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## iOS Setup

From the React Native app folder on macOS:

```sh
cd ByteCal
npm install
cd ios
bundle install
bundle exec pod install
```

Start Metro:

```sh
cd ..
npm start
```

Open the iOS project in Xcode:

```sh
open ios/ByteCal.xcworkspace
```

Select an iPhone simulator or physical iPhone, then press Run.

## iOS Camera Permission

`ios/ByteCal/Info.plist` includes:

```xml
<key>NSCameraUsageDescription</key>
<string>ByteCal needs camera access to scan product barcodes.</string>
```

Barcode scanning works best on a physical iPhone. Simulators do not provide a real camera feed.

## Mobile App Behavior

- Shows a daily calorie total at the top.
- Opens a Vision Camera scanner for EAN and UPC barcodes.
- Prevents duplicate scans from repeatedly triggering API requests.
- Looks products up through `GET /api/products/{barcode}`.
- Caches successful product lookups locally with AsyncStorage.
- Displays product name, calories, serving size, and source.
- Adds calories to today's in-memory total with `Add to Daily Intake`.

## Local Networking Notes

The app points to `http://localhost:5166` in `src/services/api.ts`.

- iOS Simulator: `localhost` usually resolves to your Mac.
- Physical iPhone: replace `localhost` with your Mac's LAN IP address, for example `http://192.168.1.20:5166`.

If you change the backend URL, update:

```ts
const API_BASE_URL = 'http://localhost:5166';
```
