'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Edit, Trash2, Heart, Eye } from 'lucide-react'
import { Button } from './ui/button'
import { PhotoCarousel } from './photo-carousel'
import { deleteListing } from '@/app/auth/actions'
import { useState } from 'react'
import { fetchWithAuth } from '@/lib/api'

import { Listing } from '@swapxride/shared'

interface ListingCardProps {
    listing: Listing
    showEdit?: boolean
    isSaved?: boolean
    isAuthenticated?: boolean
    onToggleSave?: (id: string, isSaved: boolean) => void
}

export function ListingCard({ listing, showEdit = false, isSaved = false, isAuthenticated = false, onToggleSave }: ListingCardProps) {
    const [deleting, setDeleting] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
            return
        }

        setDeleting(true)
        const result = await deleteListing(listing.id)
        if (result.error) {
            alert('Failed to delete listing: ' + result.error)
            setDeleting(false)
        }
    }

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!isAuthenticated) {
            alert('Please log in to save listings.')
            return
        }

        setSaving(true)
        // Optimistic update
        const newSavedState = !isSaved
        if (onToggleSave) onToggleSave(listing.id, newSavedState)

        try {
            const res = await fetchWithAuth(`/listings/${listing.id}/save`, {
                method: 'POST'
            })
            if (!res.ok) {
                // Revert on failure
                if (onToggleSave) onToggleSave(listing.id, !newSavedState)
                console.error('Failed to toggle save')
            }
        } catch (error) {
            console.error('Failed to toggle save', error)
            if (onToggleSave) onToggleSave(listing.id, !newSavedState)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Card className={`hover:shadow-lg transition-shadow overflow-hidden group relative ${deleting ? 'opacity-50 pointer-events-none' : ''}`}>
            <Link href={`/listings/${listing.id}`}>
                <div className="relative">
                    <PhotoCarousel photos={listing.photos} />
                    {isAuthenticated && !showEdit && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full h-8 w-8"
                            onClick={handleToggleSave}
                            disabled={saving}
                        >
                            <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                        </Button>
                    )}
                </div>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="line-clamp-1 text-lg">{listing.have_year} {listing.have_make} {listing.have_model}</CardTitle>
                            <div className="flex items-center gap-2">
                                {listing.is_paid ? (
                                    <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 h-5 px-1.5 text-[10px]">Verified</Badge>
                                ) : (
                                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] text-muted-foreground/70">Basic</Badge>
                                )}
                                <span className="text-xs text-muted-foreground">{listing.have_mileage.toLocaleString()} mi</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{listing.description}</p>

                    <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-foreground">Looking for:</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {listing.want_description || (
                                !listing.want_make &&
                                    !listing.want_model &&
                                    !listing.want_year_min &&
                                    (!listing.cash_direction || listing.cash_direction === 'none')
                                    ? 'Open to offers' : ''
                            )}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {listing.want_make && <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-background">{listing.want_make}</Badge>}
                            {listing.want_model && <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-background">{listing.want_model}</Badge>}
                            {listing.want_year_min && <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-background">{listing.want_year_min}+</Badge>}
                            {listing.cash_direction === 'offering' && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Adding Cash</Badge>}
                            {listing.cash_direction === 'asking' && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Want Cash</Badge>}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                    <div className="flex justify-between items-center w-full">
                        <span>{listing.location_zip}</span>
                        <div className="flex items-center text-muted-foreground gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{listing.view_count || 0}</span>
                        </div>
                    </div>
                </CardFooter>
            </Link>

            {showEdit && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button asChild size="sm" variant="secondary" className="shadow-md">
                        <Link href={`/listings/${listing.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        className="shadow-md"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deleting ? 'Delet...' : 'Delete'}
                    </Button>
                </div>
            )}
        </Card>
    )
}
