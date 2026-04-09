"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Sidebar() {

  const router = useRouter();
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Books", path: "/admin/books" },
    { name: "Users", path: "/admin/users" },
    { name: "HeroCarousel", path: "/admin/heroCarousel" },
  ];

  return (
    <div className="admin-sidebar">
      <h3 className="adminhead">Admin</h3>

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