// file: app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
    // Langsung arahkan ke halaman login di dalam folder (auth)
    return <Redirect href="/(auth)/login" />;
}