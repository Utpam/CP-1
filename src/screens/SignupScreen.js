import React, { useState } from 'react';
import {
    SafeAreaView, View, Text, TextInput, TouchableOpacity,
    StyleSheet, Platform, ActivityIndicator, Alert
} from 'react-native';
import { supabase } from '../../supabaseClient';

export default function SignUpScreen({ navigation }) {
    const [gmail, setGmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

    const handleSignUp = async () => {
        setError('');
        if (!gmail || !password || !confirm) {
            setError('Please fill all fields.');
            return;
        }
        if (!validateEmail(gmail)) {
            setError('Please enter a valid email.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirm) {
            setError("Passwords don't match.");
            return;
        }

        try {
            setLoading(true);

            // 1) create user in auth
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: gmail,
                password,
            });

            if (signUpError) {
                setLoading(false);
                setError(signUpError.message);
                return;
            }

            // Attempt to get the user id. On many setups, signUpData.user exists.
            // If email confirmation is required, a session/user may be null — handle that case.
            const user =
                (signUpData && signUpData.user) ||
                (await supabase.auth.getUser()).data?.user ||
                null;

            // 2) Upsert profile as student (this is safe if your RLS allows client to insert only role='student')
            if (user && user.id) {
                const profileRow = {
                    id: user.id,
                    email: user.email ?? gmail,
                    role: 'student',
                };

                // upsert will insert or update the profiles row. If you added a DB trigger already, this will be harmless.
                const { error: upsertError } = await supabase
                    .from('profiles')
                    .upsert(profileRow, { returning: 'minimal' });

                if (upsertError) {
                    // Not critical — profile creation might be handled by server trigger; show a warning.
                    console.warn('profile upsert error', upsertError);
                }
            } else {
                // If we don't have a user object (e.g., email confirmation pending), we rely on server trigger or admin to create profile.
                console.warn('No user available immediately after signup. If you enabled email confirmations, profile may be created after verification (server trigger recommended).');
            }

            setLoading(false);

            // Inform user and navigate to Login (or StudentsStack if you want to auto-login after confirm)
            Alert.alert(
                'Signup successful',
                'Check your email to confirm your account (if required). You can now sign in.',
                [{ text: 'OK', onPress: () => navigation.replace('Login') }],
                { cancelable: false }
            );
        } catch (err) {
            console.error('signup error', err);
            setLoading(false);
            setError('Unexpected error — try again.');
        }
    };

    // (Google handler left unchanged from your version)
    const handleGoogleSignUp = async () => {
        setError('');
        setLoading(true);
        try {
            const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });

            if (oauthError) {
                setError(oauthError.message);
                setLoading(false);
                return;
            }

            setLoading(false);
            Alert.alert('Continue in browser', 'Complete Google sign-in in your browser.');
        } catch (err) {
            setLoading(false);
            setError('Google sign-in error.');
            console.error('google signin error', err);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>
                    Sign{'\n'}<Text style={styles.titleUp}>Up</Text>
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

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        value={confirm}
                        onChangeText={setConfirm}
                        placeholder=""
                        placeholderTextColor="#9b9b9b"
                        style={styles.input}
                        secureTextEntry
                    />

                    {error ? <Text style={{ color: '#ff7b7b', marginTop: 8 }}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[styles.cta, { opacity: loading ? 0.8 : 1 }]}
                        activeOpacity={0.85}
                        onPress={handleSignUp}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator /> : <Text style={styles.ctaText}>Sign up</Text>}
                    </TouchableOpacity>

                    <Text style={styles.or}>OR</Text>

                    <TouchableOpacity
                        style={styles.googleBtn}
                        activeOpacity={0.85}
                        onPress={handleGoogleSignUp}
                        disabled={loading}
                    >
                        <View style={styles.googleIcon}>
                            <Text style={styles.googleG}>G</Text>
                        </View>
                        <Text style={styles.googleText}>Sign up with Google</Text>
                    </TouchableOpacity>

                    <View style={styles.createRow}>
                        <Text style={styles.createTextLeft}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.replace('Login')} activeOpacity={0.85}>
                            <Text style={styles.createTextCTA}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

// keep your styles (omitted here for brevity — reuse your existing styles)
const styles = StyleSheet.create({
    /* ... paste your existing styles here ... */
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
    title: { color: '#FFAE00', fontSize: 36, fontWeight: '700', lineHeight: 42, paddingBottom: 4, marginBottom: 14 },
    titleUp: { color: '#FFAE00', fontSize: 36, fontWeight: '700' },
    form: { marginTop: 8 },
    label: { color: '#FFAE00', fontSize: 13, marginTop: 12, marginBottom: 6 },
    input: { borderWidth: 1.6, borderColor: '#FFAE00', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#ffffff', fontSize: 14, backgroundColor: 'transparent' },
    cta: { marginTop: 18, backgroundColor: '#F59E0B', alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 34, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#16253D', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: Platform.OS === 'android' ? 6 : 0 },
    ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    or: { color: '#FFAE00', alignSelf: 'center', marginTop: 12, marginBottom: 10, fontWeight: '600' },
    googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F59E0B', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 24, marginTop: 6, position: 'relative' },
    googleIcon: { position: 'absolute', left: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    googleG: { color: '#F59E0B', fontWeight: '700' },
    googleText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
    createRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    createTextLeft: { color: 'rgba(255,174,0,0.55)', fontSize: 13 },
    createTextCTA: { color: '#F59E0B', fontSize: 13, fontWeight: '700', marginLeft: -.5 },
});
