import { NextResponse } from 'next/server';
import { getSheet, SHEET_TITLES } from '@/lib/googleSheets';
import { calculatePortfolioPerformance, fetchHistoricalPrices, TimePeriod } from '@/lib/performance';

export async function GET(request: Request) {
    try {
        // Get currency from query params
        const { searchParams } = new URL(request.url);
        const currency = searchParams.get('currency') || 'USD';

        // Fetch assets
        const assetsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/assets`, {
            cache: 'no-store'
        });
        const assets = assetsRes.ok ? await assetsRes.json() : [];

        // Fetch liabilities
        const liabilitiesRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/liabilities`, {
            cache: 'no-store'
        });
        const liabilities = liabilitiesRes.ok ? await liabilitiesRes.json() : [];

        // Calculate totals
        const totalAssets = assets.reduce((sum: number, asset: any) => sum + (asset.marketValue || 0), 0);
        const totalLiabilities = liabilities.reduce((sum: number, liability: any) => {
            return sum + (liability.status === 'Active' ? liability.amount : 0);
        }, 0);
        const netWorth = totalAssets - totalLiabilities;

        // Calculate real daily change based on asset change24h
        // Weighted average of asset changes based on their market value
        let weightedChange = 0;
        assets.forEach((asset: any) => {
            if (asset.marketValue && totalAssets > 0) {
                const weight = asset.marketValue / totalAssets;
                weightedChange += (asset.change24h || 0) * weight;
            }
        });

        const dailyChange = totalAssets * (weightedChange / 100);
        const dailyChangePercent = weightedChange;

        // Calculate YTD Growth
        let ytdGrowthPercent = 0;
        try {
            // Fetch transactions for performance calculation
            const sheet = await getSheet(SHEET_TITLES.TRANSACTIONS);
            const rows = await sheet.getRows();
            const transactions = rows.map((row) => ({
                date: row.get('date'),
                type: row.get('type'),
                category: row.get('category'),
                asset: row.get('asset'),
                quantity: parseFloat(row.get('quantity')),
                price: parseFloat(row.get('price')),
            }));

            // Get unique assets for historical prices
            const uniqueAssets = Array.from(new Set(transactions.map(t => t.asset)));

            // Fetch historical prices for YTD
            const historicalPrices = await fetchHistoricalPrices(uniqueAssets, 'YTD');

            // Calculate performance
            const performanceData = calculatePortfolioPerformance(transactions, historicalPrices, 'YTD');

            if (performanceData.length > 0) {
                ytdGrowthPercent = performanceData[performanceData.length - 1].value;
            }
        } catch (error) {
            console.error('Error calculating YTD growth:', error);
            // Fallback to 0 if calculation fails
        }

        // Fetch forex rate for currency conversion
        let conversionRate = 1;
        if (currency === 'NTD') {
            try {
                const forexRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/forex`, {
                    cache: 'no-store'
                });
                const forexData = await forexRes.json();
                conversionRate = forexData.rate || 32.5; // Default fallback
            } catch (error) {
                console.error('Error fetching forex rate:', error);
                conversionRate = 32.5; // Fallback rate
            }
        }

        // Apply currency conversion to monetary values
        const convertedTotalAssets = totalAssets * conversionRate;
        const convertedTotalLiabilities = totalLiabilities * conversionRate;
        const convertedNetWorth = netWorth * conversionRate;
        const convertedDailyChange = dailyChange * conversionRate;

        return NextResponse.json({
            totalAssets: convertedTotalAssets,
            totalLiabilities: convertedTotalLiabilities,
            netWorth: convertedNetWorth,
            dailyChange: convertedDailyChange,
            dailyChangePercent,
            ytdGrowthPercent,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
