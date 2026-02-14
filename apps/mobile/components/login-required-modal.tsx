import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/components/theme-provider';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface LoginRequiredModalProps {
    visible: boolean;
    onClose: () => void;
}

export function LoginRequiredModal({ visible, onClose }: LoginRequiredModalProps) {
    const router = useRouter();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme ?? 'light'];

    const handleLogin = () => {
        onClose();
        router.push('/auth/login');
    };

    const handleSignUp = () => {
        onClose();
        router.push('/auth/signup');
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: theme.background }]}>
                    <View style={styles.iconContainer}>
                        <IconSymbol name="lock.fill" size={48} color={theme.tint} />
                    </View>

                    <Text style={[styles.title, { color: theme.text }]}>Login Required</Text>
                    <Text style={[styles.message, { color: theme.icon }]}>
                        You must be logged in to post a new listing.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.tint }]}
                            onPress={handleLogin}
                        >
                            <Text style={styles.buttonText}>Log In</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.outlineButton, { borderColor: theme.tint }]}
                            onPress={handleSignUp}
                        >
                            <Text style={[styles.buttonText, { color: theme.tint }]}>Sign Up</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={[styles.cancelText, { color: theme.icon }]}>Maybe Later</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconContainer: {
        marginBottom: 16,
        padding: 16,
        borderRadius: 50,
        backgroundColor: 'rgba(10, 126, 164, 0.1)',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        padding: 12,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
