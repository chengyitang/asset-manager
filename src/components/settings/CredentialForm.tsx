"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface CredentialFormProps {
    type: 'googleSheets' | 'newsApi'
    initialValues?: any
    onSave: (values: any) => void
}

export function CredentialForm({ type, initialValues, onSave }: CredentialFormProps) {
    const [values, setValues] = useState(initialValues || {})
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

    const handleTest = async () => {
        setTesting(true)
        setTestResult(null)

        try {
            const response = await fetch('/api/settings/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, credentials: values }),
            })

            const result = await response.json()
            setTestResult(result)
        } catch (error) {
            setTestResult({ success: false, message: 'Failed to test connection' })
        } finally {
            setTesting(false)
        }
    }

    const handleSave = () => {
        onSave({ ...values, configured: testResult?.success || false })
    }

    if (type === 'googleSheets') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Google Sheets Credentials</CardTitle>
                    <CardDescription>
                        Configure your Google Sheets API credentials for data storage
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="clientEmail">Service Account Email</Label>
                        <Input
                            id="clientEmail"
                            type="email"
                            placeholder="your-service-account@project.iam.gserviceaccount.com"
                            value={values.clientEmail || ''}
                            onChange={(e) => setValues({ ...values, clientEmail: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="privateKey">Private Key</Label>
                        <Textarea
                            id="privateKey"
                            placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                            value={values.privateKey || ''}
                            onChange={(e) => setValues({ ...values, privateKey: e.target.value })}
                            rows={4}
                            className="font-mono text-xs"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sheetId">Google Sheet ID</Label>
                        <Input
                            id="sheetId"
                            placeholder=""
                            value={values.sheetId || ''}
                            onChange={(e) => setValues({ ...values, sheetId: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Found in your Google Sheet URL: docs.google.com/spreadsheets/d/<strong>[SHEET_ID]</strong>/edit
                        </p>
                    </div>

                    {testResult && (
                        <Alert variant={testResult.success ? "default" : "destructive"}>
                            {testResult.success ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : (
                                <XCircle className="h-4 w-4" />
                            )}
                            <AlertDescription>{testResult.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={handleTest} disabled={testing} variant="outline">
                            {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Test Connection
                        </Button>
                        <Button onClick={handleSave} disabled={!testResult?.success}>
                            Save Credentials
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (type === 'newsApi') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Finnhub News API</CardTitle>
                    <CardDescription>
                        Configure your Finnhub API key for financial news
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                            id="apiKey"
                            type="password"
                            placeholder="your-finnhub-api-key"
                            value={values.apiKey || ''}
                            onChange={(e) => setValues({ ...values, apiKey: e.target.value, provider: 'finnhub' })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Free tier: 60 API calls per minute
                        </p>
                    </div>

                    {testResult && (
                        <Alert variant={testResult.success ? "default" : "destructive"}>
                            {testResult.success ? (
                                <CheckCircle2 className="h-4 w-4" />
                            ) : (
                                <XCircle className="h-4 w-4" />
                            )}
                            <AlertDescription>{testResult.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-2">
                        <Button onClick={handleTest} disabled={testing} variant="outline">
                            {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Test Connection
                        </Button>
                        <Button onClick={handleSave} disabled={!testResult?.success}>
                            Save Credentials
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return null
}
