<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserArea
{
    /**
     * Keep users inside their own area: an internal user visiting /portal/settings/...
     * (or an external one visiting /panel/settings/...) is sent to the same page in their area.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $route = $request->route();
        $requestedArea = $route?->parameter('area');

        if ($user instanceof User && $requestedArea !== $user->area()) {
            abort_unless($request->isMethod('GET'), 404);

            $path = preg_replace('#^'.preg_quote((string) $requestedArea, '#').'/#', $user->area().'/', $request->path());

            $query = $request->getQueryString();

            return redirect()->to('/'.$path.($query ? "?{$query}" : ''));
        }

        $route?->forgetParameter('area');

        return $next($request);
    }
}
