import { NextResponse } from 'next/server';
import { getSheet, SHEET_TITLES } from '@/lib/googleSheets';
import { getPriceMap } from '@/lib/prices';

export async function GET() {
    try {
        const sheet = await getSheet(SHEET_TITLES.TRANSACTIONS);
        const rows = await sheet.getRows();

        const transactions = rows.map((row) => ({
            id: row.get('id'),
            date: row.get('date'),
            type: row.get('type'),
            category: row.get('category') || 'Stock', // Default for backward compatibility
            asset: row.get('asset'),
            assetName: row.get('assetName'),
            quantity: parseFloat(row.get('quantity')),
            price: parseFloat(row.get('price')),
            total: parseFloat(row.get('quantity')) * parseFloat(row.get('price')),
            status: row.get('status') || 'Completed',
            note: row.get('note') || '',
            currency: row.get('currency') as "USD" | "NTD" || 'USD',
        }));

        // Infer type for transactions without category
        transactions.forEach(t => {
            if (!t.category) {
                if (['BTC', 'ETH', 'SOL', 'USDT', 'USDC'].includes(t.asset)) {
                    t.category = 'Crypto';
                } else if (['USD', 'NTD'].includes(t.asset)) {
                    t.category = 'Cash';
                } else {
                    t.category = 'Stock';
                }
            }
        });

        // Fetch asset names
        const uniqueAssetsMap = new Map<string, { symbol: string, type: string }>();
        transactions.forEach(t => {
            if (!uniqueAssetsMap.has(t.asset)) {
                let type = t.category;
                uniqueAssetsMap.set(t.asset, { symbol: t.asset, type });
            }
        });
        const uniqueAssets = Array.from(uniqueAssetsMap.values());
        const priceMap = await getPriceMap(uniqueAssets);

        // Add asset names to transactions
        const transactionsWithNames = transactions.map(t => ({
            ...t,
            assetName: priceMap[t.asset]?.name || t.asset,
        }));

        return NextResponse.json(transactionsWithNames);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const sheet = await getSheet(SHEET_TITLES.TRANSACTIONS);

        const newRow = {
            id: crypto.randomUUID(),
            ...body,
            // Prepend ' to numeric symbols to prevent Google Sheets from stripping leading zeros (e.g. 006208 -> 6208)
            asset: /^\d+$/.test(body.asset) ? `'${body.asset}` : body.asset,
            total: body.quantity * body.price,
            status: 'Completed', // Default for now
        };

        await sheet.addRow(newRow);

        return NextResponse.json(newRow);
    } catch (error) {
        console.error('Error adding transaction:', error);
        return NextResponse.json({ error: 'Failed to add transaction' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
        }

        const sheet = await getSheet(SHEET_TITLES.TRANSACTIONS);
        const rows = await sheet.getRows();

        const rowToDelete = rows.find(row => row.get('id') === id);

        if (!rowToDelete) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        await rowToDelete.delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sheet = await getSheet(SHEET_TITLES.TRANSACTIONS);
        const rows = await sheet.getRows();
        const rowToUpdate = rows.find((row) => row.get('id') === id);

        if (!rowToUpdate) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        // Calculate total
        const total = updates.quantity * updates.price;

        // Prepare update object
        const updateData: Record<string, string> = {
            date: updates.date,
            type: updates.type,
            category: updates.category,
            // Prepend ' to numeric symbols to prevent Google Sheets from stripping leading zeros
            asset: /^\d+$/.test(updates.asset) ? `'${updates.asset}` : updates.asset,
            quantity: updates.quantity.toString(),
            price: updates.price.toString(),
            total: total.toString(),
            status: updates.status || rowToUpdate.get('status') || 'Completed',
            note: updates.note || '',
            currency: updates.currency || 'USD',
        };

        // Update the row
        rowToUpdate.assign(updateData);

        await rowToUpdate.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json({
            error: 'Failed to update transaction',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

