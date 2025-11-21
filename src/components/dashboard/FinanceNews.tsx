"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Newspaper } from "lucide-react"
import { NewsArticle, NewsResponse } from "@/lib/news"
import { loadSettings } from "@/lib/settings"

export function FinanceNews() {
    const [news, setNews] = useState<NewsResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchNews() {
            try {
                // Get API key from localStorage
                const settings = loadSettings()
                const apiKey = settings.newsApi.apiKey

                // Build URL with API key if available
                const url = apiKey ? `/api/news?apiKey=${encodeURIComponent(apiKey)}` : '/api/news'

                const response = await fetch(url)
                if (response.ok) {
                    const data = await response.json()
                    setNews(data)
                }
            } catch (error) {
                console.error('Error fetching news:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchNews()
    }, [])

    if (loading) {
        return (
            <div className="space-y-4">
                <h3 className="text-2xl font-bold">Finance News</h3>
                <div className="text-center py-8 text-muted-foreground">Loading news...</div>
            </div>
        )
    }

    if (!news || !news.articles || news.articles.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Newspaper className="h-6 w-6" />
                    <h3 className="text-2xl font-bold">Finance News</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(news.lastUpdated).toLocaleString()}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {news.articles.map((article) => (
                    <Card key={article.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2 pt-4">
                            <CardTitle className="text-base leading-tight line-clamp-2">
                                {article.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {article.description}
                            </p>
                            <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                                Read more
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
