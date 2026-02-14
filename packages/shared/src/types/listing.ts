export interface Photo {
    id: string;
    url: string;
    display_order: number;
}

export interface UserInfo {
    id: string;
    display_name: string;
    email?: string;
    profile_photo_url: string;
    account_type: string;
}

export interface Listing {
    id: string;
    user_id: string;
    user_info?: UserInfo;
    photos: Photo[];
    have_year: number;
    have_make: string;
    have_model: string;
    body_type?: string;
    have_trim: string;
    have_mileage: number;
    location_zip: string;
    want_description: string;
    cash_differential_min: number | null;
    cash_differential_max: number | null;
    description: string;
    condition?: string;
    title_status?: string;
    modifications?: string;
    want_make?: string;
    want_model?: string;
    want_year_min?: number;
    cash_direction?: string;
    status: 'active' | 'pending_payment' | 'sold' | 'expired' | 'deleted';
    view_count: number;
    created_at: string;
    is_paid: boolean;
}
