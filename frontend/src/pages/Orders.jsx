import { useEffect, useState } from "react";
import { api } from "../api";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.order.getOrders().then(setOrders);
  }, []);

  return (
    <div>
      <h2>Orders</h2>

      {orders.map((o) => (
        <div key={o.id} className="card">
          <p>Order ID: {o.id}</p>
          <p>Status: {o.status}</p>
        </div>
      ))}
    </div>
  );
}

export default Orders;