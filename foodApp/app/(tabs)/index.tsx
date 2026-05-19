import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function Home() {
  const router = useRouter();
  const { cartCount } = useCart();

  return (
    <View style={{ marginTop: 50, padding: 16 }}>
      <Text style={{ fontSize: 22, marginBottom: 16 }}>🍔 Restaurants</Text>
      <Text style={{ marginBottom: 24 }}>Cart items: {cartCount}</Text>

      <Button title="Go to Menu" onPress={() => router.push('/menu')} />
      <View style={{ height: 12 }} />
      <Button title="Go to Cart" onPress={() => router.push('/cart')} />
      <View style={{ height: 12 }} />
      <Button title="Go to Cart" onPress={() => router.push('/cart')} />
      <View style={{ height: 12 }} />
      <Button title="Go to Login" onPress={() => router.push('/login')} />
      <View style={{ height: 12 }} />
      <Button title="Order History" onPress={() => router.push('/history')} />
    </View>
  );
}

