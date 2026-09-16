import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { subscribersToCsv } from "@/lib/newsletter";
import { listNewsletterSubscribers } from "@/lib/newsletter-store";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subscribers = await listNewsletterSubscribers();
  if (request.nextUrl.searchParams.get("format") === "csv") {
    return new NextResponse(subscribersToCsv(subscribers), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="leiter-newsletter.csv"',
      },
    });
  }
  return NextResponse.json({ subscribers });
}
