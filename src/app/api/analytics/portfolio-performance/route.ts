import { NextResponse } from 'next/server';
import { getSheet, SHEET_TITLES } from '@/lib/googleSheets';
import { calculatePortfolioPerformance, groupTransactionsByCategory, TimePeriod, fetchHistoricalPrices } from '@/lib/performance';
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

        // Get current prices
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
        const priceMap = await getPriceMap(uniqueAssets); // Keep this if current prices are still needed elsewhere, otherwise remove.

        // Group transactions by category
        const { usStocks, taiwanStocks, crypto } = groupTransactionsByCategory(transactions);

        // Get historical prices
        const historicalPrices = await fetchHistoricalPrices(uniqueAssets.map(a => a.symbol), period);

        // Calculate performance for each category
        const usStocksPerformance = calculatePortfolioPerformance(usStocks, historicalPrices, period);
        const taiwanStocksPerformance = calculatePortfolioPerformance(taiwanStocks, historicalPrices, period);
        const cryptoPerformance = calculatePortfolioPerformance(crypto, historicalPrices, period);

        return NextResponse.json({
            usStocks: {
                name: 'My US Stocks',
                data: usStocksPerformance,
                currentReturn: usStocksPerformance.length > 0 ? usStocksPerformance[usStocksPerformance.length - 1].value : 0,
                color: '#ef4444',
            },
            taiwanStocks: {
                name: 'My Taiwan Stocks',
                data: taiwanStocksPerformance,
                currentReturn: taiwanStocksPerformance.length > 0 ? taiwanStocksPerformance[taiwanStocksPerformance.length - 1].value : 0,
                color: '#8b5cf6',
            },
            crypto: {
                name: 'My Crypto',
                data: cryptoPerformance,
                currentReturn: cryptoPerformance.length > 0 ? cryptoPerformance[cryptoPerformance.length - 1].value : 0,
                color: '#f97316',
            },
        });
    } catch (error) {
        console.error('Error calculating portfolio performance:', error);
        return NextResponse.json({ error: 'Failed to calculate portfolio performance' }, { status: 500 });
    }
}
