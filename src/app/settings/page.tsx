"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CredentialForm } from "@/components/settings/CredentialForm"
import { SetupInstructions } from "@/components/settings/SetupInstructions"
import { loadSettings, saveSettings, AppSettings } from "@/lib/settings"
import { toast } from "sonner"

export default function SettingsPage() {
    const [settings, setSettings] = useState<AppSettings | null>(null)

    useEffect(() => {
        const loaded = loadSettings()
        setSettings(loaded)
    }, [])

    const handleSaveGoogleSheets = (values: any) => {
        if (!settings) return

        const newSettings = {
            ...settings,
            googleSheets: values,
        }

        saveSettings(newSettings)
        setSettings(newSettings)

        toast.success("Google Sheets credentials have been saved successfully.")
    }

    const handleSaveNewsApi = (values: any) => {
        if (!settings) return

        const newSettings = {
            ...settings,
            newsApi: values,
        }

        saveSettings(newSettings)
        setSettings(newSettings)

        toast.success("News API credentials have been saved successfully.")
    }

    if (!settings) {
        return <div className="flex-1 p-8">Loading...</div>
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Configure your API credentials and application settings
                </p>
            </div>

            <Tabs defaultValue="googleSheets" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="googleSheets">Google Sheets</TabsTrigger>
                    <TabsTrigger value="newsApi">News API</TabsTrigger>
                </TabsList>

                <TabsContent value="googleSheets" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <CredentialForm
                            type="googleSheets"
                            initialValues={settings.googleSheets}
                            onSave={handleSaveGoogleSheets}
                        />
                        <SetupInstructions type="googleSheets" />
                    </div>
                </TabsContent>

                <TabsContent value="newsApi" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <CredentialForm
                            type="newsApi"
                            initialValues={settings.newsApi}
                            onSave={handleSaveNewsApi}
                        />
                        <SetupInstructions type="newsApi" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
