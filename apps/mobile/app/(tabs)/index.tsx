import { StyleSheet, FlatList, View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Listing } from '@swapxride/shared';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/components/theme-provider';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Link } from 'expo-router';

import { ListingCard } from '@/components/ListingCard';

import { useAuth } from '@/components/auth-provider';

// ...

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { colorScheme } = useTheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [listings, setListings] = useState<Listing[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, [user]);

  const fetchListings = async () => {
    try {
      const [listingsData, savedData] = await Promise.all([
        api.get<Listing[]>('/listings'),
        user ? api.get<Listing[]>('/listings/saved').catch(() => []) : Promise.resolve([])
      ]);
      setListings(listingsData);
      setSavedIds(new Set(savedData.map(l => l.id)));
    } catch (err) {
      console.error(err);
      setError('Failed to load listings. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (id: string) => {
    if (!user) {
      return;
    }

    const isSaved = savedIds.has(id);
    setSavedIds(prev => {
      const next = new Set(prev);
      if (isSaved) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      await api.post(`/listings/${id}/save`, {});
    } catch (error) {
      console.error('Failed to toggle save', error);
      setSavedIds(prev => {
        const next = new Set(prev);
        if (isSaved) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  const renderItem = ({ item }: { item: Listing }) => (
    <ListingCard
      listing={item}
      isSaved={savedIds.has(item.id)}
      onToggleSave={toggleSave}
    />
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={{ color: theme.text }}>{error}</Text>
        <TouchableOpacity onPress={fetchListings} style={{ marginTop: 16, padding: 8, backgroundColor: theme.tint, borderRadius: 8 }}>
          <Text style={{ color: '#fff' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate header height approximation to pad content
  // Header top padding (10) + Logo height (65 with margins) + Header bottom padding (0) ? 
  // Let's rely on padding content and manual insets.

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={listings}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingTop: insets.top + 100 } // Increased padding to prevent initial overlap
        ]}
      />
      <View style={[styles.header, {
        paddingTop: insets.top + 10,
        paddingBottom: 10,
        backgroundColor: colorScheme === 'dark' ? 'rgba(21, 23, 24, 0.9)' : 'rgba(255, 255, 255, 0.9)'
      }]}>
        <Image
          source={colorScheme === 'dark'
            ? require('../../assets/images/logo.png')
            : require('../../assets/images/logo-light.png')}
          style={[styles.logo, colorScheme === 'light' && styles.logoLight]}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 0,
    alignItems: 'flex-start',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    // No background color for transparency
  },
  logo: {
    width: 170,
    height: 48,
    marginLeft: -10,
    marginBottom: -5,
  },
  logoLight: {
    width: 300,
    height: 100,
    marginLeft: -80,
    marginTop: -25, // Move up
    marginBottom: -6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
