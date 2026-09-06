"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateOfflineOrder() {
    const router = useRouter();
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [items, setItems] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [deliveryType, setDeliveryType] = useState("Self Pickup");
    const [deliveryCharge, setDeliveryCharge] = useState("");
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [paymentStatus, setPaymentStatus] = useState("Paid");
    const [utrNumber, setUtrNumber] = useState("");
    const [status, setStatus] = useState("completed");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [bookSearch, setBookSearch] = useState("");
    const [showBookDropdown, setShowBookDropdown] = useState(false);
    const [isNewBook, setIsNewBook] = useState(false);
    const [bookPrice, setBookPrice] = useState("");
    const [customer, setCustomer] = useState({
        _id: "",
        name: "",
        phone: "",
        email: "",
        address: {
            full: "",
            pincode: "",
            area: "",
            district: "",
            state: "",
        },
    });

    useEffect(() => {
        fetchCustomers();
        fetchBooks();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".book-autocomplete")) {
                setShowBookDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchBooks = async () => {
        try {
            setPageLoading(true);
            const response = await fetch("/api/admin/books");
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to load books.");
            }
            setBooks(data.books || []);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to load books.");
        } finally {
            setPageLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (res.ok) {
                setCustomers(data.users || data || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load customers.");
        }
    };

    const handleCustomerNameChange = (e) => {
        setCustomer((prev) => ({
            ...prev,
            name: e.target.value,
            _id: "",
        }));
        setShowCustomerDropdown(true);
    };

    const handleSelectCustomer = (
        selectedCustomer
    ) => {
        setCustomer({
            _id: selectedCustomer._id,
            name: selectedCustomer.name || "",
            phone: selectedCustomer.phone || "",
            email: selectedCustomer.email || "",
            address: {
                full: selectedCustomer.address?.full || "",
                pincode: selectedCustomer.address?.pincode || "",
                area: selectedCustomer.address?.area || "",
                district: selectedCustomer.address?.district || "",
                state: selectedCustomer.address?.state || "",
            },
        });
        setShowCustomerDropdown(false);
    };

    const handleCreateCustomer = () => {
        setCustomer((prev) => ({
            ...prev,
            _id: "",
        }));
    };

    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        setCustomer((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setCustomer((prev) => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value,
            },
        }));
    };

    const handleCustomerPhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        setCustomer((prev) => ({
            ...prev,
            phone: value,
            _id: "",
        }));
        setShowCustomerDropdown(true);
    };

    const handleBookSearchChange = (e) => {
        setBookSearch(e.target.value);
        setSelectedBook("");
        setShowBookDropdown(true);
    };

    const handleSelectBook = (book) => {
        setSelectedBook(String(book._id));
        setBookSearch(book.title || "");
        setBookPrice(book.price || "");
        setIsNewBook(false);
        setShowBookDropdown(false);
    };

    const handleAddBook = async () => {
        const title = bookSearch.trim();
        const qty = Number(quantity);
        const enteredPrice = Number(bookPrice);

        if (!title) {
            toast.error("Please enter book name.");
            return;
        }

        if (!qty || qty < 1) {
            toast.error("Quantity must be at least 1.");
            return;
        }

        if (!Number.isFinite(enteredPrice) || enteredPrice <= 0) {
            toast.error("Please enter a valid price.");
            return;
        }

        setLoading(true);

        try {
            if (selectedBook) {
                const book = books.find(
                    (item) => String(item._id) === String(selectedBook)
                );

                if (!book) {
                    toast.error("Book not found.");
                    return;
                }

                if (book.isActive === false) {
                    toast.error("This book is inactive.");
                    return;
                }

                if (book.inStock === false) {
                    toast.error("This book is out of stock.");
                    return;
                }

                const existingItem = items.find(
                    (item) => String(item.bookId) === String(book._id)
                );

                if (existingItem) {
                    setItems((prev) =>
                        prev.map((item) =>
                            String(item.bookId) === String(book._id) ? {
                                ...item,
                                qty: Number(item.qty) + qty,
                            } : item
                        )
                    );
                } else {
                    setItems((prev) => [
                        ...prev,
                        {
                            bookId: book._id,
                            title: book.title,
                            teluguTitle: book.teluguTitle || "",
                            price: enteredPrice,
                            sellingPrice: enteredPrice,
                            discount: 0,
                            qty,
                            img: book.img || "",
                        },
                    ]);
                }
                toast.success("Book added successfully.");
            } else {
                const existingBook = books.find(
                    (book) =>
                        String(book.title || "").trim().toLowerCase() === title.toLowerCase()
                );
                if (existingBook) {
                    toast.error("This book already exists. Please select it.");
                    return;
                }
                const slug = title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");
                const response = await fetch("/api/admin/books", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        price: String(enteredPrice),
                        slug: `${slug}-${Date.now()}`,
                        isActive: false,
                        inStock: true,
                        images: [],
                    }),
                });

                const data = await response.json();

                if (!response.ok || !data.success || !data.book) {
                    toast.error(data.message || "Failed to create new book.");
                    return;
                }

                const newBook = data.book;
                setBooks((prev) => [newBook, ...prev]);
                setItems((prev) => [
                    ...prev,
                    {
                        bookId: newBook._id,
                        title: newBook.title,
                        teluguTitle: "",
                        price: enteredPrice,
                        sellingPrice: enteredPrice,
                        discount: 0,
                        qty,
                        img: newBook.img || "",
                    },
                ]);
                toast.success("New book created and added.");
            }

            setSelectedBook("");
            setBookSearch("");
            setBookPrice("");
            setShowBookDropdown(false);
            setQuantity(1);
            setIsNewBook(false);
        } catch (error) {
            console.error("ADD BOOK ERROR:", error);
            toast.error("Failed to add book.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (
        bookId,
        newQuantity
    ) => {
        const qty = Number(newQuantity);
        if (!qty || qty < 1) {
            return;
        }
        setItems((prev) =>
            prev.map((item) =>
                String(item.bookId) === String(bookId) ? {
                    ...item,
                    qty,
                } : item
            )
        );
    };

    const handleRemoveBook = (
        bookId
    ) => {
        setItems((prev) =>
            prev.filter(
                (item) => String(item.bookId) !== String(bookId)
            )
        );
        toast.success("Book removed.");
    };

    const handleSellingPriceChange = (
        bookId,
        value
    ) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.bookId !== bookId) {
                    return item;
                }
                const price = Number(item.price) || 0;
                if (value === "") {
                    return {
                        ...item,
                        sellingPrice: "",
                        discount: "",
                    };
                }

                const sellingPrice = Math.min(Math.max(Number(value), 0), price);
                const discount = price > 0 ? ((price - sellingPrice) / price) * 100 : 0;
                return {
                    ...item,
                    sellingPrice,
                    discount: Number(discount.toFixed(2)),
                };
            })
        );
    };

    const handleDiscountChange = (
        bookId,
        value
    ) => {
        setItems((prev) =>
            prev.map((item) => {
                if (item.bookId !== bookId) {
                    return item;
                }
                const price = Number(item.price) || 0;
                if (value === "") {
                    return {
                        ...item,
                        discount: "",
                        sellingPrice: "",
                    };
                }
                const discount = Math.min(Math.max(Number(value), 0), 100);
                const sellingPrice = price - (price * discount) / 100;
                return {
                    ...item,
                    discount,
                    sellingPrice: Number(sellingPrice.toFixed(2)),
                };
            })
        );
    };

    const getAddressFromPincode =
        async (pin) => {
            if (!/^\d{6}$/.test(pin)) {
                return;
            }
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                const data = await res.json();
                if (data[0]?.Status === "Success") {
                    const post = data[0].PostOffice[0];
                    setCustomer(
                        (prev) => ({
                            ...prev,
                            address: {
                                ...prev.address,
                                pincode: pin,
                                area: post.Name || "",
                                district: post.District || "",
                                state: post.State || "",
                            },
                        })
                    );
                }
            } catch (error) {
                console.log(error);
            }
        };

    const subtotal =
        items.reduce(
            (total, item) => {
                const sellingPrice = Number(item.sellingPrice) || 0;
                const qty = Number(item.qty) || 0;
                return (total + sellingPrice * qty);
            },
            0
        );

    const totalAmount = subtotal + (Number(deliveryCharge) || 0);

    const handleCreateOrder =
        async (e) => {
            e.preventDefault();
            if (!customer.name.trim()) {
                toast.error("Please enter customer name.");
                return;
            }
            if (!customer.phone.trim()) {
                toast.error("Please enter customer phone.");
                return;
            }

            const phone = customer.phone.trim();

            if (!/^[0-9]{10}$/.test(phone)) {
                toast.error("Please enter a valid 10-digit phone number.");
                return;
            }
            if (items.length === 0) {
                toast.error("Please add at least one book.");
                return;
            }
            if (!deliveryType) {
                toast.error("Please select delivery type.");
                return;
            }
            if (!paymentMethod) {
                toast.error("Please select payment method.");
                return;
            }
            if (
                paymentMethod !== "Cash" &&
                paymentMethod !== "COD" &&
                paymentStatus === "Paid" &&
                !utrNumber.trim()
            ) {
                toast.error("Please enter UTR number.");
                return;
            }

            try {
                setLoading(true);
                const orderData = {
                    customer: {
                        _id: customer._id || "",
                        name: customer.name.trim(),
                        phone,
                        email: customer.email.trim(),
                        address: {
                            full: customer.address.full.trim(),
                            pincode: customer.address.pincode.trim(),
                            area: customer.address.area.trim(),
                            district: customer.address.district.trim(),
                            state: customer.address.state.trim(),
                        },
                    },

                    items: items.map(
                        (item) => ({
                            bookId: item.bookId,
                            qty: Number(item.qty),
                            sellingPrice: Number(item.sellingPrice),
                            discount: Number(item.discount) || 0,
                        })
                    ),
                    deliveryType,
                    deliveryCharge: Number(deliveryCharge) || 0,
                    status,
                    paymentMethod,
                    paymentStatus,
                    utrNumber: paymentMethod === "Cash" || paymentMethod === "COD" ? "" : utrNumber.trim(),
                };

                const response =
                    await fetch("/api/admin/offline-orders", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(orderData),
                    }
                    );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Failed to create order.");
                }
                toast.success(`Order created successfully. Invoice ID: ${data.order.invoiceId}`);
                setTimeout(() => {
                    router.push("/admin/offline/orders");
                }, 1000);
            } catch (error) {
                console.error(error);
                toast.error(error.message || "Failed to create offline order.");
            } finally {
                setLoading(false);
            }
        };

    if (pageLoading) {
        return (
            <div style={{ textAlign: "center", marginTop: "60px" }}>
                <div className="loader"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="offline-order-create-page">
            <div className="offline-order-create-header">
                <div>
                    <h1>Create Offline Order</h1>
                </div>
                <button
                    type="button"
                    className="offline-order-back-btn"
                    onClick={() =>
                        router.push("/admin/offline/orders")
                    }
                >
                    Back
                </button>
            </div>

            <form
                onSubmit={handleCreateOrder}
                className="offline-order-form"
            >
                <div className="offline-order-section">
                    <h2>Customer Details</h2>
                    <div className="offline-order-grid">
                        <div className="offline-order-field">
                            <label>Name</label>
                            <div className="customer-autocomplete">
                                <input
                                    type="text"
                                    name="customerName"
                                    value={customer.name}
                                    onChange={handleCustomerNameChange}
                                    onFocus={() =>
                                        setShowCustomerDropdown(true)
                                    }
                                    placeholder="Enter customer name"
                                    autoComplete="new-password"
                                />

                                {showCustomerDropdown &&
                                    customer.name && (
                                        <div className="customer-dropdown">
                                            {customers.filter(
                                                (item) =>
                                                    item.name
                                                        ?.toLowerCase()
                                                        .includes(customer.name.toLowerCase()
                                                        )
                                            ).map((item) => (
                                                <div
                                                    key={item._id}
                                                    className="customer-dropdown-item"
                                                    onClick={() =>
                                                        handleSelectCustomer(item)
                                                    }
                                                >
                                                    {item.name}{" "}- Ph No:{" "}{item.phone}
                                                </div>
                                            )
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>
                        <div className="offline-order-field">
                            <label>Phone</label>
                            <div className="customer-autocomplete">
                                <input
                                    type="tel"
                                    name="phone"
                                    value={customer.phone}
                                    onChange={handleCustomerPhoneChange}
                                    onFocus={() =>
                                        setShowCustomerDropdown(true)
                                    }
                                    placeholder="Enter 10-digit phone number"
                                    maxLength={10}
                                    autoComplete="new-password"
                                    inputMode="numeric"
                                />

                                {showCustomerDropdown &&
                                    customer.phone && (
                                        <div className="customer-dropdown">
                                            {customers.filter(
                                                (item) =>
                                                    item.phone
                                                        ?.toString()
                                                        .includes(customer.phone)
                                            ).map((item) => (
                                                <div
                                                    key={item._id}
                                                    className="customer-dropdown-item"
                                                    onClick={() =>
                                                        handleSelectCustomer(item)
                                                    }
                                                >
                                                    {item.name}{" "}- Ph No:{" "}{item.phone}
                                                </div>
                                            )
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>

                        <div className="offline-order-field">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={customer.email}
                                onChange={handleCustomerChange}
                                placeholder="Enter email"
                            />
                        </div>
                    </div>
                    <div className="offline-order-field">
                        <label>Address</label>
                        <textarea
                            name="full"
                            value={customer.address.full}
                            onChange={handleAddressChange}
                            placeholder="Enter Address"
                        />
                    </div>
                    <div className="offline-order-grid1">
                        <div className="offline-order-field">
                            <label>Area</label>
                            <input
                                type="text"
                                name="area"
                                value={customer.address.area}
                                onChange={handleAddressChange}
                                placeholder="Area"
                            />
                        </div>
                        <div className="offline-order-field">
                            <label>District</label>
                            <input
                                type="text"
                                name="district"
                                value={customer.address.district}
                                onChange={handleAddressChange}
                                placeholder="District"
                            />
                        </div>
                        <div className="offline-order-field">
                            <label>State</label>
                            <input
                                type="text"
                                name="state"
                                value={customer.address.state}
                                onChange={handleAddressChange}
                                placeholder="State"
                            />
                        </div>
                        <div className="offline-order-field">
                            <label>Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                value={customer.address.pincode
                                }
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setCustomer(
                                        (prev) => ({
                                            ...prev,
                                            address: {
                                                ...prev.address,
                                                pincode: value,
                                            },
                                        })
                                    );
                                    if (value.length === 6) {
                                        getAddressFromPincode(value);
                                    }
                                }}
                                placeholder="Pincode"
                                maxLength={6}
                            />
                        </div>
                    </div>
                </div>

                <div className="offline-order-section">
                    <h2>Add Books</h2>
                    <div className="offline-order-add-book">
                        <div className="offline-order-field">
                            <label>Book</label>

                            <div className="customer-autocomplete book-autocomplete">
                                <input
                                    type="text"
                                    value={bookSearch}
                                    onChange={handleBookSearchChange}
                                    onFocus={() =>
                                        setShowBookDropdown(true)
                                    }
                                    placeholder="Search Book"
                                    autoComplete="off"
                                />

                                {showBookDropdown && (
                                    <div className="customer-dropdown">
                                        {books.filter(
                                            (book) =>
                                                bookSearch.trim() === "" || book.title
                                                    ?.toLowerCase()
                                                    .includes(bookSearch.toLowerCase())
                                        ).map((book) => (
                                            <div
                                                key={book._id}
                                                className="customer-dropdown-item"
                                                onClick={() => handleSelectBook(book)}
                                            >
                                                <div>
                                                    <strong>{book.title}</strong>
                                                </div>
                                                <div>
                                                    Rs. {Number(book.price) || 0}
                                                </div>
                                            </div>
                                        ))}

                                        {bookSearch.trim() !== "" &&
                                            books.filter((book) =>
                                                book.title
                                                    ?.toLowerCase()
                                                    .includes(bookSearch.toLowerCase())
                                            ).length === 0 && (
                                                <div className="customer-dropdown-item">
                                                    No books found
                                                </div>
                                            )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="offline-order-field">
                            <label>Price</label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={bookPrice}
                                onChange={(e) => setBookPrice(e.target.value)}
                                placeholder="Enter price"
                            />
                        </div>

                        <div className="offline-order-field">
                            <label>Quantity</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(e.target.value)
                                }
                            />
                        </div>

                        <button
                            type="button"
                            className="offline-order-add-btn"
                            onClick={handleAddBook}
                        >
                            Add Book
                        </button>

                    </div>

                    {items.length > 0 && (
                        <div className="offline-order-items">
                            <div className="offline-order-items-header">
                                <div>Book</div>
                                <div>Price</div>
                                <div>Selling Price</div>
                                <div>Discount</div>
                                <div>Quantity</div>
                                <div>Total</div>
                                <div>Action</div>
                            </div>
                            {items.map(
                                (item) => {
                                    const price = Number(item.price || 0);
                                    const sellingPrice = Number(item.sellingPrice ?? price);
                                    const discount = Number(item.discount ?? 0);
                                    const qty = Number(item.qty || 0);
                                    const itemTotal = sellingPrice * qty;

                                    return (
                                        <div
                                            key={item.bookId}
                                            className="offline-order-item"
                                        >
                                            <div>{item.title || "-"}</div>
                                            <div>Rs.{" "}{price.toFixed(2)}</div>
                                            <div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={price}
                                                    step="1"
                                                    value={item.sellingPrice ?? ""}
                                                    onChange={(e) =>
                                                        handleSellingPriceChange(
                                                            item.bookId,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="1"
                                                    value={item.discount ?? ""}
                                                    onChange={(e) =>
                                                        handleDiscountChange(
                                                            item.bookId,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <span>%</span>
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.qty}
                                                    onChange={(e) =>
                                                        handleQuantityChange(
                                                            item.bookId,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div>
                                                Rs.{" "}{itemTotal.toFixed(2)}
                                            </div>

                                            <div>
                                                <button
                                                    type="button"
                                                    className="offline-order-remove-btn"
                                                    onClick={() =>
                                                        handleRemoveBook(item.bookId)
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    )}
                </div>
                <div className="offline-order-section-box">
                    <div className="offline-order-section">
                        <h2>Delivery Details</h2>
                        <div className="offline-order-section-box1">
                            <div className="offline-order-field">
                                <label>Delivery Type</label>
                                <select
                                    value={deliveryType}
                                    onChange={(e) =>
                                        setDeliveryType(e.target.value)
                                    }
                                >
                                    <option value="Self Pickup">Self Pickup</option>
                                    <option value="Home Delivery">Home Delivery</option>
                                    <option value="Courier">Courier</option>
                                </select>
                            </div>
                            <div className="offline-order-field">
                                <label>Delivery Charge</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={deliveryCharge}
                                    onChange={(e) =>
                                        setDeliveryCharge(e.target.value)
                                    }
                                    placeholder="Rs."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="offline-order-section">
                        <h2>Payment Details</h2>
                        <div className="offline-order-grid">
                            <div className="offline-order-field">
                                <label>Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPaymentMethod(value);
                                        if (value === "Cash" || value === "COD"
                                        ) {
                                            setUtrNumber("");
                                        }
                                    }}
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Card">Card</option>
                                    <option value="COD">COD</option>
                                </select>
                            </div>
                            <div className="offline-order-field">
                                <label>Payment Status</label>
                                <select
                                    value={paymentStatus}
                                    onChange={(e) =>
                                        setPaymentStatus(e.target.value)
                                    }
                                >
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Partial">Partial</option>
                                </select>
                            </div>

                            {paymentMethod !== "Cash" &&
                                paymentMethod !== "COD" && (
                                    <div className="offline-order-field">
                                        <label>UTR Number</label>
                                        <input
                                            type="text"
                                            value={utrNumber}
                                            onChange={(e) =>
                                                setUtrNumber(e.target.value)
                                            }
                                            placeholder="Enter UTR number"
                                        />
                                    </div>
                                )}
                            <div className="offline-order-field">
                                <label>Order Status</label>
                                <select
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(e.target.value)
                                    }
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="offline-order-summary">
                    <div className="offline-order-summary-row">
                        <span>Books Amount</span>
                        <strong>Rs.{" "}{subtotal.toFixed(2)}</strong>
                    </div>
                    {Number(deliveryCharge || 0) > 0 && (
                        <div className="offline-order-summary-row">
                            <span>Delivery Charge</span>
                            <strong>Rs.{" "}{Number(deliveryCharge).toFixed(2)}</strong>
                        </div>
                    )}
                    <div className="offline-order-summary-total">
                        <span>Total Amount</span>
                        <strong>Rs.{" "}{totalAmount.toFixed(2)}</strong>
                    </div>
                </div>
                <div className="offline-order-actions">
                    <button
                        type="button"
                        className="offline-order-cancel-btn"
                        onClick={() =>
                            router.push("/admin/offline/orders")
                        }
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="offline-order-submit-btn"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Order"}
                    </button>
                </div>
            </form>
        </div>
    );
}