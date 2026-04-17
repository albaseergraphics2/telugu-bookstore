"use client";

import { useEffect, useState } from "react";
import { uploadToCloudinary } from "../../lib/cloudinary";

export default function HeroCarouselAdmin() {

  const [images, setImages] = useState([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const res = await fetch("/api/hero-carousel");
    const data = await res.json();
    if (data.success) setImages(data.images || []);
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => (img.src = e.target.result);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    let urls = [];

    for (let file of files) {
      const compressed = await compressImage(file);
      const url = await uploadToCloudinary(compressed);
      urls.push(url);
    }

    const updated = [...images, ...urls];
    setImages(updated);

    await fetch("/api/hero-carousel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ images: updated }),
    });
  };

  const deleteImage = async (imgUrl) => {
    try {
      await fetch("/api/delete-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: imgUrl }),
      });

      const updated = images.filter((img) => img !== imgUrl);
      setImages(updated);

      await fetch("/api/hero-carousel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ images: updated }),
      });

    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 NEW FUNCTIONS
  const moveLeft = async (index) => {
    if (index === 0) return;

    const updated = [...images];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];

    setImages(updated);

    await fetch("/api/hero-carousel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ images: updated }),
    });
  };

  const moveRight = async (index) => {
    if (index === images.length - 1) return;

    const updated = [...images];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];

    setImages(updated);

    await fetch("/api/hero-carousel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ images: updated }),
    });
  };

  return (
    <div className="admin-hero">
      <h2>Hero Carousel</h2>
      <input type="file" multiple onChange={handleUpload} />

      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "20px" }}>
        {images.map((img, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              width: "200px",
              height: "150px",
            }}
          >
            <img
              src={img}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />

            {/* DELETE BUTTON */}
            <button
              className="crossmark"
              onClick={() => {
                setSelectedImage(img);
                setShowDeletePopup(true);
              }}
            >
              ×
            </button>

            {/* MOVE LEFT */}
            <button
              onClick={() => moveLeft(i)}
              style={{
                position: "absolute",
                bottom: "5px",
                left: "5px",
                background: "#000",
                color: "#fff",
                border: "none",
                padding: "1px 1px",
                cursor: "pointer"
              }}
            >
              ⬅️
            </button>

            {/* MOVE RIGHT */}
            <button
              onClick={() => moveRight(i)}
              style={{
                position: "absolute",
                bottom: "5px",
                right: "5px",
                background: "#000",
                color: "#fff",
                border: "none",
                padding: "1px 1px",
                cursor: "pointer"
              }}
            >
              ➡️
            </button>

          </div>
        ))}
      </div>

      {showDeletePopup && (
        <div
          className="popup-overlay"
          onClick={() => setShowDeletePopup(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            className="popup-box"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "300px",
              textAlign: "center",
            }}
          >
            <h3>Delete Image</h3>
            <p>Are you sure you want to delete this image?</p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
              <button
                onClick={() => {
                  deleteImage(selectedImage);
                  setShowDeletePopup(false);
                }}
                style={{
                  background: "red",
                  color: "#fff",
                  padding: "8px 15px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Yes, Delete
              </button>

              <button
                onClick={() => setShowDeletePopup(false)}
                style={{
                  background: "gray",
                  color: "#fff",
                  padding: "8px 15px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}