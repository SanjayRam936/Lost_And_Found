import api from './client';

// Lightweight real-time field check (title / description / brand) used by the
// debounced AI feedback in the report forms.
export async function checkField(field, value, category) {
  const { data } = await api.post('/validation/check-field/', { field, value, category });
  return data; // { valid: bool, message: string, warning?: bool }
}
