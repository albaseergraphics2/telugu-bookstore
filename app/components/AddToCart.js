"use client";

import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  removeFromCart,
} from "@/redux/actions/cartActions";

export default function AddToCart({ book }) {
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);

  const item = cartItems.find((i) => i.slug === book.slug);
  const qty = item ? item.qty : 0;

  const addFirst = () => {
    dispatch(addToCart(book, 1));
  };

  const increase = () => {
    dispatch(addToCart(book, qty + 1));
  };

  const decrease = () => {
    if (qty === 1) {
      dispatch(removeFromCart(book.slug));
    } else {
      dispatch(addToCart(book, qty - 1));
    }
  };

  if (qty === 0) {
    return (
      <button className="cart-btn" onClick={addFirst}>
        Add to Cart
      </button>
    );
  }

  return (
    <div className="qty-control">
      <button onClick={decrease}>-</button>
      <span>{qty}</span>
      <button onClick={increase}>+</button>
    </div>
  );
}