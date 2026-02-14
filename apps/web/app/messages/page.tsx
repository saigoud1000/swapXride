'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Message } from '@swapxride/shared';
import { InboxList } from '@/components/chat/inbox-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Message[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();

    const urlUserId = searchParams.get('userId');
    const urlListingId = searchParams.get('listingId') || undefined;
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>(urlUserId || undefined);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setCurrentUser(user);

            // Fetch Inbox
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
                const res = await fetch(`${API_URL}/messages/inbox`, {
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data);
                }
            } catch (err) {
                console.error("Failed to load inbox", err);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [router, supabase]);

    useEffect(() => {
        if (urlUserId) {
            setSelectedUserId(urlUserId);
        }
    }, [urlUserId]);

    const handleSelectUser = (userId: string) => {
        setSelectedUserId(userId);
        router.push(`/messages?userId=${userId}`, { scroll: false });
    };

    if (loading) {
        return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="container mx-auto py-6 h-[calc(100vh-100px)]">
            <div className="grid grid-cols-1 md:grid-cols-3 h-full gap-6 bg-card rounded-lg shadow-sm border overflow-hidden">
                <div className={`${selectedUserId ? 'hidden md:block' : 'block'} md:col-span-1 border-r`}>
                    <InboxList
                        conversations={conversations}
                        currentUserId={currentUser.id}
                        selectedUserId={selectedUserId}
                        onSelectUser={handleSelectUser}
                    />
                </div>
                <div className={`${!selectedUserId ? 'hidden md:block' : 'block'} md:col-span-2 h-full overflow-hidden`}>
                    {selectedUserId ? (
                        <div className="flex flex-col h-full">
                            <div className="md:hidden p-2 border-b">
                                <Button variant="ghost" onClick={() => setSelectedUserId(undefined)}>Back to Inbox</Button>
                            </div>
                            <ChatWindow
                                otherUserId={selectedUserId}
                                currentUserId={currentUser.id}
                                listingId={urlListingId}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground p-10 text-center">
                            <div>
                                <h3 className="text-lg font-medium mb-2">Your Messages</h3>
                                <p>Select a conversation to start chatting.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

