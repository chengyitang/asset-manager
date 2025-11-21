import { NextResponse } from 'next/server';
import { getSheet, SHEET_TITLES } from '@/lib/googleSheets';
import { calculatePortfolioPerformance, TimePeriod, fetchHistoricalPrices, calculateAssetPerformance } from '@/lib/performance';
import { getPriceMap } from '@/lib/prices';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const period = (searchParams.get('period') || '1Y') as TimePeriod;

        // Fetch transactions
        const sheet = await getSheet(SHEET_TITLES.TRANSACTIONS);
        const rows = await sheet.getRows();

        const transactions = rows.map((row) => ({
            id: row.get('id'),
            date: row.get('date'),
            type: row.get('type'),
            category: row.get('category') || 'Stock',
            asset: row.get('asset'),
            quantity: parseFloat(row.get('quantity')),
            price: parseFloat(row.get('price')),
            total: parseFloat(row.get('total')),
            status: row.get('status'),
            note: row.get('note'),
        }));

        // Get unique symbols and types
        const uniqueAssetsMap = new Map<string, { symbol: string, type: string }>();
        transactions.forEach(t => {
            if (!uniqueAssetsMap.has(t.asset)) {
                let type = t.category;
                if (!type) {
                    if (['BTC', 'ETH', 'SOL', 'USDT', 'USDC'].includes(t.asset)) type = 'Crypto';
                    else if (['USD', 'NTD'].includes(t.asset)) type = 'Cash';
                    else type = 'Stock';
                }
                uniqueAssetsMap.set(t.asset, { symbol: t.asset, type });
            }
        });
        const uniqueAssets = Array.from(uniqueAssetsMap.values());
        const symbols = Array.from(uniqueAssetsMap.keys());

        // Get current prices
        const priceMap = await getPriceMap(uniqueAssets);

        // Get historical prices
        const historicalPrices = await fetchHistoricalPrices(uniqueAssets.map(a => a.symbol), period);

        // Calculate performance for each symbol
        const symbolPerformance: any = {};

        symbols.forEach((symbol) => {
            // Calculate asset price performance instead of portfolio performance
            const performance = calculateAssetPerformance(symbol, historicalPrices, period);

            if (performance.length > 0) {
                symbolPerformance[symbol] = {
                    name: symbol,
                    fullName: priceMap[symbol]?.name || symbol,
                    data: performance,
                    currentReturn: performance[performance.length - 1].value,
                };
            }
        });

        return NextResponse.json(symbolPerformance);
    } catch (error) {
        console.error('Error calculating symbol performance:', error);
        return NextResponse.json({ error: 'Failed to calculate symbol performance' }, { status: 500 });
    }
}
