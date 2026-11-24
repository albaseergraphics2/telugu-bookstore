
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "@/redux/actions/cartActions";
import Link from "next/link";
import toast from "react-hot-toast";
import useRealtime from "../hooks/useRealtime";
import { useLanguage } from "@/app/context/LanguageContext";

export default function CheckoutPage() {
    const dispatch = useDispatch();
    const router = useRouter();

    const { cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);

    const { language } = useLanguage();
    const isTelugu = language === "te";

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
                setDefaultShipping(
                    Number(data.setting.defaultShipping || 0)
                );

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
            toast.error(
                isTelugu ? "దయచేసి ముందుగా లాగిన్ అవ్వండి" : "Please login first"
            );
            return;
        }

        if (!name || !phone || !address) {
            toast.error(
                isTelugu
                    ? "దయచేసి డెలివరీ వివరాలన్నీ నమోదు చేయండి"
                    : "Please fill all delivery details"
            );
            return;
        }

        if (cartItems.length === 0) {
            toast.error(
                isTelugu ? "మీ కార్ట్ ఖాళీగా ఉంది" : "Your cart is empty"
            );
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
            utrNumber: utrNumber || "",

            items: cartItems.map((item) => ({
                bookId: item._id || item.slug,
                qty: item.qty,
            })),

            totalAmount: Number(totalPrice),
            deliveryCharge: Number(shippingCharge),
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
            toast.success(
                isTelugu
                    ? "ఆర్డర్ విజయవంతంగా నమోదు చేయబడింది!"
                    : "Order placed successfully!"
            );

            dispatch(clearCart());

            setTimeout(() => {
                router.push("/orders");
            }, 800);
        } else {
            console.log(data.message);

            toast.error(
                data.message ||
                (isTelugu ? "ఏదో తప్పు జరిగింది" : "Something went wrong")
            );
        }
    };

    const handleCheckout = async () => {
        if (placingOrder) return;

        setPlacingOrder(true);

        try {
            if (!user) {
                toast.error(
                    isTelugu
                        ? "కొనసాగించడానికి దయచేసి లాగిన్ అవ్వండి"
                        : "Please login to continue"
                );
                return;
            }

            if (!paymentMethod) {
                toast.error(
                    isTelugu
                        ? "దయచేసి చెల్లింపు పద్ధతిని ఎంచుకోండి"
                        : "Please select a payment method"
                );
                return;
            }

            if (paymentMethod === "online") {
                router.push("/payment");
                return;
            }

            if (paymentMethod === "bank") {
                if (!utrNumber.trim()) {
                    toast.error(
                        isTelugu
                            ? "దయచేసి UTR / లావాదేవీ ID నమోదు చేయండి"
                            : "Please enter UTR / Transaction ID"
                    );
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

    const buttonText = {
        online: isTelugu ? "చెల్లింపుకు వెళ్లండి" : "Proceed to Payment",
        bank: isTelugu ? "చెల్లింపు వివరాలను సమర్పించండి" : "Submit Payment Details",
        cod: isTelugu ? "ఆర్డర్ చేయండి" : "Place Order",
    }[paymentMethod] || (isTelugu ? "చెల్లింపు పద్ధతిని ఎంచుకోండి" : "Select Payment Method");

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: "100px" }}>
                <div className="loader"></div>
                <p>
                    {isTelugu ? "చెక్‌అవుట్ లోడ్ అవుతోంది..." : "Loading Checkout..."}
                </p>
            </div>
        );
    }

    return (
        <section className="checkout-page">

            <Link href="/cart" className="back-home">
                {isTelugu ? "← కార్ట్‌కు తిరిగి వెళ్ళండి" : "← Back to Cart"}
            </Link>

            <h1 className="checkout-title">
                {isTelugu ? "చెక్‌అవుట్" : "Checkout"}
            </h1>

            {/* ORDER SUMMARY */}
            <div className="checkout-card">
                <h2>
                    {isTelugu ? "ఆర్డర్ సారాంశం" : "Order Summary"}
                </h2>

                <hr />

                <div className="summary-single-row">
                    <span>
                        <strong>{isTelugu ? "పుస్తకాలు" : "Books"}</strong> {totalBooks}
                    </span>
                    <span>₹{totalPrice}</span>
                </div>

                <div className="summary-single-row">
                    <span className="shipping-label">
                        <strong>{isTelugu ? "డెలివరీ" : "Shipping"}</strong>

                        <button
                            type="button"
                            className="shipping-info-btn"
                            onClick={() => setShowShippingInfo(!showShippingInfo)}
                        >
                            ?
                        </button>

                        {showShippingInfo && (
                            <div className="shipping-tooltip">
                                {isTelugu
                                    ? `₹${freeShippingAmount} కంటే ఎక్కువ ఆర్డర్లకు ఉచిత డెలివరీ`
                                    : `Free shipping on orders above ₹${freeShippingAmount}`}
                            </div>
                        )}
                    </span>

                    <span>
                        {shippingCharge === 0
                            ? isTelugu ? "ఉచితం" : "Free"
                            : defaultShipping > 0
                                ? `₹${defaultShipping}`
                                : isTelugu ? "తర్వాత నిర్ధారించబడుతుంది" : "To Be Confirmed"}
                    </span>
                </div>

                <hr />

                <div className="summary-single-row">
                    <span>
                        <strong>{isTelugu ? "మొత్తం" : "Total"}</strong>
                    </span>
                    <span>
                        <strong>₹{grandTotal}</strong>
                    </span>
                </div>
            </div>

            {/* DELIVERY ADDRESS */}
            <div className="checkout-card">
                <h2>
                    {isTelugu ? "డెలివరీ చిరునామా" : "Delivery Address"}
                </h2>

                <input
                    type="text"
                    placeholder={isTelugu ? "పూర్తి పేరు" : "Full Name"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="tel"
                    placeholder={isTelugu ? "ఫోన్ నంబర్" : "Phone Number"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <textarea
                    placeholder={isTelugu ? "పూర్తి చిరునామా" : "Full Address"}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <input
                    type="text"
                    placeholder={isTelugu ? "పిన్‌కోడ్" : "Pincode"}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                />

                {area && (
                    <input
                        type="text"
                        value={area}
                        readOnly
                        placeholder={isTelugu ? "ప్రాంతం" : "Area"}
                    />
                )}

                {district && (
                    <input
                        type="text"
                        value={district}
                        readOnly
                        placeholder={isTelugu ? "జిల్లా" : "District"}
                    />
                )}

                {stateName && (
                    <input
                        type="text"
                        value={stateName}
                        readOnly
                        placeholder={isTelugu ? "రాష్ట్రం" : "State"}
                    />
                )}
            </div>

            {/* PAYMENT */}
            <div className="checkout-card">
                <h2>
                    {isTelugu ? "చెల్లింపు" : "Payment"}
                </h2>

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
                        {isTelugu ? "ఆన్‌లైన్ చెల్లింపు" : "Online Payment"}
                    </label>

                    <p className="payment-text">
                        {isTelugu
                            ? "UPI, క్రెడిట్/డెబిట్ కార్డ్ లేదా నెట్ బ్యాంకింగ్ ద్వారా సురక్షితంగా చెల్లించండి."
                            : "Pay securely using UPI, Credit/Debit Card or Net Banking."}

                        <br />

                        <small>
                            {isTelugu ? "(త్వరలో అందుబాటులోకి వస్తుంది)" : "(Coming Soon)"}
                        </small>
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
                        {isTelugu ? "బ్యాంక్ డిపాజిట్ / బ్యాంక్ బదిలీ" : "Bank Deposit / Bank Transfer"}
                    </label>

                    <div className={`bank-dropdown ${paymentMethod === "bank" ? "active" : ""}`}>
                        <div className="bank-left">

                            <p>
                                <strong>{isTelugu ? "బ్యాంక్:" : "Bank:"}</strong> {paymentSettings.bankName}
                            </p>

                            <p>
                                <strong>{isTelugu ? "ఖాతాదారు పేరు:" : "A/C Name:"}</strong> {paymentSettings.accountHolder}
                            </p>

                            <p>
                                <strong>{isTelugu ? "ఖాతా నంబర్:" : "A/C No:"}</strong> {paymentSettings.accountNumber}
                            </p>

                            <p>
                                <strong>IFSC:</strong> {paymentSettings.ifscCode}
                            </p>

                            <p>
                                <strong>{isTelugu ? "శాఖ:" : "Branch:"}</strong> {paymentSettings.branch}
                            </p>

                            {paymentSettings.upiAccounts?.length > 0 && (
                                <>
                                    <p>
                                        <strong>UPI ID:</strong> {paymentSettings.upiAccounts[0].upiId}
                                    </p>

                                    <p>
                                        <strong>{isTelugu ? "UPI నంబర్:" : "UPI Number:"}</strong> {paymentSettings.upiAccounts[0].mobile}
                                    </p>
                                </>
                            )}

                            <input
                                type="text"
                                className="utr-input"
                                placeholder={
                                    isTelugu
                                        ? "UTR / లావాదేవీ ID నమోదు చేయండి"
                                        : "Enter UTR / Transaction ID"
                                }
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
                        {isTelugu ? "వస్తువు అందుకున్నప్పుడు నగదు చెల్లింపు" : "Cash on Delivery"}
                    </label>
                </div>
            </div>

            {/* CHECKOUT BUTTON */}
            <button
                className="checkout-btn"
                disabled={placingOrder}
                onClick={handleCheckout}
            >
                {placingOrder ? (
                    <>
                        <span className="btn-spinner"></span>
                        {isTelugu ? "ప్రాసెస్ అవుతోంది..." : "Processing..."}
                    </>
                ) : (
                    buttonText
                )}
            </button>

        </section>
    );
}
