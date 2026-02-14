
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useState } from 'react';
import { Stack, router } from 'expo-router';
import { api } from '@/lib/api';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/components/auth-provider';

export default function DealerPaymentScreen() {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { user } = useAuth(); // Assuming useAuth gives us user info including ID

    interface PaymentIntentResponse {
        paymentIntentId: string;
        clientSecret: string;
    }

    const handleBuyPackage = async (amount: number, credits: number) => {
        setLoading(true);
        try {
            const response = await api.post<PaymentIntentResponse>('/payments/create-payment-intent', {
                amount: amount,
                currency: 'usd',
            });
            const { paymentIntentId, clientSecret } = response;

            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: "Generic Car Swap App",
                paymentIntentClientSecret: clientSecret,
            });

            if (initError) {
                Alert.alert('Error', initError.message);
                return;
            }

            const { error } = await presentPaymentSheet();

            if (error) {
                Alert.alert(`Error code: ${error.code}`, error.message);
            } else {
                // Success! Add credits.
                // NOTE: In production, rely on webhooks. This is insecure for client-side trusting.
                await api.post('/payments/add-credits', {
                    userId: user?.id,
                    credits: credits
                });

                Alert.alert('Success', `Purchased ${credits} credits!`);
                router.dismiss();
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Payment failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ title: 'Buy Dealer Credits' }} />

            <Text style={[styles.header, { color: theme.text }]}>Select a Credit Package</Text>

            <View style={styles.packageContainer}>
                <PackageCard
                    title="Starter Pack"
                    price="$50.00"
                    credits="100 Credits"
                    onPress={() => handleBuyPackage(5000, 100)}
                    theme={theme}
                    loading={loading}
                />
                <PackageCard
                    title="Pro Pack"
                    price="$100.00"
                    credits="200 Credits"
                    onPress={() => handleBuyPackage(10000, 200)}
                    theme={theme}
                    loading={loading}
                />
            </View>
        </View>
    );
}

const PackageCard = ({ title, price, credits, onPress, theme, loading }: any) => (
    <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={onPress}
        disabled={loading}
    >
        <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.credits, { color: theme.tint }]}>{credits}</Text>
        <Text style={[styles.price, { color: theme.text }]}>{price}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    packageContainer: {
        gap: 16,
    },
    card: {
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    credits: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});
