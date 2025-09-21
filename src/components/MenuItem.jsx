// components/MenuItem.jsx
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MenuItem({
    item,
    onPickImage,
    onChangeName,
    onChangePrice,
    onMoveUp,
    onMoveDown,
    onDelete,
    canMoveUp,
    canMoveDown,
}) {
    return (
        <View style={styles.container}>
            {/* thumbnail */}
            <TouchableOpacity
                style={styles.thumbWrap}
                onPress={() => onPickImage(item.id)}
                activeOpacity={0.8}
            >
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.thumb} />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="image" size={20} color="#9FB3D6" />
                        <Text style={styles.placeholderText}>Add</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={styles.left}>
                <TextInput
                    value={item.name}
                    onChangeText={(text) => onChangeName(item.id, text)}
                    placeholder="Item name"
                    placeholderTextColor="#9FB3D6"
                    style={styles.nameInput}
                />
                <TextInput
                    value={String(item.price)}
                    onChangeText={(text) => onChangePrice(item.id, text)}
                    placeholder="Price"
                    placeholderTextColor="#9FB3D6"
                    keyboardType="numeric"
                    style={styles.priceInput}
                />
            </View>

            <View style={styles.controls}>
                <TouchableOpacity onPress={() => onMoveUp(item.id)} disabled={!canMoveUp} style={styles.ctrlBtn}>
                    <Ionicons name="chevron-up" size={20} color={canMoveUp ? '#F59E0B' : '#475b77'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onMoveDown(item.id)} disabled={!canMoveDown} style={styles.ctrlBtn}>
                    <Ionicons name="chevron-down" size={20} color={canMoveDown ? '#F59E0B' : '#475b77'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
                    <Ionicons name="trash" size={18} color="#FFBC9A" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const THUMB = 64;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0B1E3C',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 14,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#16253D',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
    thumbWrap: {
        width: THUMB,
        height: THUMB,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#F59E0B', // stroke CTA color
        backgroundColor: '#0B1E3C',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    thumb: {
        width: THUMB,
        height: THUMB,
        resizeMode: 'cover',
    },
    placeholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        color: '#9FB3D6',
        marginTop: 4,
        fontSize: 11,
    },

    left: {
        flex: 1,
    },
    nameInput: {
        color: '#F59E0B',
        fontSize: 16,
        fontWeight: '700',
        paddingVertical: 0,
        marginBottom: 6,
    },
    priceInput: {
        color: '#9FB3D6',
        fontSize: 13,
        paddingVertical: 0,
    },
    controls: {
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctrlBtn: {
        paddingVertical: 6,
        paddingHorizontal: 6,
    },
    deleteBtn: {
        marginTop: 6,
        padding: 6,
    },
});
