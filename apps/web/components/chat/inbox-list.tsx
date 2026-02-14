'use client';

import { Message } from '@swapxride/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@swapxride/shared';
import { formatDistanceToNow } from 'date-fns';

interface InboxListProps {
    conversations: Message[]; // List of latest message per conversation
    currentUserId: string;
    selectedUserId?: string;
    onSelectUser: (userId: string) => void;
}

export function InboxList({ conversations, currentUserId, selectedUserId, onSelectUser }: InboxListProps) {
    return (
        <div className="flex flex-col h-full overflow-y-auto border-r">
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Inbox</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                        No conversations yet.
                    </div>
                ) : (
                    conversations.map((msg) => {
                        const otherUser = msg.sender.id === currentUserId ? msg.recipient : msg.sender;
                        const isSelected = selectedUserId === otherUser.id;

                        return (
                            <button
                                key={msg.id}
                                onClick={() => onSelectUser(otherUser.id)}
                                className={cn(
                                    "w-full flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors border-b",
                                    isSelected && "bg-muted"
                                )}
                            >
                                <Avatar>
                                    <AvatarFallback>{otherUser.display_name?.[0] || otherUser.email[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-semibold truncate">{otherUser.display_name || otherUser.email}</span>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {msg.sender.id === currentUserId && "You: "}
                                        {msg.content}
                                    </p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
