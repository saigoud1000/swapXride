
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/components/theme-provider';

export default function PaymentModal() {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { listingId } = useLocalSearchParams();

    interface PaymentIntentResponse {
        paymentIntentId: string;
        clientSecret: string;
    }

    const fetchPaymentSheetParams = async () => {
        const response = await api.post<PaymentIntentResponse>('/payments/create-payment-intent', {
            amount: 300, // $3.00
            currency: 'usd',
        });
        const { paymentIntentId, clientSecret } = response;
        return {
            paymentIntentId,
            clientSecret,
        };
    };

    const initializePaymentSheet = async () => {
        // ... unused separate init
    };

    const openPaymentSheet = async () => {
        setLoading(true);
        try {
            const { paymentIntentId, clientSecret } = await fetchPaymentSheetParams();
            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: "Generic Car Swap App",
                paymentIntentClientSecret: clientSecret,
            });

            if (initError) {
                Alert.alert('Error', initError.message);
                setLoading(false);
                return;
            }

            const { error } = await presentPaymentSheet();

            if (error) {
                Alert.alert(`Error code: ${error.code}`, error.message);
            } else {
                // Success! Activate listing
                if (listingId) {
                    await api.post(`/listings/${listingId}/activate`);
                    Alert.alert('Success', 'Your listing is now active!');
                    router.dismiss();
                    router.push({ pathname: '/listings/[id]', params: { id: listingId as string } });
                } else {
                    Alert.alert('Success', 'Payment confirmed!');
                    router.dismiss();
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Payment failed.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Listing Fee</Text>
            <Text style={[styles.description, { color: theme.text }]}>
                To maintain a high quality marketplace, we charge a small fee of $3.00 per listing.
            </Text>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.tint, opacity: loading ? 0.7 : 1 }]}
                onPress={openPaymentSheet}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Pay $3.00</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    }
});
