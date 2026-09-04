"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const mobileDropdownRef = useRef(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpenMenu, setMobileOpenMenu] = useState(null);

  const menu = [
    { name: "Dashboard", path: "/admin" },
    {
      name: "Online Orders",
      children: [
        { name: "All Orders", path: "/admin/orders" },
        { name: "Customers", path: "/admin/users" },
      ],
    },
    {
      name: "Offline Orders",
      children: [
        { name: "Orders List", path: "/admin/offline/orders" },
        { name: "Create Order", path: "/admin/offline/orders/create" },
        { name: "Customers", path: "/admin/offline/customers" },
      ],
    },
    {
      name: "Suppliers",
      children: [
        { name: "Create Supplier", path: "/admin/suppliers/create" },
        { name: "Suppliers", path: "/admin/suppliers" },
      ],
    },
    { name: "Books", path: "/admin/books" },
    { name: "Accounts", path: "/admin/accounts" },
    { name: "HeroCarousel", path: "/admin/heroCarousel" },
    { name: "Payment Settings", path: "/admin/payment-settings" },
  ];

  const currentMenu =
    menu.find((item) => item.path === pathname)?.name ||
    menu
      .flatMap((item) => item.children || [])
      .find((child) => child.path === pathname)?.name ||
    "Dashboard";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
        setMobileOpenMenu(null);
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

      {/* MOBILE MENU */}
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
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              if (mobileMenuOpen) {
                setMobileOpenMenu(null);
              }
            }}
          >
            {currentMenu}
          </button>

          {mobileMenuOpen && (
            <ul className="dropdown-menu show admin-mobile-dropdown-options">

              {menu.map((item) => (

                <li key={item.path || item.name}>

                  {item.children ? (
                    <>

                      {/* PARENT MENU */}
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() =>
                          setMobileOpenMenu(
                            mobileOpenMenu === item.name
                              ? null
                              : item.name
                          )
                        }
                      >
                        {item.name}

                        <span style={{ float: "right" }}>
                          {mobileOpenMenu === item.name ? "▼" : "▶"}
                        </span>
                      </button>

                      {/* SUBMENU */}
                      <div
                        className={`mobile-users-submenu ${
                          mobileOpenMenu === item.name ? "open" : ""
                        }`}
                      >
                        {item.children.map((child) => (
                          <button
                            key={child.path}
                            type="button"
                            className={`dropdown-item-mobile dropdown-item ${
                              pathname === child.path ? "active" : ""
                            }`}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileOpenMenu(null);
                              router.push(child.path);
                            }}
                          >
                            {child.name}
                          </button>
                        ))}
                      </div>

                    </>
                  ) : (
                    <button
                      type="button"
                      className={`dropdown-item ${
                        pathname === item.path ? "active" : ""
                      }`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileOpenMenu(null);
                        router.push(item.path);
                      }}
                    >
                      {item.name}
                    </button>
                  )}

                </li>

              ))}

            </ul>
          )}

        </div>

      </div>


      {/* DESKTOP MENU */}
      {menu.map((item) =>
        item.children ? (
          <div
            key={item.name}
            className="admin-menu-group"
          >

            <button
              onClick={() =>
                setOpenMenu(
                  openMenu === item.name
                    ? null
                    : item.name
                )
              }
            >
              {item.name}

              <span>
                {openMenu === item.name ? "▼" : "▶"}
              </span>
            </button>

            <div
              className={`admin-submenu ${
                openMenu === item.name ? "open" : ""
              }`}
            >

              {item.children.map((child) => (
                <button
                  key={child.path}
                  className={
                    pathname === child.path
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    router.push(child.path)
                  }
                >
                  {child.name}
                </button>
              ))}

            </div>

          </div>
        ) : (
          <button
            key={item.path}
            className={
              pathname === item.path
                ? "active"
                : ""
            }
            onClick={() => {
              setOpenMenu(null);
              router.push(item.path);
            }}
          >
            {item.name}
          </button>
        )
      )}

    </div>
  );
}