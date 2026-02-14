import { StyleSheet, FlatList, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Listing } from '@swapxride/shared';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/components/theme-provider';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ListingCard } from '@/components/ListingCard';
import { Stack } from 'expo-router';

export default function MyListingsScreen() {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyListings();
    }, []);

    const fetchMyListings = async () => {
        try {
            const data = await api.get<Listing[]>('/listings/my');
            setListings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Note: We are reusing ListingCard. For 'My Listings', toggling save might not be the primary action,
    // but we can leave it as is or pass isSaved={false} if we don't want to show the heart logic here,
    // or handle it if we want users to be able to heart their own posts. 
    // Usually users don't heart their own posts, so we might want to hide the heart or make it readonly.
    // For now, we'll reuse the card as is.

    const renderItem = ({ item }: { item: Listing }) => (
        <ListingCard
            listing={item}
        // Optional: Hide heart or special handling
        />
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
            <Stack.Screen options={{
                title: 'My Listings',
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
                headerShadowVisible: false,
            }} />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : listings.length === 0 ? (
                <View style={styles.center}>
                    <Text style={{ color: theme.text, fontSize: 16 }}>You haven't posted any cars yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={listings}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        padding: 16,
        gap: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
