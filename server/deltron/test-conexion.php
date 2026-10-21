<?php
// Prueba de conexión con Deltron. Muestra la IP de salida del servidor que hay que registrar.
// Úsalo una vez: súbelo a public_html, ábrelo en el navegador y se borra solo al terminar.
// Nunca muestra el token ni las credenciales.

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');

const BASE = 'https://api.deltron.com.pe/vadhsgytGn/partner-service';
$configFile = dirname(__DIR__) . '/deltron/config.php'; // /home/quickfix/deltron/config.php

function request(string $url, ?array $json = null): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_IPRESOLVE      => CURL_IPRESOLVE_V4, // Deltron solo atiende por IPv4
        CURLOPT_TIMEOUT        => 20,
    ]);
    if ($json !== null) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($json));
    }
    $body = curl_exec($ch);
    return ['code' => curl_getinfo($ch, CURLINFO_HTTP_CODE), 'body' => $body, 'error' => curl_error($ch)];
}

echo "PHP " . PHP_VERSION . "\n";
if (!function_exists('curl_init')) exit("FALLA: este PHP no tiene la extensión curl. Actívala en Select PHP Version.\n");

$ip = request('https://ifconfig.me/ip');
echo "IP de salida del servidor (IPv4): " . ($ip['code'] === 200 ? trim($ip['body']) : 'no se pudo leer') . "\n\n";

if (!is_file($configFile)) exit("FALLA: no encuentro $configFile. Crea ese archivo a partir de config.example.php.\n");
$config = require $configFile;

$res = request(BASE . '/api/auth/token', ['api_key' => $config['api_key'] ?? '', 'api_secret' => $config['api_secret'] ?? '']);
if ($res['code'] === 0) exit("FALLA: no hubo respuesta de Deltron ({$res['error']}). El hosting podría bloquear conexiones salientes al puerto 443.\n");

$data = json_decode((string) $res['body'], true);
$msg = $data['result']['error_msg'] ?? '';
switch ($res['code']) {
    case 200:
        echo "OK: Deltron respondió y aceptó tus credenciales.\n";
        echo "IP que debes registrar en Credenciales API: " . ($data['result']['client_ip'] ?? '?') . "\n";
        echo "El token vence: " . ($data['result']['expires_at'] ?? '?') . "\n";
        break;
    case 401:
        echo "FALLA 401: api_key o api_secret incorrectos. Revisa config.php.\n";
        break;
    case 403:
        echo "FALLA 403: $msg\nSi dice que la IP no está registrada, registra la IP de arriba en Credenciales API y vuelve a probar.\n";
        break;
    case 429:
        echo "FALLA 429: se agotó el límite de tokens. Espera una hora y vuelve a probar.\n";
        break;
    default:
        echo "FALLA {$res['code']}: $msg\n";
}

// Solo se borra si funcionó; si falló, lo puedes volver a abrir después de corregir.
if ($res['code'] === 200 && @unlink(__FILE__)) echo "\nEste archivo de prueba ya se borró del servidor.\n";
