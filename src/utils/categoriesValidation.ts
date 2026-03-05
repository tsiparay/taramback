import { minLength, type ValidationResult } from './validation';

export type CreateCategoryBody = {
  name?: unknown;
  description?: unknown;
  networkId?: unknown;
};

export type UpdateCategoryBody = {
  name?: unknown;
  description?: unknown;
  networkId?: unknown;
};

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export function validateCreateCategory(body: CreateCategoryBody): ValidationResult<{ name: string; description: string; networkId: number }> {
  const errors: { field: string; message: string }[] = [];

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';

  const networkIdRaw = typeof body.networkId === 'number' ? body.networkId : Number(body.networkId);
  const networkId = isFiniteNumber(networkIdRaw) ? networkIdRaw : NaN;

  if (!minLength(name, 2)) errors.push({ field: 'name', message: 'name_min_2' });
  if (!minLength(description, 2)) errors.push({ field: 'description', message: 'description_min_2' });
  if (!Number.isFinite(networkId)) errors.push({ field: 'networkId', message: 'networkId_required' });

  if (errors.length) return { ok: false, errors };
  return { ok: true, data: { name, description, networkId } };
}

export function validateUpdateCategory(body: UpdateCategoryBody): ValidationResult<{ name?: string; description?: string; networkId?: number }> {
  const errors: { field: string; message: string }[] = [];

  const name = body.name === undefined ? undefined : typeof body.name === 'string' ? body.name.trim() : null;
  const description = body.description === undefined ? undefined : typeof body.description === 'string' ? body.description.trim() : null;
  const networkId = body.networkId === undefined ? undefined : Number(body.networkId);

  if (name === null || (name !== undefined && !minLength(name, 2))) errors.push({ field: 'name', message: 'name_min_2' });
  if (description === null || (description !== undefined && !minLength(description, 2))) errors.push({ field: 'description', message: 'description_min_2' });
  if (networkId !== undefined && !Number.isFinite(networkId)) errors.push({ field: 'networkId', message: 'networkId_invalid' });

  if (errors.length) return { ok: false, errors };
  return { ok: true, data: { name: name ?? undefined, description: description ?? undefined, networkId } };
}
