// Settings storage and management
export interface GoogleSheetsConfig {
    clientEmail: string;
    privateKey: string;
    sheetId: string;
    configured: boolean;
}

export interface NewsApiConfig {
    apiKey: string;
    provider: 'finnhub' | 'newsapi';
    configured: boolean;
}

export interface AppSettings {
    googleSheets: GoogleSheetsConfig;
    newsApi: NewsApiConfig;
}

const SETTINGS_KEY = 'assetmanager_settings';

// Default settings
const defaultSettings: AppSettings = {
    googleSheets: {
        clientEmail: '',
        privateKey: '',
        sheetId: '',
        configured: false,
    },
    newsApi: {
        apiKey: '',
        provider: 'finnhub',
        configured: false,
    },
};

// Load settings from localStorage
export function loadSettings(): AppSettings {
    if (typeof window === 'undefined') {
        return defaultSettings;
    }

    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            return { ...defaultSettings, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }

    return defaultSettings;
}

// Save settings to localStorage
export function saveSettings(settings: AppSettings): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Get Google Sheets credentials (from settings or env vars)
export function getGoogleSheetsCredentials(): GoogleSheetsConfig {
    const settings = loadSettings();

    // If configured in settings, use those
    if (settings.googleSheets.configured) {
        return settings.googleSheets;
    }

    // Otherwise, try to use environment variables
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || '';
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY || '';
    const sheetId = process.env.GOOGLE_SHEETS_ID || '';

    return {
        clientEmail,
        privateKey,
        sheetId,
        configured: !!(clientEmail && privateKey && sheetId),
    };
}

// Get News API credentials (from settings or env vars)
export function getNewsApiCredentials(): NewsApiConfig {
    const settings = loadSettings();

    // If configured in settings, use those
    if (settings.newsApi.configured) {
        return settings.newsApi;
    }

    // Otherwise, try to use environment variables
    const apiKey = process.env.FINNHUB_API_KEY || process.env.NEWS_API_KEY || '';

    return {
        apiKey,
        provider: 'finnhub',
        configured: !!apiKey,
    };
}
