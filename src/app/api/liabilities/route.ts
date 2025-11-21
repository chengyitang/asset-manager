import { NextResponse } from 'next/server';
import { getSheet, SHEET_TITLES } from '@/lib/googleSheets';

export async function GET() {
    try {
        const sheet = await getSheet(SHEET_TITLES.LIABILITIES);
        const rows = await sheet.getRows();

        const liabilities = rows.map((row) => ({
            id: row.get('id'),
            date: row.get('date'),
            type: row.get('type'),
            category: row.get('category'),
            name: row.get('name'),
            amount: parseFloat(row.get('amount')) || 0,
            interestRate: parseFloat(row.get('interestRate')) || 0,
            status: row.get('status'),
            note: row.get('note'),
        }));

        return NextResponse.json(liabilities);
    } catch (error) {
        console.error('Error fetching liabilities:', error);
        return NextResponse.json({ error: 'Failed to fetch liabilities' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const sheet = await getSheet(SHEET_TITLES.LIABILITIES);

        const id = Date.now().toString();
        await sheet.addRow({
            id,
            date: body.date,
            type: body.type,
            category: body.category,
            name: body.name,
            amount: body.amount.toString(),
            interestRate: body.interestRate?.toString() || '0',
            status: body.status || 'Active',
            note: body.note || '',
        });

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error adding liability:', error);
        return NextResponse.json({ error: 'Failed to add liability' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sheet = await getSheet(SHEET_TITLES.LIABILITIES);
        const rows = await sheet.getRows();
        const rowToDelete = rows.find((row) => row.get('id') === id);

        if (rowToDelete) {
            await rowToDelete.delete();
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Liability not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error deleting liability:', error);
        return NextResponse.json({ error: 'Failed to delete liability' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sheet = await getSheet(SHEET_TITLES.LIABILITIES);
        const rows = await sheet.getRows();
        const rowToUpdate = rows.find((row) => row.get('id') === id);

        if (!rowToUpdate) {
            return NextResponse.json({ error: 'Liability not found' }, { status: 404 });
        }

        // Update the row
        rowToUpdate.assign({
            date: updates.date,
            type: updates.type,
            category: updates.category,
            name: updates.name,
            amount: updates.amount.toString(),
            interestRate: updates.interestRate?.toString() || '0',
            status: updates.status,
            note: updates.note || '',
        });

        await rowToUpdate.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating liability:', error);
        return NextResponse.json({ error: 'Failed to update liability' }, { status: 500 });
    }
}

