import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

function headerValue(request: NextRequest, name: string): string {
  return request.headers.get(name)?.trim() ?? "";
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length === 0 || b.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function expectedAdminCredentials(): { user: string; password: string } | null {
  const user = process.env.ADMIN_USER?.trim() ?? "";
  const password =
    process.env.ADMIN_PASSWORD?.trim() || process.env.ADMIN_TOKEN?.trim() || "";
  if (!user || !password) return null;
  return { user, password };
}

export function isAdminRequest(request: NextRequest): boolean {
  const expected = expectedAdminCredentials();
  if (!expected) return false;
  const user = headerValue(request, "x-admin-user");
  const password = headerValue(request, "x-admin-password");
  return safeEqual(user, expected.user) && safeEqual(password, expected.password);
}
