// News API functions - API key should be passed from environment variables

export interface NewsArticle {
    id: string;
    title: string;
    description: string;
    url: string;
    source: string;
    publishedAt: string;
    imageUrl?: string;
}

export interface NewsResponse {
    articles: NewsArticle[];
    lastUpdated: string;
    nextUpdate: string;
}

interface FinnhubNewsItem {
    category: string;
    datetime: number;
    headline: string;
    id: number;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}

interface FinnhubCompanyNewsItem {
    category: string;
    datetime: number;
    headline: string;
    id: number;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}

// Fetch general news from Finnhub API
export async function fetchFinnhubNews(apiKey: string, category: string): Promise<FinnhubNewsItem[]> {
    try {
        const response = await fetch(
            `https://finnhub.io/api/v1/news?category=${category}&token=${apiKey}`
        );

        if (!response.ok) {
            console.error(`Finnhub API error for ${category}:`, response.status);
            return [];
        }

        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error(`Error fetching Finnhub news for ${category}:`, error);
        return [];
    }
}

// Fetch company-specific news from Finnhub API
export async function fetchCompanyNews(apiKey: string, symbol: string, daysBack: number = 7): Promise<FinnhubCompanyNewsItem[]> {
    try {
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - daysBack);

        const from = fromDate.toISOString().split('T')[0];
        const to = toDate.toISOString().split('T')[0];

        const response = await fetch(
            `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${apiKey}`
        );

        if (!response.ok) {
            console.error(`Finnhub API error for company ${symbol}:`, response.status);
            return [];
        }

        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error(`Error fetching company news for ${symbol}:`, error);
        return [];
    }
}

// Check if news item is relevant based on keywords
function isRelevantNews(item: FinnhubNewsItem | FinnhubCompanyNewsItem, keywords: string[]): boolean {
    const text = `${item.headline} ${item.summary}`.toLowerCase();
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
}

// Stricter filtering for Taiwan stocks - requires strong Taiwan signals
function isTaiwanStockRelevant(item: FinnhubNewsItem | FinnhubCompanyNewsItem): boolean {
    const text = `${item.headline} ${item.summary}`.toLowerCase();

    // Strong Taiwan indicators (any one of these is sufficient)
    const strongIndicators = ['tsmc', 'taiwan semiconductor', 'taiex', 'taipei exchange'];
    if (strongIndicators.some(indicator => text.includes(indicator))) {
        return true;
    }

    // Require Taiwan + semiconductor/chip together
    if (text.includes('taiwan') && (text.includes('semiconductor') || text.includes('chip'))) {
        return true;
    }

    // Require Taiwan + stock/market/index
    if (text.includes('taiwan') && (text.includes('stock') || text.includes('market') || text.includes('index'))) {
        return true;
    }

    return false;
}

// Convert Finnhub news to our format
function convertFinnhubNews(
    items: (FinnhubNewsItem | FinnhubCompanyNewsItem)[],
    limit: number
): NewsArticle[] {
    return items.slice(0, limit).map((item) => ({
        id: item.id.toString(),
        title: item.headline,
        description: item.summary || item.headline,
        url: item.url,
        source: item.source,
        publishedAt: new Date(item.datetime * 1000).toISOString(),
        imageUrl: item.image,
    }));
}

// Fetch random finance news
export async function getFinanceNews(apiKey?: string): Promise<NewsArticle[]> {
    // If no API key provided, return mock data
    if (!apiKey) {
        console.log('No Finnhub API key provided, using mock data');
        return getMockFinanceNews();
    }

    try {
        // Fetch general financial news from Finnhub
        const generalNews = await fetchFinnhubNews(apiKey, 'general');

        // Sort by date and get the latest 3
        const sortedNews = generalNews.sort((a, b) => b.datetime - a.datetime);
        const latestNews = convertFinnhubNews(sortedNews, 3);

        // If we don't have enough news, fill with mock data
        if (latestNews.length < 3) {
            console.log(`Only found ${latestNews.length} news articles, supplementing with mock data`);
            const mockNews = getMockFinanceNews();
            return [...latestNews, ...mockNews].slice(0, 3);
        }

        return latestNews;
    } catch (error) {
        console.error('Error fetching Finnhub news:', error);
        return getMockFinanceNews();
    }
}

// Mock news data as fallback
export function getMockFinanceNews(): NewsArticle[] {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return [
        {
            id: '1',
            title: 'Stock Market Reaches New Heights Amid Economic Optimism',
            description: 'Major indices climb as investors show renewed confidence in economic recovery.',
            url: 'https://finance.yahoo.com',
            source: 'Bloomberg',
            publishedAt: yesterday.toISOString(),
        },
        {
            id: '2',
            title: 'Federal Reserve Maintains Interest Rate Policy',
            description: 'Central bank officials signal steady approach to monetary policy amid inflation concerns.',
            url: 'https://finance.yahoo.com',
            source: 'Reuters',
            publishedAt: yesterday.toISOString(),
        },
        {
            id: '3',
            title: 'Tech Sector Leads Market Rally on Strong Earnings',
            description: 'Technology companies post better-than-expected quarterly results, driving market gains.',
            url: 'https://finance.yahoo.com',
            source: 'CNBC',
            publishedAt: yesterday.toISOString(),
        },
    ];
}

export function getNextUpdateTime(): Date {
    const now = new Date();
    const etNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

    // Set to 9 AM ET today
    const nextUpdate = new Date(etNow);
    nextUpdate.setHours(9, 0, 0, 0);

    // If it's already past 9 AM ET today, set to 9 AM ET tomorrow
    if (etNow >= nextUpdate) {
        nextUpdate.setDate(nextUpdate.getDate() + 1);
    }

    return nextUpdate;
}

export function shouldRefreshNews(lastUpdated: string): boolean {
    const lastUpdate = new Date(lastUpdated);
    const nextUpdate = getNextUpdateTime();
    const now = new Date();

    // Refresh if we've passed the next update time since last update
    return now >= nextUpdate && lastUpdate < nextUpdate;
}
