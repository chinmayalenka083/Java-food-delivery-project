import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'expo-router';
import { Button, FlatList, Text, View } from 'react-native';

export default function Cart() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, total, user } = useCart();

  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
    <View style={{ marginTop: 50, padding: 16, flex: 1 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Cart</Text>
      {cart.length === 0 ? (
        <Text style={{ marginBottom: 24 }}>Your cart is empty.</Text>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                marginBottom: 12,
                padding: 10,
                backgroundColor: '#fff',
              }}>
              <Text style={{ fontSize: 18, fontWeight: '600' }}>{item.name}</Text>
              <Text>Quantity: {item.quantity}</Text>
              <Text>Price: ₹{item.price.toFixed(2)}</Text>
              <Text>Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</Text>
              <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
                <Button
                  title="-"
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                />
                <Button
                  title="+"
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                />
                <Button title="Remove" onPress={() => removeFromCart(item.id)} />
              </View>
            </View>
          )}
        />
      )}

      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Total: ₹{total.toFixed(2)}</Text>
        <Button title="Proceed to checkout" onPress={() => router.push('/shipping')} />
      </View>
    </View>
  );
}

