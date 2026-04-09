"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function HeroCarousel() {

  const [images, setImages] = useState([]);

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").then((bootstrap) => {
      const carouselElement = document.querySelector("#carouselExampleIndicators");

      if (carouselElement) {
        new bootstrap.Carousel(carouselElement, {
          interval: 4000,
          ride: "carousel",
          pause: false,
          wrap: true,
          touch: true
        });
      }
    });
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch("/api/hero-carousel");
        const data = await res.json();

        if (data.success && data.images?.length > 0) {
          setImages(data.images);
        } else {
          setImages([
            "/images/1.jpeg",
            "/images/2.jpeg",
            "/images/3.png",
          ]);
        }
      } catch {
        setImages([
          "/images/1.jpeg",
          "/images/2.jpeg",
          "/images/3.png",
        ]);
      }
    };

    fetchImages();
  }, []);

  return (
    <div id="carouselExampleIndicators" className="carousel slide">

      {/* indicators */}
      <div className="carousel-indicators">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to={i}
            className={i === 0 ? "active" : ""}
          ></button>
        ))}
      </div>

      {/* slides */}
      <div className="carousel-inner">
        {images.map((img, i) => (
          <div
            key={i}
            className={`carousel-item ${i === 0 ? "active" : ""}`}
          >
            <div className="hero-img">
              <Image
                src={
                  img.includes("cloudinary")
                    ? img.replace("/upload/", "/upload/q_auto,f_auto/")
                    : img
                }
                alt={`slide-${i}`}
                fill
                priority={i === 0}
                className="hero-image"
              />
            </div>
          </div>
        ))}
      </div>

      {/* controls */}
      <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
        <span className="carousel-control-prev-icon"></span>
      </button>

      <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
        <span className="carousel-control-next-icon"></span>
      </button>

    </div>
  );
}