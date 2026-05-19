import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'expo-router';
import { Button, FlatList, Text, View } from 'react-native';

export default function History() {
  const router = useRouter();
  const { user, orderHistory } = useCart();

  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
    <View style={{ marginTop: 50, padding: 16, flex: 1 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Order History</Text>
      {orderHistory.length === 0 ? (
        <Text>No orders yet. Place your first order.</Text>
      ) : (
        <FlatList
          data={orderHistory}
          keyExtractor={(item) => item.orderId}
          renderItem={({ item }) => (
            <View
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                padding: 12,
                marginBottom: 10,
              }}>
              <Text style={{ fontWeight: 'bold' }}>Order #{item.orderId}</Text>
              <Text>Placed: {new Date(item.createdAt).toLocaleString()}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Total: ₹{item.total.toFixed(2)}</Text>
              <Button
                title="Track"
                onPress={() => router.push(`/order-status?orderId=${item.orderId}`)}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}
