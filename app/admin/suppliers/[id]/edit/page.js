"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditSupplier() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        companyName: "",
        supplierType: "",
        phone: "",
        alternatePhone: "",
        email: "",
        gstNumber: "",
        address: {
            full: "",
            area: "",
            district: "",
            state: "",
            pincode: "",
        },
    });

    const [totals, setTotals] = useState({
        totalPurchases: 0,
        totalPaid: 0,
        totalDue: 0,
    });

    useEffect(() => {
        if (params?.id) {
            fetchSupplier();
        }
    }, [params?.id]);

    const fetchSupplier = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetch(`/api/admin/suppliers/${params.id}`);
            const text = await res.text();
            let data = {};

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (error) {
                    console.error("Invalid JSON:", text);
                }
            }

            if (!res.ok || !data.success) {
                setError(data.message || "Failed to load supplier.");
                return;
            }

            const supplier = data.supplier;

            setFormData({
                name: supplier.name || "",
                companyName: supplier.companyName || "",
                supplierType: supplier.supplierType || "",
                phone: supplier.phone || "",
                alternatePhone: supplier.alternatePhone || "",
                email: supplier.email || "",
                gstNumber: supplier.gstNumber || "",
                address: {
                    full: supplier.address?.full || "",
                    area: supplier.address?.area || "",
                    district: supplier.address?.district || "",
                    state: supplier.address?.state || "",
                    pincode: supplier.address?.pincode || "",
                },
            });
            setTotals({
                totalPurchases: supplier.totalPurchases || 0,
                totalPaid: supplier.totalPaid || 0,
                totalDue: supplier.totalDue || 0,
            });
        } catch (error) {
            console.error("FETCH SUPPLIER ERROR:", error);
            setError("Something went wrong while loading supplier.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert("Supplier name is required.");
            return;
        }

        try {
            setSaving(true);
            const res = await fetch(`/api/admin/suppliers/${params.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    companyName: formData.companyName,
                    supplierType: formData.supplierType,
                    phone: formData.phone,
                    alternatePhone: formData.alternatePhone,
                    email: formData.email,
                    gstNumber: formData.gstNumber,
                    address: formData.address,
                }),
            });
            const text = await res.text();

            let data = {};
            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (error) {
                    console.error("Invalid JSON response:", text);
                }
            }
            if (!res.ok || !data.success) {
                alert(data.message || `Failed to update supplier. Status: ${res.status}`);
                return;
            }
            alert(data.message || "Supplier updated successfully.");
            router.push(`/admin/suppliers/${params.id}`);
            router.refresh();
        } catch (error) {
            console.error("UPDATE SUPPLIER ERROR:", error);
            alert("Something went wrong while updating supplier.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    textAlign: "center",
                    marginTop: "60px",
                }}
            >
                <div className="loader"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-supplier-edit">
                <div className="create-supplier-error">
                    {error}
                </div>

                <button
                    type="button"
                    onClick={() =>
                        router.push(`/admin/suppliers/${params.id}`)
                    }
                    className="create-supplier-back-btn"
                >
                    ← Back to Supplier
                </button>
            </div>
        );
    }

    return (
        <div className="admin-supplier-edit">
            <div className="supplier-edit-header">
                <div>
                    <h2>Edit Supplier</h2>
                    <p>Update supplier information</p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        router.push(`/admin/suppliers/${params.id}`)
                    }
                    className="create-supplier-back-btn"
                >
                    ← Back
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                className="supplier-edit-form"
            >
                <div className="supplier-edit-section">
                    <h3>Supplier Information</h3>
                    <div className="supplier-edit-grid">
                        <div className="supplier-edit-field">
                            <label>Supplier Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter supplier name"
                                required
                            />
                        </div>

                        <div className="supplier-edit-field">
                            <label>Company / Publisher Name</label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="Enter company or publisher name"
                            />
                        </div>

                        <div className="supplier-edit-field">
                            <label>Supplier Type</label>
                            <select
                                name="supplierType"
                                value={formData.supplierType}
                                onChange={handleChange}
                            >
                                <option value="">Select supplier type</option>
                                <option value="Publisher">Publisher</option>
                                <option value="Distributor">Distributor</option>
                                <option value="Wholesaler">Wholesaler</option>
                                <option value="Retailer">Retailer</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="supplier-edit-field">
                            <label>Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div className="supplier-edit-field">
                            <label>Alternate Phone</label>
                            <input
                                type="tel"
                                name="alternatePhone"
                                value={formData.alternatePhone}
                                onChange={handleChange}
                                placeholder="Enter alternate phone"
                            />
                        </div>

                        <div className="supplier-edit-field">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                            />
                        </div>

                        <div className="supplier-edit-field">
                            <label>GST Number</label>
                            <input
                                type="text"
                                name="gstNumber"
                                value={formData.gstNumber}
                                onChange={handleChange}
                                placeholder="Enter GST number"
                            />
                        </div>
                    </div>
                </div>

                <div className="supplier-edit-section">
                    <h3>Address</h3>
                    <div className="supplier-edit-grid">
                        <div className="supplier-edit-field supplier-edit-full">
                            <label>Address</label>
                            <textarea
                                name="full"
                                value={formData.address.full}
                                onChange={handleAddressChange}
                                placeholder="Enter full address"
                                rows={2}
                            />
                        </div>

                        <div className="supplier-edit-field">
                            <label>Area</label>
                            <input
                                type="text"
                                name="area"
                                value={formData.address.area}
                                onChange={handleAddressChange}
                                placeholder="Enter area"
                            />
                        </div>

                        <div className="supplier-edit-field">
                            <label>District</label>
                            <input
                                type="text"
                                name="district"
                                value={formData.address.district}
                                onChange={handleAddressChange}
                                placeholder="Enter district"
                            />
                        </div>

                        <div className="supplier-edit-field">
                            <label>State</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.address.state}
                                onChange={handleAddressChange}
                                placeholder="Enter state"
                            />
                        </div>

                        <div className="supplier-edit-field">
                            <label>Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.address.pincode}
                                onChange={handleAddressChange}
                                placeholder="Enter pincode"
                                maxLength={6}
                            />
                        </div>
                    </div>
                </div>

                <div className="supplier-edit-section supplier-edit-summary">
                    <h3>Purchase Summary</h3>
                    <div className="supplier-edit-summary-grid">
                        <div>
                            <span>Total Purchases</span>
                            <strong>₹{totals.totalPurchases}</strong>
                        </div>
                        <div>
                            <span>Total Paid</span>
                            <strong>₹{totals.totalPaid}</strong>
                        </div>
                        <div>
                            <span>Total Due</span>
                            <strong>₹{totals.totalDue}</strong>
                        </div>
                    </div>
                    <p>
                        Purchase totals are managed
                        automatically and cannot be
                        changed from this page.
                    </p>
                </div>

                <div className="supplier-edit-actions">
                    <button
                        type="button"
                        onClick={() =>
                            router.push(`/admin/suppliers/${params.id}`)
                        }
                        className="supplier-edit-cancel-btn"
                        disabled={saving}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="supplier-edit-save-btn"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}