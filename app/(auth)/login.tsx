// app/(auth)/login.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getApiBaseUrl } from '../../lib/apiBase'; // ✅ IMPORT INI

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('admin');
    const [password, setPassword] = useState('123456');
    const [isLoading, setIsLoading] = useState(false);

    const { signIn } = useAuth();

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Gagal', 'Mohon isi Username dan Password.');
            return;
        }

        setIsLoading(true);

        try {
            console.log('Starting login process...');

            // ✅ Debug: Tampilkan URL yang digunakan
            const API_BASE = getApiBaseUrl();
            console.log('📡 API Base URL:', API_BASE);
            console.log('🔗 Login URL:', `${API_BASE}/api/Auth/login`);

            // 1️⃣ LOGIN KE API - Extract username dari email
            const username = email.replace('@student.simpel.lab', '');
            console.log('👤 Username:', username);

            // ✅ Gunakan API_BASE dari fungsi
            const loginResponse = await fetch(`${API_BASE}/api/Auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    jenisAplikasi: "public"
                }),
            });

            console.log('📊 Login response status:', loginResponse.status);

            // Parse login response
            const loginData = await loginResponse.json();
            console.log('📦 Login response data:', loginData);

            if (!loginResponse.ok) {
                throw new Error(loginData.errorMessage || 'Login gagal');
            }

            const firstToken = loginData.token;
            console.log('🔑 First token received:', firstToken ? 'YES' : 'NO');

            // 2️⃣ GET PERMISSION TOKEN
            console.log('🔄 Getting permission token...');
            console.log('🔗 Permission URL:', `${API_BASE}/api/Auth/getpermission`);

            const permissionResponse = await fetch(`${API_BASE}/api/Auth/getpermission`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${firstToken}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    appId: "APP01",
                    roleId: "ROL23"
                }),
            });

            console.log('📊 Permission response status:', permissionResponse.status);

            const permissionData = await permissionResponse.json();
            console.log('📦 Permission response data:', permissionData);

            if (!permissionResponse.ok) {
                throw new Error(permissionData.errorMessage || 'Gagal mendapatkan permission');
            }

            const finalToken = permissionData.token;
            const permissions = permissionData.listPermission || [];

            console.log('✅ Login berhasil!');
            console.log('🔑 Final token:', finalToken ? 'RECEIVED' : 'MISSING');
            console.log('📋 Permissions count:', permissions.length);

            // 3️⃣ SIMPAN KE AUTH CONTEXT
            await signIn(finalToken, permissions);
            console.log('💾 Token saved to AuthContext');

            // 4️⃣ NAVIGASI KE HOME
            console.log('🚀 Navigating to home...');
            router.replace('/(tabs)');

        } catch (error: any) {
            console.error('❌ Login error:', error);
            console.error('🔍 Error details:', error.message);

            // ✅ Pesan error yang lebih informatif
            let errorMessage = error.message;
            if (error.message.includes('Network request failed')) {
                errorMessage = `Gagal terhubung ke server:\n\n` +
                    `URL: ${getApiBaseUrl()}\n` +
                    `IP Server: 192.168.100.4\n` +
                    `Port: 5234\n\n` +
                    `Periksa:\n` +
                    `1. Server API berjalan di komputer\n` +
                    `2. Port 5234 terbuka\n` +
                    `3. Device dalam WiFi yang sama`;
            }

            Alert.alert('Login Gagal', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor="#5B4DBC" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* --- LOGO SECTION --- */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoBox}>
                        <FontAwesome name="flask" size={40} color="#5B4DBC" />
                    </View>
                    <Text style={styles.title}>Lab Equipment</Text>
                    <Text style={styles.subtitle}>Student Portal</Text>
                </View>

                {/* --- FORM SECTION --- */}
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="student@university.edu"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Type: 123456"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                        onPress={handleSignIn}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.loginText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? Ask Admin.</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#5B4DBC'
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 25
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40
    },
    logoBox: {
        width: 80,
        height: 80,
        backgroundColor: 'white',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 0.5
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 5
    },
    formContainer: {
        width: '100%'
    },
    inputGroup: {
        marginBottom: 20
    },
    label: {
        color: 'white',
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#333',
        elevation: 2
    },
    loginButton: {
        backgroundColor: '#26C6DA',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#80DEEA'
    },
    loginText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    footer: {
        marginTop: 30,
        alignItems: 'center'
    },
    footerText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14
    }
});