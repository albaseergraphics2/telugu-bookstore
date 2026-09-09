import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";

import Purchase from "../../../models/Purchase";
import Payment from "../../../models/Payment";
import Supplier from "../../../models/Supplier";
import Order from "../../../models/Orders";
import CustomerPayment from "../../../models/CustomerPayment";

export async function GET() {
    try {
        await connectDB();

        const orders = await Order.find().lean();

        const customerPayments = await CustomerPayment.find().lean();

        const purchases = await Purchase.find()
            .populate("supplier", "name companyName")
            .lean();

        const payments = await Payment.find()
            .populate("supplier", "name companyName")
            .lean();

        const paymentsByPurchase = {};

        payments.forEach((payment) => {
            const purchaseId = payment.purchase?.toString();

            if (!purchaseId) {
                return;
            }

            if (!paymentsByPurchase[purchaseId]) {
                paymentsByPurchase[purchaseId] = [];
            }

            paymentsByPurchase[purchaseId].push(payment);
        });

        const purchaseTransactions = purchases.map((purchase) => {
            const purchaseId = purchase._id.toString();

            const relatedPayments =
                paymentsByPurchase[purchaseId] || [];

            const laterPaymentsTotal =
                relatedPayments.reduce(
                    (total, payment) =>
                        total + (Number(payment.amount) || 0),
                    0
                );

            const currentPaidAmount =
                Number(purchase.paidAmount) || 0;

            const originalPaidAmount = Math.max(
                0,
                currentPaidAmount - laterPaymentsTotal
            );

            return {
                _id: `purchase-${purchase._id}`,
                date:
                    purchase.purchaseDate ||
                    purchase.createdAt,
                createdAt: purchase.createdAt,
                type: "Purchase",
                party:
                    purchase.supplier?.name ||
                    purchase.supplier?.companyName ||
                    "-",
                partyType: "Supplier",
                description:
                    purchase.invoiceNumber
                        ? `${purchase.books?.[0]?.bookName || "Book"} Book Purchase Invoice ${purchase.invoiceNumber}`
                        : `${purchase.books?.[0]?.bookName || "Book"} Book Purchase`,
                debit: originalPaidAmount,
                credit: 0,
                due: Math.max(
                    0,
                    (Number(purchase.totalAmount) || 0) -
                    originalPaidAmount
                ),
                paymentMethod: "",
                referenceNumber: "",
            };
        });

        const paymentTransactions = payments.map((payment) => {
            const purchaseId =
                payment.purchase?.toString();

            const purchase = purchases.find(
                (item) =>
                    item._id.toString() === purchaseId
            );

            let remainingDue = 0;

            if (purchase) {
                const relatedPayments =
                    paymentsByPurchase[purchaseId] || [];

                const totalPayments =
                    relatedPayments.reduce(
                        (total, item) =>
                            total +
                            (Number(item.amount) || 0),
                        0
                    );

                const currentPaidAmount =
                    Number(purchase.paidAmount) || 0;

                const originalPaidAmount = Math.max(
                    0,
                    currentPaidAmount - totalPayments
                );

                const paymentDate = new Date(
                    payment.paymentDate ||
                    payment.createdAt
                ).getTime();

                const paymentsUpToThisPayment =
                    relatedPayments
                        .filter((item) => {
                            const itemDate =
                                new Date(
                                    item.paymentDate ||
                                    item.createdAt
                                ).getTime();

                            return itemDate <= paymentDate;
                        })
                        .reduce(
                            (total, item) =>
                                total +
                                (Number(item.amount) || 0),
                            0
                        );

                remainingDue = Math.max(
                    0,
                    (Number(purchase.totalAmount) || 0) -
                    originalPaidAmount -
                    paymentsUpToThisPayment
                );
            }

            return {
                _id: `payment-${payment._id}`,
                date:
                    payment.paymentDate ||
                    payment.createdAt,
                createdAt: payment.createdAt,
                type: "Supplier Payment",
                party:
                    payment.supplier?.name ||
                    payment.supplier?.companyName ||
                    "-",
                partyType: "Supplier",
                description:
                    payment.referenceNumber
                        ? `Supplier Payment - ${payment.referenceNumber}`
                        : "Supplier Payment",
                debit:
                    Number(payment.amount) || 0,
                credit: 0,
                due: remainingDue,
                paymentMethod:
                    String(
                        payment.paymentMethod || ""
                    ).trim(),
                referenceNumber:
                    payment.referenceNumber || "",
            };
        });

        const orderPaymentTransactions = customerPayments.map(
            (payment) => {
                const order = orders.find(
                    (item) =>
                        item._id.toString() ===
                        payment.order?.toString()
                );

                if (!order) {
                    return null;
                }

                const orderSource =
                    String(
                        order.orderSource || ""
                    ).trim().toLowerCase();

                const source =
                    orderSource === "offline"
                        ? "Offline"
                        : "Online";

                const orderLabel = order.invoiceId
                    ? `${source} Order #${order.invoiceId}`
                    : `${source} Order`;

                const paymentDate = new Date(
                    payment.paymentDate ||
                    payment.createdAt
                ).getTime();

                const orderPayments = customerPayments
                    .filter(
                        (item) =>
                            item.order?.toString() ===
                            order._id.toString()
                    )
                    .sort(
                        (a, b) =>
                            new Date(
                                a.paymentDate ||
                                a.createdAt
                            ).getTime() -
                            new Date(
                                b.paymentDate ||
                                b.createdAt
                            ).getTime()
                    );

                const paymentsUpToThisPayment =
                    orderPayments
                        .filter((item) => {
                            const itemDate =
                                new Date(
                                    item.paymentDate ||
                                    item.createdAt
                                ).getTime();

                            return (
                                itemDate <=
                                paymentDate
                            );
                        })
                        .reduce(
                            (total, item) =>
                                total +
                                (Number(item.amount) || 0),
                            0
                        );

                const totalAmount =
                    Number(order.totalAmount || 0) +
                    Number(order.deliveryCharge || 0);

                const currentPaidAmount =
                    Number(order.paidAmount || 0);

                const originalPaidAmount = Math.max(
                    0,
                    currentPaidAmount -
                    orderPayments.reduce(
                        (total, item) =>
                            total +
                            (Number(item.amount) || 0),
                        0
                    )
                );

                const remainingDue = Math.max(
                    0,
                    totalAmount -
                    originalPaidAmount -
                    paymentsUpToThisPayment
                );

                let displayPaymentMethod = "";

                if (
                    payment.paymentMethod ===
                    "Bank Transfer"
                ) {
                    displayPaymentMethod =
                        "Bank Transfer";
                } else if (
                    payment.paymentMethod === "UPI"
                ) {
                    displayPaymentMethod = "UPI";
                } else {
                    displayPaymentMethod =
                        payment.paymentMethod || "";
                }

                return {
                    _id: `customer-payment-${payment._id}`,
                    date:
                        payment.paymentDate ||
                        payment.createdAt,
                    createdAt:
                        payment.createdAt ||
                        payment.paymentDate,
                    type: "Sale",
                    party: order.name || "-",
                    partyType: "Customer",
                    description:
                        `Payment Received of ${orderLabel}`,
                    debit: 0,
                    credit:
                        Number(payment.amount) || 0,
                    due: remainingDue,
                    paymentMethod:
                        displayPaymentMethod,
                    referenceNumber:
                        payment.referenceNumber || "",
                };
            }
        ).filter(Boolean);

        const orderTransactions = orders.map((order) => {
            const orderSource =
                String(
                    order.orderSource || ""
                ).trim().toLowerCase();

            const source =
                orderSource === "offline"
                    ? "Offline"
                    : "Online";

            const orderLabel = order.invoiceId
                ? `${source} Order #${order.invoiceId}`
                : `${source} Order`;

            const orderPayments =
                customerPayments.filter(
                    (payment) =>
                        payment.order?.toString() ===
                        order._id.toString()
                );

            const laterPaymentsTotal =
                orderPayments.reduce(
                    (total, payment) =>
                        total +
                        (Number(payment.amount) || 0),
                    0
                );

            const currentPaidAmount =
                Number(order.paidAmount) || 0;

            const originalPaidAmount = Math.max(
                0,
                currentPaidAmount -
                laterPaymentsTotal
            );

            let displayPaymentMethod = "";

            if (order.paymentMethod === "bank") {
                displayPaymentMethod =
                    "Bank Transfer";
            } else if (
                order.paymentMethod === "cod"
            ) {
                displayPaymentMethod = "COD";
            } else if (
                order.paymentMethod === "online"
            ) {
                displayPaymentMethod = "UPI";
            } else {
                displayPaymentMethod =
                    order.paymentMethod || "";
            }

            const totalAmount =
                Number(order.totalAmount || 0) +
                Number(order.deliveryCharge || 0);

            return {
                _id: `order-${order._id}`,
                date: order.createdAt,
                createdAt: order.createdAt,
                type: "Sale",
                party: order.name || "-",
                partyType: "Customer",
                description: orderLabel,
                debit: 0,
                credit: originalPaidAmount,
                due: Math.max(
                    0,
                    totalAmount -
                    originalPaidAmount
                ),
                paymentMethod:
                    displayPaymentMethod,
                referenceNumber:
                    order.utrNumber || "",
            };
        });

        const transactions = [
            ...purchaseTransactions,
            ...paymentTransactions,
            ...orderTransactions,
            ...orderPaymentTransactions,
        ];

        transactions.sort((a, b) => {
            const timeA =
                new Date(a.createdAt).getTime();

            const timeB =
                new Date(b.createdAt).getTime();

            if (timeA !== timeB) {
                return timeA - timeB;
            }

            return String(a._id).localeCompare(
                String(b._id)
            );
        });

        let balance = 0;

        const transactionsWithBalance =
            transactions.map((transaction) => {
                const debit =
                    Number(transaction.debit) || 0;

                const credit =
                    Number(transaction.credit) || 0;

                balance =
                    balance +
                    credit -
                    debit;

                return {
                    ...transaction,
                    balance,
                };
            });

        const latestFirstTransactions =
            [...transactionsWithBalance].reverse();

        const totalDebit =
            transactions.reduce(
                (total, transaction) =>
                    total +
                    (Number(transaction.debit) || 0),
                0
            );

        const totalCredit =
            transactions.reduce(
                (total, transaction) =>
                    total +
                    (Number(transaction.credit) || 0),
                0
            );

        const finalBalance =
            totalCredit - totalDebit;

        return NextResponse.json({
            success: true,
            summary: {
                totalDebit,
                totalCredit,
                balance: finalBalance,
            },
            transactions:
                latestFirstTransactions,
        });
    } catch (error) {
        console.error(
            "GET ACCOUNTS ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to load accounts.",
            },
            { status: 500 }
        );
    }
}