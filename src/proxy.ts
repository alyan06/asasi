import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16: the old `middleware` convention is now `proxy` (runs on the
// Node.js runtime). This guards the /admin area — see updateSession().
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Only run on the admin area: the storefront is fully anonymous.
  matcher: ["/admin/:path*"],
};
