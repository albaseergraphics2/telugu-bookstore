import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Orders";
import Book from "../../../../models/Books";
import User from "../../../../models/User";

export async function GET() {
    try {
        await connectDB();
        const orders = await Order.find({ orderSource: "offline", })
            .populate("items.bookId")
            .sort({ createdAt: -1 });
        return NextResponse.json({ success: true, orders, });
    } catch (error) {
        console.error("GET OFFLINE ORDERS ERROR:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch offline orders.",
            error: error.message,
        }, { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();
        const {
            customer,
            items,
            deliveryType,
            deliveryCharge,
            status,
            paymentMethod,
            paymentStatus,
            utrNumber,
        } = body;

        if (!customer) {
            return NextResponse.json({
                success: false,
                message: "Customer details are required.",
            }, { status: 400 }
            );
        }

        const name = String(customer.name || "").trim();
        const phone = String(customer.phone || "").trim();
        const email = String(customer.email || "").trim();

        if (!name) {
            return NextResponse.json({
                success: false,
                message: "Customer name is required.",
            }, { status: 400 }
            );
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            return NextResponse.json({
                success: false,
                message: "Please enter a valid 10-digit phone number.",
            }, { status: 400 }
            );
        }

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Please add at least one book.",
            }, { status: 400 }
            );
        }

        const address = {
            full: String(customer.address?.full || "").trim(),
            pincode: String(customer.address?.pincode || "").trim(),
            area: String(customer.address?.area || "").trim(),
            district: String(customer.address?.district || "").trim(),
            state: String(customer.address?.state || "").trim(),
        };

        const orderItems = [];
        let subtotal = 0;

        for (const item of items) {
            if (!item.bookId) {
                return NextResponse.json({
                    success: false,
                    message: "Invalid book."
                }, { status: 400 }
                );
            }

            const qty = Number(item.qty);

            if (!Number.isInteger(qty) || qty < 1) {
                return NextResponse.json({
                    success: false,
                    message: "Invalid book quantity.",
                }, { status: 400 }
                );
            }

            const book = await Book.findById(item.bookId);

            if (!book) {
                return NextResponse.json({
                    success: false,
                    message: "Book not found.",
                }, { status: 404 }
                );
            }

            if (book.isActive === false) {
                return NextResponse.json({
                    success: false,
                    message: `${book.title} is inactive.`,
                }, { status: 400 }
                );
            }

            if (book.inStock === false) {
                return NextResponse.json({
                    success: false,
                    message: `${book.title} is out of stock.`,
                }, { status: 400 }
                );
            }

            const sellingPrice = Number(item.sellingPrice) || Number(book.price) || 0;
            const discount = Number(item.discount) || 0;
            subtotal += sellingPrice * qty;
            orderItems.push({
                bookId: book._id,
                qty,
                sellingPrice,
                discount,
            });
        }

        const finalDeliveryCharge = Number(deliveryCharge) || 0;
        const finalTotalAmount = subtotal + finalDeliveryCharge;

        let user = null;
        if (customer._id) {
            user = await User.findById(customer._id);
        }
        if (!user) {
            user = await User.findOne({ phone, });
        }
        if (!user && email) {
            user = await User.findOne({ email, });
        }
        if (user) {
            user.name = name;
            user.phone = phone;
            if (email) {
                user.email = email;
            }
            user.address = address;
            await user.save();
        } else {
            const username = `offline_${phone}_${Date.now()}`;
            user = await User.create({
                name,
                username,
                email: email || `${username}@offline.local`,
                phone,
                password: "",
                address,
                role: "user",
            });
        }
        let invoiceId = 1001;
        const lastOrder = await Order.findOne({
            invoiceId: {
                $exists: true,
                $ne: null,
            },
        }).sort({
            invoiceId: -1,
        }).select("invoiceId");

        if (lastOrder?.invoiceId) {
            invoiceId = Math.max(1001, Number(lastOrder.invoiceId) + 1);
        }

        const order = await Order.create({
            userId: user._id.toString(),
            name: user.name,
            phone: user.phone,
            address: user.address,
            items: orderItems,
            totalAmount: finalTotalAmount,
            deliveryType: deliveryType || "Self Pickup",
            deliveryCharge: finalDeliveryCharge,
            status: status || "completed",
            invoiceId,
            paymentMethod: paymentMethod || "Cash",
            paymentStatus: paymentStatus || "Paid",
            utrNumber: paymentMethod === "Cash" ||
                paymentMethod === "COD"
                ? ""
                : String(utrNumber || "").trim(),
            orderSource: "offline",
            orderCreatedBy: "admin",
        });

        const populatedOrder = await Order.findById(order._id).populate("items.bookId");

        return NextResponse.json(
            {
                success: true,
                message: "Offline order created successfully.",
                user: {
                    _id: user._id,
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                },
                order: populatedOrder,
            }, { status: 201 }
        );
    } catch (error) {
        console.error("CREATE OFFLINE ORDER ERROR:", error);
        return NextResponse.json({
            success: false,
            message: error.message || "Failed to create offline order.",
        }, { status: 500 }
        );
    }
}