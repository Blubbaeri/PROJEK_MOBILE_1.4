// file: src/app/(auth)/login.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';



export default function LoginScreen() {
    const API_BASE_URL = "http://localhost:5234/api";
    const [email, setEmail] = useState('budi@student.simpel.lab');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();

    const handleSignIn = async () => {
        console.log('Login attempt:', email, password);

        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        setIsLoading(true);

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
        <LinearGradient colors={['#7F7FD5', '#6A5AE0', '#5B61F5']} style={styles.container}>
            <Image source={require('@/assets/images/icon.png')} style={styles.icon} />
            <Text style={styles.title}>Lab Equipment</Text>
            <Text style={styles.subtitle}>Student Portal</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#ddd"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#ddd"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#6A5AE0" />
                ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                )}
            </TouchableOpacity>
        </LinearGradient>
    );
}

// styles tetap sama
const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
    icon: { width: 100, height: 100, marginBottom: 30 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    subtitle: { fontSize: 16, color: '#eee', marginBottom: 40 },
    input: { width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 14, borderRadius: 10, marginBottom: 15, color: 'white', fontSize: 16 },
    button: { backgroundColor: 'white', paddingVertical: 14, borderRadius: 10, width: '100%', alignItems: 'center', marginTop: 10, minHeight: 50, justifyContent: 'center' },
    buttonDisabled: { backgroundColor: '#ccc' },
    buttonText: { color: '#5B61F5', fontWeight: 'bold', fontSize: 16 }
});
