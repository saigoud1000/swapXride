import { ListingsGrid } from '@/components/listings-grid'
import { SearchFilters } from '@/components/search-filters'
import { ViewSavedButton } from '@/components/view-saved-button'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface HomeProps {
  searchParams: {
    q?: string
    make?: string
    minYear?: string
    maxMileage?: string
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home({ searchParams }: HomeProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user


  const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
  const search = new URLSearchParams()
  if (searchParams.q) search.set('q', searchParams.q)
  if (searchParams.make) search.set('make', searchParams.make)
  if (searchParams.minYear) search.set('min_year', searchParams.minYear)
  if (searchParams.maxMileage) search.set('max_mileage', searchParams.maxMileage)

  const res = await fetch(`${apiUrl}/listings?${search.toString()}`, {
    cache: 'no-store'
  })
  const listings = res.ok ? await res.json() : []

  return (
    <main className="container mx-auto py-10 px-4">
      <div className="flex flex-col space-y-6 mb-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">SwapXRide Market</h1>
            <p className="text-muted-foreground mt-2 text-lg">The premier destination to swap your ride.</p>
          </div>
          <ViewSavedButton isAuthenticated={isAuthenticated} />
        </div>
        <SearchFilters />
      </div>

      <ListingsGrid initialListings={listings} />
    </main>
  )
}
