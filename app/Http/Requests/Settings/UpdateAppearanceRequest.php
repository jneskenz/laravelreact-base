<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAppearanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'appearance' => ['nullable', 'string', 'in:light,dark,system,eye-care,semi-dark,custom'],
            'layout' => ['nullable', 'string', 'in:sidebar,header'],
            'font_size' => ['nullable', 'string', 'in:compact,normal,large'],
            'active_theme_id' => ['nullable', 'integer', 'exists:themes,id'],
            'custom_overrides' => ['nullable', 'array'],
        ];
    }
}
