'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProfileFormProps {
    profile: any
}

export function ProfileForm({ profile }: ProfileFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [accountType, setAccountType] = useState(profile?.account_type || 'private')

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        // Add accountType to formData since it's a custom Select component
        formData.append('accountType', accountType)

        const result = await updateProfile(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            router.push('/profile')
            router.refresh()
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                    id="displayName"
                    name="displayName"
                    defaultValue={profile?.display_name || ''}
                    placeholder="Your Name"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="locationZip">Location (Zip Code)</Label>
                <Input
                    id="locationZip"
                    name="locationZip"
                    defaultValue={profile?.location_zip || ''}
                    placeholder="90210"
                />
            </div>

            <div className="space-y-2">
                <Label>Account Type</Label>
                <Select value={accountType} onValueChange={setAccountType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="private">Private Seller</SelectItem>
                        <SelectItem value="dealer">Dealer</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {error && (
                <div className="text-sm text-red-500 font-medium">
                    {error}
                </div>
            )}

            <div className="flex gap-4 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    )
}
