"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Currency = "USD" | "NTD"

interface CurrencyContextType {
    currency: Currency
    setCurrency: (currency: Currency) => void
    exchangeRate: number // USD to NTD rate
    format: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState<Currency>("USD")
    const [exchangeRate, setExchangeRate] = useState<number>(32.5) // Default fallback

    useEffect(() => {
        // Fetch real exchange rate
        const fetchRate = async () => {
            try {
                const res = await fetch("/api/forex")
                const data = await res.json()
                if (data.rate) {
                    setExchangeRate(data.rate)
                }
            } catch (error) {
                console.error("Failed to fetch forex rate", error)
            }
        }
        fetchRate()
    }, [])

    const format = (amount: number) => {
        const value = currency === "NTD" ? amount * exchangeRate : amount
        return new Intl.NumberFormat("en-US", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, format }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    const context = useContext(CurrencyContext)
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider")
    }
    return context
}
