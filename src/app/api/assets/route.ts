import { NextResponse } from 'next/server';
import { getSheet, SHEET_TITLES } from '@/lib/googleSheets';
import { Asset } from '@/types';
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
        // Calculate holdings and WAC
        const holdings: Record<string, Asset & { firstBuyDate?: Date }> = {};

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
                    } else if (/^\d{4,6}$/.test(t.asset)) {
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
                    currency: t.currency || 'USD', // Initialize with transaction currency
                };
            }

            const asset = holdings[t.asset];

            if (t.type === 'Buy' || t.type === 'Deposit') {
                // Calculate WAC
                const totalCost = (asset.quantity * asset.avgCost) + (t.quantity * t.price);
                const totalQty = asset.quantity + t.quantity;
                asset.avgCost = totalQty > 0 ? totalCost / totalQty : 0;
                asset.quantity = totalQty;

                // Track first buy date
                if (!asset.firstBuyDate && asset.quantity > 0) {
                    asset.firstBuyDate = t.date;
                }
            } else if (t.type === 'Sell' || t.type === 'Withdraw') {
                asset.quantity -= t.quantity;
                // Reset first buy date if quantity becomes 0
                if (asset.quantity <= 0.000001) {
                    asset.firstBuyDate = undefined;
                }
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
            if (priceData) {
                a.name = priceData.name || a.symbol; // Update name from price data

                // Handle Taiwan stocks: multiply by 1000 (1 張 = 1000 股) and convert to USD
                // Detect Taiwan stocks by 4-digit symbol pattern
                if (/^\d{4,6}$/.test(a.symbol)) {
                    // Calculate USD values for global totals
                    a.price = (priceData.price * 1000) / usdToNtdRate;
                    a.change = (priceData.change * 1000) / usdToNtdRate;
                    a.avgCost = (a.avgCost * 1000) / usdToNtdRate;

                    // Calculate Original (TWD) values for display
                    a.currency = 'NTD';
                    a.originalPrice = priceData.price; // Price per share in TWD
                    a.originalCost = (a.avgCost * usdToNtdRate) / 1000; // Cost per share in TWD
                    a.originalChange = priceData.change; // Change per share in TWD
                    a.originalValue = a.quantity * a.originalPrice * 1000; // Total value in TWD (Quantity is in lots)
                    a.originalUnrealizedPL = a.originalValue - (a.quantity * a.originalCost * 1000); // Unrealized PL in TWD
                } else {
                    a.price = priceData.price;
                    a.change = priceData.change;
                    a.currency = 'USD';
                }

                a.change24h = priceData.changePercent;
            } else {
                // Fallback if no price found: use avgCost as current price so PL is 0, or keep 0
                a.price = a.price || a.avgCost;
            }

            a.marketValue = a.quantity * a.price;
            a.value = a.marketValue; // Keep value for backward compatibility if needed
            a.unrealizedPL = a.marketValue - (a.quantity * a.avgCost);

            // Calculate Days Held
            if (a.firstBuyDate) {
                const diffTime = Math.abs(new Date().getTime() - a.firstBuyDate.getTime());
                a.daysHeld = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            return a;
        });

        // Calculate total portfolio value and category totals
        const totalPortfolioValue = assetsList.reduce((sum, asset) => sum + asset.marketValue, 0);
        const categoryTotals: Record<string, number> = {};
        assetsList.forEach(a => {
            categoryTotals[a.type] = (categoryTotals[a.type] || 0) + a.marketValue;
        });

        assetsList = assetsList.map(a => {
            a.weight = totalPortfolioValue > 0 ? (a.marketValue / totalPortfolioValue) * 100 : 0;

            // Calculate category weight
            const categoryTotal = categoryTotals[a.type] || 0;
            a.categoryWeight = categoryTotal > 0 ? (a.marketValue / categoryTotal) * 100 : 0;

            const totalCost = a.quantity * a.avgCost;
            a.totalChangePercentage = totalCost > 0 ? (a.unrealizedPL / totalCost) * 100 : 0;

            return a;
        });

        return NextResponse.json(assetsList);
    } catch (error) {
        console.error('Error fetching assets:', error);
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}
