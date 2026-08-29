"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Sidebar() {

  const router = useRouter();
  const pathname = usePathname();
  const mobileDropdownRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [mobileUsersOpen, setMobileUsersOpen] = useState(false);

  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Books", path: "/admin/books" },
    {
      name: "Users",
      children: [
        { name: "Customers", path: "/admin/users" },
        { name: "Suppliers", path: "/admin/suppliers" },
      ],
    },
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

      {/* MOBILE menu */}
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

                <li key={item.path || item.name}>

                  {item.children ? (
                    <>
                      {/* USERS */}
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() =>
                          setMobileUsersOpen(!mobileUsersOpen)
                        }
                      >
                        {item.name}

                        <span style={{ float: "right" }}>
                          {mobileUsersOpen ? "▼" : "▶"}
                        </span>
                      </button>

                      {/* USERS SUBMENU */}
                      <div
                        className={`mobile-users-submenu ${mobileUsersOpen ? "open" : ""
                          }`}
                      >
                        {item.children.map((child) => (
                          <button
                            key={child.path}
                            type="button"
                            className={`dropdown-item-mobile dropdown-item ${pathname === child.path ? "active" : ""
                              }`}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setMobileUsersOpen(false);
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
                      className={`dropdown-item ${pathname === item.path ? "active" : ""
                        }`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileUsersOpen(false);
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
          <div key={item.name} className="admin-menu-group">

            <button
              onClick={() => setUsersOpen(!usersOpen)}
            >
              {item.name}
              <span>{usersOpen ? "▼" : "▶"}</span>
            </button>

            <div className={`admin-submenu ${usersOpen ? "open" : ""}`}>

              {item.children.map((child) => (
                <button
                  key={child.path}
                  className={pathname === child.path ? "active" : ""}
                  onClick={() => router.push(child.path)}
                >
                  {child.name}
                </button>
              ))}

            </div>

          </div>
        ) : (
          <button
            key={item.path}
            className={pathname === item.path ? "active" : ""}
            onClick={() => {
              setUsersOpen(false);
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