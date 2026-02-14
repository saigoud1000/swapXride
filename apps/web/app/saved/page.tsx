'use client'

import { Listing } from '@swapxride/shared'
import { ListingsGrid } from '@/components/listings-grid'
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/api'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SavedListingsPage() {
    const [listings, setListings] = useState<Listing[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSaved = async () => {
            try {
                const res = await fetchWithAuth('/listings/saved')
                if (res.ok) {
                    const data = await res.json()
                    setListings(data)
                }
            } catch (error) {
                console.error('Failed to fetch saved listings', error)
            } finally {
                setLoading(false)
            }
        }
        fetchSaved()
    }, [])

    return (
        <main className="container mx-auto py-10 px-4">
            <div className="flex flex-col space-y-6 mb-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Saved Listings</h1>
                        <p className="text-muted-foreground">Listings you have favorited.</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">Loading...</div>
            ) : listings.length === 0 ? (
                <div className="text-center py-20 bg-muted rounded-lg border-dashed border-2">
                    <h3 className="text-lg font-semibold">No saved listings</h3>
                    <p className="text-muted-foreground mb-4">Go back to the market to save some cars!</p>
                    <Button asChild variant="secondary">
                        <Link href="/">Browse Market</Link>
                    </Button>
                </div>
            ) : (
                <ListingsGrid initialListings={listings} />
            )}
        </main>
    )
}
