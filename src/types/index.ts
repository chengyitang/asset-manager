export type AssetCategory = "Stock-US" | "Stock-TW" | "Crypto" | "Gold" | "Cash"

export type Asset = {
    id: string
    symbol: string
    name: string
    type: AssetCategory
    quantity: number
    price: number
    value: number
    change: number
    change24h: number
    avgCost: number
    unrealizedPL: number
    marketValue: number
    totalChangePercentage: number
    weight: number
    daysHeld?: number // Days held since first purchase (for Stock and Crypto)
    bank?: string // Bank name (for Cash assets)
    // Original currency values for display (e.g. TWD for Stock-TW)
    originalPrice?: number
    originalCost?: number
    originalValue?: number
    originalChange?: number
    originalUnrealizedPL?: number
    currency?: string
    categoryWeight?: number // Weight within its category
}

export type AssetCategorySummary = {
    category: AssetCategory
    totalValue: number
    currency: string
    changePercent: number
    weight: number
    assetCount: number
}

export type Liability = {
    id: string
    date: string
    type: "Loan" | "Credit Card" | "Mortgage" | "Other"
    category: string
    name: string
    amount: number
    interestRate: number
    status: "Active" | "Paid Off" | "Pending"
    note: string
}

export type Transaction = {
    id: string
    date: string
    type: "Buy" | "Sell" | "Deposit" | "Withdraw"
    category: AssetCategory
    asset: string
    assetName?: string
    quantity: number
    price: number
    total: number
    status: string
    note: string
    currency?: "USD" | "NTD"
}
