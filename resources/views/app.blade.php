<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Lightweight inline script to apply theme classes from local browser storage with zero latency --}}
        <script>
            (function() {
                try {
                    // La personalización solo aplica dentro de /panel y /portal
                    if (!/^\/(panel|portal)(\/|$)/.test(window.location.pathname)) return;

                    const mode = localStorage.getItem('appearance_mode') || 'system';
                    let effective = mode;
                    if (effective === 'system') {
                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                        effective = prefersDark ? 'dark' : 'light';
                    }

                    const root = document.documentElement;
                    root.classList.remove('dark', 'eye-care', 'semi-dark', 'custom-mode');
                    if (effective === 'dark') root.classList.add('dark');
                    else if (effective === 'eye-care') root.classList.add('eye-care');
                    else if (effective === 'semi-dark') root.classList.add('semi-dark');
                    else if (effective === 'custom') root.classList.add('custom-mode');
                } catch (e) {}
            })();
        </script>

        {{-- Fallback background colors for initial frame --}}
        <style>
            html {
                background-color: var(--background, #ffffff);
                color: var(--foreground, #09090b);
            }

            html.dark {
                background-color: var(--background, #09090b);
                color: var(--foreground, #f8fafc);
            }

            html.eye-care {
                background-color: var(--background, #fbf7ee);
                color: var(--foreground, #292524);
            }

            html.semi-dark {
                background-color: var(--background, #0f172a);
                color: var(--foreground, #f1f5f9);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
