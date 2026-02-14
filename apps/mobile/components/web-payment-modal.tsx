import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Hardcoded key for stability, matching _layout.tsx
const stripePromise = loadStripe("pk_test_51SvnmUQ420A7Y8yMoHEOXuq3Jub3sxTjDk8jRkFJHx6sLIehALjCYViZnhmxn0SlvQeVkQUmkvYpn8tgYkiQEALl00xAGlKa1P");

function CheckoutForm({ onSuccess, onCancel, buttonLabel }: { onSuccess: () => void; onCancel: () => void; buttonLabel: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
            setIsLoading(false);
        } else {
            onSuccess();
        }
    };

    return (
        <View style={styles.formContainer}>
            {/* PaymentElement container - This will be managed by React Stripe JS */}
            {/* @ts-ignore */}
            <div style={{ marginBottom: 20 }}>
                <PaymentElement />
            </div>

            {message && <Text style={styles.errorText}>{message}</Text>}

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>{isLoading ? "Processing..." : buttonLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onCancel} style={styles.cancelButton} disabled={isLoading}>
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}

interface Props {
    visible: boolean;
    clientSecret: string | null;
    onSuccess: () => void;
    onCancel: () => void;
    title?: string;
    subtitle?: string;
    buttonText?: string;
}

export function WebPaymentModal({
    visible,
    clientSecret,
    onSuccess,
    onCancel,
    title = "Complete Payment",
    subtitle = "Pay $3.00 to activate your listing",
    buttonText = "Pay & Post"
}: Props) {
    if (Platform.OS !== 'web') return null;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <KeyboardAvoidingView
                behavior={(Platform.OS as string) === "ios" ? "padding" : "height"}
                style={styles.modalOverlay}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>

                        {clientSecret && (
                            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                <CheckoutForm onSuccess={onSuccess} onCancel={onCancel} buttonLabel={buttonText} />
                            </Elements>
                        )}
                        {!clientSecret && <ActivityIndicator color="#0288d1" />}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 500,
        // Web shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
    },
    errorText: {
        color: '#c62828',
        fontSize: 14,
        marginBottom: 12,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#0288d1',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    cancelText: {
        color: '#666',
    },
});
