'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@swapxride/shared'

interface PhotoCarouselProps {
    photos: { url: string }[]
    className?: string
}

export function PhotoCarousel({ photos, className }: PhotoCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    if (!photos || photos.length === 0) {
        return (
            <div className={cn("aspect-video bg-muted flex items-center justify-center text-muted-foreground", className)}>
                No Photos
            </div>
        )
    }

    const next = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentIndex((prev) => (prev + 1) % photos.length)
    }

    const prev = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
    }

    return (
        <div className={cn("relative group aspect-video bg-muted overflow-hidden", className)}>
            <img
                src={photos[currentIndex].url}
                alt={`Photo ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-300"
            />

            {photos.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {photos.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setCurrentIndex(i)
                                }}
                                className={cn(
                                    "h-1.5 w-1.5 rounded-full transition-all",
                                    i === currentIndex ? "bg-white w-4" : "bg-white/50"
                                )}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
