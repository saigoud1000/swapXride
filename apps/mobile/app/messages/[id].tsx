import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Message } from '@swapxride/shared';
import { api } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatDistanceToNow } from 'date-fns';

export default function ChatScreen() {
    const { id, listingId } = useLocalSearchParams<{ id: string; listingId?: string }>(); // id is otherUserId
    const router = useRouter();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [partnerName, setPartnerName] = useState('Chat');

    useEffect(() => {
        if (!user) {
            router.replace('/auth/login');
            return;
        }
        fetchConversation();

        // Poll for new messages every 5 seconds (Simple implementation)
        const interval = setInterval(fetchConversation, 5000);
        return () => clearInterval(interval);
    }, [id, user]);

    useEffect(() => {
        if (messages.length > 0) {
            const firstMsg = messages[0];
            const partner = firstMsg.sender.id === user?.id ? firstMsg.recipient : firstMsg.sender;
            const name = partner?.displayName || partner?.email || 'Chat';
            setPartnerName(name);
        }
    }, [messages, user]);

    const fetchConversation = async () => {
        try {
            // Fetch messages with the specific user
            // API: GET /api/v1/messages/{otherUserId}?listingId={listingId}
            const endpoint = `/messages/${id}${listingId ? `?listingId=${listingId}` : ''}`;
            const data = await api.get<Message[]>(endpoint);
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            // API: POST /api/v1/messages
            // Body: { recipientId, content, listingId }
            await api.post('/messages', {
                recipientId: id,
                content: newMessage,
                listingId: listingId ?? null,
            });
            setNewMessage('');
            fetchConversation(); // Refresh immediately
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isMe = item.sender.id === user?.id;
        const partner = isMe ? item.recipient : item.sender;
        const partnerName = partner?.displayName || partner?.email || '?';
        const partnerInitial = partnerName[0]?.toUpperCase() || '?';

        // Parse date safely, assume UTC if no offset
        const dateStr = item.createdAt ? (item.createdAt.endsWith('Z') || item.createdAt.includes('+') ? item.createdAt : item.createdAt + 'Z') : null;

        return (
            <View style={[styles.messageRow, isMe ? styles.rowRight : styles.rowLeft]}>
                {!isMe && (
                    <View style={[styles.avatarSmall, { backgroundColor: theme.icon }]}>
                        <Text style={styles.avatarTextSmall}>{partnerInitial}</Text>
                    </View>
                )}
                <View style={[
                    styles.messageBubble,
                    isMe ? styles.myMessage : styles.theirMessage,
                    { backgroundColor: isMe ? theme.tint : (colorScheme === 'dark' ? '#333' : '#e5e5ea') }
                ]}>
                    <Text style={[styles.messageText, { color: isMe ? '#fff' : theme.text }]}>{item.content}</Text>
                    <Text style={[styles.timeText, { color: isMe ? 'rgba(255,255,255,0.7)' : '#8e8e93' }]}>
                        {dateStr ? formatDistanceToNow(new Date(dateStr), { addSuffix: true }) : ''}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <Stack.Screen options={{ title: partnerName }} />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputContainer, { borderTopColor: theme.icon + '30', backgroundColor: theme.background }]}>
                    <TextInput
                        style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f0f0f0' }]}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.icon}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={sending || !newMessage.trim()}
                        style={[styles.sendButton, { backgroundColor: theme.tint, opacity: !newMessage.trim() ? 0.5 : 1 }]}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        gap: 16, // Increase gap between messages
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        maxWidth: '100%',
    },
    rowRight: {
        justifyContent: 'flex-end',
    },
    rowLeft: {
        justifyContent: 'flex-start',
    },
    avatarSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    avatarTextSmall: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        // Remove bottom margin as listContent gap handles it
    },
    myMessage: {
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
        borderTopWidth: 1,
        gap: 12,
        marginBottom: Platform.OS === 'web' ? 20 : 0, // Add spacing for web tab bar
    },
    input: {
        flex: 1,
        minHeight: 40,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 16,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
