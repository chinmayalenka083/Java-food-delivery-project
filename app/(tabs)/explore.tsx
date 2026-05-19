import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

const restaurants = [
  { id: 'r1', name: 'Pizza Palace', category: 'Pizza', rating: 4.6, eta: '25-30 mins' },
  { id: 'r2', name: 'Burger Barn', category: 'Burgers', rating: 4.4, eta: '20-25 mins' },
  { id: 'r3', name: 'Sushi Zen', category: 'Sushi', rating: 4.8, eta: '35-40 mins' },
  { id: 'r4', name: 'Taco Town', category: 'Mexican', rating: 4.3, eta: '18-22 mins' },
  { id: 'r5', name: 'Curry Corner', category: 'Indian', rating: 4.7, eta: '30-35 mins' },
];

const categories = ['All', 'Pizza', 'Burgers', 'Sushi', 'Mexican', 'Indian'];

export default function Explore() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const matchesCat = category === 'All' || r.category === category;
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [category, search]);

  return (
    <View style={{ flex: 1, marginTop: 50, padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 8, fontWeight: '700' }}>Explore Restaurants</Text>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search restaurants..."
        style={styles.input}
      />

      <FlatList
        horizontal
        data={categories}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        style={{ marginBottom: 14 }}
        renderItem={({ item }) => (
          <Button
            title={item}
            onPress={() => setCategory(item)}
            color={item === category ? '#1f6f8b' : '#aaa'}
          />
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.meta}>Category: {item.category}</Text>
            <Text style={styles.meta}>Rating: {item.rating}</Text>
            <Text style={styles.meta}>ETA: {item.eta}</Text>
            <Button title="View menu" onPress={() => router.push(`/restaurant/${item.id}/menu` as any)} />
          </View>
        )}
        ListEmptyComponent={() => <Text>No restaurants found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    color: '#555',
    marginBottom: 2,
  },
});
