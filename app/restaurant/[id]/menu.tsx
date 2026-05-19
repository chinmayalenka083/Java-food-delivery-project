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

export default function RestaurantMenu() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addToCart, user } = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://10.0.2.2:8082/api/menu?restaurantId=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data: MenuItem[]) => setItems(data))
      .catch((err) => setError('Unable to load menu: ' + err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (!user) {
    router.replace('/login');
    return null;
  }

  if (!id) {
    return (
      <View style={{ marginTop: 50, padding: 16 }}>
        <Text>Restaurant not found.</Text>
        <Button title="Go explore" onPress={() => router.push('/explore')} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ marginTop: 50, padding: 16 }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, marginTop: 50, padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Restaurant {id} Menu</Text>
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
              backgroundColor: '#fff',
            }}>
            <Text style={{ fontSize: 18, fontWeight: '600' }}>{item.name}</Text>
            <Text style={{ color: '#555' }}>{item.description ?? 'Tasty choice'}</Text>
            <Text style={{ marginBottom: 8 }}>₹{item.price.toFixed(2)}</Text>
            <Button title="Add to Cart" onPress={() => addToCart(item)} />
          </View>
        )}
      />
    </View>
  );
}
