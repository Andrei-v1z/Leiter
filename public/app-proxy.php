<?php
header('Content-Type: application/json; charset=utf-8');
http_response_code(503);
echo json_encode([
  'error' => 'Checkout ist voruebergehend nicht verfuegbar. Bitte spaeter erneut versuchen.',
], JSON_UNESCAPED_UNICODE);
