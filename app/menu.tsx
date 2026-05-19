import { useCart } from '@/app/context/CartContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Text, View } from 'react-native';

type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
};

export default function Menu() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, addToCart, cart } = useCart();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      try {
        const endpoint = id
          ? `http://10.0.2.2:8082/api/menu?restaurantId=${id}`
          : 'http://10.0.2.2:8082/api/menu';
        const res = await fetch(endpoint);
        if (!res.ok) {
          throw new Error(`${res.status} ${res.statusText}`);
        }
        const data: MenuItem[] = await res.json();
        setItems(data);
      } catch (err: any) {
        setError('Unable to load menu: ' + (err?.message || 'unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, [id]);

  const cartQuantity = (itemId: string) => {
    const item = cart.find((c) => c.id === itemId);
    return item?.quantity ?? 0;
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <View style={{ marginTop: 50, padding: 16 }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ marginTop: 50, padding: 16, flex: 1 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Menu</Text>
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 12,
              backgroundColor: '#fff',
            }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{item.name}</Text>
            <Text style={{ color: '#555', marginVertical: 4 }}>{item.description ?? 'Delicious item'}.</Text>
            <Text style={{ marginBottom: 8 }}>Price: ₹{item.price.toFixed(2)}</Text>
            {cartQuantity(item.id) > 0 ? <Text>In cart: {cartQuantity(item.id)}</Text> : null}
            <Button title="Add to Cart" onPress={() => addToCart(item)} />
          </View>
        )}
      />
    </View>
  );
}

