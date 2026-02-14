'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CAR_MAKES, YEARS, CONDITIONS, TITLE_STATUSES, CASH_DIRECTIONS } from "@swapxride/shared"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, X } from 'lucide-react'
import { PaymentModal } from '@/components/payment-modal'

const formSchema = z.object({
    have_year: z.string().min(4),
    have_make: z.string().min(1),
    have_model: z.string().min(1),
    body_type: z.string().min(1),
    have_trim: z.string().optional(),
    have_mileage: z.string().min(1), // Parse to int later
    location_zip: z.string().min(5),
    want_description: z.string().optional(),
    cash_differential_min: z.string().optional(),
    cash_differential_max: z.string().optional(),
    description: z.string().optional(),
    condition: z.string().optional(),
    title_status: z.string().optional(),
    modifications: z.string().optional(),
    want_make: z.string().min(1, "Preferred make is required"),
    want_model: z.string().min(1, "Preferred model is required"),
    want_year_min: z.string().min(1, "Minimum year is required"),
    cash_direction: z.string().min(1, "Cash preference is required"),
})

interface ListingFormProps {
    initialData?: any
    initialPhotos?: any[]
}

export function ListingForm({ initialData, initialPhotos }: ListingFormProps) {
    const router = useRouter()
    const [uploading, setUploading] = useState(false)
    const [newFiles, setNewFiles] = useState<File[]>([])
    const [currentPhotos, setCurrentPhotos] = useState<any[]>(initialPhotos || [])
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentListingId, setPaymentListingId] = useState<string | null>(null)
    const isEditing = !!initialData

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            have_year: initialData?.have_year?.toString() || '',
            have_make: initialData?.have_make || '',
            have_model: initialData?.have_model || '',
            body_type: initialData?.body_type || '',
            have_trim: initialData?.have_trim || '',
            have_mileage: initialData?.have_mileage?.toString() || '',
            location_zip: initialData?.location_zip || '',
            want_description: initialData?.want_description || '',
            cash_differential_min: initialData?.cash_differential_min?.toString() || '',
            cash_differential_max: initialData?.cash_differential_max?.toString() || '',
            description: initialData?.description || '',
            condition: initialData?.condition || '',
            title_status: initialData?.title_status || '',
            modifications: initialData?.modifications || '',
            want_make: initialData?.want_make || '',
            want_model: initialData?.want_model || '',
            want_year_min: initialData?.want_year_min?.toString() || '',
            cash_direction: initialData?.cash_direction || '',
        },
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])
        const totalPhotos = currentPhotos.length + newFiles.length + selectedFiles.length

        if (totalPhotos > 10) {
            alert('You can only have up to 10 photos per listing.')
            return
        }

        setNewFiles(prev => [...prev, ...selectedFiles])
    }

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index))
    }

    const deleteExistingPhoto = (photoId: string) => {
        if (!confirm('Are you sure you want to delete this photo?')) return
        setCurrentPhotos(prev => prev.filter(p => p.id !== photoId))
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setUploading(true)

        // Validate photos
        const totalPhotos = currentPhotos.length + newFiles.length
        if (totalPhotos === 0) {
            alert('At least one photo is required to create a listing.')
            setUploading(false)
            return
        }


        try {
            const supabase = createClient()

            // Check auth

            const { data, error: authError } = await supabase.auth.getUser()

            if (authError || !data?.user) {
                console.error('Auth error or no user:', authError)
                alert('You must be logged in to manage listings')
                setUploading(false)
                return
            }

            const user = data.user

            // Upload new photos if any
            const photoRequests: { url: string; display_order: number }[] = []

            // Add existing photos to the payload if they weren't deleted
            currentPhotos.forEach((p, i) => {
                photoRequests.push({ url: p.url, display_order: i })
            })

            if (newFiles.length > 0) {


                for (let i = 0; i < newFiles.length; i++) {
                    const file = newFiles[i]
                    const fileExt = file.name.split('.').pop()
                    const filePath = `${user.id}/${initialData?.id || 'new'}/${Math.random()}.${fileExt}`

                    const { error: uploadError } = await supabase.storage
                        .from('photos')
                        .upload(filePath, file)

                    if (uploadError) {
                        console.error('Photo upload error:', uploadError)
                        continue
                    }

                    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath)
                    photoRequests.push({ url: publicUrl, display_order: photoRequests.length })
                }
            }

            const payload = {
                body_type: values.body_type,
                have_year: parseInt(values.have_year),
                have_make: values.have_make,
                have_model: values.have_model,
                have_trim: values.have_trim,
                have_mileage: parseInt(values.have_mileage),
                location_zip: values.location_zip,
                want_description: values.want_description,
                cash_differential_min: values.cash_differential_min ? parseInt(values.cash_differential_min) : null,
                cash_differential_max: values.cash_differential_max ? parseInt(values.cash_differential_max) : null,
                description: values.description,
                condition: values.condition,
                title_status: values.title_status,
                modifications: values.modifications,
                want_make: values.want_make,
                want_model: values.want_model,
                want_year_min: values.want_year_min ? parseInt(values.want_year_min) : null,
                cash_direction: values.cash_direction,
                photos: photoRequests
            }

            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('No session found')

            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/listings${isEditing ? `/${initialData.id}` : ''}`
            const response = await fetch(apiUrl, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                const listingResponse = await response.json();
                // Listing is now created and active (basic).
                // Prompt for optional verification.
                setPaymentListingId(listingResponse.id);
                setShowPaymentModal(true);
                setUploading(false);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} listing`)
            }
        } catch (err: any) {
            console.error('Unexpected error in onSubmit:', err)
            alert(`An error occurred: ${err.message || 'Unknown error'}`)
            setUploading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="have_year" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Year <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {YEARS.map(year => (
                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="have_make" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Make <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select make" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {CAR_MAKES.map(make => (
                                        <SelectItem key={make} value={make}>{make}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="body_type" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Body Type <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {['Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Wagon', 'Hatchback', 'Van', 'Motorcycle', 'Other'].map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="have_model" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Model <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input placeholder="M3" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="have_trim" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Trim</FormLabel>
                            <FormControl><Input placeholder="Competition" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="have_mileage" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mileage <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input placeholder="25000" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="location_zip" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Zip Code <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input placeholder="90210" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="Tell us about your car..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="condition" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Condition</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="title_status" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select title status" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {TITLE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <FormField control={form.control} name="modifications" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Modifications</FormLabel>
                        <FormControl><Textarea placeholder="List any mods..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <div className="p-4 border rounded-lg bg-muted/20">
                    <h3 className="font-semibold mb-4">Swap Preferences</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="want_make" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preferred Make <span className="text-destructive">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Any">Any</SelectItem>
                                        {CAR_MAKES.map(make => <SelectItem key={make} value={make}>{make}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="want_model" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preferred Model <span className="text-destructive">*</span></FormLabel>
                                <FormControl><Input placeholder="Any" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="want_year_min" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Min Year <span className="text-destructive">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="0">Any</SelectItem>
                                        {YEARS.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="cash_direction" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cash Preferences <span className="text-destructive">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Negotiable" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {CASH_DIRECTIONS.map(cd => <SelectItem key={cd.value} value={cd.value}>{cd.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-base font-semibold">Photos (1-10) <span className="text-destructive">*</span></Label>

                    <div className="grid grid-cols-3 gap-4">
                        {/* Existing Photos */}
                        {currentPhotos.map((p) => (
                            <div key={`current-${p.id}`} className="aspect-square relative rounded-md overflow-hidden bg-muted group border border-border">
                                <img src={p.url} alt="Listing" className="object-cover w-full h-full" />
                                <button
                                    type="button"
                                    onClick={() => deleteExistingPhoto(p.id)}
                                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        {/* New File Previews */}
                        {newFiles.map((file, i) => (
                            <div key={`new-${i}`} className="aspect-square relative rounded-md overflow-hidden bg-muted group border border-border ring-2 ring-primary">
                                <img src={URL.createObjectURL(file)} alt="Preview" className="object-cover w-full h-full opacity-70" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-[10px] font-bold bg-primary text-white px-1 rounded uppercase">New</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeNewFile(i)}
                                    className="absolute top-1 right-1 bg-secondary text-secondary-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                        {/* Add Slots */}
                        {currentPhotos.length + newFiles.length < 10 && (
                            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 rounded-md cursor-pointer transition-colors bg-muted/50">
                                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                    <Plus className="h-6 w-6" />
                                    <span className="text-xs">Add Photo</span>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                            </label>
                        )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                        {10 - (currentPhotos.length + newFiles.length)} slots remaining.
                    </div>
                </div>

                <Button type="submit" disabled={uploading}>
                    {uploading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Listing')}
                </Button>
            </form>
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                listingId={paymentListingId}
                onSuccess={() => {
                    setShowPaymentModal(false);
                    router.push('/profile');
                    router.refresh();
                }}
                onSkip={() => {
                    setShowPaymentModal(false);
                    router.push('/profile');
                }}
            />
        </Form>
    )
}

