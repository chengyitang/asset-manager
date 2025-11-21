"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

interface SetupStep {
    step: number
    title: string
    description: string
    link?: { text: string; url: string }
}

interface SetupInstructionsProps {
    type: 'googleSheets' | 'newsApi'
}

const googleSheetsSteps: SetupStep[] = [
    {
        step: 1,
        title: "Create a Google Cloud Project",
        description: "Go to Google Cloud Console and create a new project (or use an existing one).",
        link: { text: "Google Cloud Console", url: "https://console.cloud.google.com/" }
    },
    {
        step: 2,
        title: "Enable Google Sheets API",
        description: "In your project, go to 'APIs & Services' > 'Library' and enable the Google Sheets API.",
    },
    {
        step: 3,
        title: "Create Service Account",
        description: "Go to 'APIs & Services' > 'Credentials' > 'Create Credentials' > 'Service Account'. Give it a name and create.",
    },
    {
        step: 4,
        title: "Generate Private Key",
        description: "Click on the service account you created, go to 'Keys' tab, click 'Add Key' > 'Create new key' > 'JSON'. Download the JSON file.",
    },
    {
        step: 5,
        title: "Share Your Google Sheet",
        description: "Open your Google Sheet, click 'Share', and add the service account email (from the JSON file) as an Editor.",
    },
    {
        step: 6,
        title: "Copy Credentials",
        description: "From the JSON file, copy: 'client_email', 'private_key', and your Google Sheet ID (from the sheet URL).",
    },
];

const finnhubSteps: SetupStep[] = [
    {
        step: 1,
        title: "Sign Up for Finnhub",
        description: "Create a free account on Finnhub.io to get your API key.",
        link: { text: "Finnhub Registration", url: "https://finnhub.io/register" }
    },
    {
        step: 2,
        title: "Get Your API Key",
        description: "After signing up, go to your dashboard. Your API key will be displayed prominently.",
        link: { text: "Finnhub Dashboard", url: "https://finnhub.io/dashboard" }
    },
    {
        step: 3,
        title: "Copy API Key",
        description: "Copy your API key and paste it in the form below. The free tier allows 60 API calls per minute.",
    },
    {
        step: 4,
        title: "Test Connection",
        description: "Click 'Test Connection' to verify your API key is working correctly.",
    },
];

export function SetupInstructions({ type }: SetupInstructionsProps) {
    const steps = type === 'googleSheets' ? googleSheetsSteps : finnhubSteps;
    const title = type === 'googleSheets' ? 'Google Sheets API Setup' : 'Finnhub News API Setup';

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    Follow these steps to set up your {type === 'googleSheets' ? 'Google Sheets' : 'Finnhub'} credentials
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {steps.map((step) => (
                        <div key={step.step} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                {step.step}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold mb-1">{step.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                                {step.link && (
                                    <a
                                        href={step.link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                    >
                                        {step.link.text}
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
