// src/app/+not-found.tsx
import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function NotFoundScreen() {
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <Text>This screen doesn't exist.</Text>
            <Link href="/" style={styles.link}>
                <Text>Go to home screen!</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
});