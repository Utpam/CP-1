// screens/MenuScreen.jsx
import React, { useEffect, useState, useMemo } from 'react';
import {
    SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image,
    FlatList, ActivityIndicator, ScrollView, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../supabaseClient'; // <- adjust path if needed

const TYPE_OPTIONS = ['Breakfast', 'Lunch', 'Snacks', 'Drinks'];
const STATUS_META = {
    'Available Now': { color: '#10B981', icon: 'checkmark-circle' },    // green
    'N/A for today': { color: '#EF4444', icon: 'ban' },                // red
    'Cooking': { color: '#F59E0B', icon: 'restaurant' },               // amber
    'Out of Stock': { color: '#EF4444', icon: 'cube' },                // red (use box icon)
};

export default function MenuScreen() {
    const [items, setItems] = useState([]);
    const [selectedType, setSelectedType] = useState('All');
    const [types, setTypes] = useState(['All', ...TYPE_OPTIONS]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchMenu();
    }, []);

    // fetch menu rows and compute types found in DB (merge with TYPE_OPTIONS)
    const fetchMenu = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('canteen_menu')
                .select('*')
                .order('position', { ascending: true });

            if (error) {
                console.error('Supabase fetch error', error);
                setItems([]);
                return;
            }

            setItems(Array.isArray(data) ? data : []);

            // derive types from DB rows and merge with TYPE_OPTIONS
            const found = new Set(TYPE_OPTIONS);
            (data || []).forEach(d => {
                if (d?.type) found.add(d.type);
            });
            const merged = ['All', ...TYPE_OPTIONS.filter(t => t), ...[...found].filter(t => !TYPE_OPTIONS.includes(t) && t !== 'All')];
            // Remove duplicated ordering while preserving TYPE_OPTIONS order
            const uniq = Array.from(new Set(merged));
            setTypes(uniq);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchMenu();
    };

    const filtered = useMemo(() => {
        if (!selectedType || selectedType === 'All') return items;
        return items.filter(i => i.type === selectedType);
    }, [items, selectedType]);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <Text style={styles.title}>Canteen App</Text>
                <View style={styles.typeScrollWrap}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.typeScroll}
                    >
                        {types.map((t) => (
                            <TouchableOpacity
                                key={t}
                                activeOpacity={0.85}
                                onPress={() => setSelectedType(t)}
                                style={[styles.typePill, selectedType === t && styles.typePillActive]}
                            >
                                <Text style={[styles.typeText, selectedType === t && styles.typeTextActive]}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color="#F59E0B" />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(it) => it.id?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
                    renderItem={({ item }) => <MenuCard item={item} />}
                />
            )}
        </SafeAreaView>
    );
}

// Single menu card (matches your screenshot)
function MenuCard({ item }) {
    // prefer image_url from DB; fallback to placeholder local asset or remote placeholder
    const imageSource = item?.image_url
        ? { uri: item.image_url }
        : require('../../../assets/samosa.png'); // <- put your local samosa image here (or change path)

    // fallback remote placeholder if local import not found in your project
    // const imageSource = item?.image_url ? { uri: item.image_url } : { uri: 'https://via.placeholder.com/120' };

    const status = item?.status || 'Available Now';
    const meta = STATUS_META[status] || { color: '#9FB3D6', icon: 'help-circle' };

    return (
        <View style={styles.cardWrap}>
            <View style={styles.card}>
                <View style={styles.left}>
                    <View style={styles.thumbBorder}>
                        <Image source={imageSource} style={styles.thumb} resizeMode="cover" />
                    </View>
                </View>

                <View style={styles.mid}>
                    <Text style={styles.itemName} numberOfLines={1}>{item?.name || '—'}</Text>
                    <Text style={styles.itemPrice}>Rs {item?.price ?? '0'}</Text>

                    <View style={styles.statusRow}>
                        <Ionicons name={meta.icon} size={16} color={meta.color} style={{ marginRight: 6 }} />
                        <Text style={[styles.statusText, { color: meta.color }]}>{status}</Text>
                    </View>
                </View>

                <View style={styles.right}>
                    <Ionicons name="chevron-forward" size={30} color="#F59E0B" />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#EACA95' },
    header: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8 },
    title: {
        alignSelf: 'center',
        marginTop: 45,
        marginBottom: 15,
        fontSize: 36, color: '#0B1E3C', fontWeight: '800'
    },

    typeScrollWrap: {
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    typeScroll: { paddingVertical: 6, paddingLeft: 6 },
    typePill: {
        backgroundColor: '#0B1E3C',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        marginRight: 10,
        borderWidth: 0,
    },
    typePillActive: {
        backgroundColor: '#EACA95',
        borderWidth: 2,
        borderColor: '#0B1E3C',
    },
    typeText: { color: '#9FB3D6', fontWeight: '700' },
    typeTextActive: { color: '#0B1E3C' },

    listContent: { paddingHorizontal: 18, paddingBottom: 120, paddingTop: 6 },

    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    cardWrap: { marginTop: 12 },
    card: {
        flexDirection: 'row',
        backgroundColor: '#08203a', // deep navy
        borderRadius: 22,
        padding: 14,
        alignItems: 'center',
        shadowColor: '#16253D',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    left: { width: 88, alignItems: 'center', justifyContent: 'center' },
    thumbBorder: {
        width: 100,
        height: 100,
        borderRadius: 14,
        backgroundColor: '#0B1E3C',
        padding: 2,
        borderWidth: 4,
        marginLeft: 14,
        borderColor: '#F59E0B',
        overflow: 'hidden',
    },
    thumb: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },

    mid: { flex: 1, paddingLeft: 12 },
    itemName: {
        fontSize: 22, color: '#FDBA12', fontWeight: '800',
        marginLeft: 15, marginBottom: 6
    },
    itemPrice: { fontSize: 14, marginLeft: 15, color: '#FFFFFF', marginBottom: 8 },

    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginLeft: 15, },
    statusText: { fontSize: 13, fontWeight: '700' },

    right: { width: 36, alignItems: 'center', justifyContent: 'center' },
});
