"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TimePeriod, PerformanceSeries } from "@/lib/performance"
import { Settings2, Share2, Calendar } from "lucide-react"

const TIME_PERIODS: TimePeriod[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '3Y', '5Y', '10Y', 'MAX'];

const COLORS = [
    '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

interface UnifiedData {
    benchmarks: {
        sp500?: PerformanceSeries;
        taiwan0050?: PerformanceSeries;
        btc?: PerformanceSeries;
        usdt?: PerformanceSeries;
    };
    symbols: Record<string, PerformanceSeries>;
}

export function UnifiedPerformanceChart() {
    const [period, setPeriod] = useState<TimePeriod>('1Y');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<UnifiedData | null>(null);
    const [selectedSymbols, setSelectedSymbols] = useState<Set<string>>(new Set(['S&P 500', 'Taiwan 0050', 'BTC']));
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [benchmarkRes, symbolRes] = await Promise.all([
                    fetch(`/api/analytics/benchmark-data?period=${period}`),
                    fetch(`/api/analytics/symbol-performance?period=${period}`)
                ]);

                const benchmarks = await benchmarkRes.json();
                const symbols = await symbolRes.json();

                setData({ benchmarks, symbols });
            } catch (error) {
                console.error('Error fetching chart data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [period]);

    const toggleSymbol = (symbol: string) => {
        const newSelected = new Set(selectedSymbols);
        if (newSelected.has(symbol)) {
            newSelected.delete(symbol);
        } else {
            newSelected.add(symbol);
        }
        setSelectedSymbols(newSelected);
    };

    if (loading) {
        return <div className="text-center py-8">Loading chart...</div>;
    }

    if (!data) {
        return <div className="text-center py-8">No data available</div>;
    }

    // Combine all available series for selection
    // Handle potential name collisions (e.g. BTC benchmark vs BTC asset)
    const portfolioSymbols = new Set(Object.keys(data.symbols));

    const benchmarks = [
        data.benchmarks.sp500,
        data.benchmarks.taiwan0050,
        data.benchmarks.btc,
        data.benchmarks.usdt
    ].filter((b): b is PerformanceSeries => !!b).filter(b => {
        // If benchmark name exists in portfolio, hide the benchmark entirely
        // This avoids confusion and duplication
        return !portfolioSymbols.has(b.name);
    });

    const availableSeries = [
        ...benchmarks,
        ...Object.values(data.symbols)
    ];

    // Filter series based on selection
    const activeSeries = availableSeries.filter(s => selectedSymbols.has(s.name));

    // Prepare chart data
    const dateSet = new Set<string>();
    activeSeries.forEach(series => {
        if (series.data && Array.isArray(series.data)) {
            series.data.forEach(point => {
                if (point.date) dateSet.add(point.date);
            });
        }
    });

    const dates = Array.from(dateSet).sort();
    const chartData = dates.map(date => {
        const point: any = { date };
        activeSeries.forEach(series => {
            const p = series.data.find(d => d.date === date);
            point[series.name] = p?.value !== undefined ? Number(p.value) : undefined;
        });
        return point;
    });

    return (
        <div className="space-y-6">
            {/* Controls Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                + Select Symbols
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Select Symbols</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                                {availableSeries.map((series) => (
                                    <div key={series.name} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={series.name}
                                            checked={selectedSymbols.has(series.name)}
                                            onCheckedChange={() => toggleSymbol(series.name)}
                                        />
                                        <label
                                            htmlFor={series.name}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {series.fullName || series.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-muted rounded-md p-1">
                        {TIME_PERIODS.map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1 text-sm rounded-sm transition-colors ${period === p
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {activeSeries.map((series, index) => (
                    <Card key={series.name} className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="font-bold truncate">{series.name}</span>
                                <span className={`ml-auto font-bold ${series.currentReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {series.currentReturn >= 0 ? '+' : ''}{series.currentReturn.toFixed(2)}%
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground">Price Return</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chart */}
            <Card>
                <CardContent className="pt-6">
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => {
                                        if (!value) return '';
                                        const date = new Date(value);
                                        if (isNaN(date.getTime())) return value;
                                        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                                    }}
                                    minTickGap={50}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}%`}
                                    ticks={[-50, -25, 0, 25, 50]}
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any, name: string) => [`${Number(value).toFixed(2)}%`, name]}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                {activeSeries.map((series, index) => (
                                    <Line
                                        key={series.name}
                                        type="monotone"
                                        dataKey={series.name}
                                        stroke={COLORS[index % COLORS.length]}
                                        strokeWidth={2}
                                        dot={false}
                                        connectNulls={true}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
