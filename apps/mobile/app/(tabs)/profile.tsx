import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/components/theme-provider';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { themePreference, setThemePreference, colorScheme } = useTheme();
    const theme = Colors[colorScheme ?? 'light'];

    if (!user) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={[styles.title, { color: theme.text }]}>Welcome to SwapXRide</Text>
                <Text style={[styles.subtitle, { color: theme.icon }]}>Log in to manage your listings and messages.</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.tint }]}
                        onPress={() => router.push('/auth/login')}
                    >
                        <Text style={styles.buttonText}>Log In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.tint, marginTop: 12 }]}
                        onPress={() => router.push('/auth/signup')}
                    >
                        <Text style={[styles.buttonText, { color: theme.tint }]}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{user.email?.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={[styles.email, { color: theme.text }]}>{user.email}</Text>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.icon }]}>Appearance</Text>
            </View>

            <View style={[styles.segmentContainer, { backgroundColor: theme.icon + '20' }]}>
                {(['light', 'dark', 'system'] as const).map((mode) => (
                    <TouchableOpacity
                        key={mode}
                        style={[
                            styles.segmentButton,
                            themePreference === mode && { backgroundColor: theme.background, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }
                        ]}
                        onPress={() => setThemePreference(mode)}
                    >
                        <Text style={[
                            styles.segmentText,
                            { color: themePreference === mode ? theme.text : theme.icon },
                            { textTransform: 'capitalize' }
                        ]}>
                            {mode}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.content}>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.tint, marginBottom: 12 }]}
                    onPress={() => router.push('/my-listings')}
                >
                    <Text style={styles.buttonText}>My Listings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.tint, marginBottom: 12 }]}
                    onPress={() => router.push('/saved-listings')}
                >
                    <Text style={styles.buttonText}>View Saved Car</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#ff3b30' }]}
                    onPress={async () => {
                        await signOut();
                        router.replace('/auth/login');
                    }}
                >
                    <Text style={styles.buttonText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 32,
        textAlign: 'center',
    },
    buttonContainer: {
        width: '100%',
        gap: 0,
    },
    button: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    email: {
        fontSize: 18,
        fontWeight: '500',
    },
    content: {
        width: '100%',
    },
    actionButton: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    sectionHeader: {
        width: '100%',
        marginBottom: 8,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    segmentContainer: {
        flexDirection: 'row',
        width: '100%',
        height: 40,
        borderRadius: 10,
        padding: 2,
        marginBottom: 24,
    },
    segmentButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
