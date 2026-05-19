import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Profile() {
  const router = useRouter();
  const { user, logoutUser, cartCount, orderHistory } = useCart();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Profile</Text>

      {user ? (
        <View style={styles.section}>
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.value}>{user.email}</Text>
          <Text style={styles.meta}>Cart items: {cartCount}</Text>
          <Text style={styles.meta}>Orders: {orderHistory.length}</Text>
          <View style={styles.buttonGap} />
          <Button title="Logout" onPress={logoutUser} />
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.value}>You are not logged in.</Text>
          <Text style={styles.meta}>Login to view your profile and continue checkout.</Text>
          <View style={styles.buttonGap} />
          <Button title="Login" onPress={() => router.push('/login')} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  section: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
  },
  label: {
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  meta: {
    color: '#555',
    marginBottom: 6,
  },
  buttonGap: {
    height: 12,
  },
});
