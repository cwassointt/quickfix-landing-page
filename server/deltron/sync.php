<?php
// Sincronización diaria del catálogo de Deltron (cron a las 5 a. m.).
// Vive en /home/quickfix/deltron/ (fuera de public_html) junto a config.php.
// Publica solo precios de venta en soles: nunca el costo ni el tipo de cambio (son confidenciales).
//
// Uso:  php sync.php            → sincroniza
//       php sync.php --test     → solo prueba la fórmula de precios

const BASE = 'https://api.deltron.com.pe/vadhsgytGn/partner-service';
const IGV = 1.18;
const OUT = '/home/quickfix/public_html/data/componentes.json';

// Qué se vende y con qué nombre se muestra (id de categoría o subcategoría de Deltron → nombre en la web).
// El orden es el de los filtros en la página. La lista completa queda en categorias.txt tras cada sincronización.
const CATEGORIAS = [
    'NBK' => 'Laptops',
    'MON' => 'Monitores',
    'CPU' => 'Procesadores',
    'MBD' => 'Placas madre',
    'MEM' => 'Memorias RAM',
    'HDES' => 'SSD',
    'HD' => 'Discos duros',
    'PSCS' => 'Fuentes',
    'CPX' => 'Refrigeración',
    'CSE' => 'Cases',
    'KB' => 'Teclados',
    'MI' => 'Mouse',
    'AUD' => 'Audio',
    'CMRV' => 'Webcams',
    'HDE' => 'Discos externos',
    'GCH0' => 'Sillas gamer',
];

// Precio final en soles a partir del costo con IGV. Margen: S/ 25 mínimo, 30 % hasta S/ 75, y 8 % desde ~S/ 937.
function precioVenta(float $costo): int {
    $margen = $costo > 937.5 ? $costo * 0.08 : min(75, max(25, $costo * 0.30));
    return (int) (ceil(($costo + $margen + 1) / 10) * 10 - 1); // redondea hacia arriba a ...9
}

if (in_array('--test', $argv ?? [], true)) {
    foreach ([[60, 89], [120, 159], [280, 359], [3590, 3879], [134, 179], [937, 1019], [938, 1019]] as [$c, $esperado]) {
        $p = precioVenta($c);
        echo ($p === $esperado ? 'ok   ' : 'MAL  ') . "costo $c → S/ $p (esperado $esperado)\n";
    }
    exit;
}

$dir = __DIR__;
// Todo error queda en sync.log y en el correo del cron (este PHP no los muestra por defecto).
ini_set('display_errors', '1');
ini_set('log_errors', '1');
ini_set('error_log', "$dir/sync.log");
error_reporting(E_ALL);
set_time_limit(0);

// Un cron cada minuto podría lanzar otra descarga mientras la anterior sigue: solo corre una a la vez.
$lock = fopen("$dir/sync.lock", 'c');
if (!flock($lock, LOCK_EX | LOCK_NB)) exit("Ya hay una sincronización en curso.\n");

$config = require "$dir/config.php";

function falla(string $msg): never {
    fwrite(STDERR, "FALLA: $msg\n");
    exit(1);
}

function pedir(string $url, array $opts = []): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4, CURLOPT_TIMEOUT => 30]);
    curl_setopt_array($ch, $opts); // después: CURLOPT_FILE debe ganarle a RETURNTRANSFER
    $body = curl_exec($ch);
    return ['code' => curl_getinfo($ch, CURLINFO_HTTP_CODE), 'body' => $body, 'error' => curl_error($ch)];
}

// Token: Deltron devuelve el mismo mientras esté vigente, pero el endpoint tiene límite, así que lo guardamos.
function token(string $dir, array $config): string {
    $file = "$dir/token.json";
    $t = is_file($file) ? json_decode(file_get_contents($file), true) : null;
    if ($t && strtotime($t['expires_at']) > time() + 600) return $t['token'];

    $r = pedir(BASE . '/api/auth/token', [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode(['api_key' => $config['api_key'], 'api_secret' => $config['api_secret']]),
    ]);
    $data = json_decode((string) $r['body'], true);
    if ($r['code'] !== 200) falla("token HTTP {$r['code']}: " . ($data['result']['error_msg'] ?? $r['error']));
    file_put_contents($file, json_encode(['token' => $data['result']['token'], 'expires_at' => $data['result']['expires_at']]));
    chmod($file, 0600);
    return $data['result']['token'];
}

// El catálogo es pesado: se descarga directo a disco y no a memoria.
$raw = "$dir/catalogo-raw.json";
// Deltron permite 4 descargas cada 4 horas: si la última tiene menos de 3 horas, se reutiliza.
$fresco = is_file($raw) && filesize($raw) > 1000 && time() - filemtime($raw) < 3 * 3600;
if ($fresco) {
    echo 'Uso el catálogo descargado a las ' . date('H:i', filemtime($raw)) . "\n";
} else {
    $fh = fopen("$raw.tmp", 'w');
    $r = pedir(BASE . '/api/catalogo', [
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . token($dir, $config)],
        CURLOPT_FILE => $fh, // directo a disco; no poner RETURNTRANSFER false: lo mandaría a la pantalla
        CURLOPT_TIMEOUT => 600,
    ]);
    fclose($fh);
    if ($r['code'] !== 200) {
        $msg = json_decode((string) file_get_contents("$raw.tmp"), true)['result']['error_msg'] ?? $r['error'];
        @unlink("$raw.tmp");
        falla("catálogo HTTP {$r['code']}: $msg"); // se queda el catálogo publicado de ayer
    }
    rename("$raw.tmp", $raw);
    echo 'Catálogo descargado: ' . round(filesize($raw) / 1048576, 1) . " MB\n";
}

ini_set('memory_limit', '1024M');
echo 'Memoria permitida: ' . ini_get('memory_limit') . "\n";
$cat = json_decode(file_get_contents($raw), true) ?? falla('no pude leer el catálogo: ' . json_last_error_msg());
$items = $cat['result']['items'] ?? falla('el catálogo no trae items');
$tc = (float) ($cat['result']['currency_change_val'] ?? 0) ?: falla('el catálogo no trae tipo de cambio');

// Resumen de categorías (privado) para elegir cuáles vender.
$resumen = [];
foreach ($items as $p) {
    $k = "{$p['category_id']}\t{$p['category_name']}\t{$p['subcategory_id']}\t{$p['subcategory_name']}";
    $resumen[$k] = ($resumen[$k] ?? 0) + 1;
}
ksort($resumen);
$txt = "category_id\tcategoría\tsubcategory_id\tsubcategoría\tproductos\n";
foreach ($resumen as $k => $n) $txt .= "$k\t$n\n";
file_put_contents("$dir/categorias.txt", $txt);

$texto = fn($s) => trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags(str_replace('[@@@]', ' ', (string) $s)), ENT_QUOTES | ENT_HTML5, 'UTF-8')));
$frase = fn($s) => mb_strtoupper(mb_substr($s, 0, 1)) . mb_substr(mb_strtolower($s), 1);

// Deltron manda la ficha técnica solo como tabla HTML: celda de sección (firCol) + filas "dato | valor".
function specsDeHtml(string $html, callable $texto, callable $frase): array {
    $out = [];
    $seccion = '';
    foreach (preg_split('~</tr>~i', $html) as $fila) {
        $celdas = [];
        preg_match_all('~<td([^>]*)>((?:(?!<td|</td>).)*)</td>~is', $fila, $m, PREG_SET_ORDER);
        foreach ($m as [, $attrs, $contenido]) {
            $t = $texto(preg_replace('~<[^>]*>~', ' ', $contenido));
            if ($t === '') continue;
            if (stripos($attrs, 'fircol') !== false) $seccion = $frase($t);
            else $celdas[] = $t;
        }
        if (count($celdas) < 2) continue;
        $dato = $frase($celdas[0]);
        $valor = end($celdas);
        if (preg_match('~^(marca|modelo|n[uú]mero de parte|part number|c[oó]d)~iu', $dato) || preg_match('~https?://~i', $valor)) continue;
        // Secciones genéricas no aportan; las demás distinguen "Batería · Capacidad" de "Memoria · Capacidad".
        if ($seccion && !preg_match('~^(descripci[oó]n|caracter[ií]sticas|general|especificaciones)~iu', $seccion)) $dato = "$seccion · $dato";
        $out[$dato] ??= $valor;
    }
    return $out;
}
// Deltron agrega su línea comercial a la marca ("LENOVO - IDEA", "HP COMERCIAL", "AMD-ADVANCED MICRO DEVICE").
function marca(string $m): string {
    $m = preg_replace('~\s+(COMERCIAL|CONSUMO|CORP|ELECTRONICS|STORAGE)$~i', '', trim(preg_split('~\s*-\s*~', $m)[0]));
    return stripos($m, 'OTRAS MARCAS') !== false ? '' : $m;
}

$productos = [];
foreach ($items as $p) {
    // La subcategoría manda (las sillas gamer son una subcategoría dentro de accesorios).
    $categoria = CATEGORIAS[$p['subcategory_id']] ?? CATEGORIAS[$p['category_id']] ?? null;
    if (!$categoria) continue;
    // El catálogo real no trae promocion_activa y todo viene con status "F": la promo vale si trae precio.
    $usd = $p['price_promo'] !== null && $p['price_promo'] > 0 ? min($p['price'] ?: INF, $p['price_promo']) : $p['price'];
    if (!$usd) continue;

    // Solo cuenta el stock de Lima: lo de provincia tardaría días en llegar.
    $lima = 0;
    $hayMas = false;
    foreach ($p['stock']['almacenes'] ?? [] as $a) {
        if (stripos((string) ($a['almacen_name'] ?? ''), 'lima') === false) continue;
        $lima += (int) $a['cantidad'];
        $hayMas = $hayMas || !empty($a['hay_mas']);
    }
    $llega = null;
    foreach ($p['trans'] ?? [] as $t) if ($t['disponible'] > 0) $llega = min($llega ?? $t['fecha_llegada_estimada'], $t['fecha_llegada_estimada']);
    $stock = $lima >= 5 || $hayMas ? 'stock' : ($lima > 0 ? 'pocas' : ($llega ? 'transito' : null));
    if (!$stock) continue;

    $specs = specsDeHtml((string) ($p['specs']['specs_all_html'] ?? ''), $texto, $frase);
    $img = $p['images']['image_listado'] ?? null;
    $fotos = array_values(array_filter(array_map(
        fn($i) => str_contains($i['filename'] ?? '', 'blanco.jpg') ? null : $i['url'],
        $p['images']['images_carrusel'] ?? []
    )));

    $productos[] = [
        'sku' => $p['sku'],
        'pn' => $p['part_number'],
        // El nombre de Deltron viene abreviado ("MEM 16G (2X8) TG..."); la 1.ª parte de la descripción es legible.
        'nombre' => $texto(explode('[@@@]', (string) $p['description_large'])[0]) ?: $texto($p['name']),
        'descripcion' => $texto(explode('[@@@]', (string) $p['description_large'], 2)[1] ?? ''),
        'marca' => marca((string) $p['brand_name']),
        'categoria' => $categoria,
        'subcategoria' => $p['subcategory_name'],
        'garantia' => $texto($p['warranty']),
        'precio' => precioVenta($usd * IGV * $tc),
        'stock' => $stock,
        'cantidad' => $lima, // unidades en Lima; hayMas = Deltron tiene más de las que informa
        'hayMas' => $hayMas,
        'llega' => $stock === 'transito' ? $llega : null,
        'imagen' => $img && !str_contains($img, 'blanco.jpg') ? $img : ($fotos[0] ?? null),
        'fotos' => $fotos,
        'specs' => $specs,
    ];
}

// Ordenados por categoría como en CATEGORIAS (así salen los filtros); dentro, primero los que tienen foto.
$orden = array_flip(array_values(CATEGORIAS));
usort($productos, fn($a, $b) => [$orden[$a['categoria']], $a['imagen'] === null] <=> [$orden[$b['categoria']], $b['imagen'] === null]);

// Escritura atómica: la web nunca lee un archivo a medias.
@mkdir(dirname(OUT), 0755, true);
file_put_contents(OUT . '.tmp', json_encode(['actualizado' => date('c'), 'productos' => $productos], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
rename(OUT . '.tmp', OUT);
echo count($productos) . ' productos publicados de ' . count($items) . " en el catálogo.\n";
