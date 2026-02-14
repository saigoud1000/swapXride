import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CAR_MAKES, Listing, YEARS } from '@swapxride/shared';
import { api } from '@/lib/api';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/components/theme-provider';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Link, useRouter } from 'expo-router';
import { FilterSelect } from '@/components/filter-select';

// Define filter options
const BODY_TYPES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Wagon', 'Hatchback', 'Van', 'Motorcycle', 'Other'];

export default function SearchScreen() {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMake, setSelectedMake] = useState<string | null>(null);
    const [minYear, setMinYear] = useState<string | null>(null);
    const [maxMileage, setMaxMileage] = useState('');
    const [bodyType, setBodyType] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const data = await api.get<Listing[]>('/listings');
            setListings(data);
        } catch (error) {
            console.error('Failed to fetch listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const hasActiveFilters = selectedMake || minYear || maxMileage || bodyType;

    const filteredListings = useMemo(() => {
        return listings.filter(item => {
            const matchesSearch = searchTerm === '' ||
                item.have_make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.have_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.want_description?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesMake = selectedMake ? item.have_make === selectedMake : true;

            const matchesMinYear = minYear ? parseInt(item.have_year.toString()) >= parseInt(minYear) : true;

            const matchesMaxMileage = maxMileage
                ? parseInt(item.have_mileage.toString()) <= parseInt(maxMileage)
                : true;

            // Note: Listing type definition might need body_type if not already present
            // For now assuming we filter body type if available, otherwise ignore if property missing
            const matchesBodyType = bodyType
                // @ts-ignore - casting to any in case schema update is deferred
                ? (item as any).body_type === bodyType
                : true;

            return matchesSearch && matchesMake && matchesMinYear && matchesMaxMileage && matchesBodyType;
        });
    }, [listings, searchTerm, selectedMake, minYear, maxMileage, bodyType]);

    const renderResult = ({ item }: { item: Listing }) => (
        <Link href={`/listings/${item.id}`} asChild>
            <TouchableOpacity style={StyleSheet.flatten([styles.resultCard, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }])}>
                <Image
                    source={{ uri: item.photos && item.photos.length > 0 ? item.photos[0].url : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000' }}
                    style={styles.resultImage}
                />
                <View style={styles.resultContent}>
                    <Text style={[styles.resultTitle, { color: theme.text }]}>
                        {item.have_year} {item.have_make} {item.have_model}
                    </Text>
                    <Text style={[styles.resultSubtitle, { color: theme.icon }]} numberOfLines={1}>
                        Wants: {item.want_description || 'Open to offers'}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text style={{ color: theme.tint, fontWeight: '600' }}>{item.condition}</Text>
                        <Text style={{ color: theme.icon }}>{item.location_zip}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.searchHeader}>
                <View style={styles.searchRow}>
                    <View style={StyleSheet.flatten([styles.searchBar, { backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f0f0f0' }])}>
                        <IconSymbol name="magnifyingglass" size={20} color={theme.icon} />
                        <TextInput
                            style={StyleSheet.flatten([styles.input, { color: theme.text }])}
                            placeholder="Search for cars..."
                            placeholderTextColor={theme.icon}
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        {(searchTerm.length > 0) && (
                            <TouchableOpacity onPress={() => setSearchTerm('')}>
                                <IconSymbol name="xmark.circle.fill" size={20} color={theme.icon} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            (showFilters || hasActiveFilters) && { backgroundColor: theme.tint + '20', borderColor: theme.tint }
                        ]}
                        onPress={() => setShowFilters(!showFilters)}
                    >
                        <IconSymbol
                            name="line.3.horizontal.decrease.circle"
                            size={24}
                            color={(showFilters || hasActiveFilters) ? theme.tint : theme.icon}
                        />
                    </TouchableOpacity>
                </View>

                {showFilters && (
                    <View style={styles.filtersContainer}>
                        <View style={styles.filterRow}>
                            <View style={styles.filterCol}>
                                <FilterSelect
                                    label="Make"
                                    value={selectedMake}
                                    options={['All Makes', ...CAR_MAKES]}
                                    onSelect={(val) => setSelectedMake(val === 'All Makes' ? null : val)}
                                    placeholder="All Makes"
                                />
                            </View>
                            <View style={styles.filterCol}>
                                <FilterSelect
                                    label="Min Year"
                                    value={minYear}
                                    options={['Any Year', ...YEARS]}
                                    onSelect={(val) => setMinYear(val === 'Any Year' ? null : val)}
                                    placeholder="Any Year"
                                />
                            </View>
                        </View>

                        <View style={styles.filterRow}>
                            <View style={styles.filterCol}>
                                <Text style={[styles.filterLabel, { color: theme.icon }]}>Max Mileage</Text>
                                <View style={[styles.mileageInputContainer, { backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f0f0f0' }]}>
                                    <TextInput
                                        style={[styles.mileageInput, { color: theme.text }]}
                                        placeholder="e.g. 50000"
                                        placeholderTextColor={theme.icon}
                                        keyboardType="numeric"
                                        value={maxMileage}
                                        onChangeText={setMaxMileage}
                                    />
                                </View>
                            </View>
                            <View style={styles.filterCol}>
                                <FilterSelect
                                    label="Body Type"
                                    value={bodyType}
                                    options={['Any Type', ...BODY_TYPES]}
                                    onSelect={(val) => setBodyType(val === 'Any Type' ? null : val)}
                                    placeholder="Any Type"
                                />
                            </View>
                        </View>

                        {hasActiveFilters && (
                            <TouchableOpacity
                                style={styles.clearFiltersButton}
                                onPress={() => {
                                    setSelectedMake(null);
                                    setMinYear(null);
                                    setMaxMileage('');
                                    setBodyType(null);
                                }}
                            >
                                <Text style={[styles.clearFiltersText, { color: theme.tint }]}>Clear all filters</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            <View style={styles.content}>
                {!showFilters && !searchTerm && !hasActiveFilters && (
                    <View />
                )}

                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Results ({filteredListings.length})
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color={theme.tint} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={filteredListings}
                        renderItem={renderResult}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.resultsList}
                        ListEmptyComponent={
                            <Text style={{ textAlign: 'center', marginTop: 20, color: theme.icon }}>
                                No listings found matching your criteria.
                            </Text>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchHeader: {
        padding: 16,
        paddingBottom: 8,
    },
    searchRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 12,
        gap: 8,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filtersContainer: {
        marginTop: 16,
        gap: 8,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 12,
    },
    filterCol: {
        flex: 1,
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    mileageInputContainer: {
        borderRadius: 8,
        padding: 12,
        height: 44, // Match typical selector height
        justifyContent: 'center',
    },
    mileageInput: {
        fontSize: 16,
    },
    clearFiltersButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    clearFiltersText: {
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },

    resultsList: {
        gap: 16,
        paddingBottom: 100,
    },
    resultCard: {
        flexDirection: 'row',
        borderRadius: 12,
        overflow: 'hidden',
        height: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    resultImage: {
        width: 120,
        height: '100%',
    },
    resultContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    resultSubtitle: {
        fontSize: 14,
        color: '#666',
    },
});
