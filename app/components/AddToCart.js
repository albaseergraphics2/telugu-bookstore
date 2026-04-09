"use client";

import { useState, useEffect } from "react";

export default function AddToCart({ book }) {
  const [qty, setQty] = useState(0);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const item = cart.find(item => item.slug === book.slug);
    if (item) setQty(item.qty);
  }, [book.slug]);

  const updateCart = (newQty) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const index = cart.findIndex(item => item.slug === book.slug);

    if (index !== -1) {
      if (newQty === 0) {
        cart.splice(index, 1);
      } else {
        cart[index].qty = newQty;
      }
    } else {
      cart.push({ ...book, qty: 1 });
      newQty = 1;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setQty(newQty);

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const addFirst = () => updateCart(1);
  const increase = () => updateCart(qty + 1);
  const decrease = () => (qty > 1 ? updateCart(qty - 1) : updateCart(0));

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