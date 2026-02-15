'use client'

import { useState } from 'react'
import { signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export function SignupForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        try {

            const formData = new FormData(event.currentTarget)
            const result = await signup(formData)


            if (result?.error) {

                setError(result.error)
                setLoading(false)
            } else {

            }
        } catch (e) {
            console.error('Submission error:', e)
            setError('An unexpected error occurred')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" placeholder="John Doe" required />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="Min 6 characters" required />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="(555) 555-5555" />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input id="zipCode" name="zipCode" placeholder="12345" required />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="accountType">Account Type</Label>
                    <select
                        id="accountType"
                        name="accountType"
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="private"
                    >
                        <option value="private">Private Seller</option>
                        <option value="dealer">Dealer</option>
                    </select>
                </div>
            </div>
            {error && (
                <div className="text-sm text-red-500 mt-2">
                    {error.toLowerCase().includes('user already registered') || error.toLowerCase().includes('unique constraint') ? (
                        <span>
                            User already exists. <Link href="/login" className="underline font-bold">Login here</Link>
                        </span>
                    ) : (
                        `Registration failed: ${error}`
                    )}
                </div>
            )}
            <Button className="w-full mt-4" type="submit" disabled={loading}>
                {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
        </form>
    )
}
