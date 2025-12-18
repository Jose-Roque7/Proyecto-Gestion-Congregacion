import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import serverApi from "./app/lib/serverApi";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const url = request.nextUrl.clone();

  const protectedRoutes = ["/dashboard" , "/members"];
  const isLoginPage = url.pathname === "/";

  // Caso 1: Sin token y ruta protegida → redirigir a login
  if (!token && protectedRoutes.some(path => url.pathname.startsWith(path))) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Caso 2: Con token
  if (token) {
    try {
      // Verificar token con backend, enviando token en Authorization
      await serverApi.get("/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Si está en login con token válido → redirige a dashboard
      if (isLoginPage) {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }

      // Si está en ruta protegida o pública, permite continuar
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/", request.url), {
        headers: {
          'Set-Cookie': `auth_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
        }
      });
    }
  }

  // Caso 3: Sin token y ruta pública → continuar
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/members/:path*", "/"],
};
