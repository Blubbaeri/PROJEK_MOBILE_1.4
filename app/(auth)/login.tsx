// file: src/app/(auth)/login.tsx

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';

export default function LoginScreen() {
    const [email, setEmail] = useState('budi@student.simpel.lab');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();

    // --- LOGIKA LOGIN (TETAP SAMA) ---
    const handleSignIn = async () => {
        console.log('Login attempt:', email, password);

        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        setIsLoading(true);

        // Simulasi delay network
        setTimeout(() => {
            if (email === 'budi@student.simpel.lab' && password === '123456') {
                console.log('Login success (local)');
                signIn("dummy_token_123");
            } else {
                Alert.alert('Login Failed', 'Invalid email or password.');
            }
            setIsLoading(false);
        }, 800);
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
                        {/* Menggunakan FontAwesome Flask agar konsisten dengan Home, 
                            atau ganti dengan Image jika ingin pakai icon.png kamu */}
                        <FontAwesome name="flask" size={40} color="#5B4DBC" />
                        {/* <Image source={require('@/assets/images/icon.png')} style={{width: 50, height: 50}} resizeMode="contain" /> */}
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
                            placeholder="••••••••"
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
        backgroundColor: '#5B4DBC' // Ungu Utama
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 25
    },

    // Logo Styles
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
        // Shadow effect
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
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

    // Form Styles
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

    // Button Styles
    loginButton: {
        backgroundColor: '#26C6DA', // Cyan/Tosca (Kontras Bagus dengan Ungu)
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
    },
    buttonDisabled: {
        backgroundColor: '#80DEEA' // Versi pudar dari cyan
    },
    loginText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },

    // Footer
    footer: {
        marginTop: 30,
        alignItems: 'center'
    },
    footerText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14
    }
});