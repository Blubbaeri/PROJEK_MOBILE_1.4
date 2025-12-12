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
import { useRouter } from 'expo-router'; // <--- 1. INI PENTING (Import Router)

export default function LoginScreen() {
    const router = useRouter(); // <--- 2. Panggil Router
    const [email, setEmail] = useState('budi@student.simpel.lab');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { signIn } = useAuth();

    const handleSignIn = async () => {
        // Validasi Input Kosong
        if (!email || !password) {
            Alert.alert('Gagal', 'Mohon isi Email dan Password.');
            return;
        }

        setIsLoading(true);

        try {
            // Cek Password Dummy (Harus 123456)
            if (password === '123456') {

                const dummyToken = "eyJhGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy";

                // 1. Simpan status login
                await signIn(dummyToken);

                // 2. PAKSA PINDAH HALAMAN (Navigation)
                // Ini yang bikin tombolnya bereaksi langsung pindah ke Home/Tabs
                router.replace('/(tabs)');

            } else {
                Alert.alert(
                    'Login Gagal',
                    'Password salah! Coba ketik: 123456'
                );
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Terjadi kesalahan sistem.');
        } finally {
            // Kita set false di sini, tapi kalau sukses biasanya keburu pindah halaman (aman)
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