import { AssetCategorySummary } from "@/types"
import { AssetCategoryCard } from "@/components/assets/AssetCategoryCard"

async function getCategoryData(): Promise<AssetCategorySummary[]> {
    const res = await fetch('http://localhost:3000/api/assets/categories', { cache: 'no-store' });
    if (!res.ok) {
        return [];
    }
    return res.json();
}

export default async function AssetsPage() {
    const categories = await getCategoryData()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Assets</h2>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                    <AssetCategoryCard key={category.category} data={category} />
                ))}
            </div>
        </div>
    )
}
