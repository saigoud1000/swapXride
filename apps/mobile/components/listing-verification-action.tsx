import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/components/theme-provider';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WebPaymentModal } from '@/components/web-payment-modal';
import { api } from '@/lib/api';

import { useStripe } from '@stripe/stripe-react-native';

interface ListingVerificationActionProps {
    listingId: string;
    isPaid: boolean;
    isOwner: boolean;
    onVerificationComplete?: () => void;
}

export function ListingVerificationAction({ listingId, isPaid, isOwner, onVerificationComplete }: ListingVerificationActionProps) {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [showWebPayment, setShowWebPayment] = useState(false);
    const [webClientSecret, setWebClientSecret] = useState<string | null>(null);
    const [pendingPaymentIntentId, setPendingPaymentIntentId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    if (!isOwner || isPaid) {
        return null;
    }

    const fetchPaymentIntent = async () => {
        const response = await api.post<{ clientSecret: string; paymentIntentId: string }>('/payments/create-payment-intent', {
            amount: 500, // $5.00
            currency: 'usd',
        });
        return response;
    };

    const finalizeVerification = async (paymentIntentId: string) => {
        try {
            await api.post(`/listings/${listingId}/verify`, {
                paymentIntentId: paymentIntentId
            });
            Alert.alert('Success', 'Your listing is now Verified!');
            if (onVerificationComplete) onVerificationComplete();
        } catch (error) {
            console.error('Final verification failed', error);
            Alert.alert('Error', 'Payment successful but verification failed. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        try {
            // 1. Create PaymentIntent
            const { clientSecret, paymentIntentId } = await fetchPaymentIntent();

            // WEB HANDLING
            if (Platform.OS === 'web') {
                setWebClientSecret(clientSecret);
                setPendingPaymentIntentId(paymentIntentId);
                setShowWebPayment(true);
                return; // Wait for modal success
            }

            // MOBILE HANDLING (Stripe Native SDK)

            // 2. Initialize Payment Sheet
            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: 'SwapXRide',
                paymentIntentClientSecret: clientSecret,
                returnURL: 'mobile://stripe-redirect',
            });

            if (initError) {
                Alert.alert('Error', 'Failed to initialize payment: ' + initError.message);
                setLoading(false);
                return;
            }

            // 3. Present Payment Sheet
            const { error: paymentError } = await presentPaymentSheet();

            if (paymentError) {
                Alert.alert('Error', 'Payment failed: ' + paymentError.message);
                setLoading(false);
                return;
            }

            // 4. Verify on Backend
            await finalizeVerification(paymentIntentId);

        } catch (error) {
            console.error('Verification failed', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background, borderColor: theme.tint }]}>
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>Upgrade to Verified</Text>
                    <Text style={[styles.description, { color: theme.icon }]}>
                        Get 3x more views & top placement.
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.tint, shadowColor: theme.tint }]}
                    onPress={handleVerify}
                    disabled={loading}
                    activeOpacity={0.7}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <View style={styles.buttonContent}>
                            <IconSymbol name="checkmark" size={16} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.buttonText}>Verify ($5)</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <WebPaymentModal
                visible={showWebPayment}
                clientSecret={webClientSecret}
                onSuccess={() => {
                    setShowWebPayment(false);
                    if (pendingPaymentIntentId) {
                        finalizeVerification(pendingPaymentIntentId);
                    }
                }}
                onCancel={() => {
                    setShowWebPayment(false);
                    setLoading(false);
                }}
                title="Verify Listing"
                subtitle="Pay $5.00 to verify your listing"
                buttonText="Pay $5.00 & Verify"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginVertical: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        paddingRight: 12,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        lineHeight: 18,
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        minWidth: 120,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});
