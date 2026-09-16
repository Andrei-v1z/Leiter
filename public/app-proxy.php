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

if (preg_match('#/api/checkout/?$#', $path) === 1 && $method === 'POST') {
    fail('Kauf und Zahlung sind noch nicht möglich. Bitte warte auf den Rollout der Software. Bald verfügbar.', 503);
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

    $site = env_value('NEXT_PUBLIC_SITE_URL', 'https://leiter.fr');
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
                    ],
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
        'custom_text' => [
            'submit' => [
                'message' => 'Mit der Zahlung akzeptieren Sie die AGB. Rückerstattungen sind ausgeschlossen, weil digitale Lead-Daten verkauft werden.',
            ],
        ],
    ];

    if ($line['mode'] === 'subscription') {
        $payload['line_items'][0]['price_data']['recurring'] = ['interval' => 'month'];
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
