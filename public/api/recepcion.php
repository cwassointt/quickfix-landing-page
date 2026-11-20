<?php
// Recepción de equipos: el cliente se registra en /recepcion/ y el taller los ve en /taller/.
// Los datos viven fuera de public_html, en /home/quickfix/recepcion/ (config.php y recepcion.sqlite),
// así nadie puede descargarlos desde internet y nunca pasan por GitHub.
//
// Acciones (?accion=):  crear (público) · sesion · entrar · salir · lista · orden · actualizar · editar · borrar · renumerar · recibir · foto · leer · csv · informe · preguntas · redactar · borrador · foto_entrada · borrar_foto · seguimiento (público)

declare(strict_types=1);
date_default_timezone_set('America/Lima');

$DIR = getenv('QF_RECEPCION_DIR') ?: dirname($_SERVER['DOCUMENT_ROOT'] ?? __DIR__) . '/recepcion';
// aprobacion, reparacion, pruebas y listo son de la primera versión: se aceptan por los casos que ya los tienen.
const ESTADOS = ['registrado', 'recibido', 'diagnostico', 'reparado', 'no_reparado', 'entregado', 'devuelto', 'aprobacion', 'reparacion', 'pruebas', 'listo'];
const CAMPOS = [
    // campo => [obligatorio, largo máximo]
    'nombre' => [true, 100], 'dni' => [false, 12], 'whatsapp' => [true, 20], 'correo' => [false, 120], 'distrito' => [false, 60],
    'como' => [false, 40], 'tipo' => [true, 30], 'marca' => [true, 40], 'modelo' => [true, 80], 'serie' => [false, 40],
    'pin' => [false, 40], 'accesorios' => [false, 120], 'servicio' => [false, 40], 'falla' => [true, 1000], 'direccion' => [false, 200],
];
// Columnas agregadas después de la primera versión: se crean solas en bases que ya existían.
const COLUMNAS_NUEVAS = ['llega' => 'TEXT', 'modo' => 'TEXT', 'direccion' => 'TEXT', 'autoriza' => 'INTEGER', 'foto' => 'INTEGER', 'cambio' => 'TEXT', 'placa' => 'REAL', 'seguir' => 'TEXT', 'nota' => 'INTEGER'];
// Lo que necesita el tablero de cada caso (menú, buscador, filas). Sin la falla ni datos personales extra: la lista va completa, sin límite.
const COLUMNAS_LISTA = 'id, creado, origen, nombre, whatsapp, tipo, marca, modelo, serie, servicio, liquido, abierto, estado, recibido, cambio, llega, modo, seguir, (placa IS NOT NULL) AS cotizada';
const MAX_FOTOS_ENTRADA = 8;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function responder($datos, int $codigo = 200): void
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Responde y cierra la conexión, pero el script sigue trabajando (para lo que tarda más de lo que espera el servidor web). */
function soltarRespuesta(array $datos, int $codigo): void
{
    $salida = (string) json_encode($datos, JSON_UNESCAPED_UNICODE);
    ignore_user_abort(true);
    http_response_code($codigo);
    header('Content-Length: ' . strlen($salida));
    header('Connection: close');
    echo $salida;
    if (function_exists('litespeed_finish_request')) litespeed_finish_request();
    elseif (function_exists('fastcgi_finish_request')) fastcgi_finish_request();
    else { while (ob_get_level() > 0) ob_end_flush(); flush(); }
}

function fallo(string $mensaje, int $codigo = 400): void
{
    responder(['error' => $mensaje], $codigo);
}

if (!is_file("$DIR/config.php")) fallo('La recepción aún no está configurada en el servidor.', 503);
$CFG = require "$DIR/config.php";

function db(): PDO
{
    global $DIR;
    static $pdo = null;
    if ($pdo) return $pdo;
    $pdo = new PDO("sqlite:$DIR/recepcion.sqlite", null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('PRAGMA busy_timeout = 5000');
    $pdo->exec("CREATE TABLE IF NOT EXISTS ordenes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creado TEXT NOT NULL, origen TEXT NOT NULL, ip TEXT,
        nombre TEXT NOT NULL, dni TEXT, whatsapp TEXT NOT NULL, correo TEXT, distrito TEXT, como TEXT,
        tipo TEXT NOT NULL, marca TEXT NOT NULL, modelo TEXT NOT NULL, serie TEXT, color TEXT, pin TEXT, accesorios TEXT,
        servicio TEXT, falla TEXT NOT NULL, liquido INTEGER, abierto INTEGER,
        estado TEXT NOT NULL DEFAULT 'registrado', recibido TEXT, recibido_por TEXT,
        presupuesto REAL, adelanto REAL, entrega TEXT, notas TEXT
    )");
    $hay = array_column($pdo->query('PRAGMA table_info(ordenes)')->fetchAll(), 'name');
    foreach (COLUMNAS_NUEVAS as $col => $tipo) {
        if (!in_array($col, $hay, true)) $pdo->exec("ALTER TABLE ordenes ADD COLUMN $col $tipo");
    }
    $pdo->exec('CREATE TABLE IF NOT EXISTS intentos (ip TEXT NOT NULL, tipo TEXT NOT NULL, fecha INTEGER NOT NULL)');
    // Un informe técnico por caso: notas del técnico, cobros y el texto ya revisado, como JSON.
    $pdo->exec('CREATE TABLE IF NOT EXISTS informes (orden_id INTEGER PRIMARY KEY, datos TEXT NOT NULL, actualizado TEXT NOT NULL)');
    // Borrador que la IA está redactando en segundo plano (estado: redactando, listo o error).
    $pdo->exec('CREATE TABLE IF NOT EXISTS borradores (orden_id INTEGER PRIMARY KEY, estado TEXT NOT NULL, datos TEXT NOT NULL, actualizado TEXT NOT NULL)');
    // Historial del caso: cada cambio de estado, quién lo hizo y cuándo.
    $pdo->exec('CREATE TABLE IF NOT EXISTS historial (orden_id INTEGER NOT NULL, estado TEXT NOT NULL, quien TEXT NOT NULL, fecha TEXT NOT NULL)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS historial_orden ON historial (orden_id)');
    // Pagos del cliente (adelanto, saldo): el saldo es presupuesto menos la suma.
    $pdo->exec('CREATE TABLE IF NOT EXISTS pagos (orden_id INTEGER NOT NULL, monto REAL NOT NULL, fecha TEXT NOT NULL)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS pagos_orden ON pagos (orden_id)');
    // Clave del enlace público de seguimiento (24 hex, imposible de adivinar); la reciben también los casos antiguos.
    $pdo->exec("UPDATE ordenes SET seguir = lower(hex(randomblob(12))) WHERE seguir IS NULL");
    respaldar($pdo);
    return $pdo;
}

/** Una copia de la base por día, fuera de public_html; se guardan las últimas 14. */
function respaldar(PDO $pdo): void
{
    global $DIR;
    $hoy = "$DIR/respaldos/recepcion-" . date('Y-m-d') . '.sqlite';
    if (is_file($hoy)) return;
    if (!is_dir("$DIR/respaldos")) @mkdir("$DIR/respaldos", 0700, true);
    try {
        $pdo->exec('VACUUM INTO ' . $pdo->quote($hoy)); // copia consistente aunque haya escrituras (SQLite 3.27+)
    } catch (Throwable $e) {
        $pdo->exec('PRAGMA wal_checkpoint(TRUNCATE)');
        @copy("$DIR/recepcion.sqlite", $hoy);
    }
    $todos = glob("$DIR/respaldos/recepcion-*.sqlite") ?: [];
    rsort($todos);
    foreach (array_slice($todos, 14) as $viejo) @unlink($viejo);
}

function pagos(int $id): array
{
    $q = db()->prepare('SELECT rowid AS id, monto, fecha FROM pagos WHERE orden_id = ? ORDER BY fecha, rowid');
    $q->execute([$id]);
    return $q->fetchAll();
}

function historial(int $id, string $estado, string $quien): void
{
    db()->prepare('INSERT INTO historial (orden_id, estado, quien, fecha) VALUES (?, ?, ?, ?)')->execute([$id, $estado, $quien, date('c')]);
}

/** Fotos de entrada del caso (estado del equipo al recibirlo): 1, 2, 3… */
function fotosEntrada(int $id): array
{
    global $DIR;
    $n = [];
    foreach (glob("$DIR/fotos/$id-e*.jpg") ?: [] as $f) {
        if (preg_match('/-e(\d+)\.jpg$/', $f, $m)) $n[] = (int) $m[1];
    }
    sort($n);
    return $n;
}

/**
 * A qué estado pasa de verdad: "Entregado" queda como entregado (reparado) o devuelto (sin reparar) según el resultado anterior.
 * Un equipo no reparado no se entrega sin la cotización del reemplazo de placa. Devuelve el estado o un mensaje de error.
 */
function destinoEstado(array $o, string $pedido): array
{
    if ($pedido !== 'entregado' && $pedido !== 'devuelto') return [$pedido, null];
    $actual = $o['estado'];
    if (in_array($actual, ['no_reparado', 'devuelto'], true)) {
        return $o['placa'] === null ? [null, 'Antes de entregarlo, cotiza el reemplazo de la placa.'] : ['devuelto', null];
    }
    if (in_array($actual, ['reparado', 'listo', 'entregado'], true)) return ['entregado', null];
    return [null, 'Primero marca si quedó reparado o no reparado.'];
}

function ip(): string
{
    return substr((string) ($_SERVER['REMOTE_ADDR'] ?? ''), 0, 45);
}

/** Cuenta intentos recientes de esta IP; sirve para frenar spam y adivinar claves. */
function demasiados(string $tipo, int $max, int $segundos): bool
{
    $q = db()->prepare('SELECT COUNT(*) FROM intentos WHERE ip = ? AND tipo = ? AND fecha > ?');
    $q->execute([ip(), $tipo, time() - $segundos]);
    return (int) $q->fetchColumn() >= $max;
}

function anotar(string $tipo): void
{
    db()->prepare('INSERT INTO intentos (ip, tipo, fecha) VALUES (?, ?, ?)')->execute([ip(), $tipo, time()]);
    db()->prepare('DELETE FROM intentos WHERE fecha < ?')->execute([time() - 86400]);
}

function cuerpo(): array
{
    $datos = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($datos)) fallo('Solicitud inválida.');
    return $datos;
}

function limpiar($v, int $max): string
{
    $v = trim(preg_replace('/\s+/u', ' ', (string) $v) ?? '');
    return mb_substr($v, 0, $max);
}

function sino($v): ?int
{
    return $v === true ? 1 : ($v === false ? 0 : null);
}

function iniciarSesion(): void
{
    session_name('qf_taller');
    session_set_cookie_params(['lifetime' => 60 * 60 * 24 * 30, 'path' => '/', 'secure' => !empty($_SERVER['HTTPS']), 'httponly' => true, 'samesite' => 'Strict']);
    session_start();
}

/** Rol de la sesión: "admin" (todo) o "mostrador" (recibir e imprimir etiquetas). */
function rol(): ?string
{
    iniciarSesion();
    return $_SESSION['rol'] ?? null;
}

function exigir(string ...$roles): string
{
    $r = rol();
    if (!$r || !in_array($r, $roles, true)) fallo('Inicia sesión otra vez.', 401);
    return $r;
}

/** Foto de la etiqueta: llega como data URL JPEG (el navegador ya la reduce); se guarda fuera de public_html. */
/** JPEG real de hasta 3 MB, o null. */
function jpegDe(string $dataUrl): ?string
{
    if (!preg_match('#^data:image/jpeg;base64,#', $dataUrl)) return null;
    $bin = base64_decode(substr($dataUrl, 23), true);
    if ($bin === false || strlen($bin) > 3 * 1024 * 1024) return null;
    $info = @getimagesizefromstring($bin);
    return $info && $info['mime'] === 'image/jpeg' ? $bin : null;
}

function guardarFoto(int $id, string $dataUrl): bool
{
    global $DIR;
    $bin = jpegDe($dataUrl);
    if ($bin === null) return false;
    if (!is_dir("$DIR/fotos")) mkdir("$DIR/fotos", 0700, true);
    return file_put_contents("$DIR/fotos/$id.jpg", $bin) !== false;
}

const LEER_INSTRUCCIONES = 'Es la foto de la etiqueta de un equipo que un cliente deja en un taller de reparación (laptop, consola, tarjeta gráfica o PC). '
    . 'Extrae: tipo de equipo (Laptop, PC, Tarjeta gráfica, Consola u Otro); marca (ASUS, Lenovo, HP, Sony, MSI…); modelo tal como aparece en "Model", "Modelo" o "Model Name" '
    . '(por ejemplo G614JV o CFI-1215A; no uses el P/N si hay un modelo); y el número de serie de "S/N", "SN" o "Serial No.", '
    . 'copiado exactamente, sin espacios. Si un dato no se lee con seguridad, déjalo vacío: no lo adivines. '
    . 'legible es false si la foto no muestra una etiqueta de equipo.';

/** POST JSON con curl (el hosting no tiene Composer para instalar SDKs). Lanza RuntimeException si no responde 200. */
function postJson(string $url, array $cabeceras, array $cuerpo, int $espera = 45): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => $espera,
        CURLOPT_HTTPHEADER => array_merge(['content-type: application/json'], $cabeceras),
        CURLOPT_POSTFIELDS => json_encode($cuerpo, JSON_UNESCAPED_UNICODE),
    ]);
    $res = curl_exec($ch);
    $codigo = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $json = is_string($res) ? json_decode($res, true) : null;
    if ($codigo !== 200 || !is_array($json)) {
        error_log("recepcion leer: $url HTTP $codigo " . substr((string) $res, 0, 300));
        throw new RuntimeException('lectura');
    }
    return $json;
}

/** Elige el proveedor por la clave: las de Claude empiezan con "sk-ant-", las demás se tratan como DeepSeek. */
function leerEtiqueta(string $jpeg, string $clave): array
{
    return strpos($clave, 'sk-ant-') === 0 ? leerConClaude($jpeg, $clave) : leerConDeepSeek($jpeg, $clave);
}

/** DeepSeek (deepseek-flash lee imágenes): formato Chat Completions, JSON y sin "pensar" para que sea más barato. */
function leerConDeepSeek(string $jpeg, string $clave): array
{
    $json = postJson('https://api.deepseek.com/chat/completions', ['Authorization: Bearer ' . $clave], [
        'model' => 'deepseek-flash',
        'thinking' => ['type' => 'disabled'],
        'response_format' => ['type' => 'json_object'],
        'max_tokens' => 800,
        'messages' => [[
            'role' => 'user',
            'content' => [
                ['type' => 'text', 'text' => LEER_INSTRUCCIONES
                    . ' Responde solo con un objeto json como este: {"legible": true, "tipo": "Laptop", "marca": "ASUS", "modelo": "G614JV", "serie": "N3NRKD0099123AB"}'],
                ['type' => 'image_url', 'image_url' => ['url' => 'data:image/jpeg;base64,' . base64_encode($jpeg), 'detail' => 'high']],
            ],
        ]],
    ]);
    $choice = $json['choices'][0] ?? [];
    if (($choice['finish_reason'] ?? '') !== 'stop') return ['legible' => false];
    $datos = json_decode(trim((string) ($choice['message']['content'] ?? '')), true);
    return is_array($datos) ? $datos : ['legible' => false];
}

/** Claude (visión) con salida estructurada. */
function leerConClaude(string $jpeg, string $clave): array
{
    $esquema = [
        'type' => 'object',
        'properties' => [
            'legible' => ['type' => 'boolean'],
            'tipo' => ['type' => 'string', 'enum' => ['Laptop', 'PC', 'Tarjeta gráfica', 'Consola', 'Otro', '']],
            'marca' => ['type' => 'string'],
            'modelo' => ['type' => 'string'],
            'serie' => ['type' => 'string'],
        ],
        'required' => ['legible', 'tipo', 'marca', 'modelo', 'serie'],
        'additionalProperties' => false,
    ];
    $json = postJson('https://api.anthropic.com/v1/messages', ['x-api-key: ' . $clave, 'anthropic-version: 2023-06-01', 'anthropic-beta: server-side-fallback-2026-07-01'], [
        'model' => 'claude-opus-5-5',
        'max_tokens' => 4000,
        'output_config' => ['effort' => 'low', 'format' => ['type' => 'json_schema', 'schema' => $esquema]],
        'fallbacks' => 'default',
        'messages' => [[
            'role' => 'user',
            'content' => [
                ['type' => 'image', 'source' => ['type' => 'base64', 'media_type' => 'image/jpeg', 'data' => base64_encode($jpeg)]],
                ['type' => 'text', 'text' => LEER_INSTRUCCIONES],
            ],
        ]],
    ]);
    if (($json['stop_reason'] ?? '') !== 'end_turn') return ['legible' => false];
    foreach ($json['content'] ?? [] as $bloque) {
        if (($bloque['type'] ?? '') === 'text') {
            $datos = json_decode($bloque['text'], true);
            if (is_array($datos)) return $datos;
        }
    }
    return ['legible' => false];
}

/**
 * Borrador del informe técnico con DeepSeek V4 Pro (solo texto, mejor redacción que Flash).
 * A la IA solo van los datos que el informe necesita: nunca clave del equipo, correo, distrito ni DNI.
 */
function redactarInforme(array $o, array $notas, array $cobros, string $clave, string $modo = 'informe'): array
{
    $preguntas = $modo === 'preguntas';
    $ficha = [
        'equipo' => trim("{$o['tipo']} · {$o['marca']} {$o['modelo']}"),
        'serie' => (string) $o['serie'],
        'falla_reportada' => (string) $o['falla'],
        'deja_tambien' => (string) $o['accesorios'],
        'otro_tecnico_lo_abrio' => $o['abierto'] === null ? 'no sabe' : (bool) $o['abierto'],
        'le_cayo_liquido' => $o['liquido'] === null ? 'no sabe' : (bool) $o['liquido'],
        'reparar_sin_consultar' => (int) ($o['autoriza'] ?? 0) > 0,
    ];
    $json = postJson('https://api.deepseek.com/chat/completions', ['Authorization: Bearer ' . $clave], [
        'model' => 'deepseek-v4-pro',
        'thinking' => ['type' => 'disabled'],
        'response_format' => ['type' => 'json_object'],
        'temperature' => 0.4,
        'max_tokens' => $preguntas ? 1500 : 9000,
        'messages' => [
            ['role' => 'system', 'content' => require __DIR__ . '/informe-guia.php'],
            ['role' => 'user', 'content' => json_encode(['modo' => $modo, 'ficha' => $ficha, 'notas' => $notas, 'cobros' => $cobros], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)],
        ],
    ], $preguntas ? 90 : 150);
    $choice = $json['choices'][0] ?? [];
    $datos = json_decode(trim((string) ($choice['message']['content'] ?? '')), true);
    if (($choice['finish_reason'] ?? '') !== 'stop' || !is_array($datos)) throw new RuntimeException('informe');
    return $datos;
}

/** Mostrador (tus padres) ve lo necesario para recibir y ubicar el equipo; ni la clave del equipo ni montos. */
function columnas(string $rol): string
{
    return $rol === 'admin' ? '*' : 'id, creado, origen, nombre, whatsapp, tipo, marca, modelo, serie, accesorios, servicio, falla, liquido, abierto, estado, recibido, recibido_por, distrito, llega, modo, direccion, foto';
}

/** Datos del cliente y del equipo, limpios y validados. Lo usan el formulario (crear) y la edición del taller. */
function datosOrden(array $d): array
{
    $fila = [];
    foreach (CAMPOS as $campo => [$obligatorio, $max]) {
        $fila[$campo] = limpiar($d[$campo] ?? '', $max);
        if ($obligatorio && $fila[$campo] === '') fallo("Falta completar: $campo.");
    }
    $fila['serie'] = mb_strtoupper($fila['serie']);
    $digitos = preg_replace('/\D/', '', $fila['whatsapp']);
    // Celular peruano (9 dígitos que empiezan en 9, con o sin 51) o número extranjero con "+".
    $extranjero = substr($fila['whatsapp'], 0, 1) === '+' && substr($digitos, 0, 2) !== '51' && strlen($digitos) >= 8 && strlen($digitos) <= 15;
    if (!preg_match('/^(51)?9\d{8}$/', $digitos) && !$extranjero) fallo('Revisa el número de WhatsApp.');
    if ($fila['dni'] !== '' && !preg_match('/^(\d{8}|[A-Za-z0-9]{9,12})$/', $fila['dni'])) fallo('Revisa el DNI o CE.');
    if ($fila['correo'] !== '' && !filter_var($fila['correo'], FILTER_VALIDATE_EMAIL)) fallo('Revisa el correo.');
    $llega = (string) ($d['llega'] ?? '');
    $fila['llega'] = preg_match('/^\d{4}-\d{2}-\d{2}$/', $llega) ? $llega : null;
    $fila['modo'] = ($d['modo'] ?? '') === 'recojo' ? 'recojo' : 'taller';
    if ($fila['modo'] === 'recojo' && $fila['direccion'] === '') fallo('Falta la dirección para el recojo.');
    $fila['autoriza'] = max(0, min(5000, (int) ($d['autoriza'] ?? 0)));
    return $fila;
}

function numero(int $id): string
{
    return 'QF-' . str_pad((string) $id, 4, '0', STR_PAD_LEFT);
}

$accion = $_GET['accion'] ?? '';
$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($metodo === 'POST' && stripos((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') !== 0) fallo('Solicitud inválida.');

try {
    switch ("$metodo $accion") {
        case 'POST crear':
            $d = cuerpo();
            if (!empty($d['web'])) responder(['numero' => numero(0)]); // campo trampa: solo lo llenan los robots
            // Límite alto: varios clientes pueden compartir el wifi del taller.
            if (demasiados('crear', 20, 3600)) fallo('Ya registraste varios equipos. Escríbeme por WhatsApp para continuar.', 429);
            if (empty($d['acepta'])) fallo('Debes aceptar las condiciones.');
            $fila = datosOrden($d);
            $origen = isset($_COOKIE['qf_taller']) && rol() ? 'taller' : 'cliente'; // sin cookie no se abre sesión para el público
            $fila += ['liquido' => sino($d['liquido'] ?? null), 'abierto' => sino($d['abierto'] ?? null), 'creado' => date('c'), 'origen' => $origen, 'ip' => ip()];
            $cols = array_keys($fila);
            db()->prepare('INSERT INTO ordenes (' . implode(',', $cols) . ') VALUES (' . rtrim(str_repeat('?,', count($cols)), ',') . ')')->execute(array_values($fila));
            $id = (int) db()->lastInsertId();
            anotar('crear');
            historial($id, 'registrado', $origen === 'taller' ? 'taller' : 'cliente');
            db()->exec("UPDATE ordenes SET seguir = lower(hex(randomblob(12))) WHERE seguir IS NULL");
            if (!empty($d['foto']) && is_string($d['foto']) && guardarFoto($id, $d['foto'])) {
                db()->prepare('UPDATE ordenes SET foto = 1 WHERE id = ?')->execute([$id]);
            }
            if (!empty($CFG['correo'])) {
                $texto = numero($id) . "\n{$fila['nombre']} · {$fila['whatsapp']}\n{$fila['tipo']} {$fila['marca']} {$fila['modelo']}\nS/N: {$fila['serie']}\n" . ($fila['modo'] === 'recojo' ? "Recojo en: {$fila['direccion']}\n" : '') . ($fila['llega'] ? "Llega: {$fila['llega']}\n" : '') . "\n{$fila['falla']}\n\nhttps://quickfix.pe/taller/";
                @mail($CFG['correo'], '=?UTF-8?B?' . base64_encode('Nuevo equipo ' . numero($id) . ' · ' . $fila['nombre']) . '?=', $texto, "Content-Type: text/plain; charset=UTF-8\r\nFrom: QuickFix <no-reply@quickfix.pe>");
            }
            responder(['numero' => numero($id)]);

        case 'POST leer':
            // Una sola clave basta: DeepSeek o Claude, en cualquiera de las dos líneas de config.php.
            $claveIA = trim((string) (($CFG['deepseek_key'] ?? '') ?: ($CFG['anthropic_key'] ?? '')));
            if ($claveIA === '') fallo('La lectura automática no está activada.', 503);
            if (demasiados('leer', 15, 3600)) fallo('Leíste muchas etiquetas seguidas. Completa los datos a mano.', 429);
            $jpeg = jpegDe((string) (cuerpo()['foto'] ?? ''));
            if ($jpeg === null) fallo('No pude abrir esa foto. Prueba con otra.');
            anotar('leer');
            try {
                $l = leerEtiqueta($jpeg, $claveIA);
            } catch (RuntimeException $e) {
                fallo('No pude leer la etiqueta ahora. Completa los datos a mano.', 502);
            }
            responder([
                'legible' => !empty($l['legible']),
                // Solo un tipo de la lista del formulario, sin importar mayúsculas; si no, vacío.
                'tipo' => array_values(array_filter(['Laptop', 'PC', 'Tarjeta gráfica', 'Consola', 'Otro'], function ($t) use ($l) {
                    return mb_strtolower($t) === mb_strtolower(trim((string) ($l['tipo'] ?? '')));
                }))[0] ?? '',
                'marca' => limpiar($l['marca'] ?? '', 40),
                'modelo' => limpiar($l['modelo'] ?? '', 80),
                'serie' => mb_strtoupper(preg_replace('/[^A-Za-z0-9-]/', '', (string) ($l['serie'] ?? '')) ?? ''),
            ]);

        case 'GET sesion':
            responder(['rol' => rol()]);

        case 'POST entrar':
            if (demasiados('entrar', 8, 900)) fallo('Demasiados intentos. Espera 15 minutos.', 429);
            $clave = (string) (cuerpo()['clave'] ?? '');
            $nuevo = null;
            foreach (['admin' => 'clave_admin', 'mostrador' => 'clave_mostrador'] as $r => $k) {
                if (!empty($CFG[$k]) && hash_equals((string) $CFG[$k], $clave)) $nuevo = $r;
            }
            if (!$nuevo) {
                anotar('entrar');
                fallo('Clave incorrecta.', 401);
            }
            iniciarSesion();
            session_regenerate_id(true);
            $_SESSION['rol'] = $nuevo;
            responder(['rol' => $nuevo]);

        case 'POST salir':
            iniciarSesion();
            $_SESSION = [];
            session_destroy();
            responder(['ok' => true]);

        case 'GET lista':
            $r = exigir('admin', 'mostrador');
            // shortcut: sin límite de filas; con columnas cortas, 5000 casos pesan ~1 MB. Si llega a eso, ocultar entregados de hace meses.
            $filas = db()->query('SELECT ' . COLUMNAS_LISTA . ($r === 'admin' ? ', presupuesto, (SELECT IFNULL(SUM(monto), 0) FROM pagos WHERE orden_id = ordenes.id) AS pagado' : '') . ' FROM ordenes ORDER BY id DESC')->fetchAll();
            foreach ($filas as &$f) $f['numero'] = numero((int) $f['id']);
            responder(['rol' => $r, 'ordenes' => $filas]);

        case 'GET orden':
            // Lo que abre el QR de la etiqueta.
            $r = exigir('admin', 'mostrador');
            $q = db()->prepare('SELECT ' . columnas($r) . ' FROM ordenes WHERE id = ?');
            $q->execute([(int) ($_GET['id'] ?? 0)]);
            $o = $q->fetch();
            if (!$o) fallo('No existe esa orden.', 404);
            $o['numero'] = numero((int) $o['id']);
            $h = db()->prepare('SELECT estado, quien, fecha FROM historial WHERE orden_id = ? ORDER BY fecha, rowid');
            $h->execute([(int) $o['id']]);
            $o['historial'] = $h->fetchAll();
            $o['fotos_entrada'] = fotosEntrada((int) $o['id']);
            if ($r === 'admin') $o['pagos'] = pagos((int) $o['id']);
            responder(['rol' => $r, 'orden' => $o]);

        case 'POST pago':
            // Solo tú: adelanto o saldo que pagó el cliente.
            exigir('admin');
            $d = cuerpo();
            $id = (int) ($d['id'] ?? 0);
            $monto = round((float) ($d['monto'] ?? 0), 2);
            if ($monto <= 0 || $monto > 99999) fallo('Monto inválido.');
            $q = db()->prepare('SELECT 1 FROM ordenes WHERE id = ?');
            $q->execute([$id]);
            if (!$q->fetch()) fallo('No existe esa orden.', 404);
            db()->prepare('INSERT INTO pagos (orden_id, monto, fecha) VALUES (?, ?, ?)')->execute([$id, $monto, date('c')]);
            responder(['pagos' => pagos($id)]);

        case 'POST borrar_pago':
            exigir('admin');
            $d = cuerpo();
            $id = (int) ($d['id'] ?? 0);
            db()->prepare('DELETE FROM pagos WHERE rowid = ? AND orden_id = ?')->execute([(int) ($d['pago'] ?? 0), $id]);
            responder(['pagos' => pagos($id)]);

        case 'POST actualizar':
            // Solo tú: estado del equipo y presupuesto.
            exigir('admin');
            $d = cuerpo();
            $id = (int) ($d['id'] ?? 0);
            if (array_key_exists('placa', $d)) {
                $placa = $d['placa'] === null || $d['placa'] === '' ? null : round(max(0, min(99999, (float) $d['placa'])), 2);
                db()->prepare('UPDATE ordenes SET placa = ? WHERE id = ?')->execute([$placa, $id]);
            }
            if (isset($d['estado'])) {
                if (!in_array($d['estado'], ESTADOS, true)) fallo('Estado inválido.');
                $q = db()->prepare('SELECT estado, placa FROM ordenes WHERE id = ?');
                $q->execute([$id]);
                $o = $q->fetch();
                if (!$o) fallo('No existe esa orden.', 404);
                [$estado, $error] = destinoEstado($o, $d['estado']);
                if ($error) fallo($error, 409);
                // cambio: desde cuándo está en este estado (para los días en el taller y los atrasados).
                $q = db()->prepare('UPDATE ordenes SET estado = ?, cambio = ? WHERE id = ? AND estado != ?');
                $q->execute([$estado, date('c'), $id, $estado]);
                if ($q->rowCount() === 1) historial($id, $estado, 'admin');
                $nuevoEstado = $estado;
            }
            if (array_key_exists('presupuesto', $d)) {
                $monto = $d['presupuesto'] === null || $d['presupuesto'] === '' ? null : round(max(0, min(99999, (float) $d['presupuesto'])), 2);
                db()->prepare('UPDATE ordenes SET presupuesto = ? WHERE id = ?')->execute([$monto, $id]);
            }
            responder(['ok' => true, 'estado' => $nuevoEstado ?? null]);

        case 'GET informe':
            exigir('admin');
            $q = db()->prepare('SELECT datos FROM informes WHERE orden_id = ?');
            $q->execute([(int) ($_GET['id'] ?? 0)]);
            $fila = $q->fetch();
            responder(['informe' => $fila ? json_decode($fila['datos'], true) : null]);

        case 'POST informe':
            // Guarda lo que revisaste: notas, cobros y el texto final (la página lo arma; aquí solo se guarda).
            exigir('admin');
            $d = cuerpo();
            $id = (int) ($d['id'] ?? 0);
            $datos = json_encode($d['informe'] ?? null, JSON_UNESCAPED_UNICODE);
            if (!is_array($d['informe'] ?? null) || strlen($datos) > 200000) fallo('Informe inválido.');
            $q = db()->prepare('SELECT 1 FROM ordenes WHERE id = ?');
            $q->execute([$id]);
            if (!$q->fetch()) fallo('No existe esa orden.', 404);
            db()->prepare('INSERT OR REPLACE INTO informes (orden_id, datos, actualizado) VALUES (?, ?, ?)')->execute([$id, $datos, date('c')]);
            responder(['ok' => true]);

        // preguntas: lo que la IA necesita saber antes de redactar; redactar: el informe con esas respuestas.
        case 'POST preguntas':
        case 'POST redactar':
            exigir('admin');
            $claveIA = trim((string) ($CFG['deepseek_key'] ?? ''));
            if ($claveIA === '') fallo('Falta la clave de DeepSeek en config.php.', 503);
            if (demasiados('redactar', 60, 3600)) fallo('Generaste muchos informes seguidos. Espera un rato.', 429);
            $d = cuerpo();
            $q = db()->prepare('SELECT * FROM ordenes WHERE id = ?');
            $q->execute([(int) ($d['id'] ?? 0)]);
            $o = $q->fetch();
            if (!$o) fallo('No existe esa orden.', 404);
            $n = is_array($d['notas'] ?? null) ? $d['notas'] : [];
            $notas = [];
            foreach (['hallazgos' => 6000, 'resultado' => 60] as $k => $max) $notas[$k] = mb_substr(trim((string) ($n[$k] ?? '')), 0, $max);
            if ($notas['hallazgos'] === '') fallo('Escribe primero tu diagnóstico.');
            $notas['respuestas'] = [];
            foreach (array_slice(is_array($n['respuestas'] ?? null) ? $n['respuestas'] : [], 0, 6) as $r) {
                if (!is_array($r)) continue;
                $notas['respuestas'][] = ['pregunta' => mb_substr(trim((string) ($r['pregunta'] ?? '')), 0, 300), 'respuesta' => mb_substr(trim((string) ($r['respuesta'] ?? '')), 0, 1000)];
            }
            $cobros = [];
            foreach (array_slice(is_array($d['cobros'] ?? null) ? $d['cobros'] : [], 0, 12) as $c) {
                $cobros[] = ['concepto' => limpiar($c['concepto'] ?? '', 200), 'monto' => round((float) ($c['monto'] ?? 0), 2), 'nota' => limpiar($c['nota'] ?? '', 200)];
            }
            anotar('redactar');
            // La IA tarda: la sesión se suelta para que la página pueda seguir consultando mientras tanto.
            session_write_close();
            set_time_limit(300);
            if ($accion === 'preguntas') {
                try {
                    $r = redactarInforme($o, $notas, $cobros, $claveIA, 'preguntas');
                } catch (RuntimeException $e) {
                    fallo('La IA no respondió bien. Intenta de nuevo en un momento.', 502);
                }
                $lista = array_values(array_filter(array_map(function ($p) { return is_string($p) ? mb_substr(trim($p), 0, 300) : ''; }, is_array($r['preguntas'] ?? null) ? $r['preguntas'] : [])));
                responder(['preguntas' => array_slice($lista, 0, 4)]);
            }
            // Un informe completo tarda más de lo que LiteSpeed espera una respuesta (corta la conexión con una página de error).
            // Se responde enseguida y se redacta en segundo plano; la página consulta "borrador" hasta que esté listo.
            $id = (int) $o['id'];
            db()->prepare("INSERT OR REPLACE INTO borradores (orden_id, estado, datos, actualizado) VALUES (?, 'redactando', '', ?)")->execute([$id, date('c')]);
            soltarRespuesta(['pendiente' => true], 202);
            try {
                $estado = 'listo';
                $datos = (string) json_encode(redactarInforme($o, $notas, $cobros, $claveIA), JSON_UNESCAPED_UNICODE);
            } catch (Throwable $e) {
                error_log('recepcion redactar: ' . $e->getMessage());
                $estado = 'error';
                $datos = '';
            }
            db()->prepare('UPDATE borradores SET estado = ?, datos = ?, actualizado = ? WHERE orden_id = ?')->execute([$estado, $datos, date('c'), $id]);
            exit;

        case 'GET borrador':
            exigir('admin');
            $q = db()->prepare('SELECT estado, datos, actualizado FROM borradores WHERE orden_id = ?');
            $q->execute([(int) ($_GET['id'] ?? 0)]);
            $b = $q->fetch();
            if (!$b) fallo('No hay un informe en preparación. Vuelve a generarlo.', 404);
            // Si sigue "redactando" después de 5 minutos, el proceso se cortó.
            if ($b['estado'] === 'error' || ($b['estado'] === 'redactando' && strtotime($b['actualizado']) < time() - 300)) {
                fallo('La IA no respondió bien. Intenta de nuevo en un momento.', 502);
            }
            if ($b['estado'] !== 'listo') responder(['pendiente' => true]);
            responder(['borrador' => json_decode($b['datos'], true)]);

        case 'POST editar':
            // Solo tú: corregir datos del cliente o del equipo. Mismas reglas que el formulario; el N° de orden no cambia.
            exigir('admin');
            $d = cuerpo();
            $id = (int) ($d['id'] ?? 0);
            $fila = datosOrden($d) + ['liquido' => sino($d['liquido'] ?? null), 'abierto' => sino($d['abierto'] ?? null)];
            $q = db()->prepare('UPDATE ordenes SET ' . implode(' = ?, ', array_keys($fila)) . ' = ? WHERE id = ?');
            $q->execute(array_merge(array_values($fila), [$id]));
            if ($q->rowCount() !== 1) fallo('No existe esa orden.', 404);
            responder(['ok' => true]);

        case 'POST borrar':
            // Solo tú: casos de prueba. El siguiente N° sigue al mayor que quede (los que quedan no cambian, ya tienen etiqueta).
            exigir('admin');
            $id = (int) (cuerpo()['id'] ?? 0);
            $q = db()->prepare('DELETE FROM ordenes WHERE id = ?');
            $q->execute([$id]);
            if ($q->rowCount() !== 1) fallo('No existe esa orden.', 404);
            db()->prepare('DELETE FROM informes WHERE orden_id = ?')->execute([$id]);
            db()->prepare('DELETE FROM borradores WHERE orden_id = ?')->execute([$id]);
            db()->prepare('DELETE FROM historial WHERE orden_id = ?')->execute([$id]);
            db()->prepare('DELETE FROM pagos WHERE orden_id = ?')->execute([$id]);
            @unlink("$DIR/fotos/$id.jpg");
            foreach (glob("$DIR/fotos/$id-e*.jpg") ?: [] as $f) @unlink($f);
            db()->exec("UPDATE sqlite_sequence SET seq = (SELECT IFNULL(MAX(id), 0) FROM ordenes) WHERE name = 'ordenes'");
            responder(['ok' => true]);

        case 'POST renumerar':
            // Solo tú: tras borrar las pruebas, los casos que quedan pasan a QF-0001, QF-0002… en el mismo orden.
            exigir('admin');
            $pdo = db();
            $ids = $pdo->query('SELECT id FROM ordenes ORDER BY id')->fetchAll(PDO::FETCH_COLUMN);
            $cambios = 0;
            $pdo->beginTransaction();
            foreach ($ids as $i => $viejo) {
                $nuevo = $i + 1; // siempre menor o igual y libre: se recorre de menor a mayor
                if ((int) $viejo === $nuevo) continue;
                $pdo->prepare('UPDATE ordenes SET id = ? WHERE id = ?')->execute([$nuevo, $viejo]);
                $pdo->prepare('UPDATE informes SET orden_id = ? WHERE orden_id = ?')->execute([$nuevo, $viejo]);
                $pdo->prepare('UPDATE historial SET orden_id = ? WHERE orden_id = ?')->execute([$nuevo, $viejo]);
                $pdo->prepare('UPDATE pagos SET orden_id = ? WHERE orden_id = ?')->execute([$nuevo, $viejo]);
                $pdo->prepare('DELETE FROM borradores WHERE orden_id = ?')->execute([$viejo]);
                $cambios++;
            }
            $pdo->exec("UPDATE sqlite_sequence SET seq = (SELECT IFNULL(MAX(id), 0) FROM ordenes) WHERE name = 'ordenes'");
            $pdo->commit();
            // Las fotos se mueven después del commit: si la base falla, quedan donde estaban.
            foreach ($ids as $i => $viejo) {
                if ((int) $viejo === $i + 1) continue;
                if (is_file("$DIR/fotos/$viejo.jpg")) rename("$DIR/fotos/$viejo.jpg", "$DIR/fotos/" . ($i + 1) . '.jpg');
                foreach (glob("$DIR/fotos/$viejo-e*.jpg") ?: [] as $f) rename($f, str_replace("/$viejo-e", '/' . ($i + 1) . '-e', $f));
            }
            responder(['cambios' => $cambios]);

        case 'POST recibir':
            $r = exigir('admin', 'mostrador');
            $d = cuerpo();
            $q = db()->prepare("UPDATE ordenes SET estado = 'recibido', recibido = ?, cambio = ?, recibido_por = ? WHERE id = ? AND estado = 'registrado'");
            $q->execute([date('c'), date('c'), $r, (int) ($d['id'] ?? 0)]);
            if ($q->rowCount() === 1) historial((int) $d['id'], 'recibido', $r);
            responder(['ok' => $q->rowCount() === 1]);

        case 'GET foto':
            exigir('admin', 'mostrador');
            $n = (int) ($_GET['n'] ?? 0);
            $archivo = "$DIR/fotos/" . (int) ($_GET['id'] ?? 0) . ($n > 0 ? "-e$n" : '') . '.jpg';
            if (!is_file($archivo)) fallo('Sin foto.', 404);
            header('Content-Type: image/jpeg');
            header('Content-Length: ' . filesize($archivo));
            readfile($archivo);
            exit;

        case 'POST foto_entrada':
            // Fotos del equipo al recibirlo (golpes, rayones, piezas que faltan): respaldo ante reclamos.
            exigir('admin', 'mostrador');
            $d = cuerpo();
            $id = (int) ($d['id'] ?? 0);
            $q = db()->prepare('SELECT 1 FROM ordenes WHERE id = ?');
            $q->execute([$id]);
            if (!$q->fetch()) fallo('No existe esa orden.', 404);
            $hay = fotosEntrada($id);
            if (count($hay) >= MAX_FOTOS_ENTRADA) fallo('Ya hay ' . MAX_FOTOS_ENTRADA . ' fotos de este equipo.');
            $bin = jpegDe((string) ($d['foto'] ?? ''));
            if ($bin === null) fallo('La foto no es válida.');
            if (!is_dir("$DIR/fotos")) mkdir("$DIR/fotos", 0700, true);
            $n = ($hay ? max($hay) : 0) + 1;
            if (file_put_contents("$DIR/fotos/$id-e$n.jpg", $bin) === false) fallo('No se pudo guardar la foto.', 500);
            responder(['fotos' => fotosEntrada($id)]);

        case 'POST borrar_foto':
            exigir('admin');
            $d = cuerpo();
            $id = (int) ($d['id'] ?? 0);
            @unlink("$DIR/fotos/$id-e" . (int) ($d['n'] ?? 0) . '.jpg');
            responder(['fotos' => fotosEntrada($id)]);

        case 'GET seguimiento':
            // Público: lo que ve el cliente con su enlace. Solo el primer nombre, el equipo y el avance; nada más.
            $t = (string) ($_GET['t'] ?? '');
            if (demasiados('seguir', 30, 900)) fallo('Demasiados intentos. Espera unos minutos.', 429);
            if (!preg_match('/^[a-f0-9]{24}$/', $t)) { anotar('seguir'); fallo('Enlace no válido.', 404); }
            $q = db()->prepare('SELECT id, nombre, tipo, marca, modelo, estado, creado, recibido, nota FROM ordenes WHERE seguir = ?');
            $q->execute([$t]);
            $o = $q->fetch();
            if (!$o) { anotar('seguir'); fallo('No encontramos este equipo. Revisa el enlace o escríbenos por WhatsApp.', 404); }
            $h = db()->prepare('SELECT estado, fecha FROM historial WHERE orden_id = ? ORDER BY fecha, rowid');
            $h->execute([(int) $o['id']]);
            responder(['caso' => [
                'numero' => numero((int) $o['id']), 'nombre' => explode(' ', trim($o['nombre']))[0],
                'tipo' => $o['tipo'], 'marca' => $o['marca'], 'modelo' => $o['modelo'],
                'estado' => $o['estado'], 'creado' => $o['creado'], 'recibido' => $o['recibido'], 'historial' => $h->fetchAll(),
                'nota' => $o['nota'] === null ? null : (int) $o['nota'],
            ]]);

        case 'POST calificar':
            // Público: encuesta de 1 clic tras la entrega (1 = bien, -1 = pudo ser mejor). Se puede cambiar.
            $d = cuerpo();
            $t = (string) ($d['t'] ?? '');
            $nota = (int) ($d['nota'] ?? 0);
            if (demasiados('seguir', 30, 900)) fallo('Demasiados intentos. Espera unos minutos.', 429);
            if (!preg_match('/^[a-f0-9]{24}$/', $t) || !in_array($nota, [1, -1], true)) { anotar('seguir'); fallo('Solicitud inválida.'); }
            $q = db()->prepare("UPDATE ordenes SET nota = ? WHERE seguir = ? AND estado IN ('entregado', 'devuelto')");
            $q->execute([$nota, $t]);
            if ($q->rowCount() !== 1) { anotar('seguir'); fallo('Podrás calificarnos cuando recojas tu equipo.', 409); }
            responder(['ok' => true]);

        case 'GET csv':
            exigir('admin');
            header('Content-Type: text/csv; charset=utf-8');
            header('Content-Disposition: attachment; filename="quickfix-equipos-' . date('Y-m-d') . '.csv"');
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // BOM para que Excel lea las tildes
            $filas = db()->query('SELECT * FROM ordenes ORDER BY id')->fetchAll();
            if ($filas) {
                fputcsv($out, array_merge(['numero'], array_keys($filas[0])), ';');
                foreach ($filas as $f) fputcsv($out, array_merge([numero((int) $f['id'])], array_values($f)), ';');
            }
            exit;

        default:
            fallo('Acción desconocida.', 404);
    }
} catch (Throwable $e) {
    error_log('recepcion: ' . $e->getMessage());
    fallo('Hubo un problema guardando los datos. Escríbeme por WhatsApp.', 500);
}
