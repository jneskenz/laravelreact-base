<?php

return [
    /*
    |--------------------------------------------------------------------------
    | NGO Active Modules Configuration
    |--------------------------------------------------------------------------
    |
    | Define which modules are enabled or disabled for this organization.
    | When a module is set to false, its corresponding menu items and
    | routes will be hidden from the navigation.
    |
    */

    // Módulos Fase 1 (Operación Base)
    'casos' => true,
    'rescates' => true,
    'beneficiarios' => true,
    'albergues' => true,
    'veterinaria' => true,
    'voluntariado' => true,
    'donaciones' => true,
    'convenios' => true,
    'contenidos' => true,

    // Módulos Fase 2 (Perú País Animalista 2035)
    'instituto' => false,
    'renian' => false,
    'legislacion' => false,
    'infraestructura' => false,
    'logistica' => false,
];
