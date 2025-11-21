# 💰 Asset Manager

> 🇹🇼 為台灣留學生和投資人設計的個人資產管理工具  
> Designed for Taiwanese students and investors managing cross-border portfolios

A modern, full-featured personal asset management application built with Next.js. **Specifically designed for Taiwanese students and investors** who need to track investments across **US and Taiwan stock markets**, along with cryptocurrencies, gold, and cash holdings.

**Primary Focus**: US Stocks (美股) & Taiwan Stocks (台股)

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

### 📊 Cross-Border Portfolio Management
- **🇺🇸 US Stock Market**: Track NASDAQ, NYSE, and other US exchanges
- **🇹🇼 Taiwan Stock Market**: Full support for TWSE (台灣證券交易所) stocks
- **Multi-Currency**: Automatic USD/TWD conversion and tracking
- **Additional Assets**: Cryptocurrency, gold, and cash account management
- **Transaction History**: Complete buy/sell/deposit/withdraw transaction logging

### 📈 Real-Time Market Data
- Live price updates via **Yahoo Finance API**
- Historical performance charts
- Daily change tracking with percentage returns
- Multi-currency support (USD, TWD)

### 📰 Financial News Integration
- Latest financial news via **Finnhub API**
- Category-specific news filtering
- Company-specific news for your holdings
- Automatic news refresh at market open (9 AM ET)

### 📉 Advanced Analytics
- Portfolio performance over multiple time periods (1D, 5D, 1M, 6M, YTD, 1Y, 3Y, 5Y, 10Y, MAX)
- Benchmark comparison (S&P 500, NASDAQ, etc.)
- Asset allocation visualization
- Individual asset performance tracking

### 💾 Data Storage
- **Google Sheets Integration**: Your data is stored in your own Google Sheet
- Complete data ownership and privacy
- Easy data backup and export
- No vendor lock-in

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Data Storage**: [Google Sheets API](https://developers.google.com/sheets/api)
- **Market Data**: [Yahoo Finance API](https://github.com/gadicc/node-yahoo-finance2) (via yahoo-finance2)
- **News API**: [Finnhub](https://finnhub.io/) (optional)

## 🎯 Why This App for Taiwanese Students & Investors?

Managing investments across US and Taiwan markets can be challenging:

- 📊 **Cross-Border Portfolio**: Track both US stocks (美股) and Taiwan stocks (台股) in one place
- 💱 **Multi-Currency**: Automatic USD/TWD conversion and tracking
- 🌏 **Time Zone Friendly**: Works across different market hours (US: EST, Taiwan: GMT+8)
- 🔒 **Data Privacy**: Your data stays in YOUR Google Sheet - no third-party servers
- 💰 **Cost-Free**: No subscription fees, completely free to use
- 🎓 **Student-Friendly**: Easy setup, no complex infrastructure needed

Perfect for:
- 🎓 Taiwanese students studying abroad managing investments in both markets
- 💼 Investors with cross-border portfolios
- 🌐 Anyone needing to track USD and TWD assets simultaneously

---

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn** or **pnpm**
- **Google Cloud Account** (for Google Sheets API)
- **Finnhub API Key** (optional, for news features)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/chengyitang/AssetManager.git
cd assetManager
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Google Sheets API

#### Step 3.1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

#### Step 3.2: Create a Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - **Name**: `asset-manager-service`
   - **Description**: `Service account for Asset Manager app`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

#### Step 3.3: Generate Service Account Key

1. Click on the newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select **JSON** format
5. Click "Create" - a JSON file will be downloaded

#### Step 3.4: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new blank spreadsheet
3. Name it "Asset Manager Data" (or any name you prefer)
4. Copy the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```
5. Share the sheet with your service account email:
   - Click "Share" button
   - Paste the service account email (found in the JSON file: `client_email`)
   - Give it "Editor" permissions
   - Uncheck "Notify people"
   - Click "Share"

### 4. Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp env.template .env.local
   ```

2. Open `.env.local` and fill in your credentials:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"

# Optional: Finnhub API for News (get free API key at https://finnhub.io/)
FINNHUB_API_KEY=your_finnhub_api_key_here
```

**Important Notes:**
- The `GOOGLE_PRIVATE_KEY` must include the `\n` characters for line breaks
- You can find all these values in the JSON file downloaded in Step 3.3
- The Finnhub API key is optional - the app will use mock news data if not provided

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

### Adding Transactions

1. Navigate to the "Transactions" page
2. Click "Add Transaction"
3. Fill in the transaction details:
   - **Type**: Buy, Sell, Deposit, or Withdraw
   - **Category**: Stock-US, Stock-TW, Crypto, Gold, or Cash
   - **Asset Symbol**: Stock ticker (e.g., AAPL, 2330) or crypto symbol (e.g., BTC)
   - **Quantity**: Number of shares/units
   - **Price**: Price per unit
   - **Date**: Transaction date
4. Click "Save"

### Viewing Portfolio

- **Dashboard**: Overview of total portfolio value, daily change, and asset allocation
- **Assets**: Detailed breakdown by category with individual asset performance
- **Analytics**: Performance charts comparing your portfolio to market benchmarks
- **Transactions**: Complete transaction history with filtering and search

### Symbol Format Guide

#### Primary Markets (主要市場)
- **🇺🇸 US Stocks**: Use standard ticker symbols
  - Examples: `AAPL` (Apple), `GOOGL` (Google), `TSLA` (Tesla), `NVDA` (NVIDIA)
- **🇹🇼 Taiwan Stocks**: Use 4-digit stock codes (自動加上 .TW 後綴)
  - Examples: `2330` (台積電 TSMC), `2317` (鴻海 Foxconn), `2454` (聯發科 MediaTek)

#### Additional Assets (額外資產)
- **Cryptocurrencies**: Use symbol without suffix (e.g., `BTC`, `ETH`) - `-USD` is added automatically
- **Gold**: Use `GC=F` for gold futures or `GOLD` for gold ETFs
- **Cash**: Use currency codes (e.g., `USD`, `TWD`)

## 🌐 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/chengyitang/AssetManager)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Configure environment variables in Vercel:
   - Add all variables from your `.env.local`
4. Click "Deploy"

### Manual Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Environment Variables for Production

Make sure to set these environment variables in your hosting platform:
- `GOOGLE_SHEET_ID`
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `FINNHUB_API_KEY` (optional)

## 🔒 Data Privacy & Security

Especially important for cross-border financial data:

- **🔐 Your Data, Your Control**: All transaction data is stored in YOUR Google Sheet
- **🚫 No Third-Party Storage**: This app doesn't store your data on any external servers
- **🌏 Cross-Border Safe**: Manage US and Taiwan investments without data leaving your control
- **🔑 Service Account Security**: The Google Service Account only has access to the specific sheet you share with it
- **🔒 Environment Variables**: Sensitive credentials are stored in environment variables, never in code
- **📖 Open Source**: Full transparency - you can audit the entire codebase
- **💼 Student-Safe**: No need to trust third-party services with your financial data

## 🔧 Configuration

### Customizing Asset Categories

Edit the categories in `src/app/api/assets/categories/route.ts` to add or modify asset types.

### Changing News Sources

The app uses Finnhub by default. To switch to another news provider, modify `src/lib/news.ts`.

### Adjusting Update Intervals

- **Price Updates**: Configured in the dashboard components (default: manual refresh)
- **News Updates**: Set to refresh at 9 AM ET daily (configurable in `src/lib/news.ts`)

## 🐛 Troubleshooting

### "Missing Google Sheets credentials" Error

- Verify that `.env.local` exists and contains all required variables
- Check that the `GOOGLE_PRIVATE_KEY` includes the full key with `\n` characters
- Ensure the service account email has Editor access to your Google Sheet

### Prices Not Loading

- Check your internet connection
- Verify the symbol format (see Symbol Format Guide above)
- Some stocks may not be available on Yahoo Finance
- Taiwan stocks require `.TW` suffix (added automatically for 4-digit symbols)

### News Not Showing

- If you haven't set `FINNHUB_API_KEY`, the app will show mock news data
- Get a free API key at [Finnhub.io](https://finnhub.io/)
- Free tier allows 60 API calls per minute

## 📚 API Documentation

### Yahoo Finance API (via yahoo-finance2)

This app uses the [yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2) library to fetch:
- Real-time stock quotes
- Historical price data
- Forex rates
- Company information

**Rate Limits**: Yahoo Finance doesn't publish official rate limits, but the library implements reasonable defaults.

**No API Key Required**: Yahoo Finance API is free and doesn't require authentication.

### Finnhub API

Used for financial news. Features:
- General market news
- Company-specific news
- Category filtering (general, forex, crypto, merger)

**Free Tier**: 60 API calls/minute
**Get API Key**: [https://finnhub.io/register](https://finnhub.io/register)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Vercel](https://vercel.com/) - Hosting and deployment
- [Yahoo Finance](https://finance.yahoo.com/) - US and Taiwan market data
- [Finnhub](https://finnhub.io/) - Financial news
- [Radix UI](https://www.radix-ui.com/) - Accessible UI components
- [Shadcn UI](https://ui.shadcn.com/) - UI component inspiration

Special thanks to the Taiwanese student and investor community for inspiration! 🇹🇼

## 📧 Support

If you have any questions or run into issues, please:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/chengyitang/AssetManager/issues)
3. Create a new issue with detailed information

---

**Built with ❤️ using Next.js and TypeScript**
