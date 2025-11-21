import { NextResponse } from 'next/server';
import { getForexRate } from '@/lib/prices';

export async function GET() {
    try {
        const rate = await getForexRate('USD', 'NTD');
        return NextResponse.json({ rate });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch forex rate' }, { status: 500 });
    }
}
