import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { supabase } from '../../supabaseClient';

export default function SignUpScreen({ navigation }) {

    const [gmail, setGmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>
                    Sign{'\n'}
                    <Text style={styles.titleUp}>Up</Text>
                </Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Gmail</Text>
                    <TextInput
                        value={gmail}
                        onChangeText={setGmail}
                        placeholder="Enter Email"
                        placeholderTextColor="#9b9b9b"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder=""
                        placeholderTextColor="#9b9b9b"
                        style={styles.input}
                        secureTextEntry
                    />

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        value={confirm}
                        onChangeText={setConfirm}
                        placeholder=""
                        placeholderTextColor="#9b9b9b"
                        style={styles.input}
                        secureTextEntry
                    />

                    <TouchableOpacity style={styles.cta} activeOpacity={0.85}>
                        <Text style={styles.ctaText}>Sign up</Text>
                    </TouchableOpacity>

                    <Text style={styles.or}>OR</Text>

                    <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
                        <View style={styles.googleIcon}>
                            <Text style={styles.googleG}>G</Text>
                        </View>
                        <Text style={styles.googleText}>Sign up with Google</Text>
                    </TouchableOpacity>

                    {/* Split link: blended left text + CTA-styled clickable 'Sign up' */}
                    <View style={styles.createRow}>
                        <Text style={styles.createTextLeft}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.replace('Login')} activeOpacity={0.85}>
                            <Text style={styles.createTextCTA}>Sign up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EACA95', // page bg
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },

    // Card
    card: {
        width: 320,
        // height adjusted by content
        backgroundColor: '#0B1E3C', // card color
        borderRadius: 28,
        paddingVertical: 30,
        paddingHorizontal: 22,
        // shadow approximating provided metadata:
        shadowColor: '#16253D', // drop shadow color
        shadowOffset: { width: 0, height: 10 }, // vertical offset
        shadowOpacity: 0.80, // 75% opacity
        shadowRadius: 2, // blur (approx.)
        // Android
        elevation: Platform.OS === 'android' ? 25 : 0,
        overflow: 'visible', // avoid clipping descenders / shadows
    },

    title: {
        color: '#FFAE00',
        fontSize: 36,
        fontWeight: '700',
        lineHeight: 42, // increased so descenders won't get clipped
        paddingBottom: 4, // extra space below the text to avoid overlap/clipping
        marginBottom: 14,
    },
    titleUp: {
        color: '#FFAE00',
        fontSize: 36,
        fontWeight: '700',
    },

    form: {
        marginTop: 8,
    },

    label: {
        color: '#FFAE00',
        fontSize: 13,
        marginTop: 12,
        marginBottom: 6,
    },

    input: {
        borderWidth: 1.6,
        borderColor: '#FFAE00', // label/accent border
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#ffffff',
        fontSize: 14,
        backgroundColor: 'transparent',
    },

    cta: {
        marginTop: 18,
        backgroundColor: '#F59E0B', // main CTA
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 34,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        // small shadow to lift the button a bit
        shadowColor: '#16253D',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: Platform.OS === 'android' ? 6 : 0,
    },
    ctaText: {
        color: '#FFFFFF', // keep font inside CTA white
        fontSize: 16,
        fontWeight: '700',
    },

    or: {
        color: '#FFAE00',
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 10,
        fontWeight: '600',
    },

    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F59E0B', // using same orange for google btn (matches image look)
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 24,
        marginTop: 6,
        position: 'relative',
    },

    googleIcon: {
        position: 'absolute',
        left: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF', // white circle
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    googleG: {
        color: '#F59E0B', // orange 'G' inside white circle
        fontWeight: '700',
    },
    googleText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },

    /* Create account row */
    createRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    createTextLeft: {
        color: 'rgba(255,174,0,0.55)', // slightly blended but readable
        fontSize: 13,
    },
    createTextCTA: {
        color: '#F59E0B', // CTA colored link
        fontSize: 13,
        fontWeight: '700',
        marginLeft: -.5,
    },

    link: {
        textAlign: 'center',
        color: '#8A2BE2',
        marginTop: 10
    }
});
