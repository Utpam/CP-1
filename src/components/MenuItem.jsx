// components/MenuItem.jsx
import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Text,
    Alert,
    Platform,
    Modal,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const THUMB = 100;

const STATUS_COLORS = {
    'Available Now': '#22C55E', // green
    Cooking: '#F59E0B', // orange
    'N/A for today': '#94A3B8', // gray
    'Out of Stock': '#94A3B8',
};

const TYPE_OPTIONS = ['Breakfast', 'Lunch', 'Snacks', 'Drinks'];
const STATUS_OPTIONS = ['Available Now', 'Cooking', 'N/A for today', 'Out of Stock'];

export default function MenuItem({
    item,
    onPickImage,
    onChangeName,
    onChangePrice,
    onTypeChange,
    onStatusChange,
    onDelete,
}) {
    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerType, setPickerType] = useState(null); // 'type' | 'status'

    const confirmDelete = () => {
        Alert.alert(
            'Delete item',
            `Are you sure you want to delete "${item.name || 'this item'}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) },
            ],
            { cancelable: true }
        );
    };

    const openPicker = (which) => {
        setPickerType(which);
        setPickerVisible(true);
    };

    const closePicker = () => {
        setPickerVisible(false);
        setPickerType(null);
    };

    const onSelectOption = (value) => {
        if (pickerType === 'type') {
            onTypeChange(item.id, value);
        } else {
            onStatusChange(item.id, value);
        }
        closePicker();
    };

    const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS['N/A for today'];

    const renderOption = ({ item: opt }) => (
        <TouchableOpacity
            style={styles.optionRow}
            onPress={() => onSelectOption(opt)}
            activeOpacity={0.8}
        >
            <Text style={[styles.optionText, { color: '#F59E0B' }]}>{opt}</Text>
            {((pickerType === 'type' && opt === (item.type ?? 'Snacks')) ||
                (pickerType === 'status' && opt === (item.status ?? 'Available Now'))) && (
                    <Ionicons name="checkmark" size={20} color="#F59E0B" />
                )}
        </TouchableOpacity>
    );

    return (
        <>
            <View style={styles.container}>
                {/* Thumbnail */}
                <TouchableOpacity
                    style={styles.thumbWrap}
                    onPress={() => onPickImage(item.id)}
                    activeOpacity={0.85}
                >
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.thumb} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Ionicons name="image" size={26} color="#9FB3D6" />
                            <Text style={styles.placeholderText}>Add</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Main content */}
                <View style={styles.content}>
                    <TextInput
                        value={item.name}
                        onChangeText={(t) => onChangeName(item.id, t)}
                        placeholder="Item name"
                        placeholderTextColor="#9FB3D6"
                        style={styles.nameInput}
                    />

                    <View style={styles.priceRow}>
                        <Text style={styles.rs}>Rs</Text>
                        <TextInput
                            value={String(item.price)}
                            onChangeText={(t) => onChangePrice(item.id, t)}
                            placeholder="0"
                            placeholderTextColor="#9FB3D6"
                            keyboardType="numeric"
                            style={styles.priceInput}
                        />
                    </View>

                    {/* stacked pickers */}
                    <View style={styles.stackedPickers}>
                        {/* Type */}
                        <TouchableOpacity
                            style={styles.pickerBoxTouchable}
                            onPress={() => openPicker('type')}
                            activeOpacity={0.85}
                        >
                            <View style={styles.pickerInner}>
                                <Text style={styles.pickerLabel}>{item.type ?? 'Snacks'}</Text>
                                <Ionicons name="chevron-down" size={18} color="#F59E0B" />
                            </View>
                        </TouchableOpacity>

                        {/* Status */}
                        <TouchableOpacity
                            style={[styles.pickerBoxTouchable, styles.statusPickerBox]}
                            onPress={() => openPicker('status')}
                            activeOpacity={0.85}
                        >
                            <View style={styles.pickerInner}>
                                <Text style={styles.pickerLabel}>{item.status ?? 'Available Now'}</Text>
                                <Ionicons name="chevron-down" size={18} color="#F59E0B" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Delete */}
                <View style={styles.actions}>
                    <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn} activeOpacity={0.8}>
                        <Ionicons name="trash" size={22} color="#FFBC9A" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modal for options */}
            <Modal
                visible={pickerVisible}
                animationType="slide"
                transparent
                onRequestClose={closePicker}
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closePicker}>
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>
                            {pickerType === 'type' ? 'Select Type' : 'Select Status'}
                        </Text>

                        <FlatList
                            data={pickerType === 'type' ? TYPE_OPTIONS : STATUS_OPTIONS}
                            keyExtractor={(i) => i}
                            renderItem={renderOption}
                            ItemSeparatorComponent={() => <View style={styles.sep} />}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />

                        <TouchableOpacity style={styles.modalClose} onPress={closePicker} activeOpacity={0.8}>
                            <Text style={styles.modalCloseText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0B1E3C',
        padding: 14,
        borderRadius: 16,
        marginBottom: 14,
        flexDirection: 'row',
        alignItems: 'flex-start', // allow taller content
        // softer shadow
        shadowColor: '#0b1624',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0.22,
        shadowRadius: 12,
        elevation: 7,
    },

    thumbWrap: {
        width: THUMB,
        height: THUMB,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#F59E0B',
        backgroundColor: '#081426',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 17,
        marginLeft: 7,
        // inner drop
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
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
        marginTop: 6,
        fontSize: 12,
    },

    content: { flex: 1 },

    nameInput: {
        color: '#F59E0B',
        fontSize: 20,
        fontWeight: '800',
        paddingVertical: 0,
        marginBottom: 8,
    },

    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    rs: {
        color: '#F59E0B',
        fontWeight: '800',
        marginRight: 8,
        fontSize: 14,
    },
    priceInput: {
        flex: 1,
        color: '#F59E0B', // CTA color for price as requested
        fontSize: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#163048',
        paddingVertical: 2,
    },

    // stacked pickers container
    stackedPickers: {
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
    },

    // replaced picker styles:
    pickerBoxTouchable: {
        marginBottom: 10,
        minHeight: 44,
        borderRadius: 10,
        overflow: 'hidden',
        alignSelf: 'stretch',
    },
    statusPickerBox: {
        // slightly different width or style if needed
    },
    pickerInner: {
        backgroundColor: '#082033',
        height: 44,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pickerLabel: {
        color: '#F59E0B', // CTA color for picker text
        fontSize: 15,
        fontWeight: '700',
    },

    statusChip: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginLeft: 6,
        borderWidth: 1,
        borderColor: '#0B1E3C',
    },

    actions: {
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    deleteBtn: {
        padding: 6,
    },

    /* Modal */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(5,10,15,0.45)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#0B1E3C',
        paddingTop: 16,
        paddingBottom: 24,
        paddingHorizontal: 18,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        maxHeight: '60%',
    },
    modalTitle: {
        color: '#F59E0B',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    optionRow: {
        paddingVertical: 12,
        paddingHorizontal: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    sep: {
        height: 1,
        backgroundColor: '#0A2A44',
    },
    modalClose: {
        marginTop: 12,
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 22,
        borderRadius: 10,
        backgroundColor: '#F59E0B',
    },
    modalCloseText: {
        color: '#0B1E3C',
        fontWeight: '800',
        fontSize: 15,
    },
});
