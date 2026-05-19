import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, ScrollView, Text, TextInput, View } from 'react-native';

export default function Payment() {
  const router = useRouter();
  const {
    user,
    cart,
    total,
    shippingInfo,
    paymentInfo,
    setPaymentInfo,
    clearCart,
    addOrderToHistory,
    addToOfflineQueue,
  } = useCart();

  const [method, setMethod] = useState<'card' | 'cod'>(paymentInfo?.method ?? 'card');
  const [cardNumber, setCardNumber] = useState(paymentInfo?.cardNumber ?? '');
  const [cardName, setCardName] = useState(paymentInfo?.cardName ?? '');
  const [cardExpiry, setCardExpiry] = useState(paymentInfo?.cardExpiry ?? '');
  const [cardCVC, setCardCVC] = useState(paymentInfo?.cardCVC ?? '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (!shippingInfo) {
    return (
      <View style={{ marginTop: 50, padding: 16 }}>
        <Text style={{ marginBottom: 12 }}>Shipping address is required before payment.</Text>
        <Button title="Back to Shipping" onPress={() => router.push('/shipping')} />
      </View>
    );
  }

  const canPay =
    method === 'cod' ||
    (cardNumber.length >= 12 && cardName.length > 2 && cardExpiry.length >= 4 && cardCVC.length >= 3);

  const processStripePayment = async () => {
    // ⚠️ In production, replace with real Stripe/Razorpay SDK integration.
    // Here we mock behavior for test flow.
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (cardNumber.replaceAll(' ', '') === '4242424242424242') {
      return { success: true, provider: 'stripe', transactionId: `txn_${Date.now()}` };
    }
    throw new Error('Payment declined by mock gateway. Use card 4242 4242 4242 4242 for success.');
  };

  const submitOrder = async () => {
    setSubmitting(true);
    const payment = {
      method,
      cardNumber: method === 'card' ? cardNumber : undefined,
      cardName: method === 'card' ? cardName : undefined,
      cardExpiry: method === 'card' ? cardExpiry : undefined,
      cardCVC: method === 'card' ? cardCVC : undefined,
    };
    setPaymentInfo(payment);

    try {
      if (method === 'card') {
        await processStripePayment();
      }

      // Check network connectivity by attempting a simple fetch
      let isOnline = true;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const testResponse = await fetch('http://10.0.2.2:8082/api/health', { 
          method: 'GET',
          signal: controller.signal 
        });
        clearTimeout(timeoutId);
        isOnline = testResponse.ok || testResponse.status < 500;
      } catch {
        isOnline = false;
      }

      if (!isOnline) {
        addToOfflineQueue({ cart, total, shippingInfo, paymentInfo: payment, userId: user?.id ?? 'guest' });
        clearCart();
        setSubmitting(false);
        Alert.alert('Offline', 'Order queued. It will be submitted when internet is back.');
        router.replace('/order-status?orderId=pending');
        return;
      }

      const response = await fetch('http://10.0.2.2:8082/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, total, shippingInfo, paymentInfo: payment }),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const order: any = {
        orderId: result.orderId ?? `${Date.now()}`,
        status: result.status ?? 'confirmed',
        total,
        createdAt: new Date().toISOString(),
        items: cart,
      };
      addOrderToHistory(order);
      clearCart();
      router.replace(`/order-status?orderId=${order.orderId}`);
    } catch (error: any) {
      if (error?.message?.toLowerCase().includes('network') || error?.message?.toLowerCase().includes('failed')) {
        addToOfflineQueue({ cart, total, shippingInfo, paymentInfo: payment, userId: user?.id ?? 'guest' });
        clearCart();
        Alert.alert('Offline', 'Order queued due to checkout failure. It will retry when online.');
        router.replace('/order-status?orderId=pending');
      } else {
        Alert.alert('Checkout failed', error?.message || 'Unknown error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={{ marginTop: 50, padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Payment</Text>
      <Text style={{ marginBottom: 12 }}>Order Total: ₹{total.toFixed(2)}</Text>

      <View style={{ marginBottom: 14 }}>
        <Button
          title={method === 'card' ? 'Switch to Cash on Delivery' : 'Switch to Card Payment'}
          onPress={() => setMethod(method === 'card' ? 'cod' : 'card')}
        />
      </View>
      {method === 'card' ? (
        <Text style={{ marginBottom: 12, color: '#333' }}>
          Test stripe token: 4242 4242 4242 4242 (mock flow, no real payments)
        </Text>
      ) : null}

      {method === 'card' ? (
        <>
          <TextInput
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="Card Number"
            keyboardType="number-pad"
            style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 10, borderRadius: 6 }}
          />
          <TextInput
            value={cardName}
            onChangeText={setCardName}
            placeholder="Name on Card"
            style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 10, borderRadius: 6 }}
          />
          <TextInput
            value={cardExpiry}
            onChangeText={setCardExpiry}
            placeholder="Expiry (MM/YY)"
            style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 10, borderRadius: 6 }}
          />
          <TextInput
            value={cardCVC}
            onChangeText={setCardCVC}
            placeholder="CVC"
            keyboardType="number-pad"
            style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 10, borderRadius: 6 }}
          />
        </>
      ) : (
        <Text style={{ marginBottom: 14 }}>Cash on Delivery selected. Payment will be collected at delivery.</Text>
      )}

      <Button title={submitting ? 'Placing order...' : 'Place Order'} onPress={submitOrder} disabled={!canPay || submitting} />
    </ScrollView>
  );
}
