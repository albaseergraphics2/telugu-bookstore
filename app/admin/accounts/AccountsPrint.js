"use client";

import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AccountsPrint.css";

const DEFAULT_SETTINGS = {
    paperSize: "A4",
    orientation: "landscape",
    margin: "normal",
    title: "Accounts Statement",
    subtitle: "",
    showFilters: true,
    showSummary: true,
    showGeneratedDate: true,
    showDate: true,
    showType: true,
    showParty: true,
    showDescription: true,
    showPaymentMethod: true,
    showDebit: true,
    showCredit: true,
    showBalance: true,
    showPageNumber: true,
    fontSize: "medium",
    footerText: "",
};

const PAPER_SIZES = {
    A4: {
        width: 210,
        height: 297,
    },
    A5: {
        width: 148,
        height: 210,
    },
    Letter: {
        width: 216,
        height: 279,
    },
    Legal: {
        width: 216,
        height: 356,
    },
};

const COLUMNS = [
    {
        key: "showDate",
        label: "Date",
        title: "Date",
    },
    {
        key: "showType",
        label: "Type",
        title: "Type",
    },
    {
        key: "showParty",
        label: "Party",
        title: "Party",
    },
    {
        key: "showDescription",
        label: "Description",
        title: "Description",
    },
    {
        key: "showPaymentMethod",
        label: "Payment Method",
        title: "Payment Method",
    },
    {
        key: "showDebit",
        label: "Debit",
        title: "Debit",
    },
    {
        key: "showCredit",
        label: "Credit",
        title: "Credit",
    },
    {
        key: "showBalance",
        label: "Balance",
        title: "Balance",
    },
];

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function formatAmount(value) {
    const number = Number(value) || 0;
    return number.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getFontSize(fontSize) {
    if (fontSize === "small") return 9;
    if (fontSize === "large") return 13;
    return 11;
}

export default function AccountsPrint({
    transactions = [],
    search = "",
    fromDate = "",
    toDate = "",
    transactionTypes = [],
    paymentMethods = [],
    partyType = "All",
    onClose,
}) {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [activeTab, setActiveTab] = useState("customize");
    const [isPrinting, setIsPrinting] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [generatedDate] = useState(() => new Date());

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const updateSetting = (key, value) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const selectedColumns = useMemo(() => {
        return COLUMNS.filter((column) => settings[column.key]);
    }, [settings]);

    const totalPurchase = transactions
        .filter(
            (transaction) =>
                transaction.type === "Purchase"
        )
        .reduce(
            (total, transaction) =>
                total + (Number(transaction.moneyOut) || 0), 0
        );

    const totalExpenses = transactions
        .filter(
            (transaction) =>
                transaction.type === "Expense"
        )
        .reduce(
            (total, transaction) =>
                total + (Number(transaction.moneyOut) || 0), 0
        );

    const totalDebit = transactions.reduce(
        (total, transaction) =>
            total + (Number(transaction.debit) || 0), 0
    );

    const totalCredit = transactions.reduce(
        (total, transaction) =>
            total + (Number(transaction.credit) || 0), 0
    );

    const balance = totalCredit - totalDebit;

    const hasFilters =
        search ||
        fromDate ||
        toDate ||
        partyType !== "All" ||
        transactionTypes.length > 0 ||
        paymentMethods.length > 0;

    const getFilterItems = () => {
        const items = [];
        if (search) {
            items.push(`Search: ${search}`);
        }
        if (fromDate) {
            items.push(`From: ${formatDate(fromDate)}`);
        }
        if (toDate) {
            items.push(`To: ${formatDate(toDate)}`);
        }
        if (partyType !== "All") {
            items.push(`Party: ${partyType}`);
        }
        transactionTypes.forEach((type) => {
            items.push(type);
        });
        paymentMethods.forEach((method) => {
            items.push(method);
        });
        return items;
    };

    const buildRows = () => {
        return transactions.map((transaction) => {
            const row = [];
            if (settings.showDate) {
                row.push(formatDate(transaction.date));
            }
            if (settings.showType) {
                row.push(transaction.type || "-");
            }
            if (settings.showParty) {
                row.push(transaction.party || "-");
            }
            if (settings.showDescription) {
                row.push(transaction.description || "-");
            }
            if (settings.showPaymentMethod) {
                row.push(transaction.paymentMethod || "-");
            }
            if (settings.showDebit) {
                row.push(`Rs. ${formatAmount(transaction.debit)}`);
            }
            if (settings.showCredit) {
                row.push(`Rs. ${formatAmount(transaction.credit)}`);
            }
            if (settings.showBalance) {
                row.push(`Rs. ${formatAmount(transaction.balance)}`);
            }
            return row;
        });
    };

    const buildHtmlTable = () => {
        const headers = selectedColumns.map(
            (column) => column.title
        );

        const rows = transactions
            .map((transaction) => {
                const values = [];
                if (settings.showDate) {
                    values.push(formatDate(transaction.date));
                }
                if (settings.showType) {
                    values.push(transaction.type || "-");
                }
                if (settings.showParty) {
                    values.push(transaction.party || "-");
                }
                if (settings.showDescription) {
                    values.push(transaction.description || "-");
                }
                if (settings.showPaymentMethod) {
                    values.push(transaction.paymentMethod || "-");
                }
                if (settings.showDebit) {
                    values.push(`Rs. ${formatAmount(transaction.debit)}`);
                }
                if (settings.showCredit) {
                    values.push(`Rs. ${formatAmount(transaction.credit)}`);
                }
                if (settings.showBalance) {
                    values.push(`Rs. ${formatAmount(transaction.balance)}`);
                }
                return values;
            }).map(
                (values) =>
                    `<tr>${values.map(
                        (value) =>
                            `<td>${escapeHtml(value)}</td>`
                    ).join("")}</tr>`
            ).join("");

        return `
            <table class="accounts-print-table">
                <thead>
                    <tr>${headers.map(
            (header) =>
                `<th>${escapeHtml(header)}</th>`
        ).join("")}
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        `;
    };

    const getPrintCss = () => {
        const paper = PAPER_SIZES[settings.paperSize];

        const margin =
            settings.margin === "small"
                ? "8mm"
                : settings.margin === "large"
                    ? "20mm"
                    : "12mm";

        const fontSize = getFontSize(settings.fontSize);
        const orientation =
            settings.orientation === "portrait"
                ? "portrait"
                : "landscape";

        return `
            @page {
                size: ${paper.width}mm ${paper.height}mm ${orientation};
                margin: ${margin};
            }

            * {
                box-sizing: border-box;
            }

            html,
            body {
                margin: 0;
                padding: 0;
                background: white;
            }

            body {
                font-family: Arial, Helvetica, sans-serif;
                color: #111;
                font-size: ${fontSize}px;
            }

            .accounts-print-document {
                width: 100%;
            }

            .accounts-print-title {
                text-align: center;
                margin-bottom: 4px;
                font-size: ${fontSize + 7
            }px;
                font-weight: 700;
            }

            .accounts-print-subtitle {
                text-align: center;
                margin-bottom: 8px;
                font-size: ${fontSize + 1
            }px;
            }

            .accounts-print-generated {
                text-align: right;
                margin-bottom: 8px;
                font-size: ${Math.max(fontSize - 1, 8)
            }px;
            }

            .accounts-print-filters {
                border: 1px solid #aaa;
                padding: 6px 8px;
                margin-bottom: 10px;
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
            }

            .accounts-print-filter {
                border: 1px solid #ccc;
                padding: 3px 6px;
                border-radius: 3px;
            }

            .accounts-print-summary {
                display: grid;
                grid-template-columns: repeat(
                    4,
                    minmax(0, 1fr)
                );
                gap: 6px;
                margin-bottom: 10px;
            }

            .accounts-print-summary-box {
                border: 1px solid #aaa;
                padding: 7px;
                text-align: center;
            }

            .accounts-print-summary-label {
                display: block;
                font-size: ${Math.max(fontSize - 1, 8)
            }px;
                margin-bottom: 3px;
            }

            .accounts-print-summary-value {
                display: block;
                font-size: ${fontSize + 1
            }px;
                font-weight: 700;
            }

            .accounts-print-table {
                width: 100%;
                border-collapse: collapse;
                table-layout: auto;
            }

            .accounts-print-table th,
            .accounts-print-table td {
                border: 1px solid #999;
                padding: 5px 6px;
                vertical-align: top;
                word-break: break-word;
            }

            .accounts-print-table th {
                font-weight: 700;
                text-align: left;
            }

            .accounts-print-table td:nth-last-child(-n + 3),
            .accounts-print-table th:nth-last-child(-n + 3) {
                text-align: right;
            }

            .accounts-print-footer {
                margin-top: 10px;
                text-align: center;
                font-size: ${Math.max(fontSize - 1, 8)
            }px;
            }

            .accounts-print-page-number {
                position: fixed;
                bottom: 3mm;
                right: 0;
                font-size: ${Math.max(fontSize - 1, 8)
            }px;
            }

            .accounts-print-no-data {
                text-align: center;
                padding: 20px;
                border: 1px solid #999;
            }

            @media print {
                .accounts-print-document {
                    width: 100%;
                }

                .accounts-print-table thead {
                    display: table-header-group;
                }

                .accounts-print-table tr {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
            }
        `;
    };

    const getPrintDocumentHtml = () => {
        const filterItems = getFilterItems();

        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8" />
                    <title>${escapeHtml(settings.title)}</title>
                    <style>${getPrintCss()}</style>
                </head>

                <body>
                    <div class="accounts-print-document">
                        ${settings.title ? `
                                    <div class="accounts-print-title">
                                        ${escapeHtml(settings.title)}
                                    </div>
                                `: ""}
                        ${settings.subtitle ? `
                                    <div class="accounts-print-subtitle">
                                        ${escapeHtml(settings.subtitle)}
                                    </div>
                                `: ""}
                        ${settings.showGeneratedDate ? `
                                    <div class="accounts-print-generated">
                                        Generated: ${generatedDate.toLocaleString("en-IN")}
                                    </div>
                                `: ""}
                        ${settings.showFilters &&
                hasFilters &&
                filterItems.length > 0
                ? `
                                    <div class="accounts-print-filters">
                                        ${filterItems.map(
                    (item) =>
                        `<span class="accounts-print-filter">${escapeHtml(item)}</span>`
                ).join("")}
                                    </div>
                                `: ""}
                        ${settings.showSummary ? `
                                    <div class="accounts-print-summary">
                                        <div class="accounts-print-summary-box">
                                            <span class="accounts-print-summary-label">
                                                Transactions
                                            </span>
                                            <span class="accounts-print-summary-value">
                                                ${transactions.length}
                                            </span>
                                        </div>

                                        <div class="accounts-print-summary-box">
                                            <span class="accounts-print-summary-label">
                                                Total Debit
                                            </span>
                                            <span class="accounts-print-summary-value">
                                                Rs. ${formatAmount(totalDebit)}
                                            </span>
                                        </div>

                                        <div class="accounts-print-summary-box">
                                            <span class="accounts-print-summary-label">
                                                Total Credit
                                            </span>
                                            <span class="accounts-print-summary-value">
                                                Rs. ${formatAmount(totalCredit)}
                                            </span>
                                        </div>

                                        <div class="accounts-print-summary-box">
                                            <span class="accounts-print-summary-label">
                                                Balance
                                            </span>
                                            <span class="accounts-print-summary-value">
                                                Rs. ${formatAmount(balance)}
                                            </span>
                                        </div>
                                    </div>
                                `: ""}
                        ${transactions.length > 0 ? buildHtmlTable() : `
                                    <div class="accounts-print-no-data">
                                        No transactions found.
                                    </div>
                                `}
                        ${settings.footerText ? `
                                    <div class="accounts-print-footer">
                                        ${escapeHtml(settings.footerText)}
                                    </div>
                                `: ""}
                        ${settings.showPageNumber ? `
                                    <div class="accounts-print-page-number">
                                        Page <span class="page-number"></span>
                                    </div>
                                `: ""}
                    </div>
                </body>
            </html>
        `;
    };

    const handlePrint = () => {
        setIsPrinting(true);

        const printWindow = window.open(
            "",
            "_blank",
            "width=1200,height=800"
        );

        if (!printWindow) {
            alert("Please allow pop-ups for this website to print.");
            setIsPrinting(false);
            return;
        }

        printWindow.document.open();
        printWindow.document.write(
            getPrintDocumentHtml()
        );
        printWindow.document.close();

        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                setIsPrinting(false);
                setTimeout(() => {
                    printWindow.close();
                }, 1000);
            }, 300);
        };
    };

    const getPdfFontSize = () => {
        if (settings.fontSize === "small") {
            return 7;
        }
        if (settings.fontSize === "large") {
            return 10;
        }
        return 8;
    };

    const handlePdf = async () => {
        if (transactions.length === 0) {
            alert("There are no transactions to export.");
            return;
        }

        setIsGeneratingPdf(true);
        try {
            const orientation =
                settings.orientation === "portrait" ? "p" : "l";

            const pdf = new jsPDF({
                orientation,
                unit: "mm",
                format: settings.paperSize.toLowerCase(),
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const margin =
                settings.margin === "small" ? 8
                    : settings.margin === "large"
                        ? 20
                        : 12;

            let y = margin;

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(getPdfFontSize() + 7);

            if (settings.title) {
                pdf.text(
                    settings.title,
                    pageWidth / 2,
                    y,
                    { align: "center", }
                );
                y += 6;
            }

            if (settings.subtitle) {
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(getPdfFontSize() + 1);
                pdf.text(
                    settings.subtitle,
                    pageWidth / 2,
                    y,
                    { align: "center", }
                );
                y += 6;
            }

            if (settings.showGeneratedDate) {
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(7);
                pdf.text(`Generated: ${generatedDate.toLocaleString("en-IN")}`,
                    pageWidth - margin,
                    y,
                    { align: "right", }
                );
                y += 5;
            }

            if (
                settings.showFilters && hasFilters
            ) {
                const filters = getFilterItems();
                if (filters.length > 0) {
                    pdf.setFontSize(7);
                    const filterText = filters.join(" | ");
                    const splitFilters =
                        pdf.splitTextToSize(
                            filterText,
                            pageWidth -
                            margin * 2
                        );
                    pdf.text(splitFilters, margin, y);
                    y += splitFilters.length * 3.5 + 3;
                }
            }

            if (settings.showSummary) {
                pdf.setFontSize(7);
                pdf.setFont("helvetica", "bold");

                const summaryText =
                    `Transactions: ${transactions.length}    ` +
                    `Debit: Rs. ${formatAmount(totalDebit)}    ` +
                    `Credit: Rs. ${formatAmount(totalCredit)}    ` +
                    `Balance: Rs. ${formatAmount(balance)}`;

                const summaryLines =
                    pdf.splitTextToSize(
                        summaryText,
                        pageWidth -
                        margin * 2
                    );
                pdf.text(summaryLines, margin, y);
                y += summaryLines.length * 3.5 + 4;
            }

            const headers =
                selectedColumns.map(
                    (column) => column.title
                );

            const rows = buildRows();
            const columnStyles = {};

            selectedColumns.forEach(
                (column, index) => {
                    if (
                        column.key === "showDebit" ||
                        column.key === "showCredit" ||
                        column.key === "showBalance"
                    ) {
                        columnStyles[index] = {
                            halign: "right",
                        };
                    }
                }
            );

            autoTable(pdf, {
                startY: y,
                head: [headers],
                body: rows,
                margin: {
                    top: margin,
                    right: margin,
                    bottom: margin + (settings.footerText ? 8 : 3),
                    left: margin,
                },
                styles: {
                    font: "helvetica",
                    fontSize: getPdfFontSize(),
                    cellPadding: 2,
                    overflow: "linebreak",
                    valign: "top",
                },
                headStyles: {
                    fontStyle: "bold",
                    halign: "left",
                },
                columnStyles,
                theme: "grid",
                didDrawPage: (data) => {
                    if (settings.showPageNumber) {
                        const pageNumber = pdf.internal.getNumberOfPages();
                        pdf.setFont("helvetica", "normal");
                        pdf.setFontSize(7);
                        pdf.text(
                            `Page ${pageNumber}`,
                            pageWidth - margin,
                            pageHeight - 4,
                            { align: "right", }
                        );
                    }

                    if (settings.footerText) {
                        pdf.setFont("helvetica", "normal");
                        pdf.setFontSize(7);
                        pdf.text(
                            settings.footerText,
                            pageWidth / 2,
                            pageHeight - 4,
                            { align: "center", }
                        );
                    }
                },
            });

            const fileName =
                `${(settings.title || "Accounts Statement")
                    .replace(/[^a-z0-9]+/gi, "_")
                    .replace(/^_+|_+$/g, "")
                }.pdf`;
            pdf.save(fileName);
        } catch (error) {
            console.error("PDF generation error:", error);
            alert("Unable to generate PDF.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    const selectAllColumns = () => {
        setSettings((prev) => {
            const next = {
                ...prev,
            };

            COLUMNS.forEach((column) => {
                next[column.key] = true;
            });

            return next;
        });
    };

    const clearAllColumns = () => {
        setSettings((prev) => {
            const next = {
                ...prev,
            };

            COLUMNS.forEach((column) => {
                next[column.key] = false;
            });

            return next;
        });
    };

    const previewTable = () => {
        return (
            <div className="accounts-print-preview-document">
                <div className="accounts-print-preview-title">
                    {settings.title || "Accounts Statement"}
                </div>

                {settings.subtitle && (
                    <div className="accounts-print-preview-subtitle">
                        {settings.subtitle}
                    </div>
                )}

                {settings.showGeneratedDate && (
                    <div className="accounts-print-preview-date">
                        Generated:{" "}
                        {generatedDate.toLocaleString("en-IN")}
                    </div>
                )}

                {settings.showFilters &&
                    hasFilters &&
                    getFilterItems().length > 0 && (
                        <div className="accounts-print-preview-filters">
                            {getFilterItems().map(
                                (item, index) => (
                                    <span
                                        key={index}
                                    >
                                        {item}
                                    </span>
                                )
                            )}
                        </div>
                    )}

                {settings.showSummary && (
                    <div className="accounts-print-preview-summary">
                        <div>
                            <small>Transactions</small>
                            <strong>{transactions.length}</strong>
                        </div>
                        <div>
                            <small>Debit</small>
                            <strong>Rs.{" "}{formatAmount(totalDebit)}</strong>
                        </div>
                        <div>
                            <small>Credit</small>
                            <strong>Rs.{" "}{formatAmount(totalCredit)}</strong>
                        </div>
                        <div>
                            <small>Balance</small>
                            <strong>Rs.{" "}{formatAmount(balance)}</strong>
                        </div>
                    </div>
                )}

                <div className="accounts-print-preview-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                {selectedColumns.map(
                                    (column) => (
                                        <th key={column.key}>
                                            {column.title}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={Math.max(selectedColumns.length, 1)}
                                    >
                                        No transactions
                                        found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((
                                    transaction,
                                    index
                                ) => {
                                    const values = [];
                                    if (settings.showDate) {
                                        values.push(formatDate(transaction.date));
                                    }
                                    if (settings.showType) {
                                        values.push(transaction.type || "-");
                                    }
                                    if (settings.showParty) {
                                        values.push(transaction.party || "-");
                                    }
                                    if (settings.showDescription) {
                                        values.push(transaction.description || "-");
                                    }
                                    if (settings.showPaymentMethod) {
                                        values.push(transaction.paymentMethod || "-");
                                    }
                                    if (settings.showDebit) {
                                        values.push(`Rs. ${formatAmount(transaction.debit)}`);
                                    }
                                    if (settings.showCredit) {
                                        values.push(`Rs. ${formatAmount(transaction.credit)}`);
                                    }
                                    if (settings.showBalance) {
                                        values.push(`Rs. ${formatAmount(transaction.balance)}`);
                                    }

                                    return (
                                        <tr key={transaction._id || index}>
                                            {values.map((
                                                value,
                                                valueIndex
                                            ) => (
                                                <td key={valueIndex}>
                                                    {value}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {settings.footerText && (
                    <div className="accounts-print-preview-footer">
                        {settings.footerText}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="accounts-print-modal">
            <div className="accounts-print-overlay">
                <div className="accounts-print-container">
                    <div className="accounts-print-header">
                        <div>
                            <h2>
                                Print / PDF
                                Settings
                            </h2>

                            <span>{transactions.length}{" "}
                                filtered
                                transactions
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="accounts-print-close"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="accounts-print-tabs">
                        <button
                            type="button"
                            className={
                                activeTab === "customize"
                                    ? "active" 
                                    : ""
                            }
                            onClick={() =>
                                setActiveTab("customize")
                            }
                        >
                            Customize
                        </button>
                        <button
                            type="button"
                            className={
                                activeTab === "preview"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setActiveTab("preview")
                            }
                        >
                            Preview
                        </button>
                    </div>

                    <div className="accounts-print-content">
                        {activeTab === "customize" && (
                            <div className="accounts-print-customize">
                                <div className="accounts-print-section">
                                    <h3>
                                        Page
                                        Settings
                                    </h3>
                                    <div className="accounts-print-form-grid">
                                        <div>
                                            <label>
                                                Paper
                                                Size
                                            </label>

                                            <select
                                                value={settings.paperSize}
                                                onChange={(e) =>
                                                    updateSetting("paperSize",
                                                        e.target.value
                                                    )}
                                            >
                                                <option value="A4">A4</option>
                                                <option value="A5">A5</option>
                                                <option value="Letter">Letter</option>
                                                <option value="Legal">Legal</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label>Orientation</label>
                                            <select
                                                value={settings.orientation}
                                                onChange={(e) =>
                                                    updateSetting("orientation",
                                                        e.target.value
                                                    )}
                                            >
                                                <option value="landscape">Landscape</option>
                                                <option value="portrait">Portrait</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label>Margin</label>
                                            <select
                                                value={settings.margin}
                                                onChange={(e) =>
                                                    updateSetting("margin",
                                                        e.target.value
                                                    )}
                                            >
                                                <option value="small">Small</option>
                                                <option value="normal">Normal</option>
                                                <option value="large">Large</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label>
                                                Font
                                                Size
                                            </label>
                                            <select
                                                value={settings.fontSize}
                                                onChange={(e) =>
                                                    updateSetting("fontSize",
                                                        e.target.value
                                                    )}
                                            >
                                                <option value="small">Small</option>
                                                <option value="medium">Medium</option>
                                                <option value="large">Large</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="accounts-print-section">
                                    <h3>Report</h3>
                                    <div className="accounts-print-form-grid">
                                        <div className="full">
                                            <label>Title</label>
                                            <input
                                                type="text"
                                                value={settings.title}
                                                onChange={(e) =>
                                                    updateSetting("title",
                                                        e.target.value
                                                    )}
                                            />
                                        </div>
                                        <div className="full">
                                            <label>Subtitle</label>
                                            <input
                                                type="text"
                                                value={settings.subtitle}
                                                onChange={(e) =>
                                                    updateSetting("subtitle",
                                                        e.target.value
                                                    )}
                                                placeholder="Optional subtitle"
                                            />
                                        </div>
                                        <div className="full">
                                            <label>Footer</label>
                                            <input
                                                type="text"
                                                value={settings.footerText}
                                                onChange={(e) =>
                                                    updateSetting("footerText",
                                                        e.target.value
                                                    )}
                                                placeholder="Optional footer text"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="accounts-print-section">
                                    <h3>Show / Hide</h3>
                                    <div className="accounts-print-checkbox-grid">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.showGeneratedDate}
                                                onChange={(e) =>
                                                    updateSetting("showGeneratedDate",
                                                        e.target.checked
                                                    )}
                                            />
                                            Generated
                                            Date
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.showFilters}
                                                onChange={(e) =>
                                                    updateSetting("showFilters",
                                                        e.target.checked
                                                    )}
                                            />
                                            Applied
                                            Filters
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.showSummary}
                                                onChange={(e) =>
                                                    updateSetting("showSummary",
                                                        e.target.checked
                                                    )}
                                            />
                                            Summary
                                        </label>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={settings.showPageNumber}
                                                onChange={(e) =>
                                                    updateSetting("showPageNumber",
                                                        e.target.checked
                                                    )}
                                            />
                                            Page
                                            Number
                                        </label>
                                    </div>
                                </div>
                                <div className="accounts-print-section">
                                    <div className="accounts-print-columns-heading">
                                        <h3>Columns</h3>
                                        <div>
                                            <button
                                                type="button"
                                                onClick={selectAllColumns}
                                            >
                                                Select
                                                All
                                            </button>
                                            <button
                                                type="button"
                                                onClick={clearAllColumns}
                                            >
                                                Clear
                                                All
                                            </button>
                                        </div>
                                    </div>
                                    <div className="accounts-print-checkbox-grid">
                                        {COLUMNS.map(
                                            (column) => (
                                                <label key={column.key}>
                                                    <input
                                                        type="checkbox"
                                                        checked={settings[column.key]}
                                                        onChange={(e) =>
                                                            updateSetting(column.key,
                                                                e.target.checked
                                                            )}
                                                    />
                                                    {column.label}
                                                </label>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "preview" && (
                            <div className="accounts-print-preview-area">
                                {previewTable()}
                            </div>
                        )}
                    </div>

                    <div className="accounts-print-footer-actions">
                        <button
                            type="button"
                            onClick={resetSettings}
                            className="accounts-print-reset"
                        >
                            Reset Settings
                        </button>
                        <div>
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveTab("preview")
                                }
                                className="accounts-print-preview-btn"
                            >
                                Preview
                            </button>

                            <button
                                type="button"
                                onClick={handlePrint}
                                disabled={isPrinting}
                                className="accounts-print-action-btn"
                            >
                                {isPrinting ? "Printing..." : "🖨 Print"}
                            </button>

                            <button
                                type="button"
                                onClick={handlePdf}
                                disabled={isGeneratingPdf}
                                className="accounts-pdf-action-btn"
                            >
                                {isGeneratingPdf ? "Generating..." : "📄 PDF"}
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className="accounts-print-cancel-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}