"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Sidebar() {

  const router = useRouter();
  const pathname = usePathname();
  const mobileDropdownRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Books", path: "/admin/books" },
    { name: "Users", path: "/admin/users" },
    { name: "HeroCarousel", path: "/admin/heroCarousel" },
    { name: "Payment Settings", path: "/admin/payment-settings" },
  ];

  const currentMenu =
    menu.find((item) => item.path === pathname)?.name || "Dashboard";
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  return (
    <div className="admin-sidebar">

      {/* MOBILE HEADER */}
      <div className="admin-mobile-header">

        <div className="admintext">
          <h3 className="adminhead">
            Admin
          </h3>
        </div>

        <div
          className="dropdown admin-mobile-dropdown"
          ref={mobileDropdownRef}
        >

          <button
            type="button"
            className="btn btn-light dropdown-toggle admin-mobile-dropdown-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {currentMenu}
          </button>

          {mobileMenuOpen && (
            <ul className="dropdown-menu show admin-mobile-dropdown-options">

              {menu.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    className={`dropdown-item ${pathname === item.path ? "active" : ""
                      }`}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push(item.path);
                    }}
                  >
                    {item.name}
                  </button>
                </li>
              ))}

            </ul>
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