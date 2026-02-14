export interface ApiClientConfig {
    baseUrl: string;
    getAccessToken?: () => Promise<string | null | undefined>;
}

export class ApiClient {
    private config: ApiClientConfig;

    constructor(config: ApiClientConfig) {
        this.config = config;
    }

    async fetch(endpoint: string, options: RequestInit = {}) {
        const { baseUrl, getAccessToken } = this.config;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (getAccessToken) {
            const token = await getAccessToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

        return fetch(url, {
            ...options,
            headers,
        });
    }

    async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const res = await this.fetch(endpoint, { ...options, method: 'GET' });
        if (!res.ok) {
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        const text = await res.text();
        return text ? JSON.parse(text) : {} as T;
    }

    async post<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
        const res = await this.fetch(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        const text = await res.text();
        return text ? JSON.parse(text) : {} as T;
    }
}
