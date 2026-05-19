import { useCart } from '@/app/context/CartContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function OrderStatus() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const router = useRouter();
  const { user } = useCart();

  if (!user) {
    router.replace('/login');
    return null;
  }

  if (!orderId) {
    return (
      <View style={{ marginTop: 50, padding: 16 }}>
        <Text>Order not found.</Text>
        <Button title="Go Home" onPress={() => router.push('/')} />
      </View>
    );
  }

  return (
    <View style={{ marginTop: 50, padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Order Tracking</Text>
      <Text style={{ marginBottom: 12 }}>Order ID: {orderId}</Text>
      <Text>Status: Confirmed</Text>
      <Text style={{ marginTop: 8 }}>Est. delivery in 30-45 mins.</Text>
      <View style={{ marginTop: 16 }}>
        <Button title="Go to Order History" onPress={() => router.push('/history')} />
      </View>
    </View>
  );
}
