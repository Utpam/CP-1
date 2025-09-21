// screens/StaffScreens/StudentsOrderScreen.jsx
import React, { useMemo, useState } from 'react';
import {
    SafeAreaView, View, Text, TextInput, TouchableOpacity,
    StyleSheet, Platform, FlatList, KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // if not using Expo, install react-native-vector-icons
import OrderItem from '../../components/OrderItem';

export default function StudentsOrderScreen({ navigation }) {
    const [query, setQuery] = useState('');

    // demo data — replace with real data from supabase later
    const data = useMemo(() => [
        { id: '1', name: 'Prakash Sunrise', orderId: '0x213tv8i4l655wf5vxcn' },
        { id: '2', name: 'Prakash Sunrise', orderId: '0x213tv8i4l655wf5vxcn' },
        { id: '3', name: 'Prakash Sunrise', orderId: '0x213tv8i4l655wf5vxcn' },
        { id: '4', name: 'Prakash Sunrise', orderId: '0x213tv8i4l655wf5vxcn' },
        { id: '5', name: 'Prakash Sunrise', orderId: '0x213tv8i4l655wf5vxcn' },
        { id: '6', name: 'Prakash Sunrise', orderId: '0x213tv8i4l655wf5vxcn' },
        { id: '7', name: 'Prakash Sunrise', orderId: '0x213tv8i4l655wf5vxcn' },
        { id: '8', name: 'Prakash Sunrise', orderId: '0x213tv8i4l655wf5vxcn' },
    ], []);

    // filter logic: search by name or orderId
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return data;
        return data.filter(item =>
            (item.name && item.name.toLowerCase().includes(q)) ||
            (item.orderId && item.orderId.toLowerCase().includes(q))
        );
    }, [data, query]);

    const renderItem = ({ item }) => (
        <OrderItem
            name={item.name}
            orderId={item.orderId}
            onPress={() => {
                // handle item press - navigate to details if you add a details screen
                // navigation.navigate('OrderDetails', { order: item });
                console.log('pressed', item.id);
            }}
        />
    );

    return (
        <SafeAreaView style={styles.safe}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                <Text style={styles.title}>Student’s Orders</Text>

                {/* Search */}
                <View style={styles.searchRow}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={22} color="#F59E0B" style={styles.searchIcon} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Enter ID"
                            placeholderTextColor="#2E4B78"
                            style={styles.searchInput}
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* List */}
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />

                {/* Floating Button */}
                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('EditMenu')}
                >
                    <Ionicons name="pencil" size={20} color="#FFF" />
                    <Text style={styles.fabText}> Edit Menu</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#EACA95', // page beige background
    },
    container: {
        flex: 1,
        paddingHorizontal: 18,
        paddingTop: 22,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#0B1E3C',
        alignSelf: 'center',
        marginTop: 45,
        marginBottom: 40,
    },
    searchRow: {
        marginBottom: 35,
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
    fab: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        backgroundColor: '#F59E0B',
        borderRadius: 35,
        paddingVertical: 20,
        paddingHorizontal: 28,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#16253D',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 5,
    },
    fabText: {
        fontSize: 17,
        color: '#FFF',
        fontWeight: '800',
        marginLeft: 8,
    },
});
