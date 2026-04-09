"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

let globalImages = null;

export default function HeroCarousel() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js").then((bootstrap) => {
      const el = document.querySelector("#carouselExampleIndicators");

      if (el) {
        new bootstrap.Carousel(el, {
          interval: 4000,
          ride: "carousel",
          pause: false,
          wrap: true,
          touch: true,
        });
      }
    });
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
    <div id="carouselExampleIndicators" className="carousel slide">

      <div className="carousel-indicators">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide-to={i}
            className={i === 0 ? "active" : ""}
          />
        ))}
      </div>

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
                    ? img.replace(
                        "/upload/",
                        "/upload/f_auto,q_auto,w_1200/"
                      )
                    : img
                }
                alt={`slide-${i}`}
                fill
                sizes="(max-width: 768px) 100vw, 1200px" // 🔥 better than 100vw
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                className="hero-image"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon"></span>
      </button>

      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleIndicators"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon"></span>
      </button>

    </div>
  );
}