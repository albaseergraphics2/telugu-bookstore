"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

export default function Categories() {
  const [catalog, setCatalog] = useState([]);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch("/api/books");
        const data = await res.json();

        if (data.success) {
          const formattedCatalog = [
            ...new Map(
              data.books
                .filter((book) => book.category)
                .map((book) => {
                  const slug = book.category.toLowerCase().trim();

                  return [
                    slug,
                    {
                      name:
                        book.category.charAt(0).toUpperCase() +
                        book.category.slice(1),
                      teluguName:
                        book.teluguCategory || book.category,
                      slug,
                    },
                  ];
                })
            ).values(),
          ];

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
      <h2 className="cat-title">
        {language === "te" ? "పుస్తకాల విభాగాలు" : "Catalog"}
      </h2>

      <div className="cat-tabs">
        {catalog.map((cat) => (
          <Link
            href={`/category/${cat.slug}`}
            key={cat.slug}
            className="cat-tab"
          >
            {language === "te" ? cat.teluguName : cat.name}
          </Link>
        ))}

        <Link href="/books" className="cat-tab">
          {language === "te"
            ? "అన్ని పుస్తకాలు చూడండి"
            : "View All Books"}
        </Link>
      </div>
    </section>
  );
}
