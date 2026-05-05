import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;

  let user = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = decoded;
    } catch {
      user = null;
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/orders")) {
    if (!user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/orders/:path*"],
};