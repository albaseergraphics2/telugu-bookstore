"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
export default function Sidebar() {

  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Books", path: "/admin/books" },
    { name: "Users", path: "/admin/users" },
    { name: "HeroCarousel", path: "/admin/heroCarousel" },
    { name: "Payment Settings", path: "/admin/payment-settings" },
  ];

  return (
    <div className="admin-sidebar">

      {/* MOBILE HEADER */}
      <div className="admin-mobile-header">

        <h3 className="adminhead">
          Admin
        </h3>

        <div className="admin-mobile-dropdown">

          <button
            className="admin-mobile-dropdown-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span>
              {menu.find((item) => item.path === pathname)?.name || "Dashboard"}
            </span>

            <span className="admin-dropdown-arrow">
              ▼
            </span>
          </button>

          {mobileMenuOpen && (
            <div className="admin-mobile-dropdown-options">

              {menu.map((item) => (
                <button
                  key={item.path}
                  className={
                    pathname === item.path
                      ? "selected"
                      : ""
                  }
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push(item.path);
                  }}
                >
                  {item.name}
                </button>
              ))}

            </div>
          )}

        </div>

      </div>


      {/* DESKTOP MENU */}
      {menu.map((item) => (
        <button
          key={item.path}
          className={pathname === item.path ? "active" : ""}
          onClick={() => router.push(item.path)}
        >
          {item.name}
        </button>
      ))}

    </div>
  );
}