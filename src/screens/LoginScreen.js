import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';

export default function LoginScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('student'); // 'student' | 'staff'
    const [gmail, setGmail] = useState('');
    const [password, setPassword] = useState('');

    // labels based on tab
    const continueLabel =
        activeTab === 'student' ? 'Continue as Student' : 'Continue as Staff';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                {/* Tab switcher inside card, above the title */}
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

                {/* Title */}
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

                    <TouchableOpacity style={styles.cta} activeOpacity={0.85}>
                        <Text style={styles.ctaText}>{continueLabel}</Text>
                    </TouchableOpacity>

                    {/* show Google continue only for student tab */}
                    {activeTab === 'student' && (
                        <>
                            <Text style={styles.or}>OR</Text>

                            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
                                <View style={styles.googleIcon}>
                                    <Text style={styles.googleG}>G</Text>
                                </View>
                                <Text style={styles.googleText}>Continue with Google</Text>
                            </TouchableOpacity>

                            {/* Create account line (student only) */}
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

                    {/* If staff tab, show create account row but hidden (or you can omit entirely) */}
                    {activeTab === 'staff' && (
                        <View style={{ height: 28 }} /> // keep vertical rhythm when Google isn't shown
                    )}
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
        backgroundColor: '#0B1E3C', // card color
        borderRadius: 28,
        paddingVertical: 30,
        paddingHorizontal: 22,
        shadowColor: '#16253D', // drop shadow color
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.80,
        shadowRadius: 2,
        elevation: Platform.OS === 'android' ? 25 : 0,
        overflow: 'visible', // ensure children descenders aren't clipped by borderRadius on Android
    },

    /* Tab styles (inside card, above the title) */
    tabRow: {
        flexDirection: 'row',
        alignSelf: 'center',
        backgroundColor: 'transparent',
        borderRadius: 22,
        marginBottom: 20, // increased space between tabs and title
        paddingHorizontal: 6,
    },

    // Larger tab items
    tabItem: {
        paddingVertical: 10, // increased vertical padding
        paddingHorizontal: 26, // increased horizontal padding
        borderRadius: 20,
        marginHorizontal: 8,
        minWidth: 110,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Active tab: use main CTA color and white text
    tabItemActive: {
        backgroundColor: '#F59E0B',
    },
    tabTextActive: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 16,
    },

    // Inactive tab: transparent with accent text
    tabItemInactive: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    tabTextInactive: {
        color: '#FFAE00',
        fontWeight: '700',
        fontSize: 16,
    },

    title: {
        color: '#FFAE00',
        fontSize: 36,
        fontWeight: '700',
        marginTop: 14,
        lineHeight: 42, // increased so descenders won't get clipped
        paddingBottom: 4, // extra space below the text to avoid overlap/clipping
        marginBottom: 14,
        textAlign: 'left',
    },
    titleUp: {
        color: '#FFAE00',
        fontSize: 36,
        fontWeight: '700',
    },

    form: {
        marginTop: 0,
    },

    label: {
        color: '#FFAE00',
        fontSize: 13,
        marginTop: 12,
        marginBottom: 6,
    },

    input: {
        borderWidth: 3,
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
        textTransform: 'none',
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
        justifyContent: 'center', // centers text
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
        backgroundColor: '#FFFFFF', // white circle
        alignItems: 'center',
        justifyContent: 'center',
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
        marginTop: 25,
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
        marginTop: 10,
    },
});
