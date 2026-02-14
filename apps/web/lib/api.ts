import { createClient } from '@/lib/supabase/client'

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const supabase = createClient()

    // Get the session token
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`

    return fetch(fullUrl, {
        ...options,
        headers,
    })
}
