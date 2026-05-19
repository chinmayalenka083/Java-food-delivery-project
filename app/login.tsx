import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';

export default function Login() {
  const router = useRouter();
  const { loginUser } = useCart();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    if (!email || !password) {
      Alert.alert('Validation', 'Please enter email and password.');
      return;
    }

    try {
      const res = await fetch('http://10.0.2.2:8081/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || 'Login failed');
      }

      const data = await res.json();
      loginUser({ id: data.id ?? 'user', email, token: data.token ?? 'demo-token' });
      Alert.alert('Login success', 'Welcome back!');
      router.push('/');
    } catch (error: any) {
      Alert.alert('Login failed', error?.message || 'Network error');
    }
  };

  return (
    <View style={{ marginTop: 50, padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8, borderRadius: 4 }}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8, borderRadius: 4 }}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={login} />
    </View>
  );
}

