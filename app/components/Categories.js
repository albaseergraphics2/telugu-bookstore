"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Categories() {
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();

        if (data.success) {
          const categories = [
            ...new Set(
              data.books
                .map((b) => b.category?.toLowerCase().trim())
                .filter(Boolean)
            ),
          ];

          const formattedCatalog = categories.map((cat) => ({
            name: cat.charAt(0).toUpperCase() + cat.slice(1),
            slug: cat,
          }));

          setCatalog(formattedCatalog);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchCatalog();
  }, []);

  return (
    <section className="categories">
      <h2 className="cat-title">Catalog</h2>

      <div className="cat-tabs">
        {catalog.map((cat) => (
          <Link
            href={`/category/${cat.slug}`}
            key={cat.slug}
            className="cat-tab"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}