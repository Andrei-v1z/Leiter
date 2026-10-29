<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$path = (string) (parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?: '');
$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

load_env(__DIR__ . '/.env');

if (preg_match('#/api/pricing/?$#', $path) === 1 && $method === 'GET') {
    echo json_encode(pricing_catalog(), JSON_UNESCAPED_UNICODE);
    exit;
}

if (preg_match('#/api/checkout/session/?$#', $path) === 1 && $method === 'GET') {
    handle_checkout_session();
    exit;
}

if (preg_match('#/api/checkout/confirm/?$#', $path) === 1 && $method === 'GET') {
    handle_checkout_confirm();
    exit;
}

if (preg_match('#/api/checkout/?$#', $path) === 1 && $method === 'POST') {
    handle_checkout();
    exit;
}

if (preg_match('#/api/newsletter/?$#', $path) === 1 && $method === 'POST') {
    handle_newsletter();
}

if (preg_match('#/api/admin/session/?$#', $path) === 1 && $method === 'POST') {
    if (!admin_authorized()) {
        fail('Unauthorized', 401);
    }
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

if (preg_match('#/api/admin/newsletter/?$#', $path) === 1 && $method === 'GET') {
    if (!admin_authorized()) {
        fail('Unauthorized', 401);
    }
    $subscribers = newsletter_subscribers();
    $format = strtolower((string) ($_GET['format'] ?? ''));
    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="leiter-newsletter.csv"');
        echo newsletter_csv($subscribers);
        exit;
    }
    echo json_encode(['subscribers' => $subscribers], JSON_UNESCAPED_UNICODE);
    exit;
}

if (preg_match('#/api/admin/outreach/?$#', $path) === 1) {
    if (!admin_authorized()) {
        fail('Unauthorized', 401);
    }
    if ($method === 'GET') {
        handle_outreach_get();
    }
    if ($method === 'POST') {
        handle_outreach_post();
    }
    fail('Methode nicht erlaubt', 405);
}

if (preg_match('#/api/admin/pricing/?$#', $path) === 1) {
    if (!admin_authorized()) {
        fail('Unauthorized', 401);
    }
    if ($method === 'GET') {
        echo json_encode(pricing_catalog(), JSON_UNESCAPED_UNICODE);
        exit;
    }
    if ($method === 'PUT') {
        handle_admin_pricing_put();
    }
}

http_response_code(404);
echo json_encode(['error' => 'Nicht gefunden'], JSON_UNESCAPED_UNICODE);
exit;

function load_env(string $file): void
{
    if (!is_readable($file)) {
        return;
    }
    $lines = file($file, FILE_IGNORE_NEW_LINES);
    if ($lines === false) {
        return;
    }
    foreach ($lines as $raw) {
        $line = trim($raw);
        if ($line === '' || strpos($line, '#') === 0) {
            continue;
        }
        $eq = strpos($line, '=');
        if ($eq === false || $eq < 1) {
            continue;
        }
        $key = trim(substr($line, 0, $eq));
        $value = trim(substr($line, $eq + 1));
        if ($key === '') {
            continue;
        }
        if (!array_key_exists($key, $_ENV) || $_ENV[$key] === '') {
            $_ENV[$key] = $value;
        }
        if (getenv($key) === false || getenv($key) === '') {
            putenv($key . '=' . $value);
        }
    }
}

function env_value(string $key, string $fallback = ''): string
{
    $value = $_ENV[$key] ?? getenv($key);
    if (!is_string($value) || trim($value) === '') {
        return $fallback;
    }
    return rtrim(trim($value), '/');
}

function public_site_url(): string
{
    $site = env_value('NEXT_PUBLIC_SITE_URL', 'https://leiter.fr');
    $host = parse_url($site, PHP_URL_HOST);
    if (!is_string($host) || $host === '') {
        return 'https://leiter.fr';
    }
    $host = strtolower((string) preg_replace('/^www\./', '', $host));
    if ($host === 'leiter.fr' || $host === 'leiter.be') {
        return 'https://leiter.fr';
    }
    return rtrim($site, '/');
}

function default_catalog(): array
{
    return [
        'singleLead' => ['basePrice' => 80, 'currency' => 'EUR'],
        'volumeTiers' => [
            ['quantity' => 1, 'totalPrice' => 80, 'perLeadPrice' => 80],
            ['quantity' => 5, 'totalPrice' => 375, 'perLeadPrice' => 75],
            ['quantity' => 10, 'totalPrice' => 700, 'perLeadPrice' => 70],
            ['quantity' => 25, 'totalPrice' => 1625, 'perLeadPrice' => 65],
            ['quantity' => 50, 'totalPrice' => 3000, 'perLeadPrice' => 60],
            ['quantity' => 100, 'totalPrice' => 5500, 'perLeadPrice' => 55],
        ],
        'categories' => [
            ['slug' => 'unternehmensberatung', 'name' => 'Unternehmensberatung', 'basePrice' => 80],
            ['slug' => 'foerdermittelberatung', 'name' => 'Fördermittelberatung', 'basePrice' => 80],
            ['slug' => 'digitalisierung', 'name' => 'Digitalisierung', 'basePrice' => 80],
            ['slug' => 'finanzierung', 'name' => 'Finanzierung', 'basePrice' => 80],
            ['slug' => 'ma', 'name' => 'M&A', 'basePrice' => 80],
        ],
        'subscriptions' => [
            ['slug' => 'zugang', 'name' => 'Zugang', 'monthlyPrice' => 240, 'includedLeads' => 3],
            ['slug' => 'atelier', 'name' => 'Atelier', 'monthlyPrice' => 700, 'includedLeads' => 10],
            ['slug' => 'kanzlei', 'name' => 'Kanzlei', 'monthlyPrice' => 1950, 'includedLeads' => 30],
        ],
    ];
}

function pricing_catalog(): array
{
    foreach ([__DIR__ . '/data/pricing.json', __DIR__ . '/pricing-catalog.json'] as $file) {
        if (!is_readable($file)) {
            continue;
        }
        $raw = file_get_contents($file);
        if (!is_string($raw) || $raw === '') {
            continue;
        }
        $parsed = json_decode($raw, true);
        if (is_array($parsed) && isset($parsed['singleLead']['basePrice'])) {
            return array_replace_recursive(default_catalog(), $parsed);
        }
    }
    return default_catalog();
}

function request_header(string $name): string
{
    $want = strtolower($name);
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    if (is_array($headers)) {
        foreach ($headers as $key => $value) {
            if (strtolower((string) $key) === $want && is_string($value)) {
                return trim($value);
            }
        }
    }
    $serverKey = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    return trim((string) ($_SERVER[$serverKey] ?? ''));
}

function env_secret(string $key): string
{
    $value = $_ENV[$key] ?? getenv($key);
    if (!is_string($value) || trim($value) === '') {
        return '';
    }
    return trim($value);
}

function admin_authorized(): bool
{
    $user = request_header('x-admin-user');
    $password = request_header('x-admin-password');
    $expectedUser = env_secret('ADMIN_USER');
    $expectedPassword = env_secret('ADMIN_PASSWORD');
    if ($expectedPassword === '') {
        $expectedPassword = env_secret('ADMIN_TOKEN');
    }
    if ($expectedUser === '' || $expectedPassword === '' || $user === '' || $password === '') {
        return false;
    }
    return hash_equals($expectedUser, $user) && hash_equals($expectedPassword, $password);
}

function handle_admin_pricing_put(): void
{
    $raw = file_get_contents('php://input');
    $body = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($body) || !isset($body['singleLead']['basePrice'])) {
        fail('Invalid pricing data');
    }
    $dir = __DIR__ . '/data';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        fail('Speichern fehlgeschlagen', 500);
    }
    $file = $dir . '/pricing.json';
    $written = file_put_contents(
        $file,
        json_encode($body, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
        LOCK_EX
    );
    if ($written === false) {
        fail('Speichern fehlgeschlagen', 500);
    }
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function newsletter_file(): string
{
    return __DIR__ . '/data/newsletter.json';
}

function newsletter_csv_file(): string
{
    return __DIR__ . '/data/newsletter.csv';
}

function newsletter_emails_file(): string
{
    return __DIR__ . '/data/emails.txt';
}

function newsletter_csv_cell(string $value): string
{
    if (strpbrk($value, "\",\n\r") !== false) {
        return '"' . str_replace('"', '""', $value) . '"';
    }
    return $value;
}

function newsletter_csv(array $subscribers): string
{
    $lines = ['email,plan,createdAt'];
    foreach ($subscribers as $row) {
        if (!is_array($row)) {
            continue;
        }
        $lines[] = implode(',', [
            newsletter_csv_cell((string) ($row['email'] ?? '')),
            newsletter_csv_cell((string) ($row['plan'] ?? '')),
            newsletter_csv_cell((string) ($row['createdAt'] ?? '')),
        ]);
    }
    return implode("\n", $lines) . "\n";
}

function write_newsletter_copies(array $subscribers): void
{
    file_put_contents(newsletter_csv_file(), newsletter_csv($subscribers), LOCK_EX);
    $emails = [];
    foreach ($subscribers as $row) {
        if (is_array($row) && isset($row['email']) && is_string($row['email']) && $row['email'] !== '') {
            $emails[] = $row['email'];
        }
    }
    file_put_contents(newsletter_emails_file(), implode("\n", $emails) . (count($emails) ? "\n" : ''), LOCK_EX);
}

function notify_newsletter_owner(string $email, string $plan): void
{
    $to = env_value('NEWSLETTER_NOTIFY_EMAIL', 'support@brightpixel.agency');
    if ($to === '' || filter_var($to, FILTER_VALIDATE_EMAIL) === false) {
        return;
    }
    $subject = 'Leiter Newsletter: ' . $email;
    $body = "Neue Anmeldung für den Start-Newsletter.\n\nE-Mail: {$email}\nAbo: " . ($plan !== '' ? $plan : '—') . "\nZeit: " . gmdate('c') . "\n";
    $headers = implode("\r\n", [
        'From: Leiter <noreply@leiter.fr>',
        'Reply-To: ' . $email,
        'Content-Type: text/plain; charset=UTF-8',
    ]);
    @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);
}

function outreach_log_path(): string
{
    return __DIR__ . '/data/outreach-log.json';
}

function outreach_read_sends(): array
{
    $file = outreach_log_path();
    if (!is_readable($file)) {
        return [];
    }
    $raw = file_get_contents($file);
    $parsed = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($parsed) || !isset($parsed['sends']) || !is_array($parsed['sends'])) {
        return [];
    }
    return $parsed['sends'];
}

function outreach_public_sends(array $sends): array
{
    $rows = [];
    foreach ($sends as $row) {
        if (!is_array($row)) {
            continue;
        }
        $rows[] = [
            'email' => (string) ($row['email'] ?? ''),
            'name' => (string) ($row['name'] ?? ''),
            'createdAt' => (string) ($row['createdAt'] ?? ''),
        ];
    }
    return array_reverse(array_slice($rows, -30));
}

function outreach_gate(array $sends, string $email): string
{
    $now = time();
    $hour = 0;
    foreach ($sends as $row) {
        if (!is_array($row)) {
            continue;
        }
        $at = strtotime((string) ($row['createdAt'] ?? ''));
        if ($at === false || $now - $at >= 3600) {
            continue;
        }
        $hour++;
        if ((string) ($row['email'] ?? '') === $email && $now - $at < 60) {
            return 'repeat';
        }
    }
    if ($hour >= 20) {
        return 'hour';
    }
    return 'ok';
}

function outreach_append(string $email, string $name): array
{
    $dir = __DIR__ . '/data';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        return outreach_read_sends();
    }
    $file = outreach_log_path();
    $handle = fopen($file, 'c+');
    if ($handle === false) {
        return outreach_read_sends();
    }
    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        return outreach_read_sends();
    }
    $contents = stream_get_contents($handle);
    $parsed = is_string($contents) && $contents !== '' ? json_decode($contents, true) : null;
    $sends = is_array($parsed) && isset($parsed['sends']) && is_array($parsed['sends']) ? $parsed['sends'] : [];
    $sends[] = [
        'email' => $email,
        'name' => $name,
        'createdAt' => gmdate('c'),
    ];
    if (count($sends) > 100) {
        $sends = array_slice($sends, -100);
    }
    rewind($handle);
    ftruncate($handle, 0);
    fwrite($handle, json_encode(['sends' => $sends], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return $sends;
}

function outreach_recipient(string $value): string
{
    $email = normalize_email($value);
    if (strpbrk($email, "\r\n") !== false || strlen($email) > 254) {
        return '';
    }
    if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        return '';
    }
    return $email;
}

function outreach_clean_name(string $value): ?string
{
    $value = trim(str_replace(["\r", "\n", "<", ">"], '', $value));
    if (function_exists('mb_substr')) {
        $value = mb_substr($value, 0, 60);
    } elseif (strlen($value) > 60) {
        $value = substr($value, 0, 60);
    }
    if ($value === '') {
        return '';
    }
    if (preg_match("/^[\\p{L}\\p{M}][\\p{L}\\p{M} .'\\-]{0,59}$/u", $value) !== 1) {
        return null;
    }
    return $value;
}

function outreach_greeting_block(string $name): string
{
    if ($name === '') {
        return '';
    }
    $safe = htmlspecialchars($name, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    return '<p style="margin:16px 0 0;font-family:Georgia,\'Times New Roman\',serif;font-size:22px;line-height:1.3;color:#171410;">Hallo ' . $safe . ',</p>';
}

function outreach_html(string $name): string
{
    $template = file_get_contents(__DIR__ . '/email/template.html');
    if (!is_string($template) || $template === '') {
        return '';
    }
    return str_replace(
        ['__HERO_SRC__', '__DESK_SRC__', '__GREETING_BLOCK__', '__YEAR__'],
        [
            'https://leiter.fr/email/hero.jpg',
            'https://leiter.fr/email/desk.jpg',
            outreach_greeting_block($name),
            date('Y'),
        ],
        $template
    );
}

function outreach_text(string $name): string
{
    $hello = $name !== '' ? "Hallo {$name},\n\n" : '';
    return $hello . "Der Bedarf ist schon da. Du erfährst ihn nur zu spät.\n\n"
        . "Unternehmen und Gründer fragen heute nach Beratung. Fördermittel, Digitalisierung, Finanzierung, Wachstum, Nachfolge. Die Anfrage ist konkret. Der Moment ist kurz.\n\n"
        . "Leiter gibt dir diese Anfrage, solange sie frisch ist. Mit Kontakt. Exklusiv für dich. Keine alte Liste und kein geteilter Datensatz.\n\n"
        . "01 Die Anfrage ist von heute, nicht aus einem Archiv.\n"
        . "02 Den Kontakt bekommst nur du.\n"
        . "03 Du kaufst die Anfrage. Sonst nichts.\n\n"
        . "Was es kostet\n"
        . "Ein Lead: 80 €\n"
        . "Zugang: 240 € für 3 Leads im Monat\n"
        . "Atelier: 700 € für 10 Leads im Monat\n"
        . "Kanzlei: 1.950 € für 30 Leads im Monat\n"
        . "Zuzüglich MwSt. Ab fünf Leads sinkt der Preis. Abos sind monatlich kündbar.\n\n"
        . "Die Leads ansehen: https://leiter.fr/preise\n\n"
        . "Du bezahlst nicht für mehr Namen. Du bezahlst dafür, im richtigen Moment anzurufen.\n\n"
        . "Janice · Leiter\n"
        . "Bright Pixel Advertisement Agency LLC\n"
        . "1309 Coffeen Avenue STE 1200, Sheridan, Wyoming 82801, USA\n"
        . "Janice@leiter.fr\n"
        . "Impressum: https://leiter.fr/impressum\n"
        . "Datenschutz: https://leiter.fr/datenschutz\n\n"
        . "Wenn du keine Hinweise mehr möchtest, antworte kurz auf diese Mail.\n";
}

function send_lead_outreach(string $email, string $name): bool
{
    $html = outreach_html($name);
    $text = outreach_text($name);
    if ($html === '' || $text === '') {
        return false;
    }
    $boundary = 'leiter-' . bin2hex(random_bytes(12));
    $messageId = bin2hex(random_bytes(16)) . '@leiter.fr';
    $headers = implode("\r\n", [
        'From: Janice <Janice@leiter.fr>',
        'Reply-To: Janice@leiter.fr',
        'Sender: Janice@leiter.fr',
        'Message-ID: <' . $messageId . '>',
        'Date: ' . date('r'),
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
    ]);
    $body = "--{$boundary}\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($text))
        . "--{$boundary}\r\n"
        . "Content-Type: text/html; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($html))
        . "--{$boundary}--\r\n";
    return mail(
        $email,
        '=?UTF-8?B?' . base64_encode('Frische Anfragen, bevor der Bedarf abkühlt') . '?=',
        $body,
        $headers,
        '-fJanice@leiter.fr'
    );
}

function handle_outreach_get(): void
{
    $template = file_get_contents(__DIR__ . '/email/template.html');
    echo json_encode([
        'subject' => 'Frische Anfragen, bevor der Bedarf abkühlt',
        'sends' => outreach_public_sends(outreach_read_sends()),
        'template' => is_string($template) ? $template : '',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function handle_outreach_post(): void
{
    $raw = file_get_contents('php://input');
    $body = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($body)) {
        fail('Bitte eine gültige E-Mail-Adresse eingeben.');
    }
    $email = outreach_recipient((string) ($body['email'] ?? ''));
    if ($email === '') {
        fail('Bitte eine gültige E-Mail-Adresse eingeben.');
    }
    $rawName = isset($body['name']) && is_string($body['name']) ? $body['name'] : '';
    $name = outreach_clean_name($rawName);
    if ($name === null) {
        fail('Der Name darf nur Buchstaben enthalten.');
    }
    $gate = outreach_gate(outreach_read_sends(), $email);
    if ($gate === 'hour') {
        fail('In der letzten Stunde waren es schon 20 Mails.', 429);
    }
    if ($gate === 'repeat') {
        fail('Diese Adresse hat die Mail gerade bekommen.', 429);
    }
    if (!send_lead_outreach($email, $name)) {
        fail('Die Mail konnte nicht gesendet werden.', 502);
    }
    $sends = outreach_append($email, $name);
    echo json_encode(['ok' => true, 'sends' => outreach_public_sends($sends)], JSON_UNESCAPED_UNICODE);
    exit;
}

function newsletter_subscribers(): array
{
    $file = newsletter_file();
    if (!is_readable($file)) {
        return [];
    }
    $raw = file_get_contents($file);
    if (!is_string($raw) || $raw === '') {
        return [];
    }
    $parsed = json_decode($raw, true);
    if (!is_array($parsed) || !isset($parsed['subscribers']) || !is_array($parsed['subscribers'])) {
        return [];
    }
    return $parsed['subscribers'];
}

function handle_newsletter(): void
{
    $raw = file_get_contents('php://input');
    $body = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($body) || !isset($body['email']) || !is_string($body['email'])) {
        fail('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
    }

    $email = strtolower(trim($body['email']));
    if ($email === '' || strlen($email) > 254 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        fail('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
    }

    $plan = '';
    if (isset($body['plan']) && is_string($body['plan'])) {
        $candidate = strtolower(trim($body['plan']));
        if (preg_match('/^[a-z0-9-]{0,64}$/', $candidate) === 1) {
            $plan = $candidate;
        }
    }

    $dir = __DIR__ . '/data';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        fail('Speichern fehlgeschlagen', 500);
    }

    $file = newsletter_file();
    $handle = fopen($file, 'c+');
    if ($handle === false) {
        fail('Speichern fehlgeschlagen', 500);
    }

    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        fail('Speichern fehlgeschlagen', 500);
    }

    $contents = stream_get_contents($handle);
    $data = is_string($contents) && $contents !== '' ? json_decode($contents, true) : null;
    if (!is_array($data) || !isset($data['subscribers']) || !is_array($data['subscribers'])) {
        $data = ['subscribers' => []];
    }

    foreach ($data['subscribers'] as $row) {
        if (is_array($row) && isset($row['email']) && strtolower((string) $row['email']) === $email) {
            write_newsletter_copies($data['subscribers']);
            flock($handle, LOCK_UN);
            fclose($handle);
            echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    $data['subscribers'][] = [
        'email' => $email,
        'plan' => $plan,
        'createdAt' => gmdate('c'),
    ];

    rewind($handle);
    ftruncate($handle, 0);
    fwrite($handle, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($handle);
    write_newsletter_copies($data['subscribers']);
    flock($handle, LOCK_UN);
    fclose($handle);
    notify_newsletter_owner($email, $plan);

    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(string $message, int $status = 400)
{
    http_response_code($status);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function normalize_email(string $value): string
{
    return strtolower(trim($value));
}

function subscription_catalog(): array
{
    return [
        'zugang' => ['name' => 'Zugang', 'price' => 'price_1UVSh5AZohsks7xNq0fsIWPB'],
        'atelier' => ['name' => 'Atelier', 'price' => 'price_1UVSh6AZohsks7xN9NlwFxGq'],
        'kanzlei' => ['name' => 'Kanzlei', 'price' => 'price_1UVSh7AZohsks7xNNWEPlMdO'],
    ];
}

function plan_name_for_price(string $priceId): string
{
    foreach (subscription_catalog() as $plan) {
        if ($plan['price'] === $priceId) {
            return $plan['name'];
        }
    }
    return 'Abo';
}

function format_de_date(int $unix): string
{
    if (class_exists('IntlDateFormatter')) {
        $formatter = new IntlDateFormatter('de_DE', IntlDateFormatter::LONG, IntlDateFormatter::NONE, 'Europe/Berlin');
        $formatted = $formatter->format($unix);
        if (is_string($formatted) && $formatted !== '') {
            return $formatted;
        }
    }
    return gmdate('d.m.Y', $unix);
}

function stripe_get(string $path, string $secret): array
{
    $ch = curl_init('https://api.stripe.com/v1/' . ltrim($path, '/'));
    if ($ch === false) {
        return ['ok' => false, 'error' => 'Stripe-Verbindung fehlgeschlagen.', 'data' => null];
    }
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPGET => true,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $secret],
        CURLOPT_TIMEOUT => 25,
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    if (!is_string($body) || $body === '') {
        return ['ok' => false, 'error' => $curlError !== '' ? $curlError : 'Stripe-Fehler', 'data' => null];
    }
    $decoded = json_decode($body, true);
    if ($status >= 200 && $status < 300 && is_array($decoded)) {
        return ['ok' => true, 'error' => '', 'data' => $decoded];
    }
    $message = 'Stripe-Fehler';
    if (is_array($decoded) && isset($decoded['error']['message']) && is_string($decoded['error']['message'])) {
        $message = $decoded['error']['message'];
    }
    return ['ok' => false, 'error' => $message, 'data' => is_array($decoded) ? $decoded : null];
}

function customers_for_email(string $secret, string $email): array
{
    $query = rawurlencode('email:"' . str_replace(['"', '\\'], '', $email) . '"');
    $searched = stripe_get('customers/search?query=' . $query . '&limit=100', $secret);
    if ($searched['ok'] && isset($searched['data']['data']) && is_array($searched['data']['data'])) {
        return $searched['data']['data'];
    }
    $listed = stripe_get('customers?email=' . rawurlencode($email) . '&limit=100', $secret);
    if ($listed['ok'] && isset($listed['data']['data']) && is_array($listed['data']['data'])) {
        return $listed['data']['data'];
    }
    return [];
}

function subscription_price_from(array $subscription): string
{
    $price = $subscription['items']['data'][0]['price']['id'] ?? '';
    return is_string($price) ? $price : '';
}

function subscription_period_end(array $subscription): int
{
    if (isset($subscription['current_period_end'])) {
        return (int) $subscription['current_period_end'];
    }
    return (int) ($subscription['items']['data'][0]['current_period_end'] ?? 0);
}

function active_subscriptions_for_email(string $secret, string $email): array
{
    $active = ['active' => true, 'trialing' => true, 'past_due' => true, 'unpaid' => true, 'paused' => true];
    $found = [];
    foreach (customers_for_email($secret, $email) as $customer) {
        if (!is_array($customer) || empty($customer['id']) || !is_string($customer['id'])) {
            continue;
        }
        $page = stripe_get('subscriptions?customer=' . rawurlencode($customer['id']) . '&status=all&limit=100', $secret);
        $rows = $page['ok'] && isset($page['data']['data']) && is_array($page['data']['data']) ? $page['data']['data'] : [];
        foreach ($rows as $subscription) {
            if (!is_array($subscription)) {
                continue;
            }
            $status = (string) ($subscription['status'] ?? '');
            if (isset($active[$status])) {
                $found[] = $subscription;
            }
        }
    }
    usort($found, function ($a, $b) {
        return ((int) ($b['created'] ?? 0)) <=> ((int) ($a['created'] ?? 0));
    });
    return $found;
}

function scheduled_price_id(string $secret, array $subscription): string
{
    $scheduleId = $subscription['schedule'] ?? null;
    if (!is_string($scheduleId) || $scheduleId === '') {
        return '';
    }
    $schedule = stripe_get('subscription_schedules/' . rawurlencode($scheduleId), $secret);
    $phases = $schedule['ok'] && isset($schedule['data']['phases']) && is_array($schedule['data']['phases'])
        ? $schedule['data']['phases']
        : [];
    if (count($phases) < 2) {
        return '';
    }
    $next = $phases[count($phases) - 1];
    $price = $next['items'][0]['price'] ?? '';
    if (is_array($price)) {
        $price = $price['id'] ?? '';
    }
    if (!is_string($price) || $price === '' || $price === subscription_price_from($subscription)) {
        return '';
    }
    return $price;
}

function plan_change_file(): string
{
    return __DIR__ . '/data/plan-change-tokens.json';
}

function save_plan_change_token(array $token): bool
{
    $dir = __DIR__ . '/data';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        return false;
    }
    $file = plan_change_file();
    $handle = fopen($file, 'c+');
    if ($handle === false) {
        return false;
    }
    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        return false;
    }
    $contents = stream_get_contents($handle);
    $decoded = is_string($contents) && $contents !== '' ? json_decode($contents, true) : null;
    $tokens = is_array($decoded) && isset($decoded['tokens']) && is_array($decoded['tokens']) ? $decoded['tokens'] : [];
    $kept = [];
    foreach ($tokens as $row) {
        if (!is_array($row)) {
            continue;
        }
        if (($row['email'] ?? '') === $token['email'] && empty($row['usedAt'])) {
            continue;
        }
        $kept[] = $row;
    }
    $kept[] = $token;
    rewind($handle);
    ftruncate($handle, 0);
    fwrite($handle, json_encode(['tokens' => $kept], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return true;
}

function update_plan_change_tokens(callable $change)
{
    $dir = __DIR__ . '/data';
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        return null;
    }
    $handle = fopen(plan_change_file(), 'c+');
    if ($handle === false) {
        return null;
    }
    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        return null;
    }
    $contents = stream_get_contents($handle);
    $decoded = is_string($contents) && $contents !== '' ? json_decode($contents, true) : null;
    $tokens = is_array($decoded) && isset($decoded['tokens']) && is_array($decoded['tokens']) ? $decoded['tokens'] : [];
    $result = $change($tokens);
    $next = $result['tokens'] ?? $tokens;
    rewind($handle);
    ftruncate($handle, 0);
    fwrite($handle, json_encode(['tokens' => $next], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return $result['value'] ?? null;
}

function send_plan_change_mail(string $email, string $currentName, string $nextName, string $link): bool
{
    $subject = 'Leiter: Abo-Wechsel bestätigen';
    $body = "Sie möchten Ihr Leiter-Abo wechseln.\n\nAktuell: {$currentName}\nAb dem nächsten Abrechnungszeitraum: {$nextName}\n\nBis dahin bleibt Ihr aktuelles Abo aktiv. Es wird jetzt nichts zusätzlich berechnet.\n\nWechsel bestätigen: {$link}\n\nDer Link ist 24 Stunden gültig. Wenn Sie das nicht angefordert haben, ignorieren Sie diese E-Mail.\n";
    $headers = implode("\r\n", [
        'From: Leiter <noreply@leiter.fr>',
        'Content-Type: text/plain; charset=UTF-8',
    ]);
    return mail($email, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);
}

function subscription_decision(string $secret, string $email, string $slug): array
{
    $catalog = subscription_catalog();
    if (!isset($catalog[$slug])) {
        return ['action' => 'error', 'status' => 400, 'message' => 'Abo nicht gefunden'];
    }
    $nextPrice = $catalog[$slug]['price'];
    $nextName = $catalog[$slug]['name'];
    $subscriptions = active_subscriptions_for_email($secret, $email);
    if (count($subscriptions) === 0) {
        $customers = customers_for_email($secret, $email);
        $customerId = '';
        if (isset($customers[0]['id']) && is_string($customers[0]['id'])) {
            $customerId = $customers[0]['id'];
        }
        return [
            'action' => 'checkout',
            'customerId' => $customerId,
            'customerEmail' => $customerId === '' ? $email : '',
        ];
    }

    $primary = $subscriptions[0];
    $currentPrice = subscription_price_from($primary);
    $pending = scheduled_price_id($secret, $primary);
    if ($pending === $nextPrice) {
        return [
            'action' => 'error',
            'status' => 409,
            'message' => 'Der Wechsel auf ' . $nextName . ' ist bereits vorgemerkt und gilt ab dem nächsten Abrechnungszeitraum.',
        ];
    }
    if ($currentPrice === $nextPrice && $pending === '') {
        return [
            'action' => 'error',
            'status' => 409,
            'message' => 'Sie haben das Abo ' . $nextName . ' bereits. Ein zweites Abo ist nicht möglich.',
        ];
    }

    $extras = [];
    foreach (array_slice($subscriptions, 1) as $extra) {
        if (isset($extra['id']) && is_string($extra['id'])) {
            $extras[] = $extra['id'];
        }
    }
    $token = bin2hex(random_bytes(32));
    $site = public_site_url();
    $link = $site . '/api/checkout/confirm?token=' . $token;
    $record = [
        'token' => $token,
        'email' => $email,
        'subscriptionId' => (string) $primary['id'],
        'newPriceId' => $nextPrice,
        'extraSubscriptionIds' => $extras,
        'expiresAt' => gmdate('c', time() + 86400),
    ];
    if (!save_plan_change_token($record)) {
        return ['action' => 'error', 'status' => 500, 'message' => 'Die Bestätigung konnte nicht gespeichert werden.'];
    }
    if (!send_plan_change_mail($email, plan_name_for_price($currentPrice), $nextName, $link)) {
        update_plan_change_tokens(function (array $tokens) use ($token) {
            $kept = [];
            foreach ($tokens as $row) {
                if (is_array($row) && ($row['token'] ?? '') === $token && empty($row['usedAt'])) {
                    continue;
                }
                $kept[] = $row;
            }
            return ['tokens' => $kept, 'value' => true];
        });
        return ['action' => 'error', 'status' => 503, 'message' => 'Die Bestätigung konnte nicht gesendet werden. Bitte versuchen Sie es erneut.'];
    }
    return [
        'action' => 'confirm',
        'message' => 'Wir haben einen Bestätigungslink an ' . $email . ' geschickt. Der Wechsel gilt ab dem nächsten Abrechnungsmonat, nachdem Sie den Link geöffnet haben. Bis dahin bleibt Ihr aktuelles Abo aktiv.',
    ];
}

function handle_checkout_session(): void
{
    $id = isset($_GET['session_id']) && is_string($_GET['session_id']) ? $_GET['session_id'] : '';
    if (preg_match('/^cs_(live|test)_[A-Za-z0-9]+$/', $id) !== 1) {
        fail('Kauf nicht gefunden', 404);
    }
    $secret = env_value('STRIPE_SECRET_KEY');
    if ($secret === '') {
        fail('Stripe ist nicht konfiguriert. Bitte den Secret Key prüfen.', 503);
    }
    $loaded = stripe_get('checkout/sessions/' . rawurlencode($id) . '?expand[]=line_items', $secret);
    if (!$loaded['ok'] || !is_array($loaded['data'])) {
        fail('Kauf nicht gefunden', 404);
    }
    $session = $loaded['data'];
    if (($session['status'] ?? '') !== 'complete') {
        fail('Kauf nicht gefunden', 404);
    }
    $product = '';
    if (isset($session['metadata']['product']) && is_string($session['metadata']['product'])) {
        $product = $session['metadata']['product'];
    }
    if ($product === '' && isset($session['line_items']['data'][0]['description']) && is_string($session['line_items']['data'][0]['description'])) {
        $product = $session['line_items']['data'][0]['description'];
    }
    $mode = ($session['mode'] ?? '') === 'subscription' ? 'subscription' : 'payment';
    echo json_encode([
        'product' => $product !== '' ? $product : 'Leiter',
        'mode' => $mode,
        'amount' => (int) ($session['amount_total'] ?? 0),
        'currency' => is_string($session['currency'] ?? null) ? $session['currency'] : 'eur',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function handle_checkout(): void
{
    $raw = file_get_contents('php://input');
    $body = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($body) || empty($body['kind']) || !is_string($body['kind'])) {
        fail('Ungültige Anfrage');
    }

    $config = pricing_catalog();
    $line = resolve_line($config, $body);
    $unitCents = (int) round(((float) $line['unitAmount']) * 100);
    $quantity = (int) $line['quantity'];
    if ($unitCents <= 0 || $quantity < 1) {
        fail('Ungültiger Preis');
    }

    $secret = env_value('STRIPE_SECRET_KEY');
    if ($secret === '') {
        fail('Stripe ist nicht konfiguriert. Bitte den Secret Key prüfen.', 503);
    }

    $site = public_site_url();
    $payload = [
        'mode' => $line['mode'],
        'locale' => 'de',
        'billing_address_collection' => 'required',
        'success_url' => $site . '/kasse/erfolg?session_id={CHECKOUT_SESSION_ID}',
        'cancel_url' => $site . '/kasse/abgebrochen',
        'line_items' => [
            [
                'quantity' => $quantity,
                'price_data' => [
                    'currency' => 'eur',
                    'unit_amount' => $unitCents,
                    'product_data' => [
                        'name' => $line['name'],
                        'description' => $line['description'],
                        'tax_code' => 'txcd_10000000',
                    ],
                    'tax_behavior' => 'exclusive',
                ],
            ],
        ],
        'metadata' => [
            'kind' => (string) $body['kind'],
            'slug' => isset($body['slug']) && is_string($body['slug']) ? $body['slug'] : '',
            'quantity' => (string) $quantity,
            'unit_amount_eur' => (string) $line['unitAmount'],
            'total_eur' => (string) ($line['unitAmount'] * $quantity),
            'product' => $line['name'],
        ],
    ];

    if ($line['mode'] === 'subscription') {
        $slug = isset($body['slug']) && is_string($body['slug']) ? $body['slug'] : '';
        $email = isset($body['email']) && is_string($body['email']) ? normalize_email($body['email']) : '';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            fail('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        }
        $decision = subscription_decision($secret, $email, $slug);
        if ($decision['action'] === 'error') {
            fail((string) $decision['message'], (int) $decision['status']);
        }
        if ($decision['action'] === 'confirm') {
            echo json_encode(['confirmEmail' => true, 'message' => $decision['message']], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $priceId = subscription_price_id($slug);
        if ($priceId === '') {
            fail('Abo nicht gefunden');
        }
        $payload['line_items'] = [
            [
                'quantity' => 1,
                'price' => $priceId,
            ],
        ];
        if ($decision['customerId'] !== '') {
            $payload['customer'] = $decision['customerId'];
        } elseif ($decision['customerEmail'] !== '') {
            $payload['customer_email'] = $decision['customerEmail'];
        }
    } else {
        $payload['customer_creation'] = 'always';
        $payload['submit_type'] = 'pay';
    }

    $result = stripe_request('checkout/sessions', $secret, $payload);
    if (!$result['ok']) {
        $message = $result['error'];
        if (stripos($message, 'invalid api key') !== false) {
            $message = 'Stripe-Schlüssel ungültig. Bitte den Secret Key in der Umgebung prüfen.';
        }
        fail($message, 500);
    }

    $url = $result['data']['url'] ?? null;
    if (!is_string($url) || $url === '') {
        fail('Checkout konnte nicht gestartet werden', 500);
    }

    echo json_encode(['url' => $url], JSON_UNESCAPED_UNICODE);
    exit;
}

function confirm_page(string $title, string $message, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    $safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
    $safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    echo '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'
        . $safeTitle
        . ' · Leiter</title><style>body{margin:0;background:#f4f1eb;color:#171410;font-family:"IBM Plex Sans",sans-serif}main{max-width:36rem;margin:0 auto;padding:4.5rem 1.5rem}p.eyebrow{color:#9a7544;font-family:"IBM Plex Mono",monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase}h1{font-size:2.4rem;font-weight:500;letter-spacing:-.04em;line-height:1.1}p{line-height:1.7;color:#6f6a62}a{color:#171410}</style></head><body><main><p class="eyebrow">Abo</p><h1>'
        . $safeTitle
        . '</h1><p>'
        . $safeMessage
        . '</p><p><a href="/preise">Zurück zu den Preisen</a></p></main></body></html>';
    exit;
}

function apply_scheduled_plan_change(string $secret, string $subscriptionId, string $newPriceId, array $extraIds): array
{
    $loaded = stripe_get('subscriptions/' . rawurlencode($subscriptionId), $secret);
    if (!$loaded['ok'] || !is_array($loaded['data'])) {
        return ['ok' => false, 'message' => $loaded['error'] !== '' ? $loaded['error'] : 'Das Abo konnte nicht gelesen werden.'];
    }
    $subscription = $loaded['data'];
    $active = ['active' => true, 'trialing' => true, 'past_due' => true, 'unpaid' => true, 'paused' => true];
    $status = (string) ($subscription['status'] ?? '');
    if (!isset($active[$status])) {
        return ['ok' => false, 'message' => 'Dieses Abo ist nicht mehr aktiv.'];
    }
    if (!empty($subscription['cancel_at_period_end'])) {
        $cleared = stripe_request('subscriptions/' . rawurlencode($subscriptionId), $secret, ['cancel_at_period_end' => 'false']);
        if (!$cleared['ok'] || !is_array($cleared['data'])) {
            return ['ok' => false, 'message' => $cleared['error'] !== '' ? $cleared['error'] : 'Das Abo konnte nicht fortgesetzt werden.'];
        }
        $subscription = $cleared['data'];
    }

    $currentPrice = subscription_price_from($subscription);
    $end = subscription_period_end($subscription);
    if ($currentPrice === '' || $end <= time()) {
        return ['ok' => false, 'message' => 'Der Abrechnungszeitraum konnte nicht gelesen werden.'];
    }

    $scheduleId = $subscription['schedule'] ?? null;
    if (is_array($scheduleId)) {
        $scheduleId = $scheduleId['id'] ?? null;
    }
    if (is_string($scheduleId) && $scheduleId !== '') {
        $schedule = stripe_get('subscription_schedules/' . rawurlencode($scheduleId), $secret);
    } else {
        $schedule = stripe_request('subscription_schedules', $secret, ['from_subscription' => $subscriptionId]);
    }
    if (!$schedule['ok'] || !is_array($schedule['data'])) {
        return ['ok' => false, 'message' => $schedule['error'] !== '' ? $schedule['error'] : 'Der Abo-Zeitraum konnte nicht gelesen werden.'];
    }

    $phases = isset($schedule['data']['phases']) && is_array($schedule['data']['phases']) ? $schedule['data']['phases'] : [];
    $now = time();
    $currentPhase = null;
    foreach ($phases as $phase) {
        if (!is_array($phase)) {
            continue;
        }
        $start = (int) ($phase['start_date'] ?? 0);
        $phaseEnd = isset($phase['end_date']) ? (int) $phase['end_date'] : 0;
        if ($start <= $now && ($phaseEnd === 0 || $phaseEnd > $now)) {
            $currentPhase = $phase;
            break;
        }
    }
    if ($currentPhase === null && isset($phases[0]) && is_array($phases[0])) {
        $currentPhase = $phases[0];
    }
    $startDate = (int) ($currentPhase['start_date'] ?? 0);
    if ($startDate <= 0 || $end <= $startDate) {
        return ['ok' => false, 'message' => 'Der aktuelle Abo-Zeitraum konnte nicht gelesen werden.'];
    }

    $updated = stripe_request('subscription_schedules/' . rawurlencode((string) $schedule['data']['id']), $secret, [
        'end_behavior' => 'release',
        'proration_behavior' => 'none',
        'phases' => [
            [
                'items' => [['price' => $currentPrice, 'quantity' => 1]],
                'start_date' => $startDate,
                'end_date' => $end,
                'proration_behavior' => 'none',
            ],
            [
                'items' => [['price' => $newPriceId, 'quantity' => 1]],
                'proration_behavior' => 'none',
            ],
        ],
    ]);
    if (!$updated['ok']) {
        return ['ok' => false, 'message' => $updated['error'] !== '' ? $updated['error'] : 'Der Wechsel konnte nicht gespeichert werden.'];
    }

    foreach ($extraIds as $extraId) {
        if (!is_string($extraId) || $extraId === '' || $extraId === $subscriptionId) {
            continue;
        }
        stripe_request('subscriptions/' . rawurlencode($extraId), $secret, ['cancel_at_period_end' => 'true']);
    }

    $extraNote = count($extraIds) > 0 ? ' Weitere laufende Abos enden zum selben Termin.' : '';
    return [
        'ok' => true,
        'message' => 'Ihr Abo wechselt am ' . format_de_date($end) . ' zu ' . plan_name_for_price($newPriceId)
            . '. Bis dahin bleibt ' . plan_name_for_price($currentPrice) . ' aktiv. Es wird jetzt nichts zusätzlich berechnet.'
            . $extraNote,
    ];
}

function handle_checkout_confirm(): void
{
    $token = isset($_GET['token']) && is_string($_GET['token']) ? $_GET['token'] : '';
    if (preg_match('/^[a-f0-9]{64}$/', $token) !== 1) {
        confirm_page('Link ungültig', 'Dieser Bestätigungslink ist ungültig.', 404);
    }

    $row = update_plan_change_tokens(function (array $tokens) use ($token) {
        foreach ($tokens as $entry) {
            if (is_array($entry) && ($entry['token'] ?? '') === $token) {
                return ['tokens' => $tokens, 'value' => $entry];
            }
        }
        return ['tokens' => $tokens, 'value' => null];
    });
    if (!is_array($row)) {
        confirm_page('Link ungültig', 'Dieser Bestätigungslink ist ungültig.', 404);
    }
    if (!empty($row['usedAt']) && is_string($row['resultMessage'] ?? null) && $row['resultMessage'] !== '') {
        confirm_page('Wechsel vorgemerkt', $row['resultMessage']);
    }
    $expires = strtotime((string) ($row['expiresAt'] ?? ''));
    if ($expires !== false && $expires < time()) {
        confirm_page('Link abgelaufen', 'Dieser Bestätigungslink ist abgelaufen. Bitte starten Sie den Wechsel erneut.', 410);
    }

    $secret = env_value('STRIPE_SECRET_KEY');
    if ($secret === '') {
        confirm_page('Wechsel nicht möglich', 'Stripe ist nicht konfiguriert. Bitte den Secret Key prüfen.', 503);
    }
    $extras = isset($row['extraSubscriptionIds']) && is_array($row['extraSubscriptionIds']) ? $row['extraSubscriptionIds'] : [];
    $applied = apply_scheduled_plan_change($secret, (string) $row['subscriptionId'], (string) $row['newPriceId'], $extras);
    if (!$applied['ok']) {
        confirm_page('Wechsel nicht möglich', $applied['message'], 500);
    }

    update_plan_change_tokens(function (array $tokens) use ($token, $applied) {
        $next = [];
        foreach ($tokens as $entry) {
            if (is_array($entry) && ($entry['token'] ?? '') === $token) {
                $entry['usedAt'] = gmdate('c');
                $entry['resultMessage'] = $applied['message'];
            }
            $next[] = $entry;
        }
        return ['tokens' => $next, 'value' => true];
    });
    confirm_page('Wechsel vorgemerkt', $applied['message']);
}

function subscription_price_id(string $slug): string
{
    $catalog = subscription_catalog();
    return $catalog[$slug]['price'] ?? '';
}

function resolve_line(array $config, array $body): array
{
    $kind = (string) $body['kind'];
    $noRefund = 'Digitale Lead-Daten. Keine Rückerstattung. Mit der Zahlung gelten die AGB von Leiter.';

    if ($kind === 'single') {
        return [
            'name' => 'Leiter Lead',
            'description' => $noRefund,
            'mode' => 'payment',
            'unitAmount' => (float) ($config['singleLead']['basePrice'] ?? 80),
            'quantity' => 1,
        ];
    }

    if ($kind === 'volume') {
        $quantity = isset($body['quantity']) ? (int) $body['quantity'] : 0;
        if ($quantity < 1) {
            fail('Menge ungültig');
        }
        $tiers = $config['volumeTiers'] ?? [];
        $exact = null;
        $selected = null;
        foreach ($tiers as $tier) {
            if (!is_array($tier)) {
                continue;
            }
            $tierQty = (int) ($tier['quantity'] ?? 0);
            if ($tierQty === $quantity) {
                $exact = $tier;
                break;
            }
            if ($tierQty > 0 && $tierQty <= $quantity) {
                $selected = $tier;
            }
        }
        $tier = $exact ?? $selected;
        if (!is_array($tier)) {
            fail('Paket nicht gefunden');
        }
        $qty = $exact ? (int) $exact['quantity'] : $quantity;
        $perLead = (float) ($tier['perLeadPrice'] ?? 0);
        return [
            'name' => $qty === 1 ? 'Leiter Lead' : 'Leiter Lead-Paket (' . $qty . ' Leads)',
            'description' => $qty . ($qty === 1 ? ' Lead. ' : ' Leads. ') . $noRefund,
            'mode' => 'payment',
            'unitAmount' => $perLead,
            'quantity' => $qty,
        ];
    }

    if ($kind === 'exclusive') {
        fail('Exklusive Leads werden nicht angeboten.');
    }

    if ($kind === 'category') {
        $slug = isset($body['slug']) && is_string($body['slug']) ? $body['slug'] : '';
        foreach ($config['categories'] ?? [] as $category) {
            if (is_array($category) && ($category['slug'] ?? '') === $slug) {
                return [
                    'name' => 'Leiter Lead · ' . (string) ($category['name'] ?? $slug),
                    'description' => $noRefund,
                    'mode' => 'payment',
                    'unitAmount' => (float) ($category['basePrice'] ?? 80),
                    'quantity' => 1,
                ];
            }
        }
        fail('Kategorie nicht gefunden');
    }

    if ($kind === 'subscription') {
        $slug = isset($body['slug']) && is_string($body['slug']) ? $body['slug'] : '';
        foreach ($config['subscriptions'] ?? [] as $plan) {
            if (is_array($plan) && ($plan['slug'] ?? '') === $slug) {
                $included = (int) ($plan['includedLeads'] ?? 0);
                return [
                    'name' => 'Leiter ' . (string) ($plan['name'] ?? $slug),
                    'description' => $included . ' Leads pro Monat. ' . $noRefund,
                    'mode' => 'subscription',
                    'unitAmount' => (float) ($plan['monthlyPrice'] ?? 0),
                    'quantity' => 1,
                ];
            }
        }
        fail('Abo nicht gefunden');
    }

    fail('Unbekannte Bestellung');
}

function stripe_request(string $path, string $secret, array $payload): array
{
    $ch = curl_init('https://api.stripe.com/v1/' . ltrim($path, '/'));
    if ($ch === false) {
        return ['ok' => false, 'error' => 'Stripe-Verbindung fehlgeschlagen.', 'data' => null];
    }

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query($payload),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $secret,
        ],
        CURLOPT_TIMEOUT => 25,
    ]);

    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if (!is_string($body) || $body === '') {
        return ['ok' => false, 'error' => $curlError !== '' ? $curlError : 'Stripe-Fehler', 'data' => null];
    }

    $decoded = json_decode($body, true);
    if ($status >= 200 && $status < 300 && is_array($decoded)) {
        return ['ok' => true, 'error' => '', 'data' => $decoded];
    }

    $message = 'Stripe-Fehler';
    if (is_array($decoded) && isset($decoded['error']['message']) && is_string($decoded['error']['message'])) {
        $message = $decoded['error']['message'];
    }
    return ['ok' => false, 'error' => $message, 'data' => is_array($decoded) ? $decoded : null];
}
