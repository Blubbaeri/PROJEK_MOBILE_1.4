// app/(auth)/login.tsx
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getApiBaseUrl } from '../../lib/apiBase';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { signIn } = useAuth();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Gagal', 'Mohon isi Username dan Password.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting login process...');
      const API_BASE = getApiBaseUrl();
      console.log('📡 API Base URL:', API_BASE);
      console.log('🔗 Login URL:', `${API_BASE}/api/Auth/login`);

      const username = email.replace('@student.simpel.lab', '');
      console.log('👤 Username:', username);

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
      const loginData = await loginResponse.json();
      console.log('📦 Login response data:', loginData);

      if (!loginResponse.ok) {
        throw new Error(loginData.errorMessage || 'Login gagal');
      }

      const firstToken = loginData.token;
      console.log('🔑 First token received:', firstToken ? 'YES' : 'NO');

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

      await signIn(finalToken, permissions);

      console.log('💾 Token saved to AuthContext');
      console.log('🚀 Navigating to home...');

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('🔍 Error details:', error.message);

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
    <LinearGradient
      colors={['#5B4DBC', '#7B68D4', '#5B4DBC']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* Animated Background Circles */}
      <Animated.View style={[styles.backgroundCircle1, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.backgroundCircle2, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.backgroundCircle3, { opacity: fadeAnim }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <Animated.View
                style={[
                  styles.logoBox,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#26C6DA', '#00ACC1', '#0097A7']}
                  style={styles.logoGradient}
                >
                  <FontAwesome name="wrench" size={45} color="white" />
                </LinearGradient>
              </Animated.View>

              <Text style={styles.title}>Lab Equipment</Text>
              <Text style={styles.subtitle}>Management System  I</Text>

              {/* Decorative Line */}
              <View style={styles.decorativeLine}>
                <View style={styles.decorativeLineInner} />
                <View style={styles.decorativeDot} />
                <View style={styles.decorativeLineInner} />
              </View>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
              <View style={styles.card}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <FontAwesome name="user" size={16} color="white" />
                    <Text style={styles.label}>Username</Text>
                  </View>
                  <View
                    style={[
                      styles.inputWrapper,
                      emailFocused && styles.inputWrapperFocused,
                    ]}
                  >
                    <FontAwesome
                      name="user-circle"
                      size={20}
                      color={emailFocused ? '#26C6DA' : '#999'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Username"
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <FontAwesome name="lock" size={16} color="white" />
                    <Text style={styles.label}>Password</Text>
                  </View>
                  <View
                    style={[
                      styles.inputWrapper,
                      passwordFocused && styles.inputWrapperFocused,
                    ]}
                  >
                    <FontAwesome
                      name="key"
                      size={20}
                      color={passwordFocused ? '#26C6DA' : '#999'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#999"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      secureTextEntry
                    />
                  </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                  onPress={handleSignIn}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#26C6DA', '#00ACC1']}
                    style={styles.loginGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator color="white" size="small" />
                        <Text style={styles.loginText}>Processing...</Text>
                      </View>
                    ) : (
                      <View style={styles.buttonContent}>
                        <FontAwesome name="sign-in" size={20} color="white" />
                        <Text style={styles.loginText}>Login</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerDivider} />
              <View style={styles.footerContent}>
                <FontAwesome name="info-circle" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.footerText}>
                  Need access? Contact Lab Administrator
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5B4DBC',
  },
  backgroundCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -100,
    right: -100,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    bottom: 100,
    left: -50,
  },
  backgroundCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    top: 200,
    left: 50,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },
  content: {
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  decorativeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  decorativeLineInner: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  decorativeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#26C6DA',
  },
  formContainer: {
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 4,
  },
  label: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputWrapperFocused: {
    borderColor: '#26C6DA',
    shadowColor: '#26C6DA',
    shadowOpacity: 0.3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#26C6DA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    shadowOpacity: 0.2,
  },
  loginGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerDivider: {
    width: 100,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 20,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginLeft: 8,
  },
});