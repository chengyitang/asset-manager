import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

export interface PriceData {
    price: number;
    change: number;
    changePercent: number;
    currency: string;
    name?: string; // Add name field
}

export async function getQuotes(symbols: string[]) {
    if (symbols.length === 0) return [];
    try {
        // yahoo-finance2 quote method accepts a single string or an array of strings
        console.log('Fetching quotes for:', symbols);
        const results = await yahooFinance.quote(symbols);
        console.log('Quote results:', JSON.stringify(results, null, 2));
        return Array.isArray(results) ? results : [results];
    } catch (error) {
        console.error('Error fetching quotes:', error);
        return [];
    }
}

// Get symbol info including name
export async function getSymbolInfo(symbol: string, type: string): Promise<{ name: string; fullSymbol: string }> {
    try {
        let fetchSymbol = symbol;

        if (type === 'Crypto' && !symbol.includes('-')) {
            fetchSymbol = `${symbol}-USD`;
        } else if (type === 'Stock-TW' && !symbol.endsWith('.TW')) {
            fetchSymbol = `${symbol}.TW`;
        }

        const quote = await yahooFinance.quote(fetchSymbol);
        return {
            name: quote.longName || quote.shortName || symbol,
            fullSymbol: fetchSymbol
        };
    } catch (error) {
        console.error(`Error fetching symbol info for ${symbol}:`, error);
        return { name: symbol, fullSymbol: symbol };
    }
}

export async function getPriceMap(assets: { symbol: string, type: string }[]) {
    const symbolMapping: Record<string, string> = {};
    const symbolsToFetch: string[] = [];

    assets.forEach(a => {
        let fetchSymbol = a.symbol;

        if (a.type === 'Crypto' && !a.symbol.includes('-')) {
            fetchSymbol = `${a.symbol}-USD`;
        } else if (a.type === 'Stock-TW' && !a.symbol.endsWith('.TW')) {
            fetchSymbol = `${a.symbol}.TW`;
        }

        symbolMapping[fetchSymbol] = a.symbol; // Map fetched symbol back to original
        symbolsToFetch.push(fetchSymbol);
    });

    const uniqueSymbols = Array.from(new Set(symbolsToFetch));
    if (uniqueSymbols.length === 0) return {};

    const quotes = await getQuotes(uniqueSymbols) as any[];

    const priceMap: Record<string, PriceData> = {};

    quotes.forEach(q => {
        if (q && q.symbol) {
            // Find the original symbol(s) that mapped to this fetched symbol
            // In our simple case, it's 1-to-1 usually, but let's use the mapping
            const originalSymbol = symbolMapping[q.symbol];
            if (originalSymbol) {
                priceMap[originalSymbol] = {
                    price: q.regularMarketPrice || 0,
                    change: q.regularMarketChange || 0,
                    changePercent: q.regularMarketChangePercent || 0,
                    currency: q.currency || 'USD',
                    name: q.longName || q.shortName || originalSymbol,
                };
            }
            // Also store by fetched symbol just in case
            priceMap[q.symbol] = {
                price: q.regularMarketPrice || 0,
                change: q.regularMarketChange || 0,
                changePercent: q.regularMarketChangePercent || 0,
                currency: q.currency || 'USD',
                name: q.longName || q.shortName || q.symbol,
            };
        }
    });

    return priceMap;
}

export async function getForexRate(from: string, to: string): Promise<number> {
    try {
        const symbol = `${from}${to}=X`;
        const result = await yahooFinance.quote(symbol);
        return result.regularMarketPrice || 0;
    } catch (error) {
        console.error(`Error fetching forex rate for ${from}/${to}:`, error);
        return 0;
    }
}
