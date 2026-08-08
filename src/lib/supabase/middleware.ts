import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 400,
      path: "/",
      sameSite: "lax",
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            maxAge: 60 * 60 * 24 * 400,
          }),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Capture membership referral codes from ?ref=BF-YYYY-…
  const ref = request.nextUrl.searchParams.get("ref")?.trim().toUpperCase();
  if (ref && /^BF-\d{4}-\d+$/i.test(ref)) {
    supabaseResponse.cookies.set("bf_ref", ref, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/auth/");
  // Do NOT use startsWith("/member") — that also matches "/membership".
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname === "/member" ||
    pathname.startsWith("/member/");

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && pathname === "/login") {
    const next = request.nextUrl.searchParams.get("next");
    const redirectUrl = request.nextUrl.clone();
    // Never bounce membership join back through a protected-only path check.
    const safeNext =
      next &&
      next.startsWith("/") &&
      !next.startsWith("//") &&
      next !== "/login"
        ? next
        : "/member";
    redirectUrl.pathname = safeNext;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute && pathname !== "/login") {
    return supabaseResponse;
  }

  return supabaseResponse;
}
