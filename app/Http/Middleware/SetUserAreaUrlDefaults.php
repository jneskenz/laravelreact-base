<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class SetUserAreaUrlDefaults
{
    /**
     * Fill the {area} route parameter with the authenticated user's area, so
     * route('profile.edit') resolves to /panel/... or /portal/... automatically.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user instanceof User) {
            URL::defaults(['area' => $user->area()]);
        }

        return $next($request);
    }
}
