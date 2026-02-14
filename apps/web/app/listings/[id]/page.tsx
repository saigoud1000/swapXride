import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Edit } from 'lucide-react'

import { PhotoCarousel } from '@/components/photo-carousel'
import { ListingPaymentAction } from '@/components/listing-payment-action'
import { Listing } from '@swapxride/shared'

interface Props {
    params: {
        id: string
    }
}

export default async function ListingPage({ params }: Props) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
    const res = await fetch(`${API_URL}/listings/${params.id}`, {
        cache: 'no-store'
    })

    if (!res.ok) {
        if (res.status === 404) notFound()
        console.error('Failed to fetch listing', await res.text())
        throw new Error('Failed to fetch listing')
    }

    const l: Listing = await res.json()
    const profile = l.user_info

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Photos Section */}
                <PhotoCarousel photos={l.photos} className="rounded-lg" />

                {/* Details Section */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold flex items-center flex-wrap gap-2">
                            {l.have_year} {l.have_make} {l.have_model} {l.have_trim}
                            {l.is_paid && <Badge className="bg-blue-600 hover:bg-blue-700 text-lg py-1 px-3">Verified</Badge>}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{l.have_mileage.toLocaleString()} miles</Badge>
                            <Badge variant="secondary">{l.location_zip}</Badge>
                            {!l.is_paid && <Badge variant="secondary" className="text-muted-foreground">Basic Listing</Badge>}
                        </div>
                        <div className="flex gap-2 mt-2">
                            {l.condition && <Badge variant="default">{l.condition}</Badge>}
                            {l.title_status && <Badge variant="outline">{l.title_status} Title</Badge>}
                            {l.body_type && <Badge variant="secondary">{l.body_type}</Badge>}
                        </div>

                        <ListingPaymentAction
                            listingId={l.id}
                            status={(l.status as unknown as string).toLowerCase()}
                            isOwner={user?.id === l.user_id}
                            isPaid={l.is_paid || false}
                        />

                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <span>{l.view_count || 0} views</span>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert">
                        <h3 className="text-xl font-semibold">About this car</h3>
                        <p>{l.description}</p>
                        {l.modifications && (
                            <div className="mt-6">
                                <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">Modifications</h4>
                                <p className="text-sm whitespace-pre-wrap">{l.modifications}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold mb-2">Looking for</h3>
                        {l.want_description ? (
                            <p>{l.want_description}</p>
                        ) : (
                            !l.want_make &&
                            !l.want_model &&
                            !l.want_year_min &&
                            (!l.cash_direction || l.cash_direction === 'none') &&
                            !l.cash_differential_min &&
                            !l.cash_differential_max && (
                                <p>Open to offers</p>
                            )
                        )}

                        <div className="grid grid-cols-2 gap-2 text-sm mt-4 border-t pt-2">
                            {l.want_make && (
                                <div><span className="text-muted-foreground">Make:</span> <span className="font-medium">{l.want_make}</span></div>
                            )}
                            {l.want_model && (
                                <div><span className="text-muted-foreground">Model:</span> <span className="font-medium">{l.want_model}</span></div>
                            )}
                            {l.want_year_min && (
                                <div><span className="text-muted-foreground">Min Year:</span> <span className="font-medium">{l.want_year_min}</span></div>
                            )}
                            {l.cash_direction && l.cash_direction !== 'none' && (
                                <div className="capitalize"><span className="text-muted-foreground">Cash:</span> <span className="font-medium">{l.cash_direction}</span></div>
                            )}
                        </div>
                        {(l.cash_differential_min || l.cash_differential_max) && (
                            <p className="text-sm mt-2 font-medium">
                                Cash Diff: {l.cash_differential_min ? `$${l.cash_differential_min}` : ''}
                                {l.cash_differential_min && l.cash_differential_max ? ' - ' : ''}
                                {l.cash_differential_max ? `$${l.cash_differential_max}` : ''}
                            </p>
                        )}
                    </div>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={profile?.profile_photo_url} />
                                    <AvatarFallback>{profile?.display_name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex flex-col">
                                        <CardTitle className="text-lg">{profile?.display_name || 'Deleted User'}</CardTitle>
                                        {profile?.email && (
                                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground capitalize mt-1">{profile?.account_type}</p>
                                </div>
                            </div>
                            {user?.id === l.user_id && (
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/listings/${l.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Link>
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="pt-0">
                            {user?.id !== l.user_id && (
                                <Button className="w-full" asChild>
                                    <Link href={`/messages?userId=${l.user_id}&listingId=${l.id}`}>Message Seller</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
