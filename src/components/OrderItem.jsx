// components/OrderItem.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // if not using Expo, use 'react-native-vector-icons/Ionicons'

export default function OrderItem({ name, orderId, onPress }) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
            <View style={styles.left}>
                <Text style={styles.nameLabel}>Name: <Text style={styles.name}>{name}</Text></Text>
                <Text style={styles.orderLabel}>Orderer ID: <Text style={styles.orderId}>{orderId}</Text></Text>
            </View>

            <View style={styles.right}>
                <Ionicons name="chevron-forward" size={26} style={styles.arrow} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0B1E3C',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        marginBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        // subtle shadow
        shadowColor: '#16253D',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
    left: {
        flex: 1,
    },
    nameLabel: {
        color: '#F59E0B',
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 6,
    },
    name: {
        color: '#F59E0B',
        fontWeight: '800',
        fontSize: 16,
    },
    orderLabel: {
        color: '#9FB3D6', // subtle lighter text for "Orderer ID"
        fontSize: 12,
    },
    orderId: {
        color: '#9FB3D6',
        fontSize: 12,
    },
    right: {
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 6,
    },
    arrow: {
        color: '#F59E0B',
    },
});
