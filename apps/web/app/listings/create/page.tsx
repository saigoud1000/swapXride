import { ListingForm } from './listing-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateListingPage() {
    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Create Listing</CardTitle>
                    <CardDescription>Enter details about the car you have and what you're looking for.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ListingForm />
                </CardContent>
            </Card>
        </div>
    )
}
