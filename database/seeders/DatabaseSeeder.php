<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            MenuItemSeeder::class,
        ]);

        User::factory(10)->interno()->create();
        User::factory(20)->externo()->create();
        User::factory(10)->unverified()->create();

        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'tipo_usuario' => 'interno',
        ]);
        $testUser->assignRole('super-admin');
    }
}
