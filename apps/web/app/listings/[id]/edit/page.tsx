import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ListingForm } from '../../create/listing-form'
import { ListingPaymentAction } from '@/components/listing-payment-action'

interface EditListingPageProps {
    params: { id: string }
}

export default async function EditListingPage({ params }: EditListingPageProps) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
    const res = await fetch(`${API_URL}/listings/${params.id}`, {
        cache: 'no-store'
    })

    if (!res.ok) {
        if (res.status === 404) notFound()
        console.error('Failed to fetch listing for edit', await res.text())
        throw new Error('Failed to fetch listing')
    }

    const listing = await res.json()

    if (!listing) {
        notFound()
    }

    // Verify ownership
    if (listing.user_id !== user.id) {
        redirect('/')
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Listing</CardTitle>
                    <CardDescription>Update your car details and add new photos.</CardDescription>
                    <ListingPaymentAction
                        listingId={listing.id}
                        status={listing.status}
                        isOwner={true}
                        isPaid={listing.is_paid}
                    />
                </CardHeader>
                <CardContent>
                    <ListingForm initialData={listing} initialPhotos={listing.photos} />
                </CardContent>
            </Card>
        </div>
    )
}
