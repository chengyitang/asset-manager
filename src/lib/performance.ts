import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

export type TimePeriod = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '3Y' | '5Y' | '10Y' | 'MAX';

export interface PerformanceDataPoint {
    date: string;
    value: number; // percentage return from start
}

export interface PerformanceSeries {
    name: string;
    fullName?: string;
    data: PerformanceDataPoint[];
    currentReturn: number;
    color?: string;
}

export function getDateRangeForPeriod(period: TimePeriod): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
        case '1D':
            start.setDate(end.getDate() - 1);
            break;
        case '5D':
            start.setDate(end.getDate() - 5);
            break;
        case '1M':
            start.setMonth(end.getMonth() - 1);
            break;
        case '6M':
            start.setMonth(end.getMonth() - 6);
            break;
        case 'YTD':
            start.setMonth(0);
            start.setDate(1);
            break;
        case '1Y':
            start.setFullYear(end.getFullYear() - 1);
            break;
        case '3Y':
            start.setFullYear(end.getFullYear() - 3);
            break;
        case '5Y':
            start.setFullYear(end.getFullYear() - 5);
            break;
        case '10Y':
            start.setFullYear(end.getFullYear() - 10);
            break;
        case 'MAX':
            start.setFullYear(end.getFullYear() - 20); // 20 years max
            break;
    }

    return { start, end };
}

export async function fetchBenchmarkData(
    symbol: string,
    period: TimePeriod
): Promise<PerformanceDataPoint[]> {
    try {
        const { start, end } = getDateRangeForPeriod(period);

        console.log(`Fetching historical data for ${symbol} from ${start.toISOString()} to ${end.toISOString()}`);

        // yahoo-finance2 historical method
        // Note: historical method may show a deprecation notice but still works
        const result = await yahooFinance.historical(symbol, {
            period1: start,
            period2: end,
            interval: '1d',
        });

        if (!result) {
            console.warn(`No result returned for ${symbol}`);
            return [];
        }

        if (!Array.isArray(result)) {
            console.warn(`Result for ${symbol} is not an array:`, typeof result);
            return [];
        }

        if (result.length === 0) {
            console.warn(`No historical data returned for ${symbol}`);
            return [];
        }

        console.log(`Received ${result.length} data points for ${symbol}, first point:`, {
            date: result[0].date,
            close: result[0].close,
        });

        // Sort by date to ensure chronological order
        const sortedResult = result.sort((a, b) => {
            const dateA = a.date instanceof Date ? a.date : new Date(a.date);
            const dateB = b.date instanceof Date ? b.date : new Date(b.date);
            return dateA.getTime() - dateB.getTime();
        });

        const startPrice = sortedResult[0].close;

        if (!startPrice || startPrice === 0 || isNaN(startPrice)) {
            console.warn(`Invalid start price for ${symbol}:`, startPrice);
            return [];
        }

        const dataPoints = sortedResult.map((quote) => {
            // Ensure date is in YYYY-MM-DD format
            let date: string;
            if (quote.date instanceof Date) {
                date = quote.date.toISOString().split('T')[0];
            } else if (typeof quote.date === 'string') {
                // Try to parse the date string
                const parsedDate = new Date(quote.date);
                if (isNaN(parsedDate.getTime())) {
                    console.warn(`Invalid date format for ${symbol}:`, quote.date);
                    return null;
                }
                date = parsedDate.toISOString().split('T')[0];
            } else {
                console.warn(`Unexpected date type for ${symbol}:`, typeof quote.date, quote.date);
                return null;
            }

            const closePrice = quote.close;
            if (!closePrice || isNaN(closePrice)) {
                return null;
            }

            return {
                date,
                value: ((closePrice - startPrice) / startPrice) * 100,
            };
        }).filter((point): point is PerformanceDataPoint => point !== null);

        console.log(`Processed ${dataPoints.length} valid data points for ${symbol}`);
        return dataPoints;
    } catch (error) {
        console.error(`Error fetching benchmark data for ${symbol}:`, error);
        if (error instanceof Error) {
            console.error(`Error message: ${error.message}`);
            console.error(`Error stack: ${error.stack}`);
        }
        return [];
    }
}

export async function fetchHistoricalPrices(
    symbols: string[],
    period: TimePeriod
): Promise<Record<string, { date: string; price: number }[]>> {
    const { start, end } = getDateRangeForPeriod(period);
    const results: Record<string, { date: string; price: number }[]> = {};

    // Process symbols in batches to avoid rate limits
    const BATCH_SIZE = 5;
    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
        const batch = symbols.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (symbol) => {
            try {
                // Handle special cases for Taiwan stocks if needed (already handled in symbol naming usually)
                // But ensure we have the correct suffix
                let querySymbol = symbol;
                if (/^\d{4}$/.test(symbol)) {
                    querySymbol = `${symbol}.TW`;
                }

                const result = await yahooFinance.historical(querySymbol, {
                    period1: start,
                    period2: end,
                    interval: '1d',
                });

                if (result && Array.isArray(result)) {
                    results[symbol] = result.map(quote => {
                        let dateStr: string;
                        if (quote.date instanceof Date) {
                            dateStr = quote.date.toISOString().split('T')[0];
                        } else {
                            dateStr = new Date(quote.date).toISOString().split('T')[0];
                        }
                        return {
                            date: dateStr,
                            price: quote.close
                        };
                    }).filter(item => item.price !== null && item.price !== undefined && !isNaN(item.price));
                } else {
                    results[symbol] = [];
                }
            } catch (error) {
                console.error(`Error fetching historical prices for ${symbol}:`, error);
                results[symbol] = [];
            }
        }));
    }

    return results;
}

export function calculatePortfolioPerformance(
    transactions: any[],
    historicalPrices: Record<string, { date: string; price: number }[]>,
    period: TimePeriod
): PerformanceDataPoint[] {
    const { start, end } = getDateRangeForPeriod(period);
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    if (transactions.length === 0) {
        return [];
    }

    // Get all transactions up to now
    const allTransactions = transactions.filter((t) => new Date(t.date) <= new Date());

    if (allTransactions.length === 0) {
        return [];
    }

    // Generate all dates in the period
    const dates: string[] = [];
    let currentDate = new Date(start);
    const today = new Date();

    while (currentDate <= end && currentDate <= today) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Helper to get price for a symbol on a specific date
    // Uses the last known price if current date is missing (forward fill)
    const getPrice = (symbol: string, date: string): number => {
        const prices = historicalPrices[symbol];
        if (!prices || prices.length === 0) return 0;

        // Find exact match
        const exact = prices.find(p => p.date === date);
        if (exact) return exact.price;

        // Find last known price before this date
        const prev = prices
            .filter(p => p.date < date)
            .sort((a, b) => b.date.localeCompare(a.date))[0];

        return prev ? prev.price : prices[0].price; // Fallback to first price if no previous
    };

    // Calculate daily portfolio value
    const dataPoints: PerformanceDataPoint[] = [];
    let initialValue = 0;

    dates.forEach((date, index) => {
        // 1. Calculate holdings up to this date
        const holdings: { [symbol: string]: number } = {};
        const transactionsUntilDate = allTransactions.filter(t => t.date.split('T')[0] <= date);

        transactionsUntilDate.forEach(t => {
            if (!holdings[t.asset]) holdings[t.asset] = 0;
            if (t.type === 'Buy' || t.type === 'Deposit') {
                holdings[t.asset] += t.quantity;
            } else if (t.type === 'Sell' || t.type === 'Withdraw') {
                holdings[t.asset] -= t.quantity;
            }
        });

        // 2. Calculate total value using historical prices
        let totalValue = 0;
        Object.entries(holdings).forEach(([symbol, qty]) => {
            if (qty > 0) {
                const price = getPrice(symbol, date);
                totalValue += qty * price;
            }
        });

        // Set initial value from the first day
        if (index === 0) {
            initialValue = totalValue;
        }

        // If initial value is 0 (e.g. no holdings at start), try to set it when we first have value
        if (initialValue === 0 && totalValue > 0) {
            initialValue = totalValue;
        }

        // Calculate percentage return
        // If initial value is still 0, return 0
        const value = initialValue > 0 ? ((totalValue - initialValue) / initialValue) * 100 : 0;

        dataPoints.push({ date, value });
    });

    return dataPoints;
}


export function calculateAssetPerformance(
    symbol: string,
    historicalPrices: Record<string, { date: string; price: number }[]>,
    period: TimePeriod
): PerformanceDataPoint[] {
    const { start, end } = getDateRangeForPeriod(period);

    // Get prices for this symbol
    const prices = historicalPrices[symbol];
    if (!prices || prices.length === 0) {
        return [];
    }

    // Filter prices within the period
    const relevantPrices = prices.filter(p => {
        const d = new Date(p.date);
        return d >= start && d <= end;
    });

    if (relevantPrices.length === 0) {
        return [];
    }

    // Sort by date
    relevantPrices.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate percentage return relative to the first price in the period
    const startPrice = relevantPrices[0].price;

    if (startPrice === 0) return [];

    return relevantPrices.map(p => ({
        date: p.date,
        value: ((p.price - startPrice) / startPrice) * 100
    }));
}

export function groupTransactionsByCategory(transactions: any[]): {
    usStocks: any[];
    taiwanStocks: any[];
    crypto: any[];
} {
    const usStocks: any[] = [];
    const taiwanStocks: any[] = [];
    const crypto: any[] = [];

    transactions.forEach((t) => {
        if (t.category === 'Crypto') {
            crypto.push(t);
        } else if (t.category === 'Stock') {
            // Detect Taiwan stocks by symbol pattern
            if (t.asset.endsWith('.TW') || t.asset.endsWith('.TWO') || /^\d{4}$/.test(t.asset)) {
                taiwanStocks.push(t);
            } else {
                usStocks.push(t);
            }
        }
    });

    return { usStocks, taiwanStocks, crypto };
}
