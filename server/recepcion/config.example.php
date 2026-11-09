<?php
// Copia este archivo como /home/quickfix/recepcion/config.php (fuera de public_html) y cambia los valores.
// No lo subas a GitHub.
return [
    // Tu clave: ves todo (datos de contacto, clave del equipo, montos) y descargas el CSV.
    'clave_admin' => 'cambia-esta-clave-larga',
    // Clave del mostrador (tus padres): ven los equipos por recibir e imprimen etiquetas.
    'clave_mostrador' => 'otra-clave-distinta',
    // Te llega un aviso aquí por cada equipo registrado. Déjalo vacío ('') para no recibir correos.
    'correo' => 'tu-correo@gmail.com',
];
