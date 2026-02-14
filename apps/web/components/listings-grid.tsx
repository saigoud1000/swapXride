'use client'

import { Listing } from '@swapxride/shared'
import { ListingCard } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'

interface ListingsGridProps {
    initialListings: Listing[]
}

export function ListingsGrid({ initialListings }: ListingsGridProps) {
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const checkAuthAndFetchSaved = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setIsAuthenticated(true)
                try {
                    const res = await fetchWithAuth('/listings/saved')
                    if (res.ok) {
                        const savedListings: Listing[] = await res.json()
                        setSavedIds(new Set(savedListings.map(l => l.id)))
                    }
                } catch (error) {
                    console.error('Failed to fetch saved listings', error)
                }
            }
        }
        checkAuthAndFetchSaved()
    }, [])

    const handleToggleSave = (id: string, isSaved: boolean) => {
        if (isSaved) {
            setSavedIds(prev => {
                const next = new Set(prev)
                next.add(id)
                return next
            })
        } else {
            setSavedIds(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }
    }

    if (!initialListings || initialListings.length === 0) {
        return (
            <div className="col-span-full text-center py-20 bg-muted rounded-lg border-dashed border-2">
                <h3 className="text-lg font-semibold">No listings found</h3>
                <p className="text-muted-foreground mb-4">Be the first to post your car for swap!</p>
                <Button asChild variant="secondary">
                    <Link href="/listings/create">Create Listing</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialListings.map((listing) => (
                <ListingCard
                    key={listing.id}
                    listing={listing}
                    isSaved={savedIds.has(listing.id)}
                    isAuthenticated={isAuthenticated}
                    onToggleSave={handleToggleSave}
                />
            ))}
        </div>
    )
}
