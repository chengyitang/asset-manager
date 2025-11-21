# Asset Manager - API Documentation

This document provides detailed information about the external APIs used in the Asset Manager application.

## 📊 Yahoo Finance API

### Overview
Asset Manager uses the [yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2) Node.js library to access Yahoo Finance data.

### Features Used

#### 1. Real-Time Quote Data
```typescript
import yahooFinance from 'yahoo-finance2';

// Get current price for a single symbol
const quote = await yahooFinance.quote('AAPL');

// Get quotes for multiple symbols
const quotes = await yahooFinance.quote(['AAPL', 'GOOGL', 'TSLA']);
```

**Data Retrieved:**
- `regularMarketPrice`: Current market price
- `regularMarketChange`: Price change in currency
- `regularMarketChangePercent`: Price change percentage
- `currency`: Trading currency (USD, TWD, etc.)
- `longName` / `shortName`: Company/asset name

#### 2. Historical Price Data
```typescript
// Get historical prices for performance charts
const history = await yahooFinance.historical('AAPL', {
  period1: startDate,
  period2: endDate,
  interval: '1d'
});
```

**Data Retrieved:**
- `date`: Trading date
- `close`: Closing price
- `open`: Opening price
- `high`: Day's high
- `low`: Day's low
- `volume`: Trading volume

#### 3. Forex Rates
```typescript
// Get currency exchange rates
const rate = await yahooFinance.quote('USDTWD=X');
```

### Symbol Formats

| Asset Type | Input Format | Yahoo Finance Format | Example |
|------------|--------------|---------------------|---------|
| US Stocks | Ticker | Same | `AAPL` |
| Taiwan Stocks | 4-digit code | Code + `.TW` | `2330` → `2330.TW` |
| Crypto | Symbol | Symbol + `-USD` | `BTC` → `BTC-USD` |
| Forex | - | `{FROM}{TO}=X` | `USDTWD=X` |
| Gold Futures | - | `GC=F` | `GC=F` |

### Rate Limits
- No official rate limits published by Yahoo Finance
- The library implements reasonable request throttling
- Recommended: Batch requests when possible

### Cost
- **Free** - No API key required
- No authentication needed

### Implementation Files
- `src/lib/prices.ts` - Quote and price fetching
- `src/lib/performance.ts` - Historical data and performance calculations

---

## 📰 Finnhub API

### Overview
[Finnhub](https://finnhub.io/) provides real-time financial news and market data.

### Features Used

#### 1. General Market News
```typescript
const response = await fetch(
  `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`
);
```

**Categories Available:**
- `general` - General financial news
- `forex` - Foreign exchange news
- `crypto` - Cryptocurrency news
- `merger` - M&A news

**Data Retrieved:**
- `headline`: News title
- `summary`: Article summary
- `url`: Link to full article
- `source`: News source (Bloomberg, Reuters, etc.)
- `datetime`: Publication timestamp (Unix)
- `image`: Article image URL

#### 2. Company-Specific News
```typescript
const response = await fetch(
  `https://finnhub.io/api/v1/company-news?symbol=AAPL&from=2024-01-01&to=2024-01-31&token=${apiKey}`
);
```

**Parameters:**
- `symbol`: Stock ticker symbol
- `from`: Start date (YYYY-MM-DD)
- `to`: End date (YYYY-MM-DD)

### Rate Limits

| Plan | Calls/Minute | Calls/Month |
|------|--------------|-------------|
| Free | 60 | Unlimited |
| Starter | 300 | Unlimited |
| Pro | 600 | Unlimited |

### Cost
- **Free Tier**: 60 API calls/minute
- **Starter**: $24.99/month
- **Pro**: $99.99/month

### Getting an API Key

1. Visit [https://finnhub.io/register](https://finnhub.io/register)
2. Sign up for a free account
3. Verify your email
4. Copy your API key from the dashboard
5. Add to `.env.local`:
   ```env
   FINNHUB_API_KEY=your_api_key_here
   ```

### Fallback Behavior
If no API key is provided, the app will:
- Display mock news data
- Show placeholder articles
- Continue functioning normally

### Implementation Files
- `src/lib/news.ts` - News fetching and filtering
- `src/components/dashboard/FinanceNews.tsx` - News display component

---

## 🔐 Google Sheets API

### Overview
Used for persistent data storage of transactions and portfolio data.

### Authentication
Uses **Service Account** authentication:
- No OAuth flow required
- Server-to-server communication
- Credentials stored in environment variables

### Operations Used

#### 1. Read Data
```typescript
const sheet = await getSheet('Transactions');
const rows = await sheet.getRows();
```

#### 2. Write Data
```typescript
await sheet.addRow({
  id: '123',
  date: '2024-01-15',
  type: 'Buy',
  asset: 'AAPL',
  quantity: 10,
  price: 150.00
});
```

#### 3. Update Data
```typescript
const row = rows[0];
row.quantity = 20;
await row.save();
```

#### 4. Delete Data
```typescript
await row.delete();
```

### Sheet Structure

#### Transactions Sheet
| Column | Type | Description |
|--------|------|-------------|
| id | String | Unique transaction ID |
| date | Date | Transaction date (ISO 8601) |
| type | String | Buy/Sell/Deposit/Withdraw |
| category | String | Stock-US/Stock-TW/Crypto/Gold/Cash |
| asset | String | Symbol/ticker |
| quantity | Number | Number of units |
| price | Number | Price per unit |
| total | Number | Total transaction value |
| status | String | Active/Sold |
| note | String | Optional notes |
| currency | String | USD/TWD/etc |

### Rate Limits
- **Read requests**: 100 per 100 seconds per user
- **Write requests**: 100 per 100 seconds per user
- Quota resets every 100 seconds

### Cost
- **Free** - Google Sheets API is free for personal use
- Included in Google Workspace

### Implementation Files
- `src/lib/googleSheets.ts` - Sheet initialization and helpers
- `src/app/api/*/route.ts` - API routes for CRUD operations

---

## 🛡️ Security Best Practices

### Environment Variables
- Never commit `.env.local` to version control
- Use `.env.template` for documentation
- Rotate API keys periodically

### API Key Storage
- Store in environment variables
- Use Vercel/hosting platform's secret management
- Never expose keys in client-side code

### Rate Limiting
- Implement request caching where appropriate
- Batch requests when possible
- Handle rate limit errors gracefully

---

## 🔧 Troubleshooting

### Yahoo Finance Issues
- **Symbol not found**: Verify symbol format
- **No data returned**: Check if market is open
- **Rate limiting**: Reduce request frequency

### Finnhub Issues
- **401 Unauthorized**: Check API key is correct
- **429 Too Many Requests**: Exceeded rate limit
- **No news returned**: Category may have no recent news

### Google Sheets Issues
- **403 Forbidden**: Service account lacks permissions
- **404 Not Found**: Sheet ID is incorrect
- **Quota exceeded**: Wait for quota reset (100 seconds)

---

## 📚 Additional Resources

- [Yahoo Finance2 Documentation](https://github.com/gadicc/node-yahoo-finance2)
- [Finnhub API Docs](https://finnhub.io/docs/api)
- [Google Sheets API Reference](https://developers.google.com/sheets/api)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
