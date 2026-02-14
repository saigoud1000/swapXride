'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CAR_MAKES, YEARS } from "@swapxride/shared"

export function SearchFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [showFilters, setShowFilters] = useState(false)

    const [q, setQ] = useState(searchParams.get('q') || '')
    const [make, setMake] = useState(searchParams.get('make') || '')
    const [minYear, setMinYear] = useState(searchParams.get('minYear') || '')
    const [maxMileage, setMaxMileage] = useState(searchParams.get('maxMileage') || '')

    // Sync with URL params
    useEffect(() => {
        setQ(searchParams.get('q') || '')
        setMake(searchParams.get('make') || '')
        setMinYear(searchParams.get('minYear') || '')
        setMaxMileage(searchParams.get('maxMileage') || '')
    }, [searchParams])

    const updateSearch = (overrides: { q?: string, make?: string, minYear?: string, maxMileage?: string }) => {
        const params = new URLSearchParams()
        // Use overrides if provided, otherwise fallback to current state (which might be stale, but we only override what changed)
        // Actually, mixing stale state with new overrides is risky.
        // Safer: Use valid values from args or state.

        const qVal = overrides.q !== undefined ? overrides.q : q
        const makeVal = overrides.make !== undefined ? overrides.make : make
        const minYearVal = overrides.minYear !== undefined ? overrides.minYear : minYear
        const maxMileageVal = overrides.maxMileage !== undefined ? overrides.maxMileage : maxMileage

        if (qVal) params.set('q', qVal)
        if (makeVal) params.set('make', makeVal)
        if (minYearVal) params.set('minYear', minYearVal)
        if (maxMileageVal) params.set('maxMileage', maxMileageVal)

        router.push(`/?${params.toString()}`)
    }

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault()
        updateSearch({})
    }

    const clearFilters = () => {
        setQ('')
        setMake('')
        setMinYear('')
        setMaxMileage('')
        router.push('/')
    }

    const hasActiveFilters = make || minYear || maxMileage

    return (
        <div className="w-full space-y-4">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 w-full max-w-4xl relative z-20">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search make, model, description..."
                        className="pl-9"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={showFilters || hasActiveFilters ? "secondary" : "outline"}
                        onClick={() => setShowFilters(!showFilters)}
                        className="relative min-w-[100px]"
                        aria-expanded={showFilters}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                        {hasActiveFilters && (
                            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full transition-transform animate-in zoom-in" />
                        )}
                    </Button>
                    <Button type="submit">Search</Button>
                    {(q || hasActiveFilters) && (
                        <Button type="button" variant="ghost" size="icon" onClick={clearFilters}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </form>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters || hasActiveFilters ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/40 rounded-lg border border-border mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="make" className="text-xs uppercase tracking-wider font-semibold opacity-70">Make</Label>
                        <Select value={make || 'all'} onValueChange={(val) => {
                            const newMake = val === 'all' ? '' : val;
                            setMake(newMake);
                            updateSearch({ make: newMake });
                        }}>
                            <SelectTrigger id="make">
                                <SelectValue placeholder="Any Make" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any Make</SelectItem>
                                {CAR_MAKES.map(m => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="minYear" className="text-xs uppercase tracking-wider font-semibold opacity-70">Minimum Year</Label>
                        <Select value={minYear || 'all'} onValueChange={(val) => {
                            const newMinYear = val === 'all' ? '' : val;
                            setMinYear(newMinYear);
                            updateSearch({ minYear: newMinYear });
                        }}>
                            <SelectTrigger id="minYear">
                                <SelectValue placeholder="Any Year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any Year</SelectItem>
                                {YEARS.map(y => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxMileage" className="text-xs uppercase tracking-wider font-semibold opacity-70">Max Mileage</Label>
                        <Input
                            id="maxMileage"
                            type="number"
                            placeholder="e.g. 50000"
                            value={maxMileage}
                            onChange={(e) => setMaxMileage(e.target.value)}
                            onBlur={() => updateSearch({ maxMileage: maxMileage })}
                            onKeyDown={(e) => e.key === 'Enter' && updateSearch({ maxMileage: maxMileage })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bodyType" className="text-xs uppercase tracking-wider font-semibold opacity-70">Body Type</Label>
                        <Select value={searchParams.get('body_type') || 'all'} onValueChange={(val) => {
                            const params = new URLSearchParams(searchParams.toString());
                            if (val === 'all') params.delete('body_type');
                            else params.set('body_type', val);
                            router.push(`/?${params.toString()}`);
                        }}>
                            <SelectTrigger id="bodyType">
                                <SelectValue placeholder="Any Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any Type</SelectItem>
                                {['Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Wagon', 'Hatchback', 'Van', 'Motorcycle', 'Other'].map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div >
    )
}
