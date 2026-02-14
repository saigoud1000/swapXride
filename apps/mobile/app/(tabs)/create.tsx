import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { useStripe } from '@stripe/stripe-react-native';
import { WebPaymentModal } from '@/components/web-payment-modal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { CAR_MAKES, YEARS, CONDITIONS, TITLE_STATUSES, CASH_DIRECTIONS, Listing } from '@swapxride/shared';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { supabase } from '@/lib/supabase';

const BODY_TYPES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Wagon', 'Hatchback', 'Van', 'Motorcycle', 'Other'];

type ModalField = 'make' | 'year' | 'bodyType' | 'condition' | 'titleStatus' | 'wantMake' | 'wantYearMin' | 'cashDirection' | null;

export default function CreateListingScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    // Form State
    const [year, setYear] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [trim, setTrim] = useState('');
    const [bodyType, setBodyType] = useState('');
    const [mileage, setMileage] = useState('');
    const [zip, setZip] = useState('');
    const [description, setDescription] = useState('');

    // Photo State
    const [photos, setPhotos] = useState<string[]>([]);

    // Condition & History
    const [condition, setCondition] = useState('');
    const [titleStatus, setTitleStatus] = useState('');
    const [modifications, setModifications] = useState('');

    // Preferences
    const [wantMake, setWantMake] = useState('');
    const [wantModel, setWantModel] = useState('');
    const [wantYearMin, setWantYearMin] = useState('');
    const [cashDirection, setCashDirection] = useState('');
    const [wantDescription, setWantDescription] = useState('');

    const [loading, setLoading] = useState(false);

    // Modal State
    const [activeModal, setActiveModal] = useState<ModalField>(null);
    const [createdListingId, setCreatedListingId] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const pickImage = async () => {
        if (photos.length >= 10) {
            Alert.alert('Limit Reached', 'You can upload a maximum of 10 photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 10 - photos.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newPhotos = result.assets.map(asset => asset.uri);
            setPhotos(prev => [...prev, ...newPhotos]);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const uploadPhotos = async (userId: string) => {
        const uploadedUrls: { url: string; display_order: number }[] = [];
        const listingId = 'new';

        for (let i = 0; i < photos.length; i++) {
            const uri = photos[i];
            try {
                const response = await fetch(uri);
                const blob = await response.blob();
                const fileExt = uri.split('.').pop() || 'jpg';
                const fileName = `${userId}/${listingId}/${Date.now()}_${i}.${fileExt}`;

                const { data, error } = await supabase.storage
                    .from('photos')
                    .upload(fileName, blob, {
                        contentType: blob.type,
                    });

                if (error) {
                    console.error('Upload error:', error);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
                uploadedUrls.push({ url: publicUrl, display_order: i });

            } catch (error) {
                console.error('Error uploading photo:', error);
            }
        }
        return uploadedUrls;
    };



    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const [formError, setFormError] = useState<string | null>(null);
    const [pendingListingId, setPendingListingId] = useState<string | null>(null);

    // Web Payment State
    const [showWebPayment, setShowWebPayment] = useState(false);
    const [webClientSecret, setWebClientSecret] = useState<string | null>(null);
    const [webPendingData, setWebPendingData] = useState<{ photos: any[], paymentIntentId: string } | null>(null);

    const handlePreview = () => {
        setFormError(null);
        setPendingListingId(null); // Reset pending

        // Required Vehicle Fields
        if (!year || !make || !model || !mileage || !description || !zip || !bodyType || !condition || !titleStatus) {
            setFormError('Please fill in all required vehicle details marked with *.');
            return;
        }

        // Required Swap Preferences
        if (!wantMake || !wantModel || !wantYearMin || !cashDirection) {
            setFormError('Please fill in all required Swap Preferences marked with *.');
            return;
        }

        // Required Photos
        if (photos.length === 0) {
            setFormError('At least one photo is required.');
            return;
        }

        setShowPreview(true);
    };

    const finishCreation = async (uploadedPhotos: any[], paymentIntentId: string) => {
        try {
            const payload = {
                have_year: parseInt(year),
                have_make: make,
                have_model: model,
                have_trim: trim,
                body_type: bodyType,
                have_mileage: parseInt(mileage),
                location_zip: zip,
                description: description,
                condition: condition,
                title_status: titleStatus,
                modifications: modifications,

                want_make: wantMake === 'Any' ? '' : wantMake,
                want_model: wantModel,
                want_year_min: wantYearMin === 'Any' ? 0 : (wantYearMin ? parseInt(wantYearMin) : null),
                cash_direction: cashDirection,
                want_description: wantDescription,

                photos: uploadedPhotos,
                payment_intent_id: paymentIntentId || null
            };

            const newListing = await api.post<Listing>('/listings', payload);

            // Status check: 'active' is expected for both Basic and Verified now
            if ((newListing.status as unknown as string).toLowerCase() !== 'active') {
                setFormError("Listing creation failed. Status: " + newListing.status);
                setPendingListingId(newListing.id); // Save ID for fallback
                setLoading(false);
                return;
            }

            // Reset form
            setYear(''); setMake(''); setModel(''); setTrim(''); setBodyType(''); setMileage(''); setZip('');
            setDescription(''); setCondition(''); setTitleStatus(''); setModifications('');
            setWantMake(''); setWantModel(''); setWantYearMin(''); setCashDirection(''); setWantDescription('');
            setPhotos([]);

            setCreatedListingId(newListing.id);
            setLoading(false);
        } catch (error: any) {
            console.error('Error creating listing:', error);
            setFormError(error.message || 'Failed to create listing.');
            setLoading(false);
        }
    };

    const handlePost = async () => {
        setShowPreview(false); // Close preview
        setFormError(null);
        setPendingListingId(null);
        try {
            setLoading(true);

            // 1. Get user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                setFormError("You must be logged in to post.");
                setLoading(false);
                return;
            }

            // 2. Upload Photos
            const uploadedPhotos = await uploadPhotos(user.id);

            // FREEMIUM CHANGE: Skip upfront payment for now. Create as Basic listing.
            // Verification (Upgrade) can be done after creation in the success modal or listing details.

            // 3. Create Listing (Basic)
            await finishCreation(uploadedPhotos, ''); // No payment intent initially

        } catch (error: any) {
            console.error('Error creating listing:', error);
            setFormError(error.message || 'Failed to create listing.');
            setLoading(false);
        }
    };

    // ... (rest of code)

    // UI Render changes:
    // This replace block targets handlePost and UI render



    const openModal = (field: ModalField) => setActiveModal(field);
    const closeModal = () => setActiveModal(null);

    const getModalOptions = () => {
        switch (activeModal) {
            case 'make': return CAR_MAKES;
            case 'year': return YEARS;
            case 'bodyType': return BODY_TYPES;
            case 'condition': return CONDITIONS;
            case 'titleStatus': return TITLE_STATUSES;
            case 'wantMake': return ['Any', ...CAR_MAKES];
            case 'wantYearMin': return ['Any', ...YEARS];
            default: return [];
        }
    };

    const handleOptionSelect = (item: string) => {
        switch (activeModal) {
            case 'make': setMake(item); break;
            case 'year': setYear(item); break;
            case 'bodyType': setBodyType(item); break;
            case 'condition': setCondition(item); break;
            case 'titleStatus': setTitleStatus(item); break;
            case 'wantMake': setWantMake(item); break;
            case 'wantYearMin': setWantYearMin(item); break;
        }
        closeModal();
    };

    const handleCashSelect = (item: any) => {
        setCashDirection(item.value);
        closeModal();
    }

    const renderSelectButton = (label: string, value: string, placeholder: string, field: ModalField, flex: number = 1) => (
        <TouchableOpacity
            style={[styles.input, { flex, backgroundColor: theme.background, borderColor: theme.icon + '40', justifyContent: 'center' }]}
            onPress={() => openModal(field)}
        >
            <Text style={{ color: value ? theme.text : theme.icon, fontSize: 16 }} numberOfLines={1}>
                {value || placeholder}
            </Text>
            <View style={{ position: 'absolute', right: 12 }}>
                <IconSymbol name="chevron.down" size={16} color={theme.icon} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>New Listing</Text>
                {/* DEV ONLY: Prefill Button */}
                {__DEV__ && (
                    <TouchableOpacity
                        style={{ padding: 8, backgroundColor: theme.tint + '20', borderRadius: 8, marginLeft: 'auto' }}
                        onPress={() => {
                            setYear('2022');
                            setMake('Toyota');
                            setModel('Camry');
                            setTrim('SE');
                            setBodyType('Sedan');
                            setMileage('15000');
                            setZip('90210');
                            setDescription('Great car, runs well. Test listing.');
                            setCondition('Excellent');
                            setTitleStatus('Clean');
                            setModifications('None');
                            setWantMake('Honda');
                            setWantModel('Civic');
                            setWantYearMin('2020');
                            setCashDirection('Straight Trade');
                            setWantDescription('Looking for a reliable daily driver.');
                            // Basic image placeholder to pass validation
                            setPhotos(['https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1000&auto=format&fit=crop']);
                        }}
                    >
                        <Text style={{ color: theme.tint, fontWeight: '600', fontSize: 12 }}>Prefill (Test)</Text>
                    </TouchableOpacity>
                )}
            </View>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Vehicle Details */}
                <View style={[styles.section, { backgroundColor: theme.background, borderColor: theme.icon + '20', borderWidth: 1 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Vehicle Details</Text>
                    <View style={styles.row}>
                        {renderSelectButton("Year", year, "Year *", 'year', 1)}
                        {renderSelectButton("Make", make, "Make *", 'make', 1)}
                    </View>

                    <View style={styles.row}>
                        {renderSelectButton("Body Type", bodyType, "Body Type *", 'bodyType', 1)}
                        <TextInput
                            style={[styles.input, { flex: 1, backgroundColor: theme.background, color: theme.text, borderColor: theme.icon + '40' }]}
                            placeholder="Model *"
                            placeholderTextColor={theme.icon}
                            value={model}
                            onChangeText={setModel}
                        />
                    </View>
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.input, { flex: 1, backgroundColor: theme.background, color: theme.text, borderColor: theme.icon + '40' }]}
                            placeholder="Trim (Optional)"
                            placeholderTextColor={theme.icon}
                            value={trim}
                            onChangeText={setTrim}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1, backgroundColor: theme.background, color: theme.text, borderColor: theme.icon + '40' }]}
                            placeholder="Mileage *"
                            placeholderTextColor={theme.icon}
                            keyboardType="numeric"
                            value={mileage}
                            onChangeText={setMileage}
                        />
                    </View>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.icon + '40' }]}
                        placeholder="Zip Code *"
                        placeholderTextColor={theme.icon}
                        keyboardType="numeric"
                        value={zip}
                        onChangeText={setZip}
                        maxLength={5}
                    />
                    <TextInput
                        style={[styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.icon + '40' }]}
                        placeholder="Description * (Describe conditions, upgrades...)"
                        placeholderTextColor={theme.icon}
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                {/* Condition & History */}
                <View style={[styles.section, { backgroundColor: theme.background, borderColor: theme.icon + '20', borderWidth: 1 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Condition & History</Text>
                    <View style={styles.row}>
                        {renderSelectButton("Condition", condition, "Condition *", 'condition', 1)}
                        {renderSelectButton("Title Status", titleStatus, "Title Status *", 'titleStatus', 1)}
                    </View>
                    <TextInput
                        style={[styles.textArea, { height: 80, backgroundColor: theme.background, color: theme.text, borderColor: theme.icon + '40' }]}
                        placeholder="Modifications (Optional)..."
                        placeholderTextColor={theme.icon}
                        multiline
                        textAlignVertical="top"
                        value={modifications}
                        onChangeText={setModifications}
                    />
                </View>

                {/* Swap Preferences */}
                <View style={[styles.section, { backgroundColor: theme.icon + '08', borderColor: theme.icon + '20', borderWidth: 1 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Swap Preferences</Text>
                    <View style={styles.row}>
                        {renderSelectButton("Pref Make", wantMake, "Pref Make *", 'wantMake', 1)}
                        <TextInput
                            style={[styles.input, { flex: 1, backgroundColor: theme.background, color: theme.text, borderColor: theme.icon + '40' }]}
                            placeholder="Pref Model *"
                            placeholderTextColor={theme.icon}
                            value={wantModel}
                            onChangeText={setWantModel}
                        />
                    </View>
                    <View style={styles.row}>
                        {renderSelectButton("Min Year", wantYearMin, "Min Year *", 'wantYearMin', 1)}
                        {renderSelectButton("Cash", CASH_DIRECTIONS.find(c => c.value === cashDirection)?.label || "", "Cash Pref *", 'cashDirection', 1)}
                    </View>
                    <TextInput
                        style={[styles.textArea, { height: 80, backgroundColor: theme.background, color: theme.text, borderColor: theme.icon + '40' }]}
                        placeholder="What are you looking for? (Optional)"
                        placeholderTextColor={theme.icon}
                        multiline
                        textAlignVertical="top"
                        value={wantDescription}
                        onChangeText={setWantDescription}
                    />
                </View>

                {/* Photos */}
                <View style={[styles.section, { backgroundColor: theme.background, borderColor: theme.icon + '20', borderWidth: 1 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Photos (Min 1, Max 10) *</Text>
                    <View style={styles.photosGrid}>
                        {photos.map((uri, index) => (
                            <View key={index} style={[styles.photoContainer, { backgroundColor: theme.icon + '10' }]}>
                                <Image source={{ uri }} style={styles.photo} contentFit="cover" />
                                <TouchableOpacity
                                    style={styles.removePhotoButton}
                                    onPress={() => removePhoto(index)}
                                >
                                    <IconSymbol name="xmark.circle.fill" size={24} color={Colors.light.tint} />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {photos.length < 10 && (
                            <TouchableOpacity style={[styles.addPhotoButton, { borderColor: theme.icon + '40', backgroundColor: theme.background }]} onPress={pickImage}>
                                <IconSymbol name="plus" size={30} color={theme.icon} />
                                <Text style={{ color: theme.icon, fontSize: 12, marginTop: 4 }}>Add Photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {formError && (
                    <View style={{ padding: 16, backgroundColor: '#ffebee', borderRadius: 12, borderWidth: 1, borderColor: '#ffcdd2' }}>
                        <Text style={{ color: '#c62828', fontSize: 14, textAlign: 'center' }}>{formError}</Text>
                        {pendingListingId && (
                            <TouchableOpacity
                                style={{ marginTop: 12, backgroundColor: '#0288d1', padding: 12, borderRadius: 8 }}
                                onPress={() => {
                                    const baseUrl = process.env.EXPO_PUBLIC_WEB_URL || 'http://192.168.0.148:3000';
                                    Linking.openURL(`${baseUrl}/listings/${pendingListingId}`);
                                }}
                            >
                                <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Finish Payment on Web</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: theme.tint, opacity: loading ? 0.7 : 1, shadowColor: theme.tint, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }]}
                    onPress={handlePreview}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Preview Listing</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>

            {/* Generic Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={!!activeModal}
                onRequestClose={closeModal}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.icon + '40' }]}>
                        <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                            <IconSymbol name="xmark" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>
                            Select {activeModal ? activeModal.charAt(0).toUpperCase() + activeModal.slice(1).replace(/([A-Z])/g, ' $1') : ''}
                        </Text>
                        <View style={{ width: 24 }} />
                    </View>

                    {activeModal === 'cashDirection' ? (
                        <FlatList
                            data={CASH_DIRECTIONS}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.optionItem, { borderBottomColor: theme.icon + '20', backgroundColor: cashDirection === item.value ? theme.tint + '10' : 'transparent' }]}
                                    onPress={() => handleCashSelect(item)}
                                >
                                    <Text style={[styles.optionText, { color: cashDirection === item.value ? theme.tint : theme.text, fontWeight: cashDirection === item.value ? '600' : '400' }]}>{item.label}</Text>
                                    {cashDirection === item.value && <IconSymbol name="checkmark" size={20} color={theme.tint} />}
                                </TouchableOpacity>
                            )}
                        />
                    ) : (
                        <FlatList
                            data={getModalOptions()}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        { borderBottomColor: theme.icon + '20' },
                                        // Highlight logic needs to be dynamic based on activeModal
                                        (activeModal === 'make' && make === item) ||
                                            (activeModal === 'year' && year === item) ||
                                            (activeModal === 'bodyType' && bodyType === item) ||
                                            (activeModal === 'condition' && condition === item) ||
                                            (activeModal === 'titleStatus' && titleStatus === item) ||
                                            (activeModal === 'wantMake' && wantMake === item) ||
                                            (activeModal === 'wantYearMin' && wantYearMin === item)
                                            ? { backgroundColor: theme.tint + '10' } : {}
                                    ]}
                                    onPress={() => handleOptionSelect(item)}
                                >
                                    <Text style={[styles.optionText, { color: theme.text }]}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </SafeAreaView>
            </Modal>
            {/* Preview Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showPreview}
                onRequestClose={() => setShowPreview(false)}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.icon + '40' }]}>
                        <TouchableOpacity onPress={() => setShowPreview(false)} style={styles.closeButton}>
                            <IconSymbol name="xmark" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Preview Listing</Text>
                        <View style={{ width: 24 }} />
                    </View>
                    <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
                        {photos.length > 0 && (
                            <Image source={{ uri: photos[0] }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 8 }} contentFit="cover" />
                        )}
                        <View style={{ gap: 4 }}>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>{year} {make} {model}</Text>
                            <Text style={{ fontSize: 18, color: theme.icon }}>{trim}</Text>
                            <Text style={{ fontSize: 16, color: theme.icon }}>{mileage} miles • {bodyType}</Text>
                            <Text style={{ fontSize: 16, color: theme.icon }}>{zip}</Text>
                        </View>

                        <View style={{ height: 1, backgroundColor: theme.icon + '20' }} />

                        <View style={{ gap: 8 }}>
                            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>Description</Text>
                            <Text style={{ fontSize: 16, color: theme.text, lineHeight: 24 }}>{description}</Text>
                        </View>

                        <View style={{ gap: 8 }}>
                            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>Details</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                <View style={{ padding: 8, backgroundColor: theme.icon + '10', borderRadius: 8 }}>
                                    <Text style={{ color: theme.text }}>Condition: {condition}</Text>
                                </View>
                                <View style={{ padding: 8, backgroundColor: theme.icon + '10', borderRadius: 8 }}>
                                    <Text style={{ color: theme.text }}>Title: {titleStatus}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={{ height: 1, backgroundColor: theme.icon + '20' }} />

                        <View style={{ gap: 8 }}>
                            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.text }}>Looking For</Text>
                            <Text style={{ fontSize: 16, color: theme.text, lineHeight: 24 }}>
                                {wantDescription || `Open to offers for ${wantMake} ${wantModel}`}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, { backgroundColor: theme.tint, marginBottom: 40 }]}
                            onPress={handlePost}
                        >
                            <Text style={styles.submitButtonText}>Confirm & Post</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
            {/* Success Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={!!createdListingId}
                onRequestClose={() => setCreatedListingId(null)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ backgroundColor: theme.background, padding: 24, borderRadius: 16, width: '80%', alignItems: 'center', gap: 16 }}>
                        <IconSymbol name="checkmark.circle.fill" size={64} color={Colors.light.tint} />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}>Listing Created!</Text>
                        <Text style={{ fontSize: 16, color: theme.icon, textAlign: 'center' }}>Your basic listing is live. Upgrade to Verified to get 3x more views.</Text>
                        <View style={{ width: '100%', gap: 12, marginTop: 12 }}>
                            <TouchableOpacity
                                style={[styles.submitButton, { backgroundColor: theme.tint, marginBottom: 0, height: 48 }]}
                                onPress={() => {
                                    // Trigger Upgrade Flow (Simulated for now, or redirect to verify)
                                    // Ideally, navigate to details page where Verified Action is present
                                    // Or trigger verification directly here?
                                    // For simplicity and to reuse the component in details page:
                                    const id = createdListingId;
                                    setCreatedListingId(null);
                                    if (id) router.push(`/listings/${id}`); // User can upgrade from there
                                }}
                            >
                                <Text style={[styles.submitButtonText, { fontSize: 16 }]}>View Listing & Upgrade</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.tint, marginTop: 0, marginBottom: 0, height: 48 }]}
                                onPress={() => {
                                    setCreatedListingId(null);
                                    router.push('/(tabs)');
                                }}
                            >
                                <Text style={[styles.submitButtonText, { color: theme.tint, fontSize: 16 }]}>Maybe Later</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <WebPaymentModal
                visible={showWebPayment}
                clientSecret={webClientSecret}
                onSuccess={() => {
                    setShowWebPayment(false);
                    if (webPendingData) {
                        finishCreation(webPendingData.photos, webPendingData.paymentIntentId);
                    }
                }}
                onCancel={() => {
                    setShowWebPayment(false);
                    setLoading(false);
                }}
            />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    content: {
        padding: 16,
        gap: 24,
        paddingBottom: 120, // Added bottom padding to fix button being covered
    },
    section: {
        gap: 16,
        padding: 16,
        borderRadius: 16,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        // Elevation for Android
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    input: {
        height: 54,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    textArea: {
        height: 120,
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
    },
    submitButton: {
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
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
    },
    closeButton: {
        padding: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
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
    photosGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    photoContainer: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    removePhotoButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
    },
    addPhotoButton: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
    },
});
