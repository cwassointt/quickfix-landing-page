<?php
// Copia este archivo a /home/quickfix/deltron/config.php (FUERA de public_html) y pon tus credenciales.
// Nunca subas config.php al repositorio ni lo copies dentro de public_html.
return [
    'api_key'    => 'dtr_key_xxxxxxxxxxxxxxxx',
    'api_secret' => 'dtr_secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    // category_id o subcategory_id que se venden (salen en categorias.txt tras la primera sincronización).
    // Vacío: solo descarga el catálogo y escribe categorias.txt, sin publicar nada.
    'categorias' => [],
];
