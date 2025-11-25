'use client';

import { useState } from 'react';
import { clearMustChangePasswordFlag } from '@/app/actions/clear-password-flag';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Development utilities page
 * Access at: http://localhost:3000/dev-utils
 */
export default function DevUtilsPage() {
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleClearFlag = async () => {
        setIsLoading(true);
        setMessage(null);

        const result = await clearMustChangePasswordFlag();

        if (result.error) {
            setMessage(`Error: ${result.error}`);
        } else {
            setMessage('Success! Redirecting to dashboard...');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        }

        setIsLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Development Utilities</CardTitle>
                    <CardDescription>
                        Tools for development and testing
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Clear Password Change Flag</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            If you're stuck in the change-password redirect loop, click this button to clear the flag.
                        </p>
                        <Button
                            onClick={handleClearFlag}
                            disabled={isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Clearing...' : 'Clear must_change_password Flag'}
                        </Button>
                    </div>

                    {message && (
                        <Alert>
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
