import { NextResponse } from 'next/server';
import { getSheet, SHEET_TITLES } from '@/lib/googleSheets';
import { Asset, AssetCategorySummary, AssetCategory } from '@/types';
import { getPriceMap } from '@/lib/prices';

export async function GET() {
    try {
        const sheet = await getSheet(SHEET_TITLES.TRANSACTIONS);
        const rows = await sheet.getRows();

        // Sort rows by date to calculate WAC correctly
        const transactions = rows.map((row) => ({
            date: new Date(row.get('date')),
            type: row.get('type'),
            category: row.get('category'), // Get category
            asset: row.get('asset'),
            quantity: parseFloat(row.get('quantity')),
            price: parseFloat(row.get('price')),
            currency: row.get('currency') as "USD" | "NTD" || 'USD',
        })).sort((a, b) => a.date.getTime() - b.date.getTime());

        // Calculate holdings and WAC
        const holdings: Record<string, Asset> = {};

        transactions.forEach((t) => {
            if (!holdings[t.asset]) {
                // Determine type: Use explicit category if available, else fallback to heuristic
                let assetType = t.category;
                if (!assetType) {
                    // Fallback classification for old transactions without category
                    if (['BTC', 'ETH', 'SOL', 'USDT', 'USDC'].includes(t.asset)) {
                        assetType = 'Crypto';
                    } else if (['USD', 'NTD'].includes(t.asset)) {
                        assetType = 'Cash';
                    } else if (['GLD', 'GOLD', 'XAU', 'IAU'].includes(t.asset)) {
                        assetType = 'Gold';
                    } else if (/^\d{4}$/.test(t.asset)) {
                        // Taiwan stocks: 4-digit symbols
                        assetType = 'Stock-TW';
                    } else {
                        // Default to US stocks
                        assetType = 'Stock-US';
                    }
                }

                holdings[t.asset] = {
                    id: t.asset,
                    symbol: t.asset,
                    name: t.asset,
                    type: assetType,
                    quantity: 0,
                    price: 0,
                    value: 0,
                    change: 0,
                    change24h: 0,
                    avgCost: 0,
                    unrealizedPL: 0,
                    marketValue: 0,
                    totalChangePercentage: 0,
                    weight: 0,
                };
            }

            const asset = holdings[t.asset];

            if (t.type === 'Buy' || t.type === 'Deposit') {
                // Calculate WAC
                const totalCost = (asset.quantity * asset.avgCost) + (t.quantity * t.price);
                const totalQty = asset.quantity + t.quantity;
                asset.avgCost = totalQty > 0 ? totalCost / totalQty : 0;
                asset.quantity = totalQty;
            } else if (t.type === 'Sell' || t.type === 'Withdraw') {
                asset.quantity -= t.quantity;
                // WAC doesn't change on sell
            }
        });

        // Filter out zero quantity assets
        let assetsList = Object.values(holdings).filter(a => a.quantity > 0.000001); // Tolerance for float errors

        // Fetch exchange rate for NTD to USD conversion
        const forexRes = await fetch('http://localhost:3000/api/forex');
        const forexData = await forexRes.json();
        const usdToNtdRate = forexData.rate || 32.5; // Default fallback

        // Fetch Real-time Prices
        const priceMap = await getPriceMap(assetsList.map(a => ({ symbol: a.symbol, type: a.type })));

        assetsList = assetsList.map(a => {
            const priceData = priceMap[a.symbol];
            let nativePrice = 0;
            let nativeValue = 0;
            let usdValue = 0;
            let nativeUnrealizedPL = 0;

            if (priceData) {
                a.name = priceData.name || a.symbol; // Update name from price data

                // Handle Taiwan stocks: 4-6 digit symbols
                if (/^\d{4,6}$/.test(a.symbol)) {
                    console.log(`[Debug] TW Stock: ${a.symbol}, Price: ${priceData.price}, Qty: ${a.quantity}, NativeValue: ${a.quantity * 1000 * priceData.price}`);
                    // Taiwan stocks: Price is in NTD
                    nativePrice = priceData.price;
                    // Value in NTD (Quantity is in lots, so * 1000)
                    nativeValue = a.quantity * 1000 * nativePrice;
                    // Value in USD for weight calculation
                    usdValue = nativeValue / usdToNtdRate;

                    // Cost is already in NTD (from transactions)
                    // Unrealized PL in NTD
                    nativeUnrealizedPL = nativeValue - (a.quantity * 1000 * a.avgCost);
                } else {
                    // US Stocks / Crypto / Gold: Price is in USD
                    nativePrice = priceData.price;
                    nativeValue = a.quantity * nativePrice;
                    usdValue = nativeValue; // Native is USD
                    nativeUnrealizedPL = nativeValue - (a.quantity * a.avgCost);
                }

                a.change24h = priceData.changePercent;
            } else {
                console.log(`[Debug] No price data for: ${a.symbol}`);
                // Fallback
                nativePrice = a.avgCost;

                if (/^\d{4,6}$/.test(a.symbol)) {
                    nativeValue = a.quantity * 1000 * nativePrice;
                    usdValue = nativeValue / usdToNtdRate;
                } else {
                    nativeValue = a.quantity * nativePrice;
                    usdValue = nativeValue;
                }
            }

            // Store calculated values
            // We use 'marketValue' to store the NATIVE value for display in category totals
            // But we need USD value for portfolio weight calculation
            a.marketValue = nativeValue;
            a.unrealizedPL = nativeUnrealizedPL;

            // Ensure currency is set for Cash assets if not already set by price logic
            if (a.type === 'Cash' && !a.currency) {
                // Find a transaction for this asset to get the currency
                const tx = transactions.find(t => t.asset === a.symbol);
                if (tx) {
                    a.currency = tx.currency || 'USD';
                } else {
                    a.currency = 'USD';
                }
            }

            // Attach usdValue for later aggregation
            (a as any).usdValue = usdValue;

            return a;
        });

        // Calculate total portfolio value in USD for weight calculation
        const totalPortfolioValueUSD = assetsList.reduce((sum, asset) => sum + ((asset as any).usdValue || 0), 0);

        // Group assets by category and calculate aggregates
        const categoryMap: Record<AssetCategory, AssetCategorySummary & { totalCost: number, totalUnrealizedPL: number }> = {
            'Stock-US': { category: 'Stock-US', totalValue: 0, currency: 'USD', changePercent: 0, weight: 0, assetCount: 0, totalCost: 0, totalUnrealizedPL: 0 },
            'Stock-TW': { category: 'Stock-TW', totalValue: 0, currency: 'NTD', changePercent: 0, weight: 0, assetCount: 0, totalCost: 0, totalUnrealizedPL: 0 },
            'Crypto': { category: 'Crypto', totalValue: 0, currency: 'USD', changePercent: 0, weight: 0, assetCount: 0, totalCost: 0, totalUnrealizedPL: 0 },
            'Gold': { category: 'Gold', totalValue: 0, currency: 'USD', changePercent: 0, weight: 0, assetCount: 0, totalCost: 0, totalUnrealizedPL: 0 },
            'Cash': { category: 'Cash', totalValue: 0, currency: 'USD', changePercent: 0, weight: 0, assetCount: 0, totalCost: 0, totalUnrealizedPL: 0 },
        };

        assetsList.forEach(asset => {
            const category = categoryMap[asset.type];
            if (category) {
                // totalValue accumulates NATIVE value (e.g. NTD for Stock-TW)
                category.totalValue += asset.marketValue;
                category.totalUnrealizedPL += asset.unrealizedPL;

                // Accumulate total cost in native currency
                if (/^\d{4,6}$/.test(asset.symbol)) {
                    category.totalCost += asset.quantity * 1000 * asset.avgCost;
                } else {
                    category.totalCost += asset.quantity * asset.avgCost;
                }

                category.assetCount += 1;
            }
        });

        // Calculate final percentages and weights
        const categories: AssetCategorySummary[] = Object.values(categoryMap).map(category => {
            // Calculate Total Change % = (Total Unrealized PL / Total Cost) * 100
            if (category.totalCost > 0) {
                category.changePercent = (category.totalUnrealizedPL / category.totalCost) * 100;
            } else {
                category.changePercent = 0;
            }

            // Calculate weight as percentage of total portfolio (using USD values)
            // We need to re-sum the USD value for this category
            const categoryTotalUSD = assetsList
                .filter(a => a.type === category.category)
                .reduce((sum, a) => sum + ((a as any).usdValue || 0), 0);

            category.weight = totalPortfolioValueUSD > 0 ? (categoryTotalUSD / totalPortfolioValueUSD) * 100 : 0;

            // Remove internal tracking properties before returning
            const { totalCost, totalUnrealizedPL, ...summary } = category;
            return summary;
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching asset categories:', error);
        return NextResponse.json({ error: 'Failed to fetch asset categories' }, { status: 500 });
    }
}
