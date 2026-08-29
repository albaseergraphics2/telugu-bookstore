"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSupplier() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        companyName: "",
        phone: "",
        alternatePhone: "",
        email: "",
        gstNumber: "",
        supplierType: "",
        address: "",
        area: "",
        district: "",
        state: "",
        pincode: "",
        paymentTerms: "",
        openingBalance: "",
        notes: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.name.trim()) {
            setError("Supplier Name is required.");
            return;
        }

        if (!formData.companyName.trim()) {
            setError("Company / Publisher Name is required.");
            return;
        }

        if (!formData.phone.trim()) {
            setError("Phone is required.");
            return;
        }

        if (!formData.supplierType) {
            setError("Supplier Type is required.");
            return;
        }


        try {
            setLoading(true);

            const res = await fetch("/api/admin/suppliers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    openingBalance: Number(formData.openingBalance) || 0,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(
                    data.message || "Failed to create supplier."
                );
                return;
            }

            router.push("/admin/suppliers");
        } catch (error) {
            console.error(error);
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-create-supplier">

            {/* HEADER */}

            <div className="create-supplier-header">

                <h2>
                    Create New Supplier
                </h2>

                <button
                    type="button"
                    onClick={() =>
                        router.push("/admin/suppliers")
                    }
                    className="create-supplier-back-btn"
                >
                    Back
                </button>

            </div>


            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="create-supplier-form"
            >

                {/* SUPPLIER DETAILS */}

                <h3>
                    Supplier Details
                </h3>


                {/* SUPPLIER NAME */}

                <div className="create-supplier-field">

                    <label>
                        Supplier Name
                    </label>

                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter supplier name"
                    />

                </div>


                {/* COMPANY */}

                <div className="create-supplier-field">

                    <label>
                        Company / Publisher Name
                    </label>

                    <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Enter company or publisher name"
                    />

                </div>


                {/* SUPPLIER TYPE */}

                <div className="create-supplier-field">

                    <label>
                        Supplier Type
                    </label>

                    <select
                        name="supplierType"
                        value={formData.supplierType}
                        onChange={handleChange}
                    >
                        <option value="">
                            Select Supplier Type
                        </option>

                        <option value="Publisher">
                            Publisher
                        </option>

                        <option value="Distributor">
                            Distributor
                        </option>

                        <option value="Wholesaler">
                            Wholesaler
                        </option>

                        <option value="Other">
                            Other
                        </option>
                    </select>

                </div>


                {/* PHONE */}

                <div className="create-supplier-field">

                    <label>
                        Phone
                    </label>

                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                    />

                </div>


                {/* ALTERNATE PHONE */}

                <div className="create-supplier-field">

                    <label>
                        Alternate Phone
                    </label>

                    <input
                        type="tel"
                        name="alternatePhone"
                        value={formData.alternatePhone}
                        onChange={handleChange}
                        placeholder="Enter alternate phone number"
                    />

                </div>


                {/* EMAIL */}

                <div className="create-supplier-field">

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email"
                    />

                </div>


                {/* GST */}

                <div className="create-supplier-field">

                    <label>
                        GST Number
                    </label>

                    <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        placeholder="Enter GST number"
                    />

                </div>


                {/* ADDRESS */}

                <h3>
                    Address
                </h3>


                {/* FULL ADDRESS */}

                <div className="create-supplier-field">

                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter full address"
                        rows="3"
                    />

                </div>


                {/* AREA */}

                <div className="create-supplier-field">

                    <label>
                        Area
                    </label>

                    <input
                        type="text"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        placeholder="Enter area"
                    />

                </div>


                {/* DISTRICT */}

                <div className="create-supplier-field">

                    <label>
                        District
                    </label>

                    <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        placeholder="Enter district"
                    />

                </div>


                {/* STATE */}

                <div className="create-supplier-field">

                    <label>
                        State
                    </label>

                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                    />

                </div>


                {/* PINCODE */}

                <div className="create-supplier-field">

                    <label>
                        Pincode
                    </label>

                    <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="Enter pincode"
                    />

                </div>


                {/* PAYMENT */}

                <h3>
                    Payment Details
                </h3>


                {/* PAYMENT TERMS */}

                {/* <div className="create-supplier-field">

                    <label>
                        Payment Terms *
                    </label>

                    <select
                        name="paymentTerms"
                        value={formData.paymentTerms}
                        onChange={handleChange}
                    >

                        <option value="">
                            Select Payment Terms
                        </option>

                        <option value="Immediate">
                            Immediate
                        </option>

                        <option value="15 Days">
                            15 Days
                        </option>

                        <option value="30 Days">
                            30 Days
                        </option>

                        <option value="45 Days">
                            45 Days
                        </option>

                        <option value="60 Days">
                            60 Days
                        </option>

                    </select>

                </div> */}


                {/* OPENING BALANCE */}

                <div className="create-supplier-field">

                    <label>
                        Opening Balance
                    </label>

                    <input
                        type="number"
                        name="openingBalance"
                        value={formData.openingBalance}
                        onChange={handleChange}
                        placeholder="Enter opening balance"
                        min="0"
                    />

                </div>


                {/* NOTES */}

                <div className="create-supplier-field">

                    <label>
                        Notes
                    </label>

                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Enter notes"
                        rows="3"
                    />

                </div>


                {/* ERROR */}

                {error && (
                    <div className="create-supplier-error">
                        {error}
                    </div>
                )}


                {/* ACTIONS */}

                <div className="create-supplier-actions">

                    <button
                        type="button"
                        onClick={() =>
                            router.push("/admin/suppliers")
                        }
                        className="create-supplier-cancel-btn"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="create-supplier-save-btn"
                    >
                        {loading
                            ? "Saving..."
                            : "Save Supplier"}
                    </button>

                </div>

            </form>

        </div>
    );
}