export interface Message {
    id: string;
    sender: {
        id: string;
        email: string;
        displayName?: string;
        profilePhotoUrl?: string;
    };
    recipient: {
        id: string;
        email: string;
        displayName?: string;
        profilePhotoUrl?: string;
    };
    listing?: {
        id: string;
        haveYear: number;
        haveMake: string;
        haveModel: string;
    } | null;
    content: string;
    createdAt: string;
    readAt?: string | null;
}
