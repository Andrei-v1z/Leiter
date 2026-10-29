import { cleanOutreachName, outreachRecipient } from "@/lib/lead-outreach-email";

export type CsvRecipient = {
  line: number;
  email: string;
  name: string;
  problem: string;
};

const EMAIL_HEADERS = new Set(["email", "e-mail", "mail", "adresse"]);
const NAME_HEADERS = new Set(["name", "vorname", "ansprechpartner", "kontakt"]);
const LAST_NAME_HEADERS = new Set(["nachname"]);

function stripBom(value: string): string {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
}

function splitRow(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function delimiterOf(line: string): string {
  const commas = line.split(",").length;
  const semicolons = line.split(";").length;
  return semicolons > commas ? ";" : ",";
}

function headerKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function parseOutreachCsv(raw: string): CsvRecipient[] {
  const lines = stripBom(raw).split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return [];
  const delimiter = delimiterOf(lines[0]);
  const rows = lines.map((line) => splitRow(line, delimiter));
  const header = rows[0].map(headerKey);
  const emailIndex = header.findIndex((cell) => EMAIL_HEADERS.has(cell));
  const nameIndex = header.findIndex((cell) => NAME_HEADERS.has(cell));
  const lastNameIndex = header.findIndex((cell) => LAST_NAME_HEADERS.has(cell));
  const hasHeader = emailIndex >= 0;
  const data = hasHeader ? rows.slice(1) : rows;
  const seen = new Set<string>();
  const recipients: CsvRecipient[] = [];

  data.forEach((cells, index) => {
    const line = hasHeader ? index + 2 : index + 1;
    let emailCell = "";
    let nameCell = "";
    if (hasHeader) {
      emailCell = cells[emailIndex] ?? "";
      const first = nameIndex >= 0 ? cells[nameIndex] ?? "" : "";
      const last = lastNameIndex >= 0 ? cells[lastNameIndex] ?? "" : "";
      nameCell = [first, last].filter(Boolean).join(" ");
    } else if (cells.length === 1) {
      emailCell = cells[0] ?? "";
    } else if (outreachRecipient(cells[0])) {
      emailCell = cells[0] ?? "";
      nameCell = cells[1] ?? "";
    } else {
      nameCell = cells[0] ?? "";
      emailCell = cells[1] ?? "";
    }

    const email = outreachRecipient(emailCell);
    if (!email) {
      recipients.push({ line, email: emailCell, name: nameCell, problem: "Keine gültige E-Mail" });
      return;
    }
    if (seen.has(email)) {
      recipients.push({ line, email, name: nameCell, problem: "Doppelt" });
      return;
    }
    seen.add(email);
    const cleaned = cleanOutreachName(nameCell);
    if (cleaned === null) {
      recipients.push({
        line,
        email,
        name: nameCell,
        problem: "Name enthält Zeichen, die nicht in die Anrede dürfen. Die Mail geht ohne Anrede raus.",
      });
      return;
    }
    recipients.push({ line, email, name: cleaned, problem: "" });
  });

  return recipients;
}

export function sendableRecipients(rows: CsvRecipient[]): CsvRecipient[] {
  return rows.filter((row) => row.problem === "" || row.problem.startsWith("Name enthält"));
}
