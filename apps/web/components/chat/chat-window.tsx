'use client';

import { useState, useEffect, useRef } from 'react';
import { Message } from '@swapxride/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Send } from 'lucide-react';

interface ChatWindowProps {
    otherUserId: string;
    currentUserId: string;
    listingId?: string;
}

export function ChatWindow({ otherUserId, currentUserId, listingId }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [listingTitle, setListingTitle] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Fetch listing details if listingId is present
    useEffect(() => {
        const fetchListingDetails = async () => {
            if (!listingId) return;
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
                const res = await fetch(`${API_URL}/listings/${listingId}`);
                if (res.ok) {
                    const data = await res.json();
                    setListingTitle(`${data.have_year} ${data.have_make} ${data.have_model}`);
                }
            } catch (error) {
                console.error("Error fetching listing details:", error);
            }
        };
        fetchListingDetails();
    }, [listingId]);

    // Polling for messages
    useEffect(() => {
        let isMounted = true;
        setError(null);

        const fetchMessages = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
                const url = listingId
                    ? `${API_URL}/messages/${otherUserId}?listingId=${listingId}`
                    : `${API_URL}/messages/${otherUserId}`;

                const res = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) {
                        setMessages(data);
                        setIsLoading(false);
                        // Notify the app that messages have been viewed (to update badge)
                        window.dispatchEvent(new Event('messagesRead'));
                    }
                } else {
                    if (isMounted) setIsLoading(false);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
                if (isMounted) setIsLoading(false);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [otherUserId, listingId, supabase]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsSending(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
            const res = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    recipientId: otherUserId,
                    content: newMessage,
                    listingId: listingId || null
                })
            });

            if (res.ok) {
                const sentMsg = await res.json();
                setMessages([...messages, sentMsg]);
                setNewMessage('');
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b flex flex-col gap-1 flex-shrink-0">
                <span className="font-semibold">Chat</span>
                {listingTitle && (
                    <span className="text-xs text-muted-foreground">
                        Regarding: {listingTitle}
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        No messages yet. Say hello!
                    </div>
                )}
                {messages.map((msg) => {
                    const isMe = msg.sender.id === currentUserId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p>{msg.content}</p>
                                <span className="text-[10px] opacity-70 block text-right mt-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 flex-shrink-0 bg-background">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button type="submit" disabled={isSending}>
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    );
}
