import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@/components/theme-provider';
import { Colors } from '@/constants/theme';

interface FilterSelectProps {
    label: string;
    value: string | null;
    options: string[];
    onSelect: (value: string | null) => void;
    placeholder: string;
}

export function FilterSelect({ label, value, options, onSelect, placeholder }: FilterSelectProps) {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: theme.icon }]}>{label}</Text>
            <TouchableOpacity
                style={[styles.selector, { backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f0f0f0' }]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={[styles.value, { color: value ? theme.text : theme.icon }]}>
                    {value || placeholder}
                </Text>
                <IconSymbol name="chevron.down" size={16} color={theme.icon} />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                            <IconSymbol name="xmark" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Select {label}</Text>
                        <TouchableOpacity onPress={() => { onSelect(null); setModalVisible(false); }}>
                            <Text style={[styles.clearText, { color: theme.tint }]}>Clear</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={options}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.optionItem,
                                    { borderBottomColor: theme.icon + '20' },
                                    value === item && { backgroundColor: theme.tint + '10' }
                                ]}
                                onPress={() => {
                                    onSelect(item);
                                    setModalVisible(false);
                                }}
                            >
                                <Text style={[
                                    styles.optionText,
                                    { color: theme.text },
                                    value === item && { color: theme.tint, fontWeight: '600' }
                                ]}>
                                    {item}
                                </Text>
                                {value === item && (
                                    <IconSymbol name="checkmark" size={20} color={theme.tint} />
                                )}
                            </TouchableOpacity>
                        )}
                    />
                </SafeAreaView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 8,
    },
    value: {
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    closeButton: {
        padding: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    clearText: {
        fontSize: 16,
        fontWeight: '500',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    optionText: {
        fontSize: 16,
    },
});
