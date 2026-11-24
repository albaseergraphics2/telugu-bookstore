
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

let globalImages = null;

export default function HeroCarousel() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").then(
      (bootstrap) => {
        const el = document.querySelector("#carouselExampleIndicators");

        if (el) {
          const existing =
            bootstrap.Carousel.getInstance(el);

          if (!existing) {
            new bootstrap.Carousel(el, {
              interval: 5000,
              ride: "carousel",
              pause: "hover",
              wrap: true,
              touch: true,
            });
          }
        }
      }
    );
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        if (globalImages) {
          setImages(globalImages);
          return;
        }

        const res = await fetch("/api/hero-carousel");
        const data = await res.json();

        const fallback = [
          "/images/1.png",
          "/images/2.jpeg",
          "/images/3.png",
        ];

        const finalImages =
          data.success && data.images?.length > 0
            ? data.images
            : fallback;

        globalImages = finalImages;
        setImages(finalImages);

      } catch {
        const fallback = [
          "/images/1.jpeg",
          "/images/2.jpeg",
          "/images/3.png",
        ];

        globalImages = fallback;
        setImages(fallback);
      }
    };

    fetchImages();
  }, []);

  return (
    <div
      id="carouselExampleIndicators"
      className="carousel slide hero-carousel"
    >

      {/* Indicators */}
      <div className="carousel-indicators">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to={i}
            className={i === 0 ? "active" : ""}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Images */}
      <div className="carousel-inner">
        {images.map((img, i) => (
          <div
            key={i}
            className={`carousel-item ${
              i === 0 ? "active" : ""
            }`}
          >
            <div className="hero-img">
              <Image
                src={
                  img.includes("cloudinary")
                    ? img.replace(
                        "/upload/",
                        "/upload/f_auto,q_auto,w_1400/"
                      )
                    : img
                }
                alt={`Telugu Islamic Book Store Banner ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                priority={i === 0}
                className="hero-image"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Previous */}
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="prev"
        aria-label="Previous slide"
      >
        <span className="carousel-control-prev-icon" />
      </button>

      {/* Next */}
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="next"
        aria-label="Next slide"
      >
        <span className="carousel-control-next-icon" />
      </button>

    </div>
  );
}
