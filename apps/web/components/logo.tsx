'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export function Logo() {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        // Render a placeholder or the default logo (light) to match server HTML
        // Use a generic size placeholder to avoid layout shift
        return <div className="h-28 w-[350px]" />
    }

    const src = resolvedTheme === 'dark' ? '/logo-dark-optimized.png' : '/logo-trimmed.png'

    return (
        <Image
            src={src}
            alt="SwapXRide"
            width={250}
            height={60}
            className="object-contain object-left w-[80px] h-auto max-h-32"
            priority
        />
    )
}
