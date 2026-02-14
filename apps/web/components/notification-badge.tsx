'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function NotificationBadge() {
    const [count, setCount] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        let isMounted = true;

        const fetchCount = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
                const res = await fetch(`${API_URL}/messages/unread-count`, {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                });

                if (res.ok && isMounted) {
                    const data = await res.json();
                    setCount(data);
                }
            } catch (error) {
                console.error("Failed to fetch unread count", error);
            }
        };

        fetchCount();

        // Subscribe to new messages
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages'
                },
                (payload) => {
                    fetchCount();
                }
            )
            .subscribe();

        // Listen for local read events from ChatWindow
        const handleMessagesRead = () => {
            // Add a small delay to allow backend to process the read status
            setTimeout(fetchCount, 500);
            setTimeout(fetchCount, 2000); // Double check
        };
        window.addEventListener('messagesRead', handleMessagesRead);

        // Polling fallback every 10 seconds
        const interval = setInterval(fetchCount, 10000);

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
            window.removeEventListener('messagesRead', handleMessagesRead);
            clearInterval(interval);
        };
    }, [supabase]);

    return (
        <div className="relative">
            <Bell className="h-6 w-6" />
            {count > 0 && (
                <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full"
                >
                    {count > 9 ? '9+' : count}
                </Badge>
            )}
        </div>
    );
}
