import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, credentials } = body;

        if (type === 'googleSheets') {
            // Test Google Sheets connection
            const { GoogleSpreadsheet } = await import('google-spreadsheet');
            const { JWT } = await import('google-auth-library');

            const serviceAccountAuth = new JWT({
                email: credentials.clientEmail,
                key: credentials.privateKey.replace(/\\n/g, '\n'),
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });

            const doc = new GoogleSpreadsheet(credentials.sheetId, serviceAccountAuth);

            try {
                await doc.loadInfo();
                return NextResponse.json({
                    success: true,
                    message: `Connected to: ${doc.title}`,
                    sheetTitle: doc.title
                });
            } catch (error: any) {
                return NextResponse.json({
                    success: false,
                    message: `Failed to connect: ${error.message}`
                }, { status: 400 });
            }
        }

        if (type === 'newsApi') {
            // Test News API connection
            const { apiKey, provider } = credentials;

            if (provider === 'finnhub') {
                const response = await fetch(
                    `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`
                );

                if (response.ok) {
                    const data = await response.json();
                    return NextResponse.json({
                        success: true,
                        message: `Connected to Finnhub API. Found ${data.length} news articles.`
                    });
                } else {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid Finnhub API key'
                    }, { status: 400 });
                }
            }

            if (provider === 'newsapi') {
                const response = await fetch(
                    `https://newsapi.org/v2/top-headlines?category=business&apiKey=${apiKey}`
                );

                if (response.ok) {
                    return NextResponse.json({
                        success: true,
                        message: 'Connected to NewsAPI successfully'
                    });
                } else {
                    return NextResponse.json({
                        success: false,
                        message: 'Invalid NewsAPI key'
                    }, { status: 400 });
                }
            }
        }

        return NextResponse.json({
            success: false,
            message: 'Unknown credential type'
        }, { status: 400 });

    } catch (error: any) {
        console.error('Error testing credentials:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Failed to test credentials'
        }, { status: 500 });
    }
}
