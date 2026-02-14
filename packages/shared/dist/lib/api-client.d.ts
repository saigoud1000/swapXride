export interface ApiClientConfig {
    baseUrl: string;
    getAccessToken?: () => Promise<string | null | undefined>;
}
export declare class ApiClient {
    private config;
    constructor(config: ApiClientConfig);
    fetch(endpoint: string, options?: RequestInit): Promise<Response>;
    get<T>(endpoint: string, options?: RequestInit): Promise<T>;
    post<T>(endpoint: string, body: any, options?: RequestInit): Promise<T>;
}
