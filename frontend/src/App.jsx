import Login from "./pages/Login";
import { api } from "./api";
import { useAuth } from "./context/useAuth";
import { useEffect, useMemo, useState } from "react";

// ------------------ STATIC DATA ------------------

const foodItems = [
  {
    id: "paneer-tikka",
    name: "Paneer Tikka Bowl",
    restaurant: "Bombay Spice Lab",
    price: "₹249",
    offer: "20% OFF",
    image:
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7",
  },
];

// ✅ Subscription Plans (10)
const subscriptionPlans = [
  { id: 1, name: "Weekly Veg Plan", price: "₹999" },
  { id: 2, name: "Weekly Non-Veg Plan", price: "₹1299" },
  { id: 3, name: "Monthly Veg Plan", price: "₹3499" },
  { id: 4, name: "Monthly Non-Veg Plan", price: "₹4499" },
  { id: 5, name: "Diet Plan", price: "₹2999" },
  { id: 6, name: "Protein Rich Plan", price: "₹3999" },
  { id: 7, name: "Student Budget Plan", price: "₹1999" },
  { id: 8, name: "Family Combo Plan", price: "₹5999" },
  { id: 9, name: "Keto Plan", price: "₹4999" },
  { id: 10, name: "Custom Meal Plan", price: "₹6999" },
];

// ------------------ APP ------------------

function App() {
  const { isAuthenticated, user, logout, loading } = useAuth();

  const [backendFoods, setBackendFoods] = useState([]);
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");

  const visibleFoods = useMemo(
      () => (backendFoods.length ? backendFoods : foodItems),
      [backendFoods]
  );

  // ------------------ LOAD DATA ------------------

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      try {
        const restaurants = await api.restaurant.getAll();

        const menus = await Promise.all(
            restaurants.map(async (restaurant) => {
              const menu = await api.restaurant.getMenu(restaurant.id);

              return menu.map((food) => ({
                id: food.id,
                name: food.name,
                restaurant: restaurant.name,
                price: `₹${Number(food.price).toFixed(0)}`,
                offer: "Special",
                image: "https://via.placeholder.com/300",
                backendFood: food,
              }));
            })
        );

        setBackendFoods(menus.flat());
      } catch {
        setStatusMessage("Using demo food items.");
      }

      try {
        const [c, o, s] = await Promise.all([
          api.cart.getCart(),
          api.order.getOrders(),
          api.subscription.getAll(),
        ]);

        setCart(c);
        setOrders(o);
        setSubscriptions(s);
      } catch {
        setStatusMessage("Backend not fully connected.");
      }
    };

    loadData();
  }, [isAuthenticated]);

  // ------------------ ACTIONS ------------------

  const addFoodToCart = async (item) => {
    try {
      const nextCart = await api.cart.addItem({
        foodId: item.id,
        foodName: item.name,
        quantity: 1,
        unitPrice: Number(item.price.replace(/[^\d]/g, "")),
      });

      setCart(nextCart);
    } catch {
      setStatusMessage("Add to cart failed");
    }
  };

  const placeOrder = async () => {
    try {
      const order = await api.order.placeOrder(1);
      setOrders((prev) => [order, ...prev]);
      setCart(await api.cart.getCart());
    } catch {
      setStatusMessage("Order failed");
    }
  };

  // ✅ Subscribe Action
  const subscribePlan = async (plan) => {
    try {
      const res = await api.subscription.subscribe({
        planId: plan.id,
        name: plan.name,
      });

      setSubscriptions((prev) => [...prev, res]);
      setStatusMessage("Subscribed successfully!");
    } catch {
      setStatusMessage("Subscription failed");
    }
  };

  // ------------------ UI STATES ------------------

  if (loading) return <p>Loading...</p>;

  if (!isAuthenticated) return <Login />;

  // ------------------ UI ------------------

  return (
      <main style={{ padding: "20px" }}>
        <header style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>FoodBox Home</h1>
          <button onClick={logout}>Logout</button>
        </header>

        <h2>Welcome {user?.email}</h2>

        {statusMessage && <p>{statusMessage}</p>}

        {/* 🍱 FOOD ORDER SECTION */}
        <section>
          <h2>🍱 Food Orders</h2>

          <h3>Cart Items: {cart?.items?.length || 0}</h3>
          <button onClick={placeOrder}>Place Order</button>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {visibleFoods.map((item) => (
                <div
                    key={item.id}
                    style={{
                      border: "1px solid #ccc",
                      padding: "10px",
                      width: "200px",
                    }}
                >
                  <img src={item.image} alt={item.name} width="150" />
                  <h4>{item.name}</h4>
                  <p>{item.price}</p>
                  <p>{item.offer}</p>

                  <button onClick={() => addFoodToCart(item)}>
                    Add to Cart
                  </button>
                </div>
            ))}
          </div>
        </section>

        {/* 📦 SUBSCRIPTION SECTION */}
        <section style={{ marginTop: "40px" }}>
          <h2>📦 Subscription Plans</h2>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {subscriptionPlans.map((plan) => (
                <div
                    key={plan.id}
                    style={{
                      border: "1px solid #aaa",
                      padding: "10px",
                      width: "200px",
                    }}
                >
                  <h4>{plan.name}</h4>
                  <p>{plan.price}</p>

                  <button onClick={() => subscribePlan(plan)}>
                    Subscribe
                  </button>
                </div>
            ))}
          </div>
        </section>
      </main>
  );
}

export default App;