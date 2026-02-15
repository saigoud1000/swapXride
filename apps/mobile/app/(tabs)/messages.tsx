import { Message } from '@swapxride/shared';
import { api } from '@/lib/api';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/components/theme-provider';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';

import { useAuth } from '@/components/auth-provider';

export default function MessagesScreen() {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            // Fetch inbox conversations
            const data = await api.get<Message[]>('/messages/inbox');
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Message }) => {
        // Fallback for sender info if not fully populated by API yet
        // In a real app, the API should return a 'sender' object populated
        // We'll assume the type matches for now or handle missing fields safely
        const isMe = item.sender.id === user?.id;
        const partner = isMe ? item.recipient : item.sender;
        const partnerName = partner?.displayName || partner?.email || 'Unknown User';
        const partnerInitial = partnerName[0]?.toUpperCase() || '?';

        return (
            <TouchableOpacity
                style={[styles.messageRow, { borderBottomColor: theme.icon + '20', backgroundColor: item.readAt ? 'transparent' : theme.tint + '10' }]}
                onPress={() => {
                    const partnerId = partner.id;
                    router.push({
                        pathname: `/messages/${partnerId}` as any,
                        params: { listingId: item.listing?.id }
                    });
                }}
            >
                <View style={[styles.avatar, { backgroundColor: theme.icon }]}>
                    <Text style={styles.avatarText}>{partnerInitial}</Text>
                </View>
                <View style={styles.messageContent}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.senderName, { color: theme.text }]}>{partnerName}</Text>
                        <Text style={styles.timeText}>
                            {item.createdAt ? formatDistanceToNow(new Date(item.createdAt.endsWith('Z') || item.createdAt.includes('+') ? item.createdAt : item.createdAt + 'Z'), { addSuffix: true }) : ''}
                        </Text>
                    </View>
                    <Text style={[styles.messageText, { color: !item.readAt ? theme.text : '#666', fontWeight: !item.readAt ? '600' : '400' }]} numberOfLines={1}>
                        {isMe ? 'You: ' : ''}{item.content}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Messages</Text>
            </View>

            {loading ? (
                <View style={[styles.center, { flex: 1 }]}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : (
                <FlatList
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={{ color: '#666', marginTop: 20 }}>No messages yet.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    messageRow: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    messageContent: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    senderName: {
        fontSize: 16,
        fontWeight: '600',
    },
    timeText: {
        fontSize: 12,
        color: '#666',
    },
    messageText: {
        fontSize: 14,
    },
});
