import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import Order from "../../../../models/Orders";

export async function GET() {
    try {
        await connectDB();
        const orders = await Order.find({
            orderSource: "offline",
        }).sort({ createdAt: -1, });

        const customersMap = new Map();
        orders.forEach((order) => {
            const phone = order.phone || "";
            if (!phone) return;
            if (!customersMap.has(phone)) {
                customersMap.set(phone, {
                    _id: phone,
                    name: order.name || "",
                    phone: order.phone || "",
                    address: {
                        full: order.address?.full || "",
                        pincode: order.address?.pincode || "",
                        area: order.address?.area || "",
                        district: order.address?.district || "",
                        state: order.address?.state || "",
                    },
                    ordersCount: 0,
                    totalAmount: 0,
                });
            }
            const customer = customersMap.get(phone);
            customer.ordersCount += 1;
            customer.totalAmount += Number(order.totalAmount) || 0;
            customer.name = order.name || customer.name;
            customer.address = {
                full: order.address?.full || customer.address.full,
                pincode: order.address?.pincode || customer.address.pincode,
                area: order.address?.area || customer.address.area,
                district: order.address?.district || customer.address.district,
                state: order.address?.state || customer.address.state,
            };
        });
        const customers = Array.from(customersMap.values());
        return NextResponse.json({ success: true, customers, });
    } catch (error) {
        console.error("OFFLINE CUSTOMERS ERROR:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch offline customers.",
        }, { status: 500, }
        );
    }
}