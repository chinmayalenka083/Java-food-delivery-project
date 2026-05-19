import { useCart } from "../context/useCart";

function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    totalAmount,
  } = useCart();

  return (
    <div>
      <h2>Cart</h2>

      {cartItems.map((item) => (
        <div key={item.id} className="cart-row">
          <span>{item.name}</span>

          <div>
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
              -
            </button>

            {item.quantity}

            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
              +
            </button>
          </div>

          <span>₹{item.price * item.quantity}</span>

          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}

      <h3>Total: ₹{totalAmount}</h3>
    </div>
  );
}

export default Cart;
