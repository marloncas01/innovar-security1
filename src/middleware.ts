import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAdminRoute = pathname.startsWith("/admin");
  const isApiAdminRoute = pathname.startsWith("/api/admin");
  const isClientRoute =
    pathname.startsWith("/citas") ||
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/notificaciones");
  const isApiClientRoute =
    pathname.startsWith("/api/citas") ||
    pathname.startsWith("/api/clientes") ||
    pathname.startsWith("/api/notifications");

  if (isAdminRoute || isApiAdminRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isClientRoute || isApiClientRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/citas/:path*",
    "/citas/:path*/:path*",
    "/perfil/:path*",
    "/notificaciones/:path*",
    "/api/citas/:path*",
    "/api/client/:path*",
    "/api/notifications/:path*",
    "/api/photos/:path*",
    "/api/content/:path*",
    "/api/faq",
    "/api/chatbot",
  ],
};
