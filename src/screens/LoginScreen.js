import React, { useState } from 'react';
import {
    SafeAreaView, View, Text, TextInput, TouchableOpacity,
    StyleSheet, Platform, ActivityIndicator, Alert
} from 'react-native';
import { supabase } from '../../supabaseClient';

export default function LoginScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('student'); // 'student' | 'staff'
    const [gmail, setGmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const continueLabel =
        activeTab === 'student' ? 'Continue as Student' : 'Continue as Staff';

    const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

    const handleLogin = async () => {
        setError('');
        if (!gmail || !password) {
            setError('Please enter email and password.');
            return;
        }
        if (!validateEmail(gmail)) {
            setError('Please enter a valid email.');
            return;
        }

        try {
            setLoading(true);

            // sign in
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: gmail,
                password,
            });

            if (signInError) {
                setLoading(false);
                setError(signInError.message);
                return;
            }

            // get user (session) info
            const user = (signInData && signInData.user) || (await supabase.auth.getUser()).data?.user;

            if (!user) {
                setLoading(false);
                setError('Login succeeded but user info missing.');
                return;
            }

            // fetch profile role
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            // handle DB/profile lookup error
            if (profileError) {
                console.warn('Profile lookup error:', profileError);
                // If no profile found, we default to student behavior (or you can set an error).
                // For safety, sign out and show an error if trying to use the staff tab.
                if (activeTab === 'staff') {
                    await supabase.auth.signOut();
                    setLoading(false);
                    setError('Only staff can log in here.');
                    return;
                }
                // else fallback to student
                setLoading(false);
                navigation.replace('StudentsStack');
                return;
            }

            // If user is a student but is trying to login from the staff tab -> block
            if (activeTab === 'staff' && profile.role !== 'staff') {
                // log them out (clear session) and show an error
                await supabase.auth.signOut();
                setLoading(false);
                setError('Only staff can log in here.');
                return;
            }

            setLoading(false);

            // Normal navigation paths
            if (profile.role === 'staff') {
                navigation.replace('StaffStack');
            } else {
                navigation.replace('StudentsStack');
            }
        } catch (err) {
            console.error('Login error', err);
            setLoading(false);
            setError('Unexpected error, try again.');
        }
    };

    // google handler omitted for brevity / unchanged

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <View style={styles.tabRow}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={[
                            styles.tabItem,
                            activeTab === 'student' ? styles.tabItemActive : styles.tabItemInactive,
                        ]}
                        onPress={() => setActiveTab('student')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'student' ? styles.tabTextActive : styles.tabTextInactive,
                            ]}
                        >
                            Student
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={[
                            styles.tabItem,
                            activeTab === 'staff' ? styles.tabItemActive : styles.tabItemInactive,
                        ]}
                        onPress={() => setActiveTab('staff')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === 'staff' ? styles.tabTextActive : styles.tabTextInactive,
                            ]}
                        >
                            Staff
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.title}>
                    Login
                    <Text style={styles.titleUp}></Text>
                </Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Gmail</Text>
                    <TextInput
                        value={gmail}
                        onChangeText={setGmail}
                        placeholder=""
                        placeholderTextColor="#9b9b9b"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder=""
                        placeholderTextColor="#9b9b9b"
                        style={styles.input}
                        secureTextEntry
                        autoComplete="password"
                    />

                    {error ? <Text style={{ color: '#ff7b7b', marginTop: 8 }}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[styles.cta, { opacity: loading ? 0.85 : 1 }]}
                        activeOpacity={0.85}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator />
                        ) : (
                            <Text style={styles.ctaText}>{continueLabel}</Text>
                        )}
                    </TouchableOpacity>

                    {activeTab === 'student' && (
                        <>
                            <Text style={styles.or}>OR</Text>

                            <TouchableOpacity
                                style={styles.googleBtn}
                                activeOpacity={0.85}
                                disabled={loading}
                            >
                                <View style={styles.googleIcon}>
                                    <Text style={styles.googleG}>G</Text>
                                </View>
                                <Text style={styles.googleText}>Continue with Google</Text>
                            </TouchableOpacity>

                            <View style={styles.createRow}>
                                <Text style={styles.createTextLeft}>Don't have Account yet? </Text>
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={() => navigation.navigate('Signup')}
                                >
                                    <Text style={styles.createTextCTA}>Create Account</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {activeTab === 'staff' && <View style={{ height: 28 }} />}
                </View>
            </View>
        </SafeAreaView>
    );
}

// styles: reuse your existing styles (same as you provided)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EACA95',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    card: {
        width: 320,
        backgroundColor: '#0B1E3C',
        borderRadius: 28,
        paddingVertical: 30,
        paddingHorizontal: 22,
        shadowColor: '#16253D',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.80,
        shadowRadius: 2,
        elevation: Platform.OS === 'android' ? 25 : 0,
        overflow: 'visible',
    },
    tabRow: {
        flexDirection: 'row',
        alignSelf: 'center',
        backgroundColor: 'transparent',
        borderRadius: 22,
        marginBottom: 20,
        paddingHorizontal: 6,
    },
    tabItem: {
        paddingVertical: 10,
        paddingHorizontal: 26,
        borderRadius: 20,
        marginHorizontal: 8,
        minWidth: 110,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabItemActive: { backgroundColor: '#F59E0B' },
    tabTextActive: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
    tabItemInactive: { backgroundColor: 'transparent', borderWidth: 0 },
    tabTextInactive: { color: '#FFAE00', fontWeight: '700', fontSize: 16 },
    title: {
        color: '#FFAE00',
        fontSize: 36,
        fontWeight: '700',
        marginTop: 14,
        lineHeight: 42,
        paddingBottom: 4,
        marginBottom: 14,
        textAlign: 'left',
    },
    titleUp: { color: '#FFAE00', fontSize: 36, fontWeight: '700' },
    form: { marginTop: 0 },
    label: { color: '#FFAE00', fontSize: 13, marginTop: 12, marginBottom: 6 },
    input: {
        borderWidth: 3,
        borderColor: '#FFAE00',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#ffffff',
        fontSize: 14,
        backgroundColor: 'transparent',
    },
    cta: {
        marginTop: 18,
        backgroundColor: '#F59E0B',
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 34,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#16253D',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: Platform.OS === 'android' ? 6 : 0,
    },
    ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', textTransform: 'none' },
    or: { color: '#FFAE00', alignSelf: 'center', marginTop: 12, marginBottom: 10, fontWeight: '600' },
    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F59E0B',
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
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleG: { color: '#F59E0B', fontWeight: '700' },
    googleText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
    createRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 25 },
    createTextLeft: { color: 'rgba(255,174,0,0.55)', fontSize: 13 },
    createTextCTA: { color: '#F59E0B', fontSize: 13, fontWeight: '700', marginLeft: -.5 },
});
