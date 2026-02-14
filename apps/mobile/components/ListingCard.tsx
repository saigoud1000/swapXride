import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Listing } from '@swapxride/shared';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/components/theme-provider';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function ListingCard({ listing, isSaved, onToggleSave }: { listing: Listing, isSaved?: boolean, onToggleSave?: (id: string) => void }) {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme ?? 'light'];


    // structured tags from listing data
    const tags = [
        listing.want_make,
        listing.want_model,
        listing.want_year_min ? `${listing.want_year_min}+` : null,
        listing.cash_direction === 'WANT_CASH' ? 'Want Cash' : null,
        listing.cash_direction === 'OFFER_CASH' ? 'Offer Cash' : null,
        // Fallback to description if no specific wants, or add it as extra context
        (!listing.want_make && !listing.want_model) ? listing.want_description : null
    ].filter(Boolean) as string[];

    return (
        <Link href={`/listings/${listing.id}`} asChild>
            <TouchableOpacity activeOpacity={0.9}>
                <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff' }]}>
                    {/* Image Section */}
                    <View style={[styles.imageContainer, { backgroundColor: theme.icon + '10' }]}>
                        {listing.photos && listing.photos.length > 0 ? (
                            <Image
                                source={{ uri: listing.photos[0].url }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.image, { alignItems: 'center', justifyContent: 'center', backgroundColor: theme.icon + '05' }]}>
                                <IconSymbol name="car.fill" size={48} color={theme.icon + '40'} />
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.favoriteButton}
                            onPress={(e) => {
                                // Prevent navigation when clicking heart
                                e.preventDefault && e.preventDefault();
                                onToggleSave && onToggleSave(listing.id);
                            }}
                        >
                            <IconSymbol name={isSaved ? "heart.fill" : "heart"} size={22} color={isSaved ? "#ff3b30" : "#333"} />
                        </TouchableOpacity>

                        <View style={styles.mileageBadge}>
                            <Text style={styles.mileageText}>{listing.have_mileage.toLocaleString()} mi</Text>
                        </View>
                    </View>

                    {/* Content Section */}
                    <View style={styles.content}>
                        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                            {listing.have_year} {listing.have_make} {listing.have_model}
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.icon }]} numberOfLines={1}>
                            {listing.have_trim || 'Base Model'} • {listing.body_type || 'Vehicle'}
                        </Text>

                        <View style={styles.badgeRow}>
                            {listing.is_paid ? (
                                <View style={[styles.badge, { backgroundColor: '#2563eb' }]}>
                                    <Text style={[styles.badgeText, { color: '#fff' }]}>Verified</Text>
                                </View>
                            ) : (
                                <View style={[styles.badge, { backgroundColor: theme.icon + '15' }]}>
                                    <Text style={[styles.badgeText, { color: theme.text }]}>Basic</Text>
                                </View>
                            )}
                        </View>

                        {/* Wants / Tags */}
                        <View style={styles.section}>
                            <Text style={[styles.label, { color: theme.icon }]}>Looking for:</Text>
                            <View style={styles.tagsRow}>
                                {tags.length > 0 ? tags.map((tag, index) => (
                                    <View key={index} style={[styles.tag, { borderColor: theme.icon + '40' }]}>
                                        <Text style={[styles.tagText, { color: theme.text }]}>{tag}</Text>
                                    </View>
                                )) : (
                                    <View style={[styles.tag, { borderColor: theme.icon + '40' }]}>
                                        <Text style={[styles.tagText, { color: theme.text }]}>Open to Offers</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Footer styling */}
                        <View style={[styles.footer, { borderTopColor: theme.icon + '15' }]}>
                            <Text style={[styles.footerText, { color: theme.icon }]}>{listing.location_zip}</Text>
                            <View style={styles.viewCount}>
                                <IconSymbol name="eye" size={14} color={theme.icon} />
                                <Text style={[styles.footerText, { color: theme.icon }]}>{listing.view_count || 0}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Link>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 4,
    },
    imageContainer: {
        position: 'relative',
        height: 220,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favoriteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    mileageBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    mileageText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 12,
    },
    section: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
    },
    viewCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    footerText: {
        fontSize: 12,
    },
    badgeRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});
