<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreThemeRequest extends FormRequest
{
    /**
     * Hexadecimal color in the #rrggbb format.
     */
    protected const HEX_COLOR = 'regex:/^#[0-9a-fA-F]{6}$/';

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('configuracion.editar') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:255'],
            'color' => ['required', 'string', self::HEX_COLOR],
            'radius' => ['required', 'string', 'in:0rem,0.375rem,0.625rem,1rem,1.5rem'],
            'modes_config' => ['required', 'array'],
            'modes_config.light' => ['required', 'array'],
            'modes_config.dark' => ['required', 'array'],
            'modes_config.eye_care' => ['required', 'array'],
            'modes_config.semi_dark' => ['required', 'array'],
            'modes_config.*.*' => ['nullable', 'string', self::HEX_COLOR],
            'is_default' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'color.regex' => 'El color principal debe tener el formato #RRGGBB.',
            'radius.in' => 'Selecciona uno de los estilos de esquinas disponibles.',
            'modes_config.*.*.regex' => 'Todos los colores deben tener el formato #RRGGBB.',
        ];
    }
}
