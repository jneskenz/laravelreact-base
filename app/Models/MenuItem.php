<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Route;

/**
 * @property int $id
 * @property string $key
 * @property string $label
 * @property string|null $icon
 * @property string|null $route
 * @property string|null $url
 * @property string|null $permission_required
 * @property string|null $module
 * @property string $area
 * @property int|null $parent_id
 * @property int $order
 * @property bool $is_active
 * @property-read MenuItem|null $parent
 * @property-read Collection<int, MenuItem> $children
 */
class MenuItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'label',
        'icon',
        'route',
        'url',
        'permission_required',
        'module',
        'area',
        'parent_id',
        'order',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'order' => 'integer',
            'parent_id' => 'integer',
        ];
    }

    /**
     * Parent menu item relation.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Child menu items relation.
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('order');
    }

    /**
     * Scope active items.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Resolve the navigation URL for this menu item.
     */
    public function resolveUrl(): ?string
    {
        if (! empty($this->route) && Route::has($this->route)) {
            return route($this->route);
        }

        if (! empty($this->url)) {
            return $this->url;
        }

        return null;
    }

    /**
     * Determine if this menu item is visible for a given user.
     */
    public function isVisibleFor(?User $user): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if (! empty($this->module) && ! config("ngo-modules.{$this->module}", true)) {
            return false;
        }

        if (empty($this->permission_required)) {
            return true;
        }

        if ($user === null) {
            return false;
        }

        return $user->can($this->permission_required);
    }

    /**
     * Generate the complete filtered menu tree for a user.
     *
     * @return array<int, array{id: int, key: string, label: string, icon: string|null, url: string|null, children: array<int, mixed>}>
     */
    public static function treeForUser(?User $user): array
    {
        if ($user === null) {
            return [];
        }

        $area = $user->tipo_usuario === 'interno' ? 'panel' : 'portal';

        /** @var Collection<int, MenuItem> $allItems */
        $allItems = static::query()
            ->where('is_active', true)
            ->where('area', $area)
            ->orderBy('order')
            ->get();

        // Group by parent_id
        $grouped = $allItems->groupBy(fn (MenuItem $item) => $item->parent_id ?? 0);

        return static::buildTreeNodes($grouped, 0, $user);
    }

    /**
     * Recursively build tree nodes, filtering out unauthorized items.
     *
     * @param  \Illuminate\Support\Collection<int|string, Collection<int, MenuItem>>  $grouped
     * @return array<int, array{id: int, key: string, label: string, icon: string|null, url: string|null, children: array<int, mixed>}>
     */
    protected static function buildTreeNodes(\Illuminate\Support\Collection $grouped, int $parentId, User $user): array
    {
        $nodes = [];
        $items = $grouped->get($parentId, collect());

        foreach ($items as $item) {
            $children = static::buildTreeNodes($grouped, (int) $item->id, $user);

            // If item has children, it's visible if at least one child is visible (or if item itself is visible)
            if (! empty($children)) {
                $nodes[] = [
                    'id' => $item->id,
                    'key' => $item->key,
                    'label' => $item->label,
                    'icon' => $item->icon,
                    'url' => $item->resolveUrl(),
                    'children' => $children,
                ];

                continue;
            }

            // Leaf item: must pass visibility check
            if ($item->isVisibleFor($user)) {
                $nodes[] = [
                    'id' => $item->id,
                    'key' => $item->key,
                    'label' => $item->label,
                    'icon' => $item->icon,
                    'url' => $item->resolveUrl(),
                    'children' => [],
                ];
            }
        }

        return $nodes;
    }
}
