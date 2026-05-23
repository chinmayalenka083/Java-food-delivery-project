import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { useAuth } from "./context/useAuth";

const categories = [
  { name: "Pizza", emoji: "🍕", gradient: "sunset" },
  { name: "Biryani", emoji: "🥘", gradient: "spice" },
  { name: "Burger", emoji: "🍔", gradient: "fresh" },
  { name: "Healthy", emoji: "🥗", gradient: "green" },
  { name: "Desserts", emoji: "🍰", gradient: "berry" },
  { name: "Coffee", emoji: "☕", gradient: "coffee" },
];

const restaurants = [
  {
    id: 1,
    name: "Bombay Spice Lab",
    cuisine: "North Indian, Biryani",
    rating: 4.7,
    deliveryTime: "25-30 min",
    priceForTwo: 450,
    type: "Non-Veg",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Green Bowl Co.",
    cuisine: "Healthy, Salads",
    rating: 4.6,
    deliveryTime: "20-25 min",
    priceForTwo: 520,
    type: "Veg",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Crust & Cheese",
    cuisine: "Pizza, Italian",
    rating: 4.5,
    deliveryTime: "30-35 min",
    priceForTwo: 650,
    type: "Veg",
    featured: true,
    image:
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Burger District",
    cuisine: "Burgers, Fast Food",
    rating: 4.2,
    deliveryTime: "18-22 min",
    priceForTwo: 380,
    type: "Non-Veg",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Tandoor House",
    cuisine: "Mughlai, Kebabs",
    rating: 4.4,
    deliveryTime: "32-38 min",
    priceForTwo: 720,
    type: "Non-Veg",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Pure Veg Thali",
    cuisine: "Thali, Home Style",
    rating: 4.3,
    deliveryTime: "24-28 min",
    priceForTwo: 340,
    type: "Veg",
    featured: false,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80",
  },
];

const restaurantImages = restaurants.map((restaurant) => restaurant.image);

const plans = [
  {
    id: "basic",
    name: "Basic Plan",
    meals: "10 meals/month",
    price: 1499,
    features: ["Free delivery", "5% dining discounts", "Flexible lunch slots"],
  },
  {
    id: "standard",
    name: "Standard Plan",
    meals: "20 meals/month",
    price: 2799,
    popular: true,
    features: ["Free delivery", "Priority support", "12% discounts", "Pause anytime"],
  },
  {
    id: "premium",
    name: "Premium Plan",
    meals: "60 meals/month",
    price: 6499,
    features: ["Unlimited delivery", "Premium support", "20% discounts", "Weekend treats"],
  },
];

const timeSlots = ["8:00 AM - 9:30 AM", "12:00 PM - 1:30 PM", "7:00 PM - 8:30 PM"];
const preferences = ["Veg", "Non-Veg", "Healthy"];

function App() {
  const { isAuthenticated, user, login, register, logout, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ rating: false, price: "All", type: "All" });
  const [restaurantData, setRestaurantData] = useState(restaurants);
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [authDialog, setAuthDialog] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [backendMode, setBackendMode] = useState("demo");
  const [mealConfig, setMealConfig] = useState({
    mealsPerDay: 2,
    preference: "Veg",
    slot: timeSlots[1],
  });

  const monthlyPrice = useMemo(() => {
    const preferenceFee = mealConfig.preference === "Healthy" ? 35 : mealConfig.preference === "Non-Veg" ? 25 : 0;
    return (mealConfig.mealsPerDay * (129 + preferenceFee) * 30).toLocaleString("en-IN");
  }, [mealConfig]);

  useEffect(() => {
    let ignore = false;

    async function loadRestaurants() {
      try {
        const backendRestaurants = await api.restaurant.getAll();
        const restaurantsWithMenu = await Promise.all(
          backendRestaurants.map(async (restaurant, index) => {
            let menu = [];
            try {
              menu = await api.restaurant.getMenu(restaurant.id);
            } catch {
              menu = [];
            }

            return normalizeRestaurant(restaurant, index, menu);
          })
        );

        if (!ignore && restaurantsWithMenu.length) {
          setRestaurantData(restaurantsWithMenu);
          setBackendMode("connected");
        }
      } catch {
        if (!ignore) {
          setRestaurantData(restaurants);
          setBackendMode("demo");
        }
      }
    }

    loadRestaurants();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setCart(null);
      setOrders([]);
      setSubscriptions([]);
      return;
    }

    let ignore = false;

    async function loadAccountData() {
      try {
        const [cartResponse, orderResponse, subscriptionResponse] = await Promise.all([
          api.cart.getCart().catch(() => null),
          api.order.getOrders().catch(() => []),
          api.subscription.getAll().catch(() => []),
        ]);

        if (!ignore) {
          setCart(cartResponse);
          setOrders(orderResponse || []);
          setSubscriptions(subscriptionResponse || []);
        }
      } catch {
        if (!ignore) {
          setStatusMessage("Signed in, but some account services are unavailable.");
        }
      }
    }

    loadAccountData();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  const filteredRestaurants = useMemo(() => {
    return restaurantData
      .filter((restaurant) => {
        const matchesSearch = `${restaurant.name} ${restaurant.cuisine}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesRating = !filters.rating || restaurant.rating >= 4.5;
        const matchesType = filters.type === "All" || restaurant.type === filters.type;
        const matchesPrice =
          filters.price === "All" ||
          (filters.price === "Under 500" && restaurant.priceForTwo < 500) ||
          (filters.price === "500+" && restaurant.priceForTwo >= 500);

        return matchesSearch && matchesRating && matchesType && matchesPrice;
      })
      .sort((a, b) => b.rating - a.rating);
  }, [filters, restaurantData, search]);

  const cartCount = cart?.items?.reduce((total, item) => total + Number(item.quantity || 0), 0) || 0;

  const handleAddToCart = async (restaurant) => {
    if (!isAuthenticated) {
      setAuthDialog("login");
      setStatusMessage("Login first to add meals to your cart.");
      return;
    }

    const item = restaurant.menu?.[0];
    if (!item?.id) {
      setStatusMessage("This restaurant has no backend menu item yet.");
      return;
    }

    try {
      const nextCart = await api.cart.addItem({
        foodId: item.id,
        foodName: item.name,
        quantity: 1,
        unitPrice: Number(item.price || restaurant.priceForTwo / 2),
      });

      setCart(nextCart);
      setStatusMessage(`${item.name} added to cart.`);
    } catch (error) {
      setStatusMessage(error.message || "Could not add item to cart.");
    }
  };

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      setAuthDialog("signup");
      setStatusMessage("Create an account or login to subscribe.");
      return;
    }

    try {
      const subscription = await api.subscription.subscribe({
        packageId: plan.id,
        packageName: plan.name,
        monthlyPrice: plan.price,
        includedItems: plan.features,
      });

      setSubscriptions((current) => [subscription, ...current]);
      setStatusMessage(`${plan.name} subscription created.`);
    } catch (error) {
      setStatusMessage(error.message || "Subscription failed.");
    }
  };

  const handleAuthSubmit = async (mode, form) => {
    if (mode === "signup") {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
    } else {
      await login({
        email: form.email.trim(),
        password: form.password,
      });
    }

    setAuthDialog(null);
    setStatusMessage(mode === "signup" ? "Account created and connected." : "Logged in successfully.");
  };

  return (
    <div className="app-shell">
      <Navbar
        cartCount={cartCount}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogin={() => setAuthDialog("login")}
        onSignup={() => setAuthDialog("signup")}
        onLogout={logout}
      />

      <main>
        <section id="home" className="hero-section">
          <div className="hero-copy reveal">
            <span className="eyebrow">Fresh food in minutes</span>
            <h1>Order crave-worthy meals from top kitchens near you.</h1>
            <p>
              Discover restaurants, monthly meal packs, and free trial plans
              built for busy weekdays and relaxed weekends.
            </p>

            <label className="search-bar">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search restaurants, biryani, pizza, healthy bowls..."
              />
            </label>

            <div className="hero-actions">
              <a className="primary-action" href="#restaurants">Find food</a>
              <a className="secondary-action" href="#subscription">View plans</a>
            </div>

            <div className={backendMode === "connected" ? "connection-pill live" : "connection-pill"}>
              <span />
              {backendMode === "connected" ? "Backend connected through API Gateway" : "Demo data active until backend is running"}
            </div>
          </div>

          <div className="hero-visual reveal delay-one" aria-label="Food delivery highlights">
            <img
              src="https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=80"
              alt="Assorted restaurant dishes"
            />
            <div className="floating-card delivery-card">
              <strong>22 min</strong>
              <span>Average delivery</span>
            </div>
            <div className="floating-card rating-card">
              <strong>4.8 ★</strong>
              <span>Top rated meals</span>
            </div>
          </div>
        </section>

        <section className="section-wrap">
          <SectionHeader
            eyebrow="Explore"
            title="Popular categories"
            text="Quick picks for every craving, mood, and meal time."
          />
          <div className="category-grid">
            {categories.map((category) => (
              <button className={`category-card ${category.gradient}`} key={category.name}>
                <span>{category.emoji}</span>
                <strong>{category.name}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="section-wrap">
          <SectionHeader
            eyebrow="Featured"
            title="Restaurants people reorder from"
            text="High ratings, fast delivery, and reliable food quality."
          />
          <div className="restaurant-grid">
            {restaurantData.filter((restaurant) => restaurant.featured).map((restaurant) => (
              <RestaurantCard
                restaurant={restaurant}
                key={restaurant.id}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>

        <section id="subscription" className="subscription-section">
          <SectionHeader
            eyebrow="Subscriptions"
            title="Food Subscription Plans"
            text="Monthly plans with predictable pricing and fewer checkout steps."
          />
          <div className="plan-grid">
            {plans.map((plan) => (
              <PlanCard plan={plan} key={plan.name} onSubscribe={handleSubscribe} />
            ))}
          </div>
        </section>

        <section className="trial-banner">
          <div>
            <span className="eyebrow">No commitment</span>
            <h2>Try 3 Days Free Trial</h2>
            <p>Enjoy free delivery, curated meals, and plan upgrades before paying.</p>
          </div>
          <a className="primary-action dark" href="#meal-options">Start Free Trial</a>
        </section>

        <section id="meal-options" className="meal-builder section-wrap">
          <SectionHeader
            eyebrow="Customize"
            title="Monthly Meal Option"
            text="Tune your package by meals per day, food preference, and delivery slot."
          />

          <div className="builder-layout">
            <div className="control-panel">
              <ControlGroup label="Meals per day">
                {[1, 2, 3].map((mealCount) => (
                  <button
                    className={mealConfig.mealsPerDay === mealCount ? "chip active" : "chip"}
                    key={mealCount}
                    onClick={() => setMealConfig((current) => ({ ...current, mealsPerDay: mealCount }))}
                  >
                    {mealCount}
                  </button>
                ))}
              </ControlGroup>

              <ControlGroup label="Food preference">
                {preferences.map((preference) => (
                  <button
                    className={mealConfig.preference === preference ? "chip active" : "chip"}
                    key={preference}
                    onClick={() => setMealConfig((current) => ({ ...current, preference }))}
                  >
                    {preference}
                  </button>
                ))}
              </ControlGroup>

              <ControlGroup label="Delivery time slot">
                {timeSlots.map((slot) => (
                  <button
                    className={mealConfig.slot === slot ? "slot active" : "slot"}
                    key={slot}
                    onClick={() => setMealConfig((current) => ({ ...current, slot }))}
                  >
                    {slot}
                  </button>
                ))}
              </ControlGroup>
            </div>

            <aside className="price-panel">
              <span className="eyebrow">Estimated monthly price</span>
              <strong>₹{monthlyPrice}</strong>
              <p>{mealConfig.mealsPerDay} meal(s) per day • {mealConfig.preference} • {mealConfig.slot}</p>
              <button onClick={() => handleSubscribe({
                id: `custom-${mealConfig.mealsPerDay}-${mealConfig.preference.toLowerCase()}`,
                name: `${mealConfig.preference} Custom Meal Plan`,
                price: Number(monthlyPrice.replace(/,/g, "")),
                features: [
                  `${mealConfig.mealsPerDay} meal(s) per day`,
                  mealConfig.preference,
                  mealConfig.slot,
                ],
              })}>
                Subscribe Now
              </button>
            </aside>
          </div>
        </section>

        {statusMessage && (
          <div className="status-toast" role="status">
            {statusMessage}
            <button onClick={() => setStatusMessage("")}>Close</button>
          </div>
        )}

        <section id="restaurants" className="section-wrap">
          <SectionHeader
            eyebrow="All restaurants"
            title="Restaurant Listing"
            text="Filter by rating, price, and dietary preference."
          />

          <div className="filter-bar">
            <button
              className={filters.rating ? "filter active" : "filter"}
              onClick={() => setFilters((current) => ({ ...current, rating: !current.rating }))}
            >
              Rating 4.5+
            </button>
            {["All", "Under 500", "500+"].map((price) => (
              <button
                className={filters.price === price ? "filter active" : "filter"}
                key={price}
                onClick={() => setFilters((current) => ({ ...current, price }))}
              >
                {price}
              </button>
            ))}
            {["All", "Veg", "Non-Veg"].map((type) => (
              <button
                className={filters.type === type ? "filter active" : "filter"}
                key={type}
                onClick={() => setFilters((current) => ({ ...current, type }))}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="restaurant-grid">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                restaurant={restaurant}
                key={restaurant.id}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>

        {isAuthenticated && (
          <section id="orders" className="account-strip section-wrap">
            <div>
              <span className="eyebrow">Account</span>
              <h2>Backend account summary</h2>
            </div>
            <div className="account-grid">
              <AccountMetric label="Cart items" value={cartCount} />
              <AccountMetric label="Orders" value={orders.length} />
              <AccountMetric label="Subscriptions" value={subscriptions.length} />
            </div>
          </section>
        )}
      </main>

      <Footer />

      {authDialog && (
        <AuthDialog
          initialMode={authDialog}
          loading={authLoading}
          onClose={() => setAuthDialog(null)}
          onSubmit={handleAuthSubmit}
        />
      )}
    </div>
  );
}

function normalizeRestaurant(restaurant, index, menu) {
  const fallback = restaurants[index % restaurants.length];
  const firstMenuPrice = Number(menu?.[0]?.price || fallback.priceForTwo / 2);

  return {
    id: restaurant.id,
    name: restaurant.name || fallback.name,
    cuisine: restaurant.cuisine || fallback.cuisine,
    rating: Number(restaurant.rating || fallback.rating),
    deliveryTime: fallback.deliveryTime,
    priceForTwo: Math.max(300, Math.round(firstMenuPrice * 2)),
    type: menu?.some((item) => item.veg === false) ? "Non-Veg" : "Veg",
    featured: index < 3,
    image: restaurant.image || restaurantImages[index % restaurantImages.length],
    menu,
  };
}

function Navbar({ cartCount, isAuthenticated, user, onLogin, onSignup, onLogout }) {
  return (
    <header className="site-header">
      <a className="logo" href="#home" aria-label="Foodly home">
        <span>F</span>
        Foodly
      </a>
      <nav>
        <a href="#home">Home</a>
        <a href="#subscription">Subscription</a>
        <a href="#orders">Orders</a>
        <a href="#restaurants">Restaurants</a>
      </nav>
      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            <span className="user-pill">{user?.email || user?.name || "Signed in"}</span>
            <button className="ghost-button" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className="ghost-button" onClick={onLogin}>Login</button>
            <button className="ghost-button solid" onClick={onSignup}>Signup</button>
          </>
        )}
        <button className="cart-button" aria-label="Cart">🛒 {cartCount}</button>
      </div>
    </header>
  );
}

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="section-heading reveal">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function RestaurantCard({ restaurant, onAddToCart }) {
  return (
    <article className="restaurant-card reveal">
      <img src={restaurant.image} alt={restaurant.name} />
      <div className="restaurant-body">
        <div>
          <h3>{restaurant.name}</h3>
          <p>{restaurant.cuisine}</p>
        </div>
        <div className="restaurant-meta">
          <span className="rating">{restaurant.rating} ★</span>
          <span>{restaurant.deliveryTime}</span>
          <span>₹{restaurant.priceForTwo} for two</span>
        </div>
        <button className="card-action" onClick={() => onAddToCart(restaurant)}>
          Add best seller
        </button>
      </div>
    </article>
  );
}

function PlanCard({ plan, onSubscribe }) {
  return (
    <article className={plan.popular ? "plan-card popular reveal" : "plan-card reveal"}>
      {plan.popular && <span className="popular-badge">Most Popular</span>}
      <h3>{plan.name}</h3>
      <p>{plan.meals}</p>
      <strong>₹{plan.price.toLocaleString("en-IN")}</strong>
      <ul>
        {plan.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <button onClick={() => onSubscribe(plan)}>Subscribe Now</button>
    </article>
  );
}

function AccountMetric({ label, value }) {
  return (
    <div className="account-metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function AuthDialog({ initialMode, loading, onClose, onSubmit }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const isSignup = mode === "signup";

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (isSignup && !form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!form.email.trim() || !form.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      await onSubmit(mode, form);
    } catch (err) {
      setError(err.message || "Authentication failed.");
    }
  };

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true">
      <form className="auth-card" onSubmit={submit}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
        <span className="eyebrow">OAuth / JWT Gateway</span>
        <h2>{isSignup ? "Create account" : "Login"}</h2>
        <p>
          {isSignup
            ? "Register through the auth-user backend and receive a gateway JWT."
            : "Sign in to connect cart, orders, subscriptions, and profile services."}
        </p>

        {isSignup && (
          <label>
            <span>Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Your name"
            />
          </label>
        )}

        <label>
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Enter password"
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button className="primary-form-button" disabled={loading}>
          {loading ? "Connecting..." : isSignup ? "Signup" : "Login"}
        </button>

        <button
          className="link-button"
          type="button"
          onClick={() => {
            setError("");
            setMode(isSignup ? "login" : "signup");
          }}
        >
          {isSignup ? "Already have an account? Login" : "New user? Signup"}
        </button>
      </form>
    </div>
  );
}

function ControlGroup({ label, children }) {
  return (
    <div className="control-group">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <a className="logo" href="#home">
          <span>F</span>
          Foodly
        </a>
        <p>Fast restaurant discovery, flexible meals, and monthly food plans.</p>
      </div>
      <div className="footer-links">
        <a href="#home">About</a>
        <a href="#home">Contact</a>
        <a href="#home">Careers</a>
      </div>
      <div className="social-links">
        <a href="#home" aria-label="Instagram">◎</a>
        <a href="#home" aria-label="Facebook">f</a>
        <a href="#home" aria-label="X">x</a>
      </div>
    </footer>
  );
}

export default App;
