// screens/CartScreen.jsx
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../supabaseClient';
import { useNavigation, useRoute } from '@react-navigation/native';

const STORAGE_KEY = 'CANTEEN_CART_V1';

export default function CartScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  // If navigation passed cart & handlers, use them; else load from storage
  const params = route.params || {};
  const initialCart = params.cart || {};

  const [cart, setCart] = useState(initialCart);
  const [placing, setPlacing] = useState(false);

  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const total = useMemo(() => cartItems.reduce((s, e) => s + ((e.item.price || 0) * e.qty), 0), [cartItems]);

  const updateQty = async (id, newQty) => {
    setCart(prev => {
      if (newQty <= 0) {
        const { [id]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: { ...prev[id], qty: newQty } };
    });
  };

  const persistAndReturn = async (updatedCart) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCart));
    } catch (e) {
      console.warn('persist error', e);
    }
  };

  const placeOrder = async () => {
  if (cartItems.length === 0) {
    Alert.alert('Empty', 'Cart is empty');
    return;
  }
  setPlacing(true);

  // get current user (Supabase JS v2)
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user;
  if (userErr || !user) {
    console.error('No signed-in user', userErr);
    Alert.alert('Sign in required', 'Please sign in to place an order.');
    setPlacing(false);
    // optionally navigate to login screen: navigation.navigate('Auth')
    return;
  }

  // prepare payload
  const orderItems = cartItems.map(e => ({
    id: e.item.id,
    name: e.item.name,
    price: e.item.price,
    qty: e.qty
  }));
  const payload = {
    items: orderItems,
    total,
    status: 'pending',
    user_id: user.id,        // <<--- important for RLS
  };

  console.log('Placing order payload:', JSON.stringify(payload));

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('order error', error);
      Alert.alert('Order failed', 'Could not place the order');
      setPlacing(false);
      return;
    }

    // on success remove local cart
    await AsyncStorage.removeItem(STORAGE_KEY);
    Alert.alert('Success', `Order placed. Order id: ${data.id || '—'}`);
    setPlacing(false);
    navigation.popToTop();
  } catch (err) {
    console.error('placeOrder exception', err);
    Alert.alert('Order failed', 'Something went wrong.');
    setPlacing(false);
  }
};

  return (
    <View style={styles.safe}>
      <Text style={styles.header}>Your Cart</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(e) => String(e.item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.item.name}</Text>
              <Text style={styles.price}>Rs {item.item.price} x {item.qty} = Rs {item.item.price * item.qty}</Text>
            </View>
            <View style={styles.controls}>
              <TouchableOpacity onPress={() => updateQty(String(item.item.id), item.qty - 1)}>
                <Ionicons name="remove-circle" size={28} color="#F59E0B" />
              </TouchableOpacity>
              <Text style={styles.qty}>{item.qty}</Text>
              <TouchableOpacity onPress={() => updateQty(String(item.item.id), item.qty + 1)}>
                <Ionicons name="add-circle" size={28} color="#F59E0B" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ padding: 16 }}>Your cart is empty</Text>}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total: Rs {total}</Text>
        <TouchableOpacity style={styles.placeBtn} onPress={placeOrder} disabled={placing}>
          <Text style={styles.placeBtnText}>{placing ? 'Placing...' : 'Place Order'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EACA95' },
  header: {
    paddingTop: 48, paddingBottom: 16, textAlign: 'center',
    fontSize: 28, fontWeight: '800', alignSelf: 'center', color: '#08203a'
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#08203a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center'
  },
  name: { color: '#FDBA12', fontWeight: '800', fontSize: 16 },
  price: { color: '#fff', marginTop: 6 },
  controls: { flexDirection: 'row', alignItems: 'center' },
  qty: { color: '#fff', fontWeight: '800', marginHorizontal: 8, minWidth: 20, textAlign: 'center' },

  footer: {
    padding: 18,
    borderTopWidth: 2,
    borderColor: '#9b9b9bff',
    backgroundColor: '#c7b69aff',
  },
  total: { fontWeight: '900', fontSize: 18, marginBottom: 12 },
  placeBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  placeBtnText: { color: '#08203a', fontWeight: '900', fontSize: 16 }
});
