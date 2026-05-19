import { useEffect, useState } from "react";
import { api } from "../api";
import { useCart } from "../context/useCart";

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    api.restaurant.getAll().then(setRestaurants);
  }, []);

  return (
    <div>
      <h2>Restaurants</h2>

      <div className="restaurants">
        {restaurants.map((r) => (
          <div className="card restaurant-card" key={r.id}>
            <img
              className="restaurant-img"
              src={r.image || "https://via.placeholder.com/300"}
            />
            <h3>{r.name}</h3>

            {r.menu?.map((item) => (
              <div key={item.id} className="menu-row">
                <span>{item.name}</span>
                <span>₹{item.price}</span>
                <button onClick={() => addToCart({ ...item, quantity: 1 })}>
                  Add
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
