"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [phoneLocked, setPhoneLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ New states
  const [pincode, setPincode] = useState("");
  const [area, setArea] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      router.replace("/");
      return;
    }

    setUser(storedUser);
    setPhone(storedUser.phone || "");

    // ✅ Handle old + new address
    if (storedUser.address && typeof storedUser.address === "object") {
      setAddress(storedUser.address.full || "");
      setPincode(storedUser.address.pincode || "");
      setArea(storedUser.address.area || "");
      setDistrict(storedUser.address.district || "");
      setStateName(storedUser.address.state || "");
    } else {
      setAddress(storedUser.address || "");
    }

    if (storedUser.phone) {
      setPhoneLocked(true);
    }

    setLoading(false);
  }, [router]);

  // ✅ Fetch address from pincode
  const getAddressFromPincode = async (pin) => {
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();

      if (data[0].Status === "Success") {
        const post = data[0].PostOffice[0];

        setArea(post.Name);
        setDistrict(post.District);
        setStateName(post.State);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSave = async () => {
    if (!phone.trim()) {
      alert("Phone number is required");
      return;
    }

    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user._id,
          phone,
          address: {
            full: address,
            pincode,
            area,
            district,
            state: stateName,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setPhone(data.user.phone || "");

        if (typeof data.user.address === "object") {
          setAddress(data.user.address.full || "");
          setPincode(data.user.address.pincode || "");
          setArea(data.user.address.area || "");
          setDistrict(data.user.address.district || "");
          setStateName(data.user.address.state || "");
        }

        setPhoneLocked(true);
        alert("Profile updated ✅");
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      <div className="profile-card">
        <div className="profile-row">
          <span>Name</span>
          <p>{user.name}</p>
        </div>

        <div className="profile-row">
          <span>Username</span>
          <p>@{user.username}</p>
        </div>

        <div className="profile-row">
          <span>Email</span>
          <p>{user.email || "-"}</p>
        </div>

        <div className="profile-row">
          <span>Phone</span>
          {phoneLocked ? (
            <p>{phone}</p>
          ) : (
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          )}
        </div>
        {/* ✅ FULL ADDRESS */}
        <div className="profile-row">
          <span>Address</span>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* ✅ PINCODE */}
        <div className="profile-row">
          <span>Pincode</span>
          <input
            type="text"
            value={pincode}
            onChange={(e) => {
              const val = e.target.value;
              setPincode(val);

              if (val.length === 6) {
                getAddressFromPincode(val);
              }
            }}
            placeholder="Enter pincode"
          />
        </div>

{/* ✅ AREA */}
<div className="profile-row">
  <span>Area</span>
  <p>{area || "-"}</p>
</div>

{/* ✅ DISTRICT */}
<div className="profile-row">
  <span>District</span>
  <p>{district || "-"}</p>
</div>

{/* ✅ STATE */}
<div className="profile-row">
  <span>State</span>
  <p>{stateName || "-"}</p>
</div>

        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}