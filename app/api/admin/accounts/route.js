import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";

import Purchase from "../../../models/Purchase";
import Payment from "../../../models/Payment";
import Supplier from "../../../models/Supplier";
import Order from "../../../models/Orders";

export async function GET() {
    try {
        await connectDB();
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .lean();

        const purchases = await Purchase.find()
            .populate("supplier", "name companyName")
            .sort({ purchaseDate: -1 })
            .lean();

        const payments = await Payment.find()
            .populate("supplier", "name companyName")
            .sort({ paymentDate: -1 })
            .lean();

        const purchaseTransactions = purchases.map(
            (purchase) => ({
                _id: `purchase-${purchase._id}`,
                date: purchase.purchaseDate,
                type: "Purchase",

                party:
                    purchase.supplier?.name ||
                    purchase.supplier?.companyName ||
                    "-",

                partyType: "Supplier",

                description:
                    purchase.invoiceNumber
                        ? `Purchase Invoice ${purchase.invoiceNumber}`
                        : "Book Purchase",

                debit: purchase.totalAmount || 0,
                credit: 0,
            })
        );

        const paymentTransactions = payments.map(
            (payment) => ({
                _id: `payment-${payment._id}`,

                date: payment.paymentDate,

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

                debit: payment.amount || 0,

                credit: 0,

                paymentMethod: String(
                    payment.paymentMethod || ""
                ).trim(),

                referenceNumber:
                    payment.referenceNumber || "",
            })
        );

        const orderTransactions = orders.map(
            (order) => {

                let displayPaymentMethod = "";

                if (order.paymentMethod === "bank") {
                    displayPaymentMethod = "Bank Transfer";
                } else if (order.paymentMethod === "cod") {
                    displayPaymentMethod = "Cash";
                } else if (order.paymentMethod === "online") {
                    displayPaymentMethod = "UPI";
                } else {
                    displayPaymentMethod =
                        order.paymentMethod || "";
                }

                return {
                    _id: `order-${order._id}`,

                    date: order.createdAt,

                    type: "Sale",

                    party: order.name || "-",

                    partyType: "Customer",

                    description:
                        order.invoiceId
                            ? `Order #${order.invoiceId}`
                            : "Customer Sale",

                    debit: 0,

                    credit: order.totalAmount || 0,

                    paymentMethod: displayPaymentMethod,

                    referenceNumber:
                        order.utrNumber || "",
                };
            }
        );

        const transactions = [
            ...purchaseTransactions,
            ...paymentTransactions,
            ...orderTransactions,
        ];

        /*
         * ============================
         * SORT BY DATE
         * ============================
         */

        transactions.sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


        /*
         * ============================
         * RUNNING BALANCE
         *
         * Credit - Debit
         * ============================
         */

        let balance = 0;

        const transactionsWithBalance = [
            ...transactions,
        ]
            .reverse()
            .map((transaction) => {

                balance =
                    balance +
                    (transaction.credit || 0) -
                    (transaction.debit || 0);

                return {
                    ...transaction,
                    balance,
                };
            })
            .reverse();


        /*
         * ============================
         * SUMMARY
         * ============================
         */

        const totalDebit =
            transactions.reduce(
                (total, transaction) =>
                    total +
                    (transaction.debit || 0),
                0
            );


        const totalCredit =
            transactions.reduce(
                (total, transaction) =>
                    total +
                    (transaction.credit || 0),
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
                transactionsWithBalance,
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
            {
                status: 500,
            }
        );
    }
}