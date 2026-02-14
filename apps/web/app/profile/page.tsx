import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ListingCard } from '@/components/listing-card'
import { ModeToggle } from '@/components/mode-toggle'
import { Listing } from '@swapxride/shared'
import { DealerCreditSection } from '@/components/dealer-credit-section'

export default async function ProfilePage() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
    const res = await fetch(`${apiUrl}/listings/my`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
    })
    const myListings = res.ok ? await res.json() : []

    let creditsData = { credits: 0 };
    if (profile?.account_type === 'Dealer') {
        const creditRes = await fetch(`${apiUrl}/payments/credits`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store'
        });
        if (creditRes.ok) {
            creditsData = await creditRes.json();
        }
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar / Profile Info */}
                <Card className="w-full md:w-1/3 h-fit">
                    <CardHeader>
                        <CardTitle>{profile?.display_name || user.email}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-sm">
                            <span className="font-semibold">Account Type:</span> {profile?.account_type || 'Private'}
                        </div>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/profile/edit">Edit Profile</Link>
                        </Button>
                        {/* Placeholder for edit functionality */}

                        <div className="pt-4 border-t">
                            <h3 className="font-semibold mb-2">Appearance</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Theme</span>
                                <ModeToggle />
                            </div>
                        </div>

                        {profile?.account_type === 'Dealer' && (
                            <DealerCreditSection initialCredits={creditsData?.credits || 0} userId={user.id} />
                        )}
                    </CardContent>
                </Card>

                {/* Listings */}
                <div className="w-full md:w-2/3">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">My Listings</h2>
                        <Button asChild>
                            <Link href="/listings/create">New Listing</Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {myListings?.map((listing: Listing) => (
                            <ListingCard key={listing.id} listing={listing} showEdit={true} />
                        ))}
                        {(!myListings || myListings.length === 0) && (
                            <div className="col-span-full text-center py-10 bg-muted rounded-lg">
                                <p className="text-muted-foreground">You haven't posted any cars yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
