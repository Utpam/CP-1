// screens/StaffScreens/EditMenuScreen.jsx
import React, { useMemo, useState } from 'react';
import {
    SafeAreaView, View, Text, TextInput, TouchableOpacity,
    StyleSheet, Platform, FlatList, KeyboardAvoidingView, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import MenuItem from '../../components/MenuItem';
import { v4 as uuidv4 } from 'uuid'; // optional: generate ids (install uuid) or use Date.now

export default function EditMenuScreen({ navigation }) {
    const [query, setQuery] = useState('');

    // demo data — replace with DB fetch
    const [items, setItems] = useState([
        { id: 'i1', name: 'Veg Sandwich', price: '40', image: '' },
        { id: 'i2', name: 'Pasta', price: '80', image: '' },
        { id: 'i3', name: 'Tea', price: '15', image: '' },
    ]);

    // filter logic
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter(it =>
            it.name?.toLowerCase().includes(q) || String(it.price).includes(q)
        );
    }, [items, query]);

    const onChangeName = (id, name) => {
        setItems(prev => prev.map(it => (it.id === id ? { ...it, name } : it)));
    };
    const onChangePrice = (id, price) => {
        const p = price.replace(/[^0-9.]/g, '');
        setItems(prev => prev.map(it => (it.id === id ? { ...it, price: p } : it)));
    };

    const moveItem = (id, direction) => {
        setItems(prev => {
            const idx = prev.findIndex(i => i.id === id);
            if (idx === -1) return prev;
            const newArr = [...prev];
            const swapWith = direction === 'up' ? idx - 1 : idx + 1;
            if (swapWith < 0 || swapWith >= newArr.length) return prev;
            [newArr[idx], newArr[swapWith]] = [newArr[swapWith], newArr[idx]];
            return newArr;
        });
    };

    const deleteItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

    const addItem = () => {
        // using timestamp if uuid not installed
        const newId = `i${Date.now()}`;
        setItems(prev => [...prev, { id: newId, name: '', price: '', image: '' }]);
    };

    // image picker for a specific item
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
                aspect: [1, 1],      // 1:1 ratio
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.length) {
                const uri = result.assets[0].uri;
                setItems(prev => prev.map(it => (it.id === id ? { ...it, image: uri } : it)));
            }
        } catch (err) {
            console.warn('Image pick error', err);
        }
    };

    const handleSave = () => {
        // validation: all items must have name, price, and image
        const invalid = items.find(i => !i.name?.trim() || !i.price?.toString()?.trim() || !i.image);
        if (invalid) {
            Alert.alert('Incomplete items', 'Please add name, price and image for every item before saving.');
            return;
        }

        // TODO: persist to Supabase storage + table (upload images then save meta with positions)
        // For now show success
        console.log('Saving items', items);
        Alert.alert('Saved', 'Menu saved successfully.');
    };

    // determine if Save button should be disabled
    const allValid = items.length > 0 && items.every(i => i.name?.trim() && i.price?.toString()?.trim() && i.image);

    const renderItem = ({ item, index }) => (
        <MenuItem
            item={item}
            onPickImage={pickImageForItem}
            onChangeName={onChangeName}
            onChangePrice={onChangePrice}
            onMoveUp={() => moveItem(item.id, 'up')}
            onMoveDown={() => moveItem(item.id, 'down')}
            onDelete={deleteItem}
            canMoveUp={index > 0}
            canMoveDown={index < items.length - 1}
        />
    );

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

                {/* two centered FABs at bottom */}
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#EACA95',
    },
    container: {
        flex: 1,
        paddingHorizontal: 18,
        paddingTop: 18,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0B1E3C',
        alignSelf: 'center',
        marginBottom: 16,
    },
    searchRow: {
        marginBottom: 18,
        alignItems: 'center',
    },
    searchBox: {
        width: '100%',
        backgroundColor: '#0B1E3C',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        paddingVertical: 2,
    },
    listContent: {
        paddingBottom: 120,
    },

    /* FAB row centered bottom */
    bottomFabRow: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },

    fab: {
        backgroundColor: '#F59E0B',
        borderRadius: 35,
        paddingVertical: 20,
        paddingHorizontal: 28,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 8,
        shadowColor: '#16253D',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    addFab: {
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    fabDisabled: {
        opacity: 0.55,
    },
    fabText: {
        fontSize: 17,
        color: '#FFF',
        fontWeight: '800',
        marginLeft: 8,
    },
});
