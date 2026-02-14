import { StyleSheet, FlatList, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Listing } from '@swapxride/shared';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/components/theme-provider';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ListingCard } from '@/components/ListingCard';
import { Stack } from 'expo-router';

export default function SavedListingsScreen() {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSavedListings();
    }, []);

    const fetchSavedListings = async () => {
        try {
            const data = await api.get<Listing[]>('/listings/saved');
            setListings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleSave = async (id: string) => {
        // Optimistic remove from list
        setListings(prev => prev.filter(l => l.id !== id));
        try {
            await api.post(`/listings/${id}/save`, {});
        } catch (error) {
            console.error(error);
            // If failed, we would need to re-fetch or revert
            fetchSavedListings();
        }
    };

    const renderItem = ({ item }: { item: Listing }) => (
        <ListingCard
            listing={item}
            isSaved={true}
            onToggleSave={toggleSave}
        />
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
            <Stack.Screen options={{
                title: 'Saved Listings',
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
                    <Text style={{ color: theme.text, fontSize: 16 }}>No saved listings yet.</Text>
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
