export type ValidationErrorDetail = {
  field: string;
  message: string;
};

export type ValidationResult<T> = {
  ok: true;
  data: T;
} | {
  ok: false;
  errors: ValidationErrorDetail[];
};

export function minLength(value: string, min: number) {
  return value.trim().length >= min;
}
