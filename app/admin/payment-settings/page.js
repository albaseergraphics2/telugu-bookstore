"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "../../lib/cloudinary";
import useRealtime from "../../hooks/useRealtime";

export default function PaymentSettingsPage() {
  const [defaultShipping, setDefaultShipping] = useState("");
  const [freeShippingAmount, setFreeShippingAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    defaultShipping: 100,
    freeShippingAmount: 1000,
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    branch: "",
    qrCode: "",
    mobileNumbers: [""],
    upiAccounts: [
      {
        upiId: "",
        mobile: "",
      },
    ],
    codEnabled: true,
    bankTransferEnabled: true,
    onlinePaymentEnabled: false,
  });

  const saveSettings = async () => {
    try {
      setSaving(true);

      const payload = {
        ...form,
        defaultShipping: Number(defaultShipping),
        freeShippingAmount: Number(freeShippingAmount),
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Settings saved successfully");
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();

      if (data.success) {
        setDefaultShipping(data.setting.defaultShipping ?? "");
        setFreeShippingAmount(data.setting.freeShippingAmount ?? "");

        setForm({
          ...data.setting,
          mobileNumbers:
            data.setting.mobileNumbers?.length
              ? data.setting.mobileNumbers
              : [""],
          upiAccounts:
            data.setting.upiAccounts?.length
              ? data.setting.upiAccounts
              : [{ upiId: "", mobile: "" }],
        });
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useRealtime(fetchSettings);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQrUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;
    try {
      toast.loading("Uploading...", { id: "upload" });
      const url = await uploadToCloudinary(file);
      setForm((prev) => ({
        ...prev,
        qrCode: url,
      }));
      toast.success("QR uploaded", { id: "upload" });
    } catch {
      toast.error("Upload failed", { id: "upload" });
    }
  };

  const saveShippingCharge = async () => {
    if (!defaultShipping) {
      toast.error("Please enter shipping charge");
      return;
    }
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          defaultShipping: Number(defaultShipping),
          freeShippingAmount: Number(freeShippingAmount),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setDefaultShipping(data.setting.defaultShipping ?? "");
        setFreeShippingAmount(data.setting.freeShippingAmount ?? "");
        toast.success("Shipping charge saved successfully");
      } else {
        toast.error(data.message || "Failed to save shipping charge");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const clearShippingCharge = () => {
    setDefaultShipping("");
    setFreeShippingAmount("");
    toast.success("Input cleared");
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="payment-settings">
      <h2>Shipping Charges</h2>
      <div className="shipping-section">
        <label>Default Shipping Charge (Rs.)</label>

        <input
          type="number"
          className="shipping-input"
          placeholder="Enter Charges"
          value={defaultShipping}
          onChange={(e) => setDefaultShipping(e.target.value)}
        />

        <label style={{ marginTop: "10px" }}>
          Free Shipping Above (Rs.)
        </label>

        <input
          type="number"
          className="shipping-input"
          placeholder="Enter Order Amount"
          value={freeShippingAmount}
          onChange={(e) => setFreeShippingAmount(e.target.value)}
        />

        <div className="shipping-btns">
          <button className="save-btn" onClick={saveShippingCharge}>
            Save
          </button>

          <button className="clear-btn" onClick={clearShippingCharge}>
            Clear
          </button>
        </div>
      </div>

      <h2>Bank Details</h2>
      <div className="payment-grid">
        <div className="payment-item">
          <label>Account Holder</label>
          <input
            name="accountHolder"
            value={form.accountHolder ?? ""}
            onChange={handleChange}
          />
        </div>
        <div className="payment-item">
          <label>Bank Name</label>
          <input
            name="bankName"
            value={form.bankName}
            onChange={handleChange}
          />
        </div>
        <div className="payment-item">
          <label>Account Number</label>
          <input
            name="accountNumber"
            value={form.accountNumber}
            onChange={handleChange}
          />
        </div>
        <div className="payment-item">
          <label>IFSC Code</label>
          <input
            name="ifscCode"
            value={form.ifscCode}
            onChange={handleChange}
          />
        </div>
        <div className="payment-item">
          <label>Branch</label>
          <input
            name="branch"
            value={form.branch}
            onChange={handleChange}
          />
        </div>
        <div className="payment-item">
          <label>QR Code</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleQrUpload}
          />
        </div>
        <div className="payment-item">
          <label>QR Preview</label>

          {form.qrCode && (
            <img src={form.qrCode} alt="QR" />
          )}
        </div>
      </div>

      <h3>Mobile Numbers</h3>

      {form.mobileNumbers.map((num, i) => (
        <div className="upi-item" key={i}>

          <input
            value={num}
            placeholder={`Mobile ${i + 1}`}
            onChange={(e) => {
              const arr = [...form.mobileNumbers];
              arr[i] = e.target.value;

              setForm(prev => ({
                ...prev,
                mobileNumbers: arr,
              }));
            }}
          />
        </div>
      ))}

      <button
        className="add-btn"
        onClick={() =>
          setForm(prev => ({
            ...prev,
            mobileNumbers: [...prev.mobileNumbers, ""],
          }))
        }
      >
        + Add Mobile
      </button>

      <h3>UPI Accounts</h3>
      {form.upiAccounts.map((upi, i) => (
        <div className="upi-item" key={i}>

          <input
            value={upi.upiId}
            placeholder="UPI ID"
            onChange={(e) => {
              const arr = [...form.upiAccounts];
              arr[i].upiId = e.target.value;

              setForm(prev => ({
                ...prev,
                upiAccounts: arr,
              }));
            }}
          />

          <input
            value={upi.mobile}
            placeholder="Mobile"
            onChange={(e) => {
              const arr = [...form.upiAccounts];
              arr[i].mobile = e.target.value;
              setForm(prev => ({
                ...prev,
                upiAccounts: arr,
              }));
            }}
          />
        </div>
      ))}

      <button
        className="add-btn"
        onClick={() =>
          setForm(prev => ({
            ...prev,
            upiAccounts: [
              ...prev.upiAccounts,
              {
                upiId: "",
                mobile: "",
              },
            ],
          }))
        }
      >
        + Add UPI
      </button>

      <h3>Payment Methods</h3>
      <div className="checkbox-group">

        <label>
          <input
            type="checkbox"
            name="codEnabled"
            checked={form.codEnabled}
            onChange={handleChange}
          />
          Cash On Delivery
        </label>

        <label>
          <input
            type="checkbox"
            name="bankTransferEnabled"
            checked={form.bankTransferEnabled}
            onChange={handleChange}
          />
          Bank Transfer
        </label>

        <label>
          <input
            type="checkbox"
            name="onlinePaymentEnabled"
            checked={form.onlinePaymentEnabled}
            onChange={handleChange}
          />
          Online Payment
        </label>

      </div>

      <button
        className="save-btn"
        onClick={saveSettings}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>

    </div>
  );
}