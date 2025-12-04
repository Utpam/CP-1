// screens/MenuScreen.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Image,
  FlatList, ActivityIndicator, ScrollView, RefreshControl, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../../supabaseClient'; // keep as-is

const STORAGE_KEY = 'CANTEEN_CART_V1';
const MAX_QTY = 5;

const TYPE_OPTIONS = ['Breakfast', 'Lunch', 'Snacks', 'Drinks'];
const STATUS_META = {
  'Available Now': { color: '#10B981', icon: 'checkmark-circle' },
  'N/A for today': { color: '#EF4444', icon: 'ban' },
  'Cooking': { color: '#F59E0B', icon: 'restaurant' },
  'Out of Stock': { color: '#EF4444', icon: 'cube' },
};

export default function MenuScreen() {
  const navigation = useNavigation();

  const [items, setItems] = useState([]);
  const [selectedType, setSelectedType] = useState('All');
  const [types, setTypes] = useState(['All', ...TYPE_OPTIONS]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // cart: { [itemId]: { item: ItemObject, qty: number } }
  const [cart, setCart] = useState({});

  useEffect(() => {
    fetchMenu();
    loadCartFromStorage();
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    persistCart(cart);
  }, [cart]);

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

  // Persistence helpers
  const persistCart = async (cartObj) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cartObj));
    } catch (e) {
      console.warn('Failed to persist cart', e);
    }
  };

  const loadCartFromStorage = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setCart(parsed || {});
      }
    } catch (e) {
      console.warn('Failed to load cart', e);
    }
  };

  // cart operations
  const addToCart = (item) => {
    setCart(prev => {
      const id = String(item.id);
      const existing = prev[id]?.qty || 0;
      if (existing >= MAX_QTY) return prev;
      return { ...prev, [id]: { item, qty: existing + 1 } };
    });
  };

  const incQty = (id) => {
    setCart(prev => {
      const entry = prev[id];
      if (!entry) return prev;
      if (entry.qty >= MAX_QTY) return prev;
      return { ...prev, [id]: { ...entry, qty: entry.qty + 1 } };
    });
  };

  const decQty = (id) => {
    setCart(prev => {
      const entry = prev[id];
      if (!entry) return prev;
      if (entry.qty <= 1) {
        const { [id]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: { ...entry, qty: entry.qty - 1 } };
    });
  };

  const clearCart = async () => {
    setCart({});
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => { /* ignore */ });
  };

  const filtered = useMemo(() => {
    if (!selectedType || selectedType === 'All') return items;
    return items.filter(i => i.type === selectedType);
  }, [items, selectedType]);

  // cart counters/summary
  const cartCount = useMemo(() => Object.values(cart).reduce((s, e) => s + (e.qty || 0), 0), [cart]);
  const cartTotal = useMemo(() => Object.values(cart).reduce((s, e) => s + ((e.item?.price ?? 0) * (e.qty || 0)), 0), [cart]);

  // navigate to cart screen with props
  const openCart = () => {
    navigation.navigate('CartScreen', {
      cart,
      clearCart,
      placeOrderHandler: placeOrderAndClear,
    });
  };

  // place order: insert into supabase orders table (see schema below)
  async function placeOrderAndClear(meta = {}) {
    // Prepare order payload (array of items)
    const orderItems = Object.values(cart).map(e => ({
      id: e.item.id,
      name: e.item.name,
      price: e.item.price,
      qty: e.qty,
    }));
    const total = orderItems.reduce((s, it) => s + (it.price * it.qty), 0);

    try {
      // Insert into orders table; ensure you have the table created (SQL below)
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          items: orderItems,
          total,
          status: 'pending',
          metadata: meta, // optional
        }])
        .select()
        .single();

      if (error) {
        console.error('Place order error', error);
        Alert.alert('Order failed', 'Unable to place the order. Try again.');
        return { success: false, error };
      }

      // success: clear cart locally
      await clearCart();
      Alert.alert('Order placed', `Order id: ${data.id || '—'}`);
      return { success: true, order: data };
    } catch (err) {
      console.error(err);
      Alert.alert('Order failed', 'Something went wrong.');
      return { success: false, error: err };
    }
  }

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
          keyExtractor={(it) => String(it.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F59E0B" />}
          renderItem={({ item }) => (
            <MenuCard
              item={item}
              cartEntry={cart[String(item.id)]}
              onAdd={() => addToCart(item)}
              onInc={() => incQty(String(item.id))}
              onDec={() => decQty(String(item.id))}
            />
          )}
        />
      )}

      {/* floating cart button */}
      {cartCount > 0 && (
        <View style={styles.cartFloatWrap} pointerEvents="box-none">
          <TouchableOpacity style={styles.cartFloatBtn} onPress={openCart} activeOpacity={0.85}>
            <Ionicons name="cart" size={26} color="#08203a" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.cartTotalText}>Rs {cartTotal}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
// compact MenuCard (drop-in replacement)
function MenuCard({ item, cartEntry, onAdd, onInc, onDec }) {
  const imageSource = item?.image_url
    ? { uri: item.image_url }
    : require('../../../assets/samosa.png');

  const status = item?.status || 'Server Side Error';
  const meta = STATUS_META[status] || { color: '#9FB3D6', icon: 'help-circle' };

  return (
    <View style={compactStyles.cardWrap}>
      <View style={compactStyles.card}>
        <View style={compactStyles.left}>
          <View style={compactStyles.thumbBorder}>
            <Image source={imageSource} style={compactStyles.thumb} resizeMode="cover" />
            {/* small overlay Add button on thumb */}
            {!cartEntry?.qty ? (
              <TouchableOpacity style={compactStyles.thumbAddBtn} onPress={onAdd} activeOpacity={0.85}>
                <Ionicons name="add" size={18} color="#08203a" />
              </TouchableOpacity>
            ) : (
              <View style={compactStyles.thumbQtyBubble}>
                <Text style={compactStyles.thumbQtyText}>{cartEntry.qty}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={compactStyles.mid}>
          <Text style={compactStyles.itemName} numberOfLines={1}>{item?.name || '—'}</Text>
          <Text style={compactStyles.itemPrice}>Rs {item?.price ?? '0'}</Text>
          <View style={compactStyles.statusRow}>
            <Ionicons name={meta.icon} size={14} color={meta.color} style={{ marginRight: 6 }} />
            <Text style={[compactStyles.statusText, { color: meta.color }]} numberOfLines={1}>{status}</Text>
          </View>
        </View>

        <View style={compactStyles.right}>
          {/* small add/qty pill */}
          {!cartEntry?.qty ? (
            <TouchableOpacity onPress={onAdd} style={compactStyles.smallAddBtn} activeOpacity={0.9}>
              <Ionicons name="add-outline" size={22} color="#F59E0B" />
            </TouchableOpacity>
          ) : (
            <View style={compactStyles.smallQtyPill}>
              <TouchableOpacity onPress={onDec} style={compactStyles.pillBtn}>
                <Ionicons name="remove" size={20} color="#F59E0B" />
              </TouchableOpacity>
              <Text style={compactStyles.pillQty}>{cartEntry.qty}</Text>
              <TouchableOpacity onPress={onInc} style={compactStyles.pillBtn}>
                <Ionicons name="add" size={20} color="#F59E0B" />
              </TouchableOpacity>
            </View>
          )}
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

  listContent: { paddingHorizontal: 18, paddingBottom: 140, paddingTop: 6 }, // leave space for floating cart

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

  right: { width: 120, alignItems: 'center', justifyContent: 'center' },

  addBtn: {
    alignItems: 'center', justifyContent: 'center',
  },

  qtyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1E3C',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 30,
  },
  qtyBtn: { paddingHorizontal: 6 },
  qtyText: {
    marginHorizontal: 6,
    fontSize: 16,
    color: '#FFF',
    fontWeight: '800',
    minWidth: 28,
    textAlign: 'center',
  },

  // floating cart
  cartFloatWrap: {
    position: 'absolute',
    right: 18,
    bottom: 28,
    alignItems: 'center',
  },
  cartFloatBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  cartBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#08203a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: { color: '#F59E0B', fontWeight: '800', fontSize: 12 },
  cartTotalText: { marginTop: 6, color: '#08203a', fontWeight: '800' },
});

const compactStyles = StyleSheet.create({
  cardWrap: { marginTop: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#08203a',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    elevation: 3,
  },
  left: { width: 72, alignItems: 'center', justifyContent: 'center' },
  thumbBorder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#0B1E3C',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: { width: '100%', height: '100%', borderRadius: 8 },

  // overlay add button on thumb
  thumbAddBtn: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbQtyBubble: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#08203a',
    borderColor: '#F59E0B',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  thumbQtyText: { color: '#F59E0B', fontWeight: '800' },

  mid: { flex: 1, paddingLeft: 10 },
  itemName: { fontSize: 16, color: '#FDBA12', fontWeight: '800' },
  itemPrice: { fontSize: 13, color: '#fff', marginTop: 4 },

  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statusText: { fontSize: 12, fontWeight: '700' },

  right: { width: 80, alignItems: 'center', justifyContent: 'center' },

  smallAddBtn: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  smallQtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#0B1E3C',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  pillBtn: { paddingHorizontal: 6 },
  pillQty: { color: '#F59E0B', fontWeight: '800', marginHorizontal: 6, minWidth: 18, textAlign: 'center' },
});