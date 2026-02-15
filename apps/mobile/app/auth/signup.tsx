import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';

export default function SignupScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [accountType, setAccountType] = useState<'private' | 'dealer'>('private');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password || !fullName || !zipCode) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone_number: phone,
                    zip_code: zipCode,
                    account_type: accountType
                }
            }
        });
        setLoading(false);

        if (error) {
            Alert.alert('Sign Up Failed', error.message);
        } else {
            Alert.alert('Success', 'Check your email for the confirmation link.');
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/auth/login');
            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.form}>
                <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>

                <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f0f0f0' }]}
                    placeholder="Full Name"
                    placeholderTextColor={theme.icon}
                    value={fullName}
                    onChangeText={setFullName}
                />

                <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f0f0f0' }]}
                    placeholder="Email"
                    placeholderTextColor={theme.icon}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f0f0f0' }]}
                    placeholder="Password"
                    placeholderTextColor={theme.icon}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f0f0f0' }]}
                    placeholder="Phone Number (Optional)"
                    placeholderTextColor={theme.icon}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />

                <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f0f0f0' }]}
                    placeholder="Zip Code"
                    placeholderTextColor={theme.icon}
                    value={zipCode}
                    onChangeText={setZipCode}
                    keyboardType="numeric"
                />

                <View style={styles.accountTypeContainer}>
                    <Text style={[styles.label, { color: theme.text }]}>Account Type:</Text>
                    <View style={styles.radioGroup}>
                        <TouchableOpacity
                            style={[styles.radioButton, accountType === 'private' && { backgroundColor: theme.tint, borderColor: theme.tint }]}
                            onPress={() => setAccountType('private')}
                        >
                            <Text style={[styles.radioText, accountType === 'private' ? { color: '#fff' } : { color: theme.text }]}>Private</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.radioButton, accountType === 'dealer' && { backgroundColor: theme.tint, borderColor: theme.tint }]}
                            onPress={() => setAccountType('dealer')}
                        >
                            <Text style={[styles.radioText, accountType === 'dealer' ? { color: '#fff' } : { color: theme.text }]}>Dealer</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.tint }]}
                    onPress={handleSignup}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Sign Up</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()} style={styles.linkButton}>
                    <Text style={[styles.linkText, { color: theme.tint }]}>Already have an account? Log In</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    form: {
        gap: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    button: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    linkButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 14,
    },
    accountTypeContainer: {
        marginTop: 8,
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    radioButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    radioText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
