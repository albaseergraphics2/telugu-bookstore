"use client";
import { useEffect, useState } from "react";

export default function Accounts() {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [transactionTypes, setTransactionTypes] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [partyType, setPartyType] = useState("All");
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [partyTypeOpen, setPartyTypeOpen] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await fetch("/api/admin/accounts");
            const data = await res.json();

            if (data.success) {
                const sortedTransactions = (data.transactions || []).sort(
                    (a, b) => new Date(a.date) - new Date(b.date)
                );

                let runningBalance = 0;

                const transactionsWithBalance = sortedTransactions.map(
                    (transaction) => {
                        const debit = Number(transaction.debit) || 0;
                        const credit = Number(transaction.credit) || 0;
                        runningBalance = runningBalance - debit + credit;

                        return {
                            ...transaction,
                            balance: runningBalance,
                        };
                    }
                );
                setTransactions(transactionsWithBalance);
                const totalPages = Math.ceil(transactionsWithBalance.length / pageSize);
                setCurrentPage(totalPages || 1);
            } else {
                setTransactions([]);
            }
        } catch (error) {
            console.error(error);
            setTransactions([]);
        }
    };

    const handleTransactionType = (type) => {
        setTransactionTypes((prev) =>
            prev.includes(type)
                ? prev.filter((item) => item !== type)
                : [...prev, type]
        );
    };

    const handlePaymentMethod = (method) => {
        setPaymentMethods((prev) =>
            prev.includes(method)
                ? prev.filter((item) => item !== method)
                : [...prev, method]
        );
    };

    const resetFilters = () => {
        setSearch("");
        setFromDate("");
        setToDate("");
        setTransactionTypes([]);
        setPaymentMethods([]);
        setPartyType("All");
    };

    const filteredTransactions = transactions.filter(
        (transaction) => {
            const searchText = search.trim().toLowerCase();
            const matchesSearch =
                !searchText ||
                transaction.description
                    ?.toLowerCase()
                    .includes(searchText) ||
                transaction.party
                    ?.toLowerCase()
                    .includes(searchText) ||
                transaction.referenceNumber
                    ?.toLowerCase()
                    .includes(searchText) ||
                transaction.type
                    ?.toLowerCase()
                    .includes(searchText);

            const transactionDate =
                transaction.date
                    ? new Date(transaction.date)
                    : null;

            const matchesFromDate =
                !fromDate ||
                (
                    transactionDate &&
                    transactionDate >=
                    new Date(`${fromDate}T00:00:00`)
                );

            const matchesToDate =
                !toDate ||
                (
                    transactionDate &&
                    transactionDate <=
                    new Date(`${toDate}T23:59:59.999`)
                );

            const matchesType =
                transactionTypes.length === 0 ||
                transactionTypes.includes(
                    transaction.type
                );

            const matchesPaymentMethod =
                paymentMethods.length === 0 ||
                paymentMethods.some(
                    (method) =>
                        String(method).trim().toLowerCase() ===
                        String(transaction.paymentMethod || "")
                            .trim()
                            .toLowerCase()
                );

            const matchesParty = partyType === "All" || transaction.partyType === partyType;

            return (
                matchesSearch &&
                matchesFromDate &&
                matchesToDate &&
                matchesType &&
                matchesPaymentMethod &&
                matchesParty
            );
        }
    );

    const totalPages = Math.ceil(filteredTransactions.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
    const displayStart = filteredTransactions.length === 0 ? 0 : startIndex + 1;
    const displayEnd = Math.min(endIndex, filteredTransactions.length);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [
        search,
        fromDate,
        toDate,
        partyType,
        transactionTypes,
        paymentMethods,
        pageSize
    ]);

    useEffect(() => {
        if (
            totalPages > 0 &&
            currentPage > totalPages
        ) {
            setCurrentPage(totalPages);
        }
        if (totalPages === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [
        totalPages,
        currentPage
    ]);

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
            return pages;
        }
        pages.push(1);
        if (currentPage > 4) {
            pages.push("...");
        }
        const startPage = Math.max(
            2,
            currentPage - 1
        );
        const endPage = Math.min(
            totalPages - 1,
            currentPage + 1
        );
        for (
            let i = startPage;
            i <= endPage;
            i++
        ) {
            pages.push(i);
        }
        if (currentPage < totalPages - 3) {
            pages.push("...");
        }
        pages.push(totalPages);
        return pages;
    };

    const totalPurchase =
        filteredTransactions
            .filter(
                (transaction) =>
                    transaction.type === "Purchase"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    (Number(transaction.moneyOut) || 0),
                0
            );

    const totalExpenses =
        filteredTransactions
            .filter(
                (transaction) =>
                    transaction.type === "Expense"
            )
            .reduce(
                (total, transaction) =>
                    total +
                    (Number(transaction.moneyOut) || 0),
                0
            );

    const totalDebit =
        filteredTransactions.reduce(
            (total, transaction) =>
                total + (Number(transaction.debit) || 0),
            0
        );

    const totalCredit =
        filteredTransactions.reduce(
            (total, transaction) =>
                total + (Number(transaction.credit) || 0),
            0
        );

    const balance = totalCredit - totalDebit;

    return (
        <div className="admin-accounts">
            <div className="admin-users-header-accounts">
                <div className="admin-users-header-accounts-box">
                    <h2>Accounts</h2>
                </div>
                <div className="accounts-filter-bar">
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="accounts-filter-btn"
                    >
                        {showFilters ? "✕ Close Filters" : "☰ Filters"}
                    </button>
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="accounts-reset-btn"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="accounts-filter-panel">
                    <div className="accounts-filter-search">
                        <label>Search</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search transaction..."
                        />
                    </div>
                    <div className="accounts-filter-grid">
                        <div>
                            <label>From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label>To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>
                        <div className="party-dropdown">
                            <label>Party</label>

                            <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => setPartyTypeOpen(!partyTypeOpen)}
                            >
                                {partyType}

                                <span style={{ float: "right" }}>
                                    {partyTypeOpen ? "▼" : "▶"}
                                </span>
                            </button>

                            {partyTypeOpen && (
                                <div className="mobile-users-submenu open">
                                    <button
                                        type="button"
                                        className={`dropdown-item-mobile dropdown-item ${partyType === "All" ? "active" : ""
                                            }`}
                                        onClick={() => {
                                            setPartyType("All");
                                            setPartyTypeOpen(false);
                                        }}
                                    >
                                        All
                                    </button>

                                    <button
                                        type="button"
                                        className={`dropdown-item-mobile dropdown-item ${partyType === "Customer" ? "active" : ""
                                            }`}
                                        onClick={() => {
                                            setPartyType("Customer");
                                            setPartyTypeOpen(false);
                                        }}
                                    >
                                        Customers
                                    </button>

                                    <button
                                        type="button"
                                        className={`dropdown-item-mobile dropdown-item ${partyType === "Supplier" ? "active" : ""
                                            }`}
                                        onClick={() => {
                                            setPartyType("Supplier");
                                            setPartyTypeOpen(false);
                                        }}
                                    >
                                        Suppliers
                                    </button>

                                </div>

                            )}
                        </div>
                    </div>

                    <div className="accounts-filter-group">
                        <label>Transaction Type</label>
                        <div className="accounts-checkboxes">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={transactionTypes.includes("Sale")}
                                    onChange={() => handleTransactionType("Sale")}
                                />
                                Sales
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={transactionTypes.includes("Customer Payment")}
                                    onChange={() => handleTransactionType("Customer Payment")}
                                />
                                Customer Payment
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={transactionTypes.includes("Purchase")}
                                    onChange={() => handleTransactionType("Purchase")}
                                />
                                Purchase
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={transactionTypes.includes("Supplier Payment")}
                                    onChange={() => handleTransactionType("Supplier Payment")}
                                />
                                Supplier Payment
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={transactionTypes.includes("Expense")}
                                    onChange={() => handleTransactionType("Expense")}
                                />
                                Expense
                            </label>
                        </div>
                    </div>

                    <div className="accounts-filter-group">
                        <label>Payment Method</label>
                        <div className="accounts-checkboxes">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={paymentMethods.includes("Cash")}
                                    onChange={() =>
                                        setPaymentMethods((prev) =>
                                            prev.includes("Cash")
                                                ? prev.filter((item) => item !== "Cash")
                                                : [...prev, "Cash"]
                                        )
                                    }
                                />
                                Cash
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={paymentMethods.includes("UPI")}
                                    onChange={() => handlePaymentMethod("UPI")}
                                />
                                UPI
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={paymentMethods.includes("Bank Transfer")}
                                    onChange={() =>
                                        setPaymentMethods((prev) =>
                                            prev.includes("Bank Transfer")
                                                ? prev.filter(
                                                    (item) => item !== "Bank Transfer")
                                                : [...prev, "Bank Transfer"]
                                        )
                                    }
                                />
                                Bank Transfer
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={paymentMethods.includes("Cheque")}
                                    onChange={() => handlePaymentMethod("Cheque")}
                                />
                                Cheque
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={paymentMethods.includes("Other")}
                                    onChange={() => handlePaymentMethod("Other")}
                                />
                                Other
                            </label>
                        </div>
                    </div>

                    <div className="accounts-filter-actions">
                        <button
                            type="button"
                            onClick={() => setShowFilters(false)}
                            className="accounts-apply-btn"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            <div className="accounts-history">
                <div className="accounts-history-header">
                    <div className="accounts-history-filter">
                        <h3>Transaction History</h3>
                        {(search || fromDate || toDate || partyType !== "All" ||
                            transactionTypes.length > 0 ||
                            paymentMethods.length > 0) && (
                                <div className="accounts-active-filters">
                                    <span>Filters Applied :</span>
                                    {search && (<span>Search: {search}</span>)}
                                    {fromDate && (<span>From: {fromDate}</span>)}
                                    {toDate && (<span>To: {toDate}</span>)}
                                    {partyType !== "All" && (<span>{partyType}</span>)}
                                    {transactionTypes.map(
                                        (type) => (<span key={type}>{type}</span>)
                                    )}
                                    {paymentMethods.map(
                                        (method) => (<span key={method}>{method}</span>)
                                    )}
                                </div>
                            )}
                    </div>
                    <span>{filteredTransactions.length}{" "}Transactions</span>
                </div>

                <div className="accounts-desktop">
                    <div className="accounts-table">
                        <div className="accounts-table-row accounts-table-header">
                            <div>Date</div>
                            <div>Type</div>
                            <div>Party</div>
                            <div>Description</div>
                            <div>Payment Method</div>
                            <div>Debit</div>
                            <div>Credit</div>
                            <div>Balance</div>
                        </div>

                        {filteredTransactions.length === 0 ? (
                            <div className="accounts-empty">No transactions found.</div>
                        ) : (
                            paginatedTransactions.map(
                                (transaction) => (
                                    <div
                                        key={transaction._id}
                                        className="accounts-table-row"
                                    >
                                        <div>
                                            {transaction.date
                                                ? new Date(transaction.date).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })
                                                : "-"}
                                        </div>
                                        <div>{transaction.type || "-"}</div>
                                        <div>{transaction.party || "-"}</div>
                                        <div>{transaction.description || "-"}</div>
                                        <div>{transaction.paymentMethod || "-"}</div>
                                        <div>Rs. {transaction.debit || 0}</div>
                                        <div>Rs. {transaction.credit || 0}</div>
                                        <div>Rs. {transaction.balance || 0}</div>
                                    </div>
                                )
                            )
                        )}
                    </div>
                </div>

                {/* MOBILE TABLE */}
                <div className="accounts-mobile">
                    <div className="accounts-mobile-table">
                        <div className="accounts-mobile-row accounts-mobile-header">
                            <div>Date</div>
                            <div>Type</div>
                            <div>Party</div>
                            <div>Description</div>
                            <div>Payment Method</div>
                            <div>Debit</div>
                            <div>Credit</div>
                            <div>Balance</div>
                        </div>

                        {filteredTransactions.length === 0 ? (
                            <div className="accounts-empty">No transactions found.</div>
                        ) : (
                            paginatedTransactions.map(
                                (transaction) => (
                                    <div
                                        key={transaction._id}
                                        className="accounts-mobile-row"
                                    >
                                        <div>
                                            {transaction.date
                                                ? new Date(transaction.date).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                })
                                                : "-"}
                                        </div>
                                        <div>{transaction.type || "-"}</div>
                                        <div>{transaction.party || "-"}</div>
                                        <div>{transaction.description || "-"}</div>
                                        <div>{transaction.paymentMethod || "-"}</div>
                                        <div>Rs. {transaction.debit || 0}</div>
                                        <div>Rs. {transaction.credit || 0}</div>
                                        <div>Rs. {transaction.balance || 0}</div>
                                    </div>
                                )
                            )
                        )}
                    </div>
                </div>

                {/* PAGINATION */}
                {filteredTransactions.length > 0 && (
                    <div className="accounts-pagination">
                        <div className="accounts-pagination-info">
                            <span>{" "}
                                <strong>{displayStart}</strong>{" – "}
                                <strong>{displayEnd}</strong>{" of "}
                                <strong>{filteredTransactions.length}</strong>
                            </span>

                            <label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span>per page</span>
                            </label>
                        </div>

                        {/* PAGE CONTROLS */}
                        <div className="accounts-pagination-controls">
                            <button
                                type="button"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                &lt;&lt;
                            </button>

                            <button
                                type="button"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>

                            <div className="accounts-pagination-pages">
                                {getPageNumbers().map(
                                    (page, index) =>
                                        page === "..." ? (
                                            <span
                                                key={`dots-${index}`}
                                                className="accounts-pagination-dots"
                                            >
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={page}
                                                type="button"
                                                onClick={() => goToPage(page)}
                                                className={currentPage === page ? "active" : ""}
                                            >
                                                {page}
                                            </button>
                                        )
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                &gt;
                            </button>

                            <button
                                type="button"
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                &gt;&gt;
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}