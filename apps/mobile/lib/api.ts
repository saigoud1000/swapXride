import { ApiClient } from '@swapxride/shared';
import { supabase } from './supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const api = new ApiClient({
    baseUrl: BASE_URL,
    getAccessToken: async () => {
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token || null;
    }
});
