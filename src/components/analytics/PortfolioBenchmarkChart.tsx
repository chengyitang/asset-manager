"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TimePeriod, PerformanceSeries } from "@/lib/performance"

const TIME_PERIODS: TimePeriod[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '3Y', '5Y', '10Y', 'MAX'];

export function PortfolioBenchmarkChart() {
    const [period, setPeriod] = useState<TimePeriod>('1Y');
    const [loading, setLoading] = useState(true);
    const [portfolioData, setPortfolioData] = useState<any>(null);
    const [benchmarkData, setBenchmarkData] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [portfolioRes, benchmarkRes] = await Promise.all([
                    fetch(`/api/analytics/portfolio-performance?period=${period}`),
                    fetch(`/api/analytics/benchmark-data?period=${period}`)
                ]);

                // Handle portfolio data
                if (portfolioRes.ok) {
                    const portfolio = await portfolioRes.json();
                    setPortfolioData(portfolio);
                } else {
                    console.error('Failed to fetch portfolio performance:', portfolioRes.statusText);
                    setPortfolioData(null);
                }

                // Handle benchmark data
                if (benchmarkRes.ok) {
                    const benchmark = await benchmarkRes.json();
                    console.log('Benchmark data received:', {
                        sp500: benchmark.sp500?.data?.length || 0,
                        taiwan0050: benchmark.taiwan0050?.data?.length || 0,
                        btc: benchmark.btc?.data?.length || 0,
                        usdt: benchmark.usdt?.data?.length || 0,
                    });
                    setBenchmarkData(benchmark);
                } else {
                    console.error('Failed to fetch benchmark data:', benchmarkRes.statusText);
                    setBenchmarkData(null);
                }
            } catch (error) {
                console.error('Error fetching chart data:', error);
                setPortfolioData(null);
                setBenchmarkData(null);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [period]);

    if (loading) {
        return <div className="text-center py-8">Loading chart...</div>;
    }

    // Combine all series data - only include series with actual data points
    const allSeries = [
        portfolioData?.usStocks,
        benchmarkData?.sp500,
        portfolioData?.taiwanStocks,
        benchmarkData?.taiwan0050,
        portfolioData?.crypto,
        benchmarkData?.btc,
        benchmarkData?.usdt,
    ].filter((series): series is PerformanceSeries => {
        // Only include series that have data array with at least one point
        return series !== null && 
               series !== undefined && 
               Array.isArray(series.data) && 
               series.data.length > 0;
    });

    console.log('All series after filtering:', allSeries.map(s => ({
        name: s.name,
        dataPoints: s.data.length,
        currentReturn: s.currentReturn
    })));

    if (allSeries.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio vs Benchmarks Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        No data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Merge data points by date
    const dateSet = new Set<string>();
    allSeries.forEach((series: PerformanceSeries) => {
        if (series?.data && Array.isArray(series.data)) {
            series.data.forEach(point => {
                if (point?.date) {
                    dateSet.add(point.date);
                }
            });
        }
    });

    const dates = Array.from(dateSet).sort();
    console.log('Total unique dates:', dates.length, 'First few dates:', dates.slice(0, 5));
    
    const chartData = dates.map(date => {
        const dataPoint: any = { date };
        allSeries.forEach((series: PerformanceSeries) => {
            if (series?.data && Array.isArray(series.data)) {
                const point = series.data.find(p => p.date === date);
                // Use undefined instead of null for Recharts - undefined values are skipped
                dataPoint[series.name] = point?.value !== undefined && point?.value !== null ? Number(point.value) : undefined;
            }
        });
        return dataPoint;
    }).filter(point => {
        // Filter out points where all values are undefined
        return allSeries.some(series => point[series.name] !== undefined);
    });

    console.log('Chart data points:', chartData.length, 'Sample point:', chartData[0]);

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Portfolio vs Benchmarks Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        No chart data available for the selected period
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Portfolio vs Benchmarks Performance</CardTitle>
                    <div className="flex gap-1">
                        {TIME_PERIODS.map((p) => (
                            <Button
                                key={p}
                                variant={period === p ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPeriod(p)}
                                className="h-8 px-3"
                            >
                                {p}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                    {allSeries.map((series: PerformanceSeries) => (
                        <div key={series.name} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: series.color }}
                            />
                            <span className="text-sm font-medium">{series.name}</span>
                            <span className={`text-sm font-bold ${series.currentReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {series.currentReturn >= 0 ? '+' : ''}{series.currentReturn.toFixed(2)}%
                            </span>
                        </div>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => {
                                if (!value) return '';
                                const date = new Date(value);
                                if (isNaN(date.getTime())) return value;
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            formatter={(value: any) => {
                                if (value === null || value === undefined) return 'N/A';
                                return `${Number(value).toFixed(2)}%`;
                            }}
                            labelFormatter={(label) => {
                                if (!label) return '';
                                const date = new Date(label);
                                if (isNaN(date.getTime())) return label;
                                return date.toLocaleDateString();
                            }}
                        />
                        <Legend />
                        {allSeries.map((series: PerformanceSeries) => (
                            <Line
                                key={series.name}
                                type="monotone"
                                dataKey={series.name}
                                stroke={series.color || '#8884d8'}
                                strokeWidth={2}
                                dot={false}
                                connectNulls={true}
                                isAnimationActive={true}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
