import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { LEAD_EMAIL_SUBJECT, cleanOutreachName, outreachRecipient } from "@/lib/lead-outreach-email";
import { listOutreachSends } from "@/lib/outreach-log";

function denied() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return denied();
  const sends = await listOutreachSends();
  let template = "";
  try {
    template = await fs.readFile(path.join(process.cwd(), "public", "email", "template.html"), "utf8");
  } catch {
    template = "";
  }
  return NextResponse.json({ subject: LEAD_EMAIL_SUBJECT, sends, template });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return denied();

  const body = (await request.json().catch(() => null)) as { email?: unknown; name?: unknown } | null;
  if (!outreachRecipient(body?.email)) {
    return NextResponse.json({ error: "Bitte eine gültige E-Mail-Adresse eingeben." }, { status: 400 });
  }
  const rawName = typeof body?.name === "string" ? body.name : "";
  if (cleanOutreachName(rawName) === null) {
    return NextResponse.json({ error: "Der Name darf nur Buchstaben enthalten." }, { status: 400 });
  }

  return NextResponse.json(
    {
      error:
        "Lokal wird nicht zugestellt. Die Vorschau stimmt. Auf leiter.fr geht die Mail über den Server raus.",
    },
    { status: 503 }
  );
}
