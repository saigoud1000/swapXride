'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {

    const supabase = createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string



    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error.message)
        return { error: error.message }
    }



    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {

    const supabase = createClient()

    try {
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string
        const phone = formData.get('phone') as string
        const zipCode = formData.get('zipCode') as string
        const accountType = formData.get('accountType') as string

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone_number: phone,
                    zip_code: zipCode,
                    account_type: accountType
                }
            }
        })

        if (error) {
            console.error('Signup error:', error.message)
            return { error: error.message }
        }



        revalidatePath('/', 'layout')
        redirect('/')
    } catch (e: any) {
        if (e.message === 'NEXT_REDIRECT') {
            throw e;
        }
        console.error('Unexpected signup error:', e)
        return { error: e.message || 'An unexpected error occurred during signup' }
    }
}
export async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
export async function updateProfile(formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const displayName = formData.get('displayName') as string
    const locationZip = formData.get('locationZip') as string
    const accountType = formData.get('accountType') as string

    const { error } = await supabase
        .from('profiles')
        .update({
            display_name: displayName,
            location_zip: locationZip,
            account_type: accountType,
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/profile')
    return { success: true }
}

export async function deleteListing(id: string) {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        return { error: 'Not authenticated' }
    }

    try {
        const apiUrl = `${process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL}/listings/${id}`
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return { error: errorData.message || 'Failed to delete listing from server' }
        }

        revalidatePath('/')
        revalidatePath('/profile')
        return { success: true }
    } catch (err: any) {
        return { error: err.message || 'Network error' }
    }
}
