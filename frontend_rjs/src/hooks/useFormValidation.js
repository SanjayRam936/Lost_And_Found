// Shared validation hook for the report forms. Provides:
//   * clientValidate(form, isFound) -> field errors object (mirrors backend)
//   * aiStatus + runAiCheck() -> debounced real-time AI feedback (title/description)
//     against POST /api/v1/validation/check-field/
import { useState, useRef, useCallback } from 'react';
import { checkField as apiCheckField } from '../api/validation';
import { charCount, looksLikeMash, isValidImei, todayStr } from '../utils/validationHelpers';

export function useFormValidation() {
  // aiStatus[field] = { state: 'idle'|'checking'|'ok'|'warn'|'error', message }
  const [aiStatus, setAiStatus] = useState({});
  const timers = useRef({});

  const runAiCheck = useCallback((field, value, category) => {
    clearTimeout(timers.current[field]);
    const v = (value || '').trim();
    const minLen = field === 'title' ? 3 : 30;
    if (v.length < minLen) {
      setAiStatus((s) => ({ ...s, [field]: { state: 'idle', message: '' } }));
      return;
    }
    setAiStatus((s) => ({ ...s, [field]: { state: 'checking', message: '' } }));
    // 600ms debounce after the user stops typing.
    timers.current[field] = setTimeout(async () => {
      try {
        const res = await apiCheckField(field, v, category);
        setAiStatus((s) => ({
          ...s,
          [field]: {
            state: res.valid ? (res.warning ? 'warn' : 'ok') : 'error',
            message: res.message || '',
          },
        }));
      } catch {
        setAiStatus((s) => ({ ...s, [field]: { state: 'idle', message: '' } }));
      }
    }, 600);
  }, []);

  // Synchronous client-side validation mirroring the backend rules.
  const clientValidate = useCallback((form, isFound) => {
    const errors = {};

    const t = charCount(form.title, 3, 100);
    if (t.tooShort || t.tooLong) errors.title = 'Item title must be between 3 and 100 characters.';
    else if (looksLikeMash(form.title)) errors.title = 'Your item title appears to contain random or meaningless text.';

    if (!form.category) errors.category = 'Please select a valid category from the list.';

    const d = charCount(form.description, 30, 5000);
    if (d.tooShort) errors.description = 'Description must be at least 30 characters.';
    else if (d.tooLong) errors.description = 'Description must not exceed 5000 characters.';
    else if (looksLikeMash(form.description)) errors.description = 'Your description appears to contain random or meaningless text.';

    // Date must not be in the future (applies to both lost & found).
    if (form.date && form.date > todayStr()) {
      errors.date = 'The date cannot be in the future.';
    }

    if (isFound) {
      if (!(form.image instanceof File) && !form.pk) errors.image = 'A photo is required for found items.';
      if (!form.date) errors.date = 'Date is required for found items.';
      if (!form.time) errors.time = 'Time is required for found items.';
    }

    if (form.imei_number && !isValidImei(form.imei_number)) {
      errors.imei_number = 'IMEI number must be exactly 15 digits.';
    }
    return errors;
  }, []);

  return { aiStatus, runAiCheck, clientValidate };
}
