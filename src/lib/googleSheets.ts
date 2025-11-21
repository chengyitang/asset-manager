import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Config variables
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || '';
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY || '';

export const SHEET_TITLES = {
    TRANSACTIONS: 'Transactions',
    ASSETS: 'Assets', // Optional, if we want to cache asset metadata
    LIABILITIES: 'Liabilities',
};

export const HEADERS = {
    TRANSACTIONS: ['id', 'date', 'type', 'category', 'asset', 'quantity', 'price', 'total', 'status', 'note', 'currency'],
    LIABILITIES: ['id', 'date', 'type', 'category', 'name', 'amount', 'interestRate', 'status', 'note'],
};

let doc: GoogleSpreadsheet | null = null;

export async function getDoc() {
    if (doc) return doc;

    if (!SPREADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
        throw new Error('Missing Google Sheets credentials');
    }

    const jwt = new JWT({
        email: GOOGLE_CLIENT_EMAIL,
        key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
        ],
    });

    const newDoc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
    await newDoc.loadInfo();
    doc = newDoc;
    return doc;
}

export async function getSheet(title: string) {
    const doc = await getDoc();
    let sheet = doc.sheetsByTitle[title];

    if (!sheet) {
        sheet = await doc.addSheet({ title });
    }

    // Initialize headers if empty
    try {
        await sheet.loadHeaderRow();
        const headers = sheet.headerValues;
        
        // Check if currency column exists for Transactions sheet, add it if missing
        if (title === SHEET_TITLES.TRANSACTIONS && !headers.includes('currency')) {
            // Add currency column to existing sheet
            await sheet.setHeaderRow([...headers, 'currency']);
        }
    } catch (e) {
        // If loadHeaderRow fails, it likely means the sheet is empty.
        // We can proceed to set the header row directly.
        if (title === SHEET_TITLES.TRANSACTIONS) {
            await sheet.setHeaderRow(HEADERS.TRANSACTIONS);
        } else if (title === SHEET_TITLES.LIABILITIES) {
            await sheet.setHeaderRow(HEADERS.LIABILITIES);
        }
    }

    return sheet;
}

