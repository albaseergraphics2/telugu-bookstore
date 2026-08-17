"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, clearCart, } from "@/redux/actions/cartActions";
import Link from "next/link";
import { RiDeleteBin6Line } from "react-icons/ri";

export default function CartPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [pincode, setPincode] = useState("");
  const [area, setArea] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
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
  }, [user]);

  const removeItem = (slug) => {
    dispatch(removeFromCart(slug));
  };

  const increaseQty = (slug) => {
    const item = cartItems.find((i) => i.slug === slug);
    if (!item) return;

    dispatch(addToCart(item, item.qty + 1));
  };

  const decreaseQty = (slug) => {
    const item = cartItems.find((i) => i.slug === slug);
    if (!item) return;

    if (item.qty > 1) {
      dispatch(addToCart(item, item.qty - 1));
    }
  };

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price?.replace("₹", "") || 0);
      return total + (price * item.qty);
    }, 0);
  }, [cartItems]);

  const totalBooks = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.qty, 0);
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

I want to order these books:

${orderList}

Total Amount: ₹${totalPrice}

Customer Details:
Name: ${name}
Phone: ${phone}
Address: ${address}`;

      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      window.open(whatsappURL, "_blank");

      dispatch(clearCart());
      setTimeout(() => {
        router.push("/orders");
      }, 500);
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
      <Link href="/books" className="back-home">← View All Books</Link>
      <h1 className="cart-title">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <Link href="/books" className="shop-btn">
            View Books
          </Link>
        </div>
      ) : (
        <div className="cart-container">
          <div className="cart-header">
            <div>BOOKS</div>
            <div>QUANTITY</div>
            <div>TOTAL</div>
          </div>
          {cartItems.map((item) => {
            const price = Number(item.price?.replace("₹", "") || 0);
            const subTotal = price * item.qty;

            return (
              <div className="cart-item" key={item.slug}>
                {/* Product */}
                <div className="cart-product">
                  <img
                    src={
                      item.img
                        ? item.img.replace("/upload/", "/upload/f_auto,q_auto,w_150/")
                        : "/images/No_Image_Available.jpg"
                    }
                    alt={item.title}
                  />

                  <div className="cart-info">
                    <h3>{item.title}</h3>
                    <p>₹{item.price}</p>

                    <div className="mobile-cart-actions">
                      <div className="cart-quantity">
                        <div className="qty-box">
                          <button onClick={() => decreaseQty(item.slug)}>-</button>
                          <span>{item.qty}</span>
                          <button onClick={() => increaseQty(item.slug)}>+</button>
                        </div>

                        <button
                          className="remove-icon-btn"
                          onClick={() => removeItem(item.slug)}
                        >
                          <RiDeleteBin6Line />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div className="desktop-cart-actions">
                  <div className="cart-quantity">
                    <div className="qty-box">
                      <button onClick={() => decreaseQty(item.slug)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => increaseQty(item.slug)}>+</button>
                    </div>

                    <button
                      className="remove-icon-btn"
                      onClick={() => removeItem(item.slug)}
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="cart-total">
                  ₹{subTotal}
                </div>
              </div>
            );
          })}

          <div className="cart-summary">
            <h2 className="summary-title">Order Summary</h2>
            {totalPrice < 1000 && (
              <>
                <hr className="summary-divider" />
                <div className="summary-note">
                  <p>Free shipping on orders above ₹1000.</p>
                </div>

                <hr className="summary-divider" />
              </>
            )}

            <div className="summary-box">
              <div className="summary-row">
                <span>Total Books</span>
                <strong>{totalBooks}</strong>
              </div>

              <div className="summary-row">
                <span>Total Amount</span>
                <strong>₹{totalPrice}</strong>
              </div>

            </div>

            <Link href="/checkout" className="checkout-btn">
              Checkout
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}