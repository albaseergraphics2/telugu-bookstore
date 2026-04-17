"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pincode, setPincode] = useState("");
  const [area, setArea] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(savedCart);
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      if (user.address && typeof user.address === "object") {
        setAddress(user.address.full || "");
        setPincode(user.address.pincode || "");
        setArea(user.address.area || "");
        setDistrict(user.address.district || "");
        setStateName(user.address.state || "");
      } else {
        setAddress(user.address || "");
      }
    }
  }, []);

  const updateStorage = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (slug) => {
    const updatedCart = cartItems.filter(item => item.slug !== slug);
    updateStorage(updatedCart);
  };

  const increaseQty = (slug) => {
    const updatedCart = cartItems.map(item =>
      item.slug === slug ? { ...item, qty: item.qty + 1 } : item
    );
    updateStorage(updatedCart);
  };

  const decreaseQty = (slug) => {
    const updatedCart = cartItems.map(item =>
      item.slug === slug
        ? { ...item, qty: item.qty > 1 ? item.qty - 1 : 1 }
        : item
    );
    updateStorage(updatedCart);
  };

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price?.replace("₹", "") || 0);
      return total + (price * item.qty);
    }, 0);
  }, [cartItems]);

  const getAddressFromPincode = async (pin) => {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0].Status === "Success") {
        const post = data[0].PostOffice[0];
        setArea(post.Name);
        setDistrict(post.District);
        setStateName(post.State);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const placeOrder = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first");
      return;
    }

    if (!name || !phone || !address) {
      alert("Fill all details");
      return;
    }

    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    const whatsappNumber = "919441055065";

    const orderList = cartItems.map(item => {
      const price = Number(item.price?.replace("₹", "") || 0);
      return `${item.title} (Qty: ${item.qty}) - ₹${price * item.qty}`;
    }).join("\n");

    const orderData = {
      userId: user._id,
      name,
      phone,
      address: {
        full: address,
        pincode,
        area,
        district,
        state: stateName,
      },
      items: cartItems.map(item => ({
        bookId: item._id || item.slug,
        qty: item.qty
      })),
      totalAmount: totalPrice,
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (data.success) {
      const invoiceId = data.order.invoiceId;

      const message =
        `Assalamu Alaikum
Order ID: ${invoiceId}

I want to order these books:

${orderList}

Total Amount: ₹${totalPrice}

Customer Details:
Name: ${name}
Phone: ${phone}
Address: ${address}`;

      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      window.open(whatsappURL, "_blank");

      localStorage.removeItem("cart");
      setCartItems([]);
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      alert("Something went wrong");
    }
  };

  useEffect(() => {
    if (pincode.length === 6) {
      const timer = setTimeout(() => {
        getAddressFromPincode(pincode);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [pincode]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <div className="loader"></div>
        <p>Loading Cart...</p>
      </div>
    );
  }

  return (
    <section className="cart-page">
      <Link href="/" className="back-home">← Back to Home</Link>
      <h1 className="cart-title">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <Link href="/orders" className="shop-btn">View My Orders</Link>
        </div>
      ) : (
        <div className="cart-container">

          {cartItems.map((item) => {
            const price = Number(item.price?.replace("₹", "") || 0);
            const subTotal = price * item.qty;

            return (
              <div className="cart-item" key={item.slug}>
                <img
                  src={
                    item.img
                      ? item.img.replace("/upload/", "/upload/f_auto,q_auto,w_150/")
                      : "/no-image.png"
                  }
                  alt={item.title}
                />

                <div className="cart-info">
                  <h3>{item.title}</h3>
                  <p>{item.author}</p>
                  <p>Price: {item.price}</p>
                  <p>Subtotal: ₹{subTotal}</p>

                  <div className="qty-box">
                    <button onClick={() => decreaseQty(item.slug)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => increaseQty(item.slug)}>+</button>
                  </div>

                  <button className="remove-btn" onClick={() => removeItem(item.slug)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          <div className="cart-summary">
            <h2>Total: ₹{totalPrice}</h2>

            <div className="user-details">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              {/* ✅ FIXED */}
              <textarea
                placeholder="Enter your address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter pincode"
              />

              <button
                type="button"
                className="checkout-btn"
                onClick={() => setShowConfirmPopup(true)}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmPopup && (
        <div
          className="order-popup-overlay"
          onClick={() => setShowConfirmPopup(false)}
        >
          <div
            className="order-popup-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Confirm Order</h3>
            <p>Are you sure you want to place this order?</p>
            <h4>Total: ₹{totalPrice}</h4>

            <div className="order-popup-actions">
              <button
                className="order-popup-confirm"
                onClick={() => {
                  setShowConfirmPopup(false);
                  placeOrder();
                }}
              >
                Yes, Place Order
              </button>

              <button
                className="order-popup-cancel"
                onClick={() => setShowConfirmPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}