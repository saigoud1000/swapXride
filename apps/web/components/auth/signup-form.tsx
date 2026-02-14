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
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
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
