<?php
// Recepción de equipos: el cliente se registra en /recepcion/ y el taller los ve en /taller/.
// Los datos viven fuera de public_html, en /home/quickfix/recepcion/ (config.php y recepcion.sqlite),
// así nadie puede descargarlos desde internet y nunca pasan por GitHub.
//
// Acciones (?accion=):  crear (público) · sesion · entrar · salir · lista · recibir · foto · csv

declare(strict_types=1);
date_default_timezone_set('America/Lima');

$DIR = getenv('QF_RECEPCION_DIR') ?: dirname($_SERVER['DOCUMENT_ROOT'] ?? __DIR__) . '/recepcion';
const ESTADOS = ['registrado', 'recibido', 'diagnostico', 'aprobacion', 'reparacion', 'pruebas', 'listo', 'entregado', 'devuelto'];
const CAMPOS = [
    // campo => [obligatorio, largo máximo]
    'nombre' => [true, 100], 'dni' => [false, 12], 'whatsapp' => [true, 20], 'correo' => [false, 120], 'distrito' => [false, 60],
    'como' => [false, 40], 'tipo' => [true, 30], 'marca' => [true, 40], 'modelo' => [true, 80], 'serie' => [false, 40],
    'pin' => [false, 40], 'accesorios' => [false, 120], 'servicio' => [false, 40], 'falla' => [true, 1000], 'direccion' => [false, 200],
];
// Columnas agregadas después de la primera versión: se crean solas en bases que ya existían.
const COLUMNAS_NUEVAS = ['llega' => 'TEXT', 'modo' => 'TEXT', 'direccion' => 'TEXT', 'autoriza' => 'INTEGER', 'foto' => 'INTEGER'];

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

function responder($datos, int $codigo = 200): void
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
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
    return $pdo;
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
function guardarFoto(int $id, string $dataUrl): bool
{
    global $DIR;
    if (!preg_match('#^data:image/jpeg;base64,#', $dataUrl)) return false;
    $bin = base64_decode(substr($dataUrl, 23), true);
    if ($bin === false || strlen($bin) > 3 * 1024 * 1024) return false;
    $info = @getimagesizefromstring($bin);
    if (!$info || $info['mime'] !== 'image/jpeg') return false;
    if (!is_dir("$DIR/fotos")) mkdir("$DIR/fotos", 0700, true);
    return file_put_contents("$DIR/fotos/$id.jpg", $bin) !== false;
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
            $fila = [];
            foreach (CAMPOS as $campo => [$obligatorio, $max]) {
                $fila[$campo] = limpiar($d[$campo] ?? '', $max);
                if ($obligatorio && $fila[$campo] === '') fallo("Falta completar: $campo.");
            }
            $fila['serie'] = mb_strtoupper($fila['serie']);
            $digitos = preg_replace('/\D/', '', $fila['whatsapp']);
            // Celular peruano (9 dígitos que empiezan en 9, con o sin 51) o número extranjero con "+".
            $extranjero = substr($fila['whatsapp'], 0, 1) === '+' && substr($digitos, 0, 2) !== '51' && strlen($digitos) >= 8 && strlen($digitos) <= 15;
            if (!preg_match('/^(51)?9\d{8}$/', $digitos) && !$extranjero) fallo('Revisa tu número de WhatsApp.');
            if ($fila['dni'] !== '' && !preg_match('/^(\d{8}|[A-Za-z0-9]{9,12})$/', $fila['dni'])) fallo('Revisa tu DNI o CE.');
            if ($fila['correo'] !== '' && !filter_var($fila['correo'], FILTER_VALIDATE_EMAIL)) fallo('Revisa tu correo.');
            $llega = (string) ($d['llega'] ?? '');
            $fila['llega'] = preg_match('/^\d{4}-\d{2}-\d{2}$/', $llega) ? $llega : null;
            $fila['modo'] = ($d['modo'] ?? '') === 'recojo' ? 'recojo' : 'taller';
            if ($fila['modo'] === 'recojo' && $fila['direccion'] === '') fallo('Falta la dirección para el recojo.');
            $fila['autoriza'] = max(0, min(5000, (int) ($d['autoriza'] ?? 0)));
            $origen = isset($_COOKIE['qf_taller']) && rol() ? 'taller' : 'cliente'; // sin cookie no se abre sesión para el público
            $fila += ['liquido' => sino($d['liquido'] ?? null), 'abierto' => sino($d['abierto'] ?? null), 'creado' => date('c'), 'origen' => $origen, 'ip' => ip()];
            $cols = array_keys($fila);
            db()->prepare('INSERT INTO ordenes (' . implode(',', $cols) . ') VALUES (' . rtrim(str_repeat('?,', count($cols)), ',') . ')')->execute(array_values($fila));
            $id = (int) db()->lastInsertId();
            anotar('crear');
            if (!empty($d['foto']) && is_string($d['foto']) && guardarFoto($id, $d['foto'])) {
                db()->prepare('UPDATE ordenes SET foto = 1 WHERE id = ?')->execute([$id]);
            }
            if (!empty($CFG['correo'])) {
                $texto = numero($id) . "\n{$fila['nombre']} · {$fila['whatsapp']}\n{$fila['tipo']} {$fila['marca']} {$fila['modelo']}\nS/N: {$fila['serie']}\n" . ($fila['modo'] === 'recojo' ? "Recojo en: {$fila['direccion']}\n" : '') . ($fila['llega'] ? "Llega: {$fila['llega']}\n" : '') . "\n{$fila['falla']}\n\nhttps://quickfix.pe/taller/";
                @mail($CFG['correo'], '=?UTF-8?B?' . base64_encode('Nuevo equipo ' . numero($id) . ' · ' . $fila['nombre']) . '?=', $texto, "Content-Type: text/plain; charset=UTF-8\r\nFrom: QuickFix <no-reply@quickfix.pe>");
            }
            responder(['numero' => numero($id)]);

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
            // Mostrador ve lo necesario para recibir el equipo; ni la clave del equipo ni montos.
            $cols = $r === 'admin' ? '*' : 'id, creado, origen, nombre, whatsapp, tipo, marca, modelo, serie, accesorios, servicio, falla, liquido, abierto, estado, recibido, recibido_por, distrito, llega, modo, direccion, foto';
            $where = ($_GET['filtro'] ?? '') === 'pendientes' ? "WHERE estado = 'registrado'" : '';
            $filas = db()->query("SELECT $cols FROM ordenes $where ORDER BY id DESC LIMIT 200")->fetchAll();
            foreach ($filas as &$f) $f['numero'] = numero((int) $f['id']);
            responder(['rol' => $r, 'ordenes' => $filas]);

        case 'POST recibir':
            $r = exigir('admin', 'mostrador');
            $d = cuerpo();
            $q = db()->prepare("UPDATE ordenes SET estado = 'recibido', recibido = ?, recibido_por = ? WHERE id = ? AND estado = 'registrado'");
            $q->execute([date('c'), $r, (int) ($d['id'] ?? 0)]);
            responder(['ok' => $q->rowCount() === 1]);

        case 'GET foto':
            exigir('admin', 'mostrador');
            $archivo = "$DIR/fotos/" . (int) ($_GET['id'] ?? 0) . '.jpg';
            if (!is_file($archivo)) fallo('Sin foto.', 404);
            header('Content-Type: image/jpeg');
            header('Content-Length: ' . filesize($archivo));
            readfile($archivo);
            exit;

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
