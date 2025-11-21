import { NextResponse } from 'next/server';
import { fetchBenchmarkData, TimePeriod } from '@/lib/performance';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const period = (searchParams.get('period') || '1Y') as TimePeriod;

        // Fetch benchmark data with individual error handling
        const results = await Promise.allSettled([
            fetchBenchmarkData('^GSPC', period), // S&P 500
            fetchBenchmarkData('0050.TW', period), // Taiwan 0050
            fetchBenchmarkData('BTC-USD', period), // Bitcoin
            fetchBenchmarkData('USDT-USD', period), // USDT
        ]);

        const [sp500Result, taiwan0050Result, btcResult, usdtResult] = results;
        
        const sp500Data = sp500Result.status === 'fulfilled' ? sp500Result.value : [];
        const taiwan0050Data = taiwan0050Result.status === 'fulfilled' ? taiwan0050Result.value : [];
        const btcData = btcResult.status === 'fulfilled' ? btcResult.value : [];
        const usdtData = usdtResult.status === 'fulfilled' ? usdtResult.value : [];

        // Log any failures
        if (sp500Result.status === 'rejected') {
            console.error('Failed to fetch S&P 500 data:', sp500Result.reason);
        }
        if (taiwan0050Result.status === 'rejected') {
            console.error('Failed to fetch Taiwan 0050 data:', taiwan0050Result.reason);
        }
        if (btcResult.status === 'rejected') {
            console.error('Failed to fetch BTC data:', btcResult.reason);
        }
        if (usdtResult.status === 'rejected') {
            console.error('Failed to fetch USDT data:', usdtResult.reason);
        }

        console.log('Benchmark data lengths:', {
            sp500: sp500Data.length,
            taiwan0050: taiwan0050Data.length,
            btc: btcData.length,
            usdt: usdtData.length,
        });

        return NextResponse.json({
            sp500: {
                name: 'S&P 500',
                data: sp500Data,
                currentReturn: sp500Data.length > 0 ? sp500Data[sp500Data.length - 1].value : 0,
                color: '#3b82f6',
            },
            taiwan0050: {
                name: 'Taiwan 0050',
                data: taiwan0050Data,
                currentReturn: taiwan0050Data.length > 0 ? taiwan0050Data[taiwan0050Data.length - 1].value : 0,
                color: '#10b981',
            },
            btc: {
                name: 'BTC',
                data: btcData,
                currentReturn: btcData.length > 0 ? btcData[btcData.length - 1].value : 0,
                color: '#f59e0b',
            },
            usdt: {
                name: 'USDT',
                data: usdtData,
                currentReturn: usdtData.length > 0 ? usdtData[usdtData.length - 1].value : 0,
                color: '#6b7280',
            },
        });
    } catch (error) {
        console.error('Error fetching benchmark data:', error);
        return NextResponse.json({ error: 'Failed to fetch benchmark data' }, { status: 500 });
    }
}
