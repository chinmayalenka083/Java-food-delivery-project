const API_BASE = 'https://example.com/api';

export async function getMenuItems() {
  const response = await fetch(`${API_BASE}/menu`);
  if (!response.ok) throw new Error('Failed to fetch menu');
  return response.json();
}

export async function createOrder(orderData) {
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) throw new Error('Failed to submit order');
  return response.json();
}

export default { getMenuItems, createOrder };
