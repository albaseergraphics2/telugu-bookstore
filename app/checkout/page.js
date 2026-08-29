"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "@/redux/actions/cartActions";
import Link from "next/link";
import toast from "react-hot-toast";
import useRealtime from "../hooks/useRealtime";

export default function CheckoutPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [pincode, setPincode] = useState("");
    const [area, setArea] = useState("");
    const [district, setDistrict] = useState("");
    const [stateName, setStateName] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [utrNumber, setUtrNumber] = useState("");
    const [loading, setLoading] = useState(true);
    const [showShippingInfo, setShowShippingInfo] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [defaultShipping, setDefaultShipping] = useState(0);
    const [freeShippingAmount, setFreeShippingAmount] = useState(1000);
    const [paymentSettings, setPaymentSettings] = useState({
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        ifscCode: "",
        branch: "",
        qrCode: "",
        upiAccounts: [],
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 200);

        return () => clearTimeout(timer);
    }, []);


    const handleCheckout = async () => {
        if (placingOrder) return;

        setPlacingOrder(true);

        try {
            if (!user) {
                toast.error("Please login to continue");
                return;
            }
            if (!paymentMethod) {
                toast.error("Please select a payment method");
                return;
            }
            if (paymentMethod === "online") {
                router.push("/payment");
                return;
            }
            if (paymentMethod === "bank") {
                if (!utrNumber.trim()) {
                    toast.error("Please enter UTR / Transaction ID");
                    return;
                }
                await placeOrder();
                return;
            }
            if (paymentMethod === "cod") {
                await placeOrder();
            }
        } finally {
            setPlacingOrder(false);
        }
    };

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

    const totalPrice = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const price = Number(item.price?.replace("₹", "") || 0);
            return total + price * item.qty;
        }, 0);
    }, [cartItems]);

    const totalBooks = useMemo(() => {
        return cartItems.reduce((total, item) => total + item.qty, 0);
    }, [cartItems]);

    const shippingCharge =
        freeShippingAmount > 0 && totalPrice >= freeShippingAmount
            ? 0
            : defaultShipping > 0
                ? defaultShipping
                : 0;

    const grandTotal = totalPrice + shippingCharge;

    const getAddressFromPincode = async (pin) => {
        try {
            const res = await fetch(
                `https://api.postalpincode.in/pincode/${pin}`
            );

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

    useEffect(() => {
        if (pincode.length === 6) {
            const timer = setTimeout(() => {
                getAddressFromPincode(pincode);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [pincode]);


    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings", {
                cache: "no-store",
            });

            const data = await res.json();

            if (data.success) {
                setDefaultShipping(Number(data.setting.defaultShipping || 0));
                setFreeShippingAmount(
                    Number(data.setting.freeShippingAmount || 0)
                );
                setPaymentSettings(data.setting);
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
        }
    };

    useRealtime(fetchSettings);

    const placeOrder = async () => {
        if (!user) {
            toast.error("Please login first");
            return;
        }
        if (!name || !phone || !address) {
            toast.error("Please fill all delivery details");
            return;
        }
        if (cartItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

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
            paymentMethod,
            utrNumber,
            items: cartItems.map((item) => ({
                bookId: item._id || item.slug,
                qty: item.qty,
            })),
            totalAmount: totalPrice,
            deliveryCharge: shippingCharge,
        };

        const res = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        const data = await res.json();

        if (data.success) {
            toast.success("Order placed successfully!");
            dispatch(clearCart());
            setTimeout(() => {
                router.push("/orders");
            }, 800);
        } else {
            toast.error(data.message || "Something went wrong");
        }
    };
    const buttonText = {
        online: "Proceed to Payment",
        bank: "Submit Payment Details",
        cod: "Place Order",
    }[paymentMethod] || "Select Payment Method";

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: "100px" }}>
                <div className="loader"></div>
                <p>Loading Checkout...</p>
            </div>
        );
    }

    return (
        <section className="checkout-page">
            <Link href="/cart" className="back-home">
                ← Back to Cart
            </Link>

            <h1 className="checkout-title">Checkout</h1>

            <div className="checkout-card">
                <h2>Order Summary</h2>
                <hr />
                <div className="summary-single-row">
                    <span><strong>Books</strong> {totalBooks}</span>
                    <span>Rs. {totalPrice}</span>
                </div>
                <div className="summary-single-row">
                    <span className="shipping-label">
                        <strong>Shipping</strong>

                        <button
                            type="button"
                            className="shipping-info-btn"
                            onClick={() => setShowShippingInfo(!showShippingInfo)}
                        >
                            ?
                        </button>

                        {showShippingInfo && (
                            <div className="shipping-tooltip">
                                Free shipping on orders above Rs. {freeShippingAmount}
                            </div>
                        )}
                    </span>

                    <span>
                        {shippingCharge === 0
                            ? "Free"
                            : defaultShipping > 0
                                ? `Rs. ${defaultShipping}`
                                : "To Be Confirmed"}
                    </span>
                </div>

                <hr />

                <div className="summary-single-row">
                    <span><strong>Total</strong></span>
                    <span><strong>Rs. {grandTotal}</strong></span>
                </div>
            </div>

            <div className="checkout-card">
                <h2>Delivery Address</h2>

                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <textarea
                    placeholder="Full Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                />

                {area && (
                    <input
                        type="text"
                        value={area}
                        readOnly
                        placeholder="Area"
                    />
                )}

                {district && (
                    <input
                        type="text"
                        value={district}
                        readOnly
                        placeholder="District"
                    />
                )}

                {stateName && (
                    <input
                        type="text"
                        value={stateName}
                        readOnly
                        placeholder="State"
                    />
                )}
            </div>

            <div className="checkout-card">
                <h2>Payment</h2>

                <div className="payment-option">
                    <label>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="online"
                            checked={paymentMethod === "online"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            disabled
                        />
                        Online Payment
                    </label>

                    <p className="payment-text">
                        Pay securely using UPI, Credit/Debit Card or Net Banking.
                        <br />
                        <small>(Coming Soon)</small>
                    </p>
                </div>

                <div className="payment-option">
                    <label>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="bank"
                            checked={paymentMethod === "bank"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        Bank Deposit / Bank Transfer
                    </label>

                    <div className={`bank-dropdown ${paymentMethod === "bank" ? "active" : ""}`}>
                        <div className="bank-left">
                            <p><strong>Bank:</strong> {paymentSettings.bankName}</p>
                            <p><strong>A/C Name:</strong> {paymentSettings.accountHolder}</p>
                            <p><strong>A/C No:</strong> {paymentSettings.accountNumber}</p>
                            <p><strong>IFSC:</strong> {paymentSettings.ifscCode}</p>
                            <p><strong>Branch:</strong> {paymentSettings.branch}</p>

                            {paymentSettings.upiAccounts?.length > 0 && (
                                <>
                                    <p>
                                        <strong>UPI ID:</strong> {paymentSettings.upiAccounts[0].upiId}
                                    </p>

                                    <p>
                                        <strong>UPI Number:</strong> {paymentSettings.upiAccounts[0].mobile}
                                    </p>
                                </>
                            )}
                            <input
                                type="text"
                                className="utr-input"
                                placeholder="Enter UTR / Transaction ID"
                                value={utrNumber}
                                onChange={(e) => setUtrNumber(e.target.value)}
                            />
                        </div>

                        <div className="bank-right">
                            <img
                                src={
                                    paymentSettings.qrCode ||
                                    "/images/No_Image_Available.jpg"
                                }
                                alt="QR Code"
                            />
                        </div>
                    </div>
                </div>

                <div className="payment-option">
                    <label>
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={paymentMethod === "cod"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        Cash on Delivery
                    </label>
                </div>
            </div>

            <button
                className="checkout-btn"
                disabled={!paymentMethod || placingOrder}
                onClick={handleCheckout}
            >
                {placingOrder ? (
                    <>
                        <span className="btn-spinner"></span>
                        Processing...
                    </>
                ) : (
                    buttonText
                )}
            </button>
        </section>
    );
}