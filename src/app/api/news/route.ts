import { NextResponse } from 'next/server';
import { getFinanceNews, getMockFinanceNews, getNextUpdateTime, NewsResponse } from '@/lib/news';

// In-memory cache for news
let newsCache: NewsResponse | null = null;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const apiKey = searchParams.get('apiKey');

        const now = new Date();

        // Check if we need to refresh the cache
        if (!newsCache || (newsCache.lastUpdated && new Date(newsCache.lastUpdated) < getNextUpdateTime())) {
            // Fetch fresh news from Finnhub if API key provided
            let articles;
            if (apiKey) {
                articles = await getFinanceNews(apiKey);
            } else {
                console.log('No API key provided, using mock data');
                articles = getMockFinanceNews();
            }

            newsCache = {
                articles,
                lastUpdated: now.toISOString(),
                nextUpdate: getNextUpdateTime().toISOString(),
            };
        }

        return NextResponse.json(newsCache);
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
