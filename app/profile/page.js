"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function ProfilePage() {
  const router = useRouter();

  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );
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
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    if (user) {
      setPhone(user.phone || "");

      if (user.address && typeof user.address === "object") {
        setAddress(user.address.full || "");
        setPincode(user.address.pincode || "");
        setArea(user.address.area || "");
        setDistrict(user.address.district || "");
        setStateName(user.address.state || "");
      } else {
        setAddress(user.address || "");
      }

      setPhoneLocked(!!user.phone);
      setLoading(false);
    }
  }, [user, isAuthenticated, router]);

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
        setPhone(data.user.phone || "");

        if (typeof data.user.address === "object") {
          setAddress(data.user.address.full || "");
          setPincode(data.user.address.pincode || "");
          setArea(data.user.address.area || "");
          setDistrict(data.user.address.district || "");
          setStateName(data.user.address.state || "");
        }

        setPhoneLocked(true);
        dispatch(loadUser());
        alert("Profile updated");
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