// screens/StaffScreens/EditMenuScreen.jsx
import React, { useMemo, useState, useRef } from 'react';
import {
    SafeAreaView, View, Text, TextInput, TouchableOpacity,
    StyleSheet, Platform, FlatList, KeyboardAvoidingView, Alert,
    Modal, ActivityIndicator, Animated
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import MenuItem from '../../components/MenuItem';
import { supabase } from '../../../supabaseClient'; // adjust path if needed
import { Buffer } from 'buffer';

export default function EditMenuScreen({ navigation }) {
    const [query, setQuery] = useState('');

    const [items, setItems] = useState([
        { id: 'i1', name: 'Samosa', price: '20', image: '', type: 'Snacks', status: 'Available Now' },
        { id: 'i2', name: 'Tea', price: '10', image: '', type: 'Drinks', status: 'Available Now' },
    ]);

    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentUploadingIndex, setCurrentUploadingIndex] = useState(-1);
    const [uploadStatusMessages, setUploadStatusMessages] = useState([]);
    const animProgress = useRef(new Animated.Value(0)).current;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter(it =>
            it.name?.toLowerCase().includes(q) || String(it.price).includes(q)
        );
    }, [items, query]);

    const onChangeName = (id, name) => setItems(prev => prev.map(it => it.id === id ? { ...it, name } : it));
    const onChangePrice = (id, price) => {
        const p = price.replace(/[^0-9.]/g, '');
        setItems(prev => prev.map(it => it.id === id ? { ...it, price: p } : it));
    };
    const onTypeChange = (id, type) => setItems(prev => prev.map(i => i.id === id ? { ...i, type } : i));
    const onStatusChange = (id, status) => setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    const deleteItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

    const addItem = () => {
        const newId = `i${Date.now()}`;
        setItems(prev => [...prev, { id: newId, name: '', price: '', image: '', type: 'Snacks', status: 'Available Now' }]);
    };

    // image picker
    const pickImageForItem = async (id) => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Please allow permission to access photos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7, // slightly lower quality to reduce size
            });

            if (!result.canceled && result.assets?.length) {
                const uri = result.assets[0].uri;
                setItems(prev => prev.map(it => it.id === id ? { ...it, image: uri } : it));
            }
        } catch (err) {
            console.warn('Image pick error', err);
            Alert.alert('Image pick failed', String(err));
        }
    };

    // --- NEW upload implementation using base64 -> Buffer (reliable on Android) ---
    async function uploadImageUsingBase64Buffer(item) {
        if (!item.image) throw new Error('No image URI');

        // determine extension safely
        let ext = 'jpg';
        try {
            const uri = item.image;
            const lastDot = uri.lastIndexOf('.');
            if (lastDot !== -1) {
                const possible = uri.substring(lastDot + 1).split('?')[0].toLowerCase();
                // guard: must be reasonable length and characters
                if (/^[a-z0-9]{2,4}$/.test(possible)) ext = possible;
            }
        } catch (e) {
            // fallback to jpg
            ext = 'jpg';
        }

        // read base64 from file system (works on Android + iOS)
        try {
            const base64 = await FileSystem.readAsStringAsync(item.image, { encoding: FileSystem.EncodingType.Base64 });
            if (!base64) throw new Error('readAsStringAsync returned empty base64');

            // convert base64 to Buffer
            const buf = Buffer.from(base64, 'base64');

            // prepare path and content type
            const bucket = 'menu-images';
            const filename = `${item.id}.${ext}`; // e.g. i12345.jpg
            const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

            // supabase-js accepts Buffer for upload in RN environments
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filename, buf, { contentType, upsert: true });

            if (uploadError) {
                console.error('supabase.storage.upload error', uploadError);
                throw uploadError;
            }

            // get public url (if bucket is public)
            const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
            return data.publicUrl;
        } catch (err) {
            console.error('uploadImageUsingBase64Buffer error', err);
            throw err;
        }
    }
    // --- end upload function ---

    const handleSave = async () => {
        // validate
        const invalid = items.find(i => !i.name?.trim() || !i.price?.toString()?.trim() || !i.image);
        if (invalid) {
            Alert.alert('Incomplete items', 'Please add name, price and image for every item before saving.');
            return;
        }

        // check network
        const net = await NetInfo.fetch();
        if (!net.isConnected) {
            Alert.alert('No internet', 'You appear to be offline. Please connect to the internet and try again.');
            return;
        }

        setUploadStatusMessages(items.map(() => 'Pending'));
        setUploadModalVisible(true);
        setUploadProgress(0);
        setCurrentUploadingIndex(-1);
        Animated.timing(animProgress, { toValue: 0, duration: 200, useNativeDriver: false }).start();

        try {
            const total = items.length;
            const savedRows = [];

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                setCurrentUploadingIndex(i);
                setUploadStatusMessages(prev => prev.map((m, idx) => idx === i ? 'Uploading image...' : m));

                let publicUrl = '';
                try {
                    publicUrl = await uploadImageUsingBase64Buffer(item);
                    setUploadStatusMessages(prev => prev.map((m, idx) => idx === i ? 'Image uploaded' : m));
                } catch (imgErr) {
                    console.error('Image upload error for item', item.id, imgErr);
                    setUploadStatusMessages(prev => prev.map((m, idx) => idx === i ? `Image upload failed: ${imgErr.message || imgErr}` : m));
                    throw imgErr;
                }

                // prepare DB row
                savedRows.push({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    type: item.type,
                    status: item.status,
                    image_url: publicUrl,
                    position: i,
                    updated_at: new Date().toISOString(),
                });

                // update progress
                const fraction = (i + 1) / total;
                setUploadProgress(fraction);
                Animated.timing(animProgress, { toValue: fraction, duration: 300, useNativeDriver: false }).start();
            }

            // upsert to DB
            setUploadStatusMessages(prev => prev.map(() => 'Saving metadata...'));
            const { error: upsertError } = await supabase
                .from('canteen_menu')
                .upsert(savedRows, { returning: 'representation' });

            if (upsertError) {
                console.error('Upsert error', upsertError);
                throw upsertError;
            }

            setUploadStatusMessages(prev => prev.map(() => 'Done'));
            Animated.timing(animProgress, { toValue: 1, duration: 300, useNativeDriver: false }).start();
            Alert.alert('Saved', 'Menu saved successfully.');
            setUploadModalVisible(false);
        } catch (err) {
            console.error('Save error', err);
            setUploadModalVisible(false);
            Alert.alert('Upload failed', `Failed to upload menu: ${err.message || err}`);
        } finally {
            setCurrentUploadingIndex(-1);
            setUploadProgress(0);
            Animated.timing(animProgress, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        }
    };

    const allValid = items.length > 0 && items.every(i => i.name?.trim() && i.price?.toString()?.trim() && i.image);

    const renderItem = ({ item }) => (
        <MenuItem
            item={item}
            onPickImage={pickImageForItem}
            onChangeName={onChangeName}
            onChangePrice={onChangePrice}
            onTypeChange={onTypeChange}
            onStatusChange={onStatusChange}
            onDelete={deleteItem}
        />
    );

    const progressInterpolate = animProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                <Text style={styles.title}>Edit Canteen Menu</Text>

                <View style={styles.searchRow}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={22} color="#F59E0B" style={styles.searchIcon} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search for Canteen Item"
                            placeholderTextColor="#2E4B78"
                            style={styles.searchInput}
                        />
                    </View>
                </View>

                <FlatList
                    data={filtered}
                    keyExtractor={(i) => i.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />

                <View style={styles.bottomFabRow}>
                    <TouchableOpacity
                        style={[styles.fab, !allValid && styles.fabDisabled]}
                        activeOpacity={0.85}
                        onPress={handleSave}
                        disabled={!allValid}
                    >
                        <Ionicons name="save" size={18} color="#FFF" />
                        <Text style={styles.fabText}> Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.fab, styles.addFab]} activeOpacity={0.85} onPress={addItem}>
                        <Ionicons name="add" size={18} color="#FFF" />
                        <Text style={styles.fabText}> Add</Text>
                    </TouchableOpacity>
                </View>

                <Modal visible={uploadModalVisible} transparent animationType="fade">
                    <View style={styles.uploadModalOverlay}>
                        <View style={styles.uploadModal}>
                            <Text style={styles.uploadTitle}>Uploading menu...</Text>

                            <View style={styles.progressBar}>
                                <Animated.View style={[styles.progressFill, { width: progressInterpolate }]} />
                            </View>

                            <Text style={styles.progressText}>
                                {currentUploadingIndex >= 0 ? `Item ${currentUploadingIndex + 1} of ${items.length}` : ''}
                            </Text>

                            <View style={{ marginTop: 12 }}>
                                {uploadStatusMessages.map((m, idx) => (
                                    <Text key={idx} style={styles.uploadLine}>
                                        {idx + 1}. {m}
                                    </Text>
                                ))}
                            </View>

                            <View style={{ marginTop: 14 }}>
                                <ActivityIndicator size="large" color="#F59E0B" />
                            </View>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#EACA95' },
    container: { flex: 1, paddingHorizontal: 18, paddingTop: 18 },
    title: { fontSize: 32, fontWeight: '800', color: '#0B1E3C', alignSelf: 'center', marginBottom: 16 },
    searchRow: { marginBottom: 18, alignItems: 'center' },
    searchBox: { width: '100%', backgroundColor: '#0B1E3C', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center' },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14, paddingVertical: 2 },
    listContent: { paddingBottom: 160 },
    bottomFabRow: { position: 'absolute', left: 0, right: 0, bottom: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 },
    fab: { backgroundColor: '#F59E0B', borderRadius: 35, paddingVertical: 20, paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, shadowColor: '#16253D', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 5 },
    addFab: { paddingVertical: 18, paddingHorizontal: 20 },
    fabDisabled: { opacity: 0.55 },
    fabText: { fontSize: 17, color: '#FFF', fontWeight: '800', marginLeft: 8 },

    uploadModalOverlay: { flex: 1, backgroundColor: 'rgba(5,10,15,0.5)', justifyContent: 'center', alignItems: 'center' },
    uploadModal: { width: '88%', backgroundColor: '#0B1E3C', padding: 18, borderRadius: 14, alignItems: 'center' },
    uploadTitle: { color: '#F59E0B', fontSize: 18, fontWeight: '700', marginBottom: 12 },
    progressBar: { width: '100%', height: 12, backgroundColor: '#082033', borderRadius: 8, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#F59E0B', width: '0%' },
    progressText: { color: '#FFFFFF', marginTop: 8 },
    uploadLine: { color: '#9FB3D6', fontSize: 13, marginTop: 6 },
});
