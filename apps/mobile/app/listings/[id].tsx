import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

import { Listing, CONDITIONS } from '@swapxride/shared';
import { api } from '@/lib/api';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/components/theme-provider';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { ListingVerificationAction } from '@/components/listing-verification-action';

export default function ListingDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { user } = useAuth();

    // State for listing data
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchListing();
    }, [id]);

    const fetchListing = async () => {
        try {
            setLoading(true);
            setError(null);
            if (!id) {
                setError('Invalid listing ID');
                return;
            }

            // Fetch listing details from API
            const data = await api.get<Listing>(`/listings/${id}`);
            setListing(data);
        } catch (err) {
            console.error('Error fetching listing:', err);
            setError('Failed to load listing details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    if (error || !listing) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text, marginBottom: 10 }}>{error || 'Listing not found'}</Text>
                <TouchableOpacity onPress={fetchListing} style={{ padding: 10, backgroundColor: theme.tint, borderRadius: 8 }}>
                    <Text style={{ color: '#fff' }}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: theme.tint }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Safety check for photos
    const displayImage = listing.photos && listing.photos.length > 0
        ? listing.photos[0].url
        : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000';

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen
                options={{
                    title: listing.have_model ? `${listing.have_year} ${listing.have_make} ${listing.have_model}` : 'Listing Details',
                    headerTintColor: theme.text,
                    headerStyle: { backgroundColor: theme.background },
                    headerShadowVisible: false,
                }}
            />
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: displayImage }} style={styles.image} resizeMode="cover" />
                </View>

                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.text }]}>
                        {listing.have_year} {listing.have_make} {listing.have_model} {listing.have_trim}
                    </Text>

                    <View style={styles.badgeContainer}>
                        {/* Verified Status */}
                        {listing.is_paid ? (
                            <View style={[styles.chip, { backgroundColor: '#007AFF', borderColor: '#007AFF' }]}>
                                <IconSymbol name="checkmark" size={12} color="#fff" style={{ marginRight: 4 }} />
                                <Text style={[styles.chipText, { color: '#fff' }]}>Verified</Text>
                            </View>
                        ) : (
                            <View style={[styles.chip, { backgroundColor: theme.background, borderColor: theme.icon + '40' }]}>
                                <Text style={[styles.chipText, { color: theme.icon }]}>Basic</Text>
                            </View>
                        )}

                        {/* Condition */}
                        <View style={[styles.chip, { backgroundColor: theme.tint + '15', borderColor: theme.tint + '30' }]}>
                            <Text style={[styles.chipText, { color: theme.tint }]}>{listing.condition}</Text>
                        </View>

                        {/* Title Status */}
                        {listing.title_status && (
                            <View style={[styles.chip, { backgroundColor: theme.background, borderColor: theme.icon + '40' }]}>
                                <Text style={[styles.chipText, { color: theme.text }]}>{listing.title_status}</Text>
                            </View>
                        )}

                        {/* Body Type */}
                        {listing.body_type && (
                            <View style={[styles.chip, { backgroundColor: theme.background, borderColor: theme.icon + '40' }]}>
                                <Text style={[styles.chipText, { color: theme.text }]}>{listing.body_type}</Text>
                            </View>
                        )}
                    </View>

                    <ListingVerificationAction
                        listingId={listing.id}
                        isPaid={listing.is_paid || false}
                        isOwner={listing.user_id === user?.id}
                        onVerificationComplete={fetchListing}
                    />

                    <View style={styles.metaContainer}>
                        <View style={styles.metaItem}>
                            <IconSymbol name="speedometer" size={14} color={theme.icon} style={{ marginRight: 4 }} />
                            <Text style={[styles.metaText, { color: theme.icon }]}>{listing.have_mileage.toLocaleString()} miles</Text>
                        </View>
                        <Text style={[styles.metaSeparator, { color: theme.icon }]}>•</Text>
                        <View style={styles.metaItem}>
                            <IconSymbol name="location.fill" size={14} color={theme.icon} style={{ marginRight: 4 }} />
                            <Text style={[styles.metaText, { color: theme.icon }]}>Zip: {listing.location_zip}</Text>
                        </View>
                        <Text style={[styles.metaSeparator, { color: theme.icon }]}>•</Text>
                        <View style={styles.metaItem}>
                            <IconSymbol name="eye" size={14} color={theme.icon} style={{ marginRight: 4 }} />
                            <Text style={[styles.metaText, { color: theme.icon }]}>{listing.view_count || 0} views</Text>
                        </View>
                    </View>

                    <View style={[styles.section, { borderColor: theme.icon + '30' }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
                        <Text style={[styles.description, { color: theme.text }]}>{listing.description}</Text>

                        {listing.modifications ? (
                            <View style={{ marginTop: 16 }}>
                                <Text style={[styles.sectionTitle, { fontSize: 16, color: theme.text, marginBottom: 4 }]}>Modifications</Text>
                                <Text style={[styles.description, { color: theme.icon }]}>{listing.modifications}</Text>
                            </View>
                        ) : null}
                    </View>

                    <View style={[styles.section, { borderBottomWidth: 0, paddingBottom: 0, backgroundColor: theme.icon + '08', padding: 16, borderRadius: 12, marginBottom: 24 }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 18, marginBottom: 8 }]}>Looking for</Text>

                        {/* Wants Description */}
                        {listing.want_description ? (
                            <Text style={[styles.wantText, { color: theme.text, marginBottom: 16, lineHeight: 22 }]}>{listing.want_description}</Text>
                        ) : (
                            (!listing.want_make && !listing.want_model && !listing.want_year_min && (!listing.cash_direction || listing.cash_direction === 'none')) ? (
                                <Text style={[styles.wantText, { color: theme.text, marginBottom: 16 }]}>Open to offers</Text>
                            ) : null
                        )}

                        {/* Wants Details Grid - only show if there are details */}
                        {(listing.want_make || listing.want_model || listing.want_year_min || (listing.cash_direction && listing.cash_direction !== 'none')) && (
                            <View style={{ borderTopWidth: 1, borderTopColor: theme.icon + '20', paddingTop: 16 }}>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                                    {listing.want_make && (
                                        <View style={{ width: '45%' }}>
                                            <Text style={{ fontSize: 12, color: theme.icon, marginBottom: 2 }}>Make</Text>
                                            <Text style={{ fontSize: 15, color: theme.text, fontWeight: '600' }}>{listing.want_make}</Text>
                                        </View>
                                    )}
                                    {listing.want_model && (
                                        <View style={{ width: '45%' }}>
                                            <Text style={{ fontSize: 12, color: theme.icon, marginBottom: 2 }}>Model</Text>
                                            <Text style={{ fontSize: 15, color: theme.text, fontWeight: '600' }}>{listing.want_model}</Text>
                                        </View>
                                    )}
                                    {listing.want_year_min && (
                                        <View style={{ width: '45%' }}>
                                            <Text style={{ fontSize: 12, color: theme.icon, marginBottom: 2 }}>Min Year</Text>
                                            <Text style={{ fontSize: 15, color: theme.text, fontWeight: '600' }}>{listing.want_year_min}</Text>
                                        </View>
                                    )}
                                    {(listing.cash_direction && listing.cash_direction !== 'none') && (
                                        <View style={{ width: '45%' }}>
                                            <Text style={{ fontSize: 12, color: theme.icon, marginBottom: 2 }}>Cash</Text>
                                            <Text style={{ fontSize: 15, color: theme.text, fontWeight: '600', textTransform: 'capitalize' }}>
                                                {listing.cash_direction === 'WANT_CASH' ? 'Asking for Cash' : 'Offering Cash'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={[styles.section, { borderColor: theme.icon + '30' }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Seller</Text>
                        <View style={styles.sellerRow}>
                            <View style={[styles.avatar, { backgroundColor: theme.icon }]}>
                                <Text style={styles.avatarText}>{listing.user_info?.display_name ? listing.user_info.display_name[0] : '?'}</Text>
                            </View>
                            <View>
                                <Text style={[styles.sellerName, { color: theme.text }]}>{listing.user_info?.display_name || 'Unknown User'}</Text>
                                {listing.user_info?.email ? (
                                    <Text style={{ color: theme.icon, fontSize: 13, marginTop: 2 }}>{listing.user_info.email}</Text>
                                ) : null}
                                <View style={{ flexDirection: 'row', marginTop: 6 }}>
                                    <View style={{ backgroundColor: theme.icon + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                                        <Text style={{ color: theme.text, fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}>
                                            {listing.user_info?.account_type || 'Private'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.icon + '30' }]}>
                <TouchableOpacity
                    style={[styles.messageButton, { backgroundColor: theme.tint }]}
                    onPress={() => router.push({
                        pathname: `/messages/${listing.user_id}`,
                        params: { listingId: listing.id }
                    })}
                >
                    <Text style={styles.messageButtonText}>Message Seller</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        height: 300,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 4,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    metaText: {
        fontSize: 16,
        color: '#666',
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipText: {
        fontWeight: '600',
        fontSize: 13,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 24,
        paddingLeft: 2,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaSeparator: {
        marginHorizontal: 8,
        fontSize: 14,
    },
    section: {
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    wantText: {
        fontSize: 16,
        lineHeight: 24,
        fontStyle: 'italic',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    sellerName: {
        fontSize: 16,
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 1,
        paddingBottom: 40,
    },
    messageButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    messageButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
