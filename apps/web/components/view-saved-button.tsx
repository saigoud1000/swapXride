'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ViewSavedButtonProps {
    isAuthenticated: boolean
}

export function ViewSavedButton({ isAuthenticated }: ViewSavedButtonProps) {
    // If not authenticated, do not render anything
    if (!isAuthenticated) return null

    return (
        <Button variant="outline" asChild>
            <Link href="/saved">View Saved</Link>
        </Button>
    )
}
