import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, ScrollView, Text, TextInput } from 'react-native';

type ShippingForm = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  instructions: string;
};

export default function Shipping() {
  const router = useRouter();
  const { user, setShippingInfo } = useCart();

  const [form, setForm] = useState<ShippingForm>({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    instructions: '',
  });

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const onChange = (key: keyof ShippingForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canContinue =
    form.fullName.trim() &&
    form.phone.trim() &&
    form.street.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.zip.trim();

  return (
    <ScrollView style={{ marginTop: 50, padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Shipping Address</Text>
      {(['fullName', 'phone', 'street', 'city', 'state', 'zip'] as const).map((field) => (
        <TextInput
          key={field}
          value={form[field]}
          onChangeText={(value) => onChange(field, value)}
          placeholder={field === 'fullName' ? 'Full Name' : field.charAt(0).toUpperCase() + field.slice(1)}
          style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 10, borderRadius: 6 }}
          keyboardType={field === 'phone' || field === 'zip' ? 'phone-pad' : 'default'}
        />
      ))}

      <TextInput
        value={form.instructions}
        onChangeText={(value) => onChange('instructions', value)}
        placeholder='Delivery instructions (optional)'
        style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 10, borderRadius: 6, minHeight: 80 }}
        multiline
      />

      <Button
        title='Continue to Payment'
        disabled={!canContinue}
        onPress={() => {
          setShippingInfo({
            fullName: form.fullName,
            phone: form.phone,
            street: form.street,
            city: form.city,
            state: form.state,
            zip: form.zip,
            instructions: form.instructions,
          });
          router.push('/payment');
        }}
      />
    </ScrollView>
  );
}
