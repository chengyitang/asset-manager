"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TimePeriod } from "@/lib/performance"

const TIME_PERIODS: TimePeriod[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '3Y', '5Y', '10Y', 'MAX'];

const COLORS = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

export function SymbolPerformanceChart() {
    const [period, setPeriod] = useState<TimePeriod>('1Y');
    const [loading, setLoading] = useState(true);
    const [symbolData, setSymbolData] = useState<any>(null);
    const [visibleSymbols, setVisibleSymbols] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const response = await fetch(`/api/analytics/symbol-performance?period=${period}`);
                if (response.ok) {
                    const data = await response.json();
                    setSymbolData(data);

                    // Initially show all symbols
                    setVisibleSymbols(new Set(Object.keys(data)));
                }
            } catch (error) {
                console.error('Error fetching symbol performance:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [period]);

    const toggleSymbol = (symbol: string) => {
        const newVisible = new Set(visibleSymbols);
        if (newVisible.has(symbol)) {
            newVisible.delete(symbol);
        } else {
            newVisible.add(symbol);
        }
        setVisibleSymbols(newVisible);
    };

    if (loading) {
        return <div className="text-center py-8">Loading chart...</div>;
    }

    if (!symbolData || Object.keys(symbolData).length === 0) {
        return <div className="text-center py-8">No symbol data available</div>;
    }

    // Prepare chart data
    const symbols = Object.keys(symbolData);
    const dateSet = new Set<string>();

    symbols.forEach(symbol => {
        if (symbolData[symbol]?.data && Array.isArray(symbolData[symbol].data)) {
            symbolData[symbol].data.forEach((point: any) => {
                if (point?.date) {
                    dateSet.add(point.date);
                }
            });
        }
    });

    const dates = Array.from(dateSet).sort();
    const chartData = dates.map(date => {
        const dataPoint: any = { date };
        symbols.forEach(symbol => {
            if (symbolData[symbol]?.data && Array.isArray(symbolData[symbol].data)) {
                const point = symbolData[symbol].data.find((p: any) => p.date === date);
                // Use undefined instead of null for Recharts - undefined values are skipped
                dataPoint[symbol] = point?.value !== undefined && point?.value !== null ? Number(point.value) : undefined;
            }
        });
        return dataPoint;
    }).filter(point => {
        // Filter out points where all visible symbols have undefined values
        return symbols.filter(s => visibleSymbols.has(s)).some(symbol => point[symbol] !== undefined);
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Individual Symbol Performance</CardTitle>
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
                    {symbols.map((symbol, index) => (
                        <div key={symbol} className="flex items-center gap-2">
                            <Checkbox
                                checked={visibleSymbols.has(symbol)}
                                onCheckedChange={() => toggleSymbol(symbol)}
                            />
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-medium">{symbol}</span>
                            <span className={`text-sm font-bold ${symbolData[symbol].currentReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {symbolData[symbol].currentReturn >= 0 ? '+' : ''}{symbolData[symbol].currentReturn.toFixed(2)}%
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
                        {symbols.filter(symbol => visibleSymbols.has(symbol)).map((symbol, index) => (
                            <Line
                                key={symbol}
                                type="monotone"
                                dataKey={symbol}
                                stroke={COLORS[index % COLORS.length]}
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
