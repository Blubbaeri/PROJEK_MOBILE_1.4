// components/IPSelector.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Tambah import axios

const COMMON_IPS = [
    '10.1.6.125',      // IP kampus
    '192.168.100.4',   // IP rumah
    '192.168.1.100',   // Common home 1
    '192.168.0.100',   // Common home 2
    '10.0.2.2',        // Android emulator
    'localhost',       // iOS simulator
];

export const IPSelector = ({ onSelect, currentIP }: any) => {
    const [customIP, setCustomIP] = useState('');
    const [recentIPs, setRecentIPs] = useState<string[]>([]);
    const [testingIP, setTestingIP] = useState<string | null>(null);

    useEffect(() => {
        loadRecentIPs();
    }, []);

    const loadRecentIPs = async () => {
        try {
            const saved = await AsyncStorage.getItem('recent_ips');
            if (saved) setRecentIPs(JSON.parse(saved));
        } catch (e) {
            console.log('Error loading IPs:', e);
        }
    };

    const saveIP = async (ip: string) => {
        try {
            const updated = [ip, ...recentIPs.filter(i => i !== ip)].slice(0, 5);
            setRecentIPs(updated);

            // **KEY HARUS SAMA DENGAN apiBase.ts!**
            await AsyncStorage.setItem('server_ip', ip); // <-- GANTI 'selected_ip' jadi 'server_ip'
            await AsyncStorage.setItem('recent_ips', JSON.stringify(updated));
        } catch (e) {
            console.log('Error saving IP:', e);
        }
    };

    const handleSelect = async (ip: string) => {
        setCustomIP(ip);
        await saveIP(ip);
        onSelect(ip);
    };

    const testConnection = async (ip: string) => {
        setTestingIP(ip);
        try {
            // Pakai axios dengan timeout
            const response = await axios.get(`http://${ip}:5234/api/equipment`, {
                timeout: 3000,
                validateStatus: () => true // Accept any status code
            });

            setTestingIP(null);
            return response.status < 500; // Return true jika status bukan server error
        } catch {
            setTestingIP(null);
            return false;
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                Select Server IP
            </Text>
            <Text style={{ marginBottom: 5, color: '#666' }}>
                Current: {currentIP || 'Not set'}
            </Text>

            <TextInput
                style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                placeholder="Enter IP address (e.g., 192.168.1.100)"
                value={customIP}
                onChangeText={setCustomIP}
            />

            <Button
                title="Use Custom IP"
                onPress={() => customIP && handleSelect(customIP)}
                disabled={!customIP}
            />

            <Text style={{ marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>
                Common IPs:
            </Text>

            {testingIP && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <ActivityIndicator size="small" />
                    <Text style={{ marginLeft: 10 }}>Testing {testingIP}...</Text>
                </View>
            )}

            <FlatList
                data={[...recentIPs, ...COMMON_IPS.filter(ip => !recentIPs.includes(ip))]}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item }) => (
                    <View style={{ marginBottom: 10 }}>
                        <Button
                            title={`${item} ${testingIP === item ? 'Testing...' : ''}`}
                            onPress={async () => {
                                const isOk = await testConnection(item);
                                if (isOk) {
                                    Alert.alert('Success', `Connected to ${item}`);
                                    handleSelect(item);
                                } else {
                                    Alert.alert('Failed', `Cannot connect to ${item}`);
                                }
                            }}
                            disabled={testingIP !== null}
                        />
                    </View>
                )}
            />
        </View>
    );
};