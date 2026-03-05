import type { ArticleStatus, CreateArticleInput, UpdateArticleInput } from '../models/article';
import type { ValidationResult, ValidationErrorDetail } from './validation';
import { minLength } from './validation';

function isStatus(v: unknown): v is ArticleStatus {
  return v === 'draft' || v === 'published' || v === 'archived';
}

function parseNumberArray(v: unknown): number[] | null {
  if (!Array.isArray(v)) return null;
  const nums = v.map((x) => Number(x)).filter((n) => !Number.isNaN(n));
  return nums.length === v.length ? nums : null;
}

export function validateCreateArticle(body: any): ValidationResult<CreateArticleInput> {
  const errors: ValidationErrorDetail[] = [];

  const title = typeof body?.title === 'string' ? body.title : '';
  const content = typeof body?.content === 'string' ? body.content : '';
  const networkId = Number(body?.networkId);
  const authorId = Number(body?.authorId);
  const categoryIds = parseNumberArray(body?.categoryIds) ?? [];

  if (!minLength(title, 5)) errors.push({ field: 'title', message: 'min_5' });
  if (!minLength(content, 50)) errors.push({ field: 'content', message: 'min_50' });
  if (!Number.isFinite(networkId)) errors.push({ field: 'networkId', message: 'required' });
  if (!Number.isFinite(authorId)) errors.push({ field: 'authorId', message: 'required' });
  if (!categoryIds.length) errors.push({ field: 'categoryIds', message: 'min_1' });

  const status: ArticleStatus = isStatus(body?.status) ? body.status : 'draft';
  const featured = Boolean(body?.featured);

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      title,
      content,
      status,
      featured,
      publishedAt: body?.publishedAt ? new Date(body.publishedAt) : null,
      networkId,
      authorId,
      categoryIds,
    },
  };
}

export function validateUpdateArticle(body: any): ValidationResult<UpdateArticleInput> {
  const errors: ValidationErrorDetail[] = [];
  const data: UpdateArticleInput = {};

  if (body?.title !== undefined) {
    if (typeof body.title !== 'string' || !minLength(body.title, 5)) {
      errors.push({ field: 'title', message: 'min_5' });
    } else {
      data.title = body.title;
    }
  }

  if (body?.content !== undefined) {
    if (typeof body.content !== 'string' || !minLength(body.content, 50)) {
      errors.push({ field: 'content', message: 'min_50' });
    } else {
      data.content = body.content;
    }
  }

  if (body?.status !== undefined) {
    if (!isStatus(body.status)) {
      errors.push({ field: 'status', message: 'invalid' });
    } else {
      data.status = body.status;
    }
  }

  if (body?.featured !== undefined) {
    data.featured = Boolean(body.featured);
  }

  if (body?.publishedAt !== undefined) {
    data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  }

  if (body?.networkId !== undefined) {
    const networkId = Number(body.networkId);
    if (!Number.isFinite(networkId)) errors.push({ field: 'networkId', message: 'required' });
    else data.networkId = networkId;
  }

  if (body?.authorId !== undefined) {
    const authorId = Number(body.authorId);
    if (!Number.isFinite(authorId)) errors.push({ field: 'authorId', message: 'required' });
    else data.authorId = authorId;
  }

  if (body?.categoryIds !== undefined) {
    const categoryIds = parseNumberArray(body.categoryIds);
    if (!categoryIds || !categoryIds.length) errors.push({ field: 'categoryIds', message: 'min_1' });
    else data.categoryIds = categoryIds;
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, data };
}

export function validatePatchStatus(body: any): ValidationResult<{ status: ArticleStatus }> {
  const errors: ValidationErrorDetail[] = [];

  if (!isStatus(body?.status)) {
    errors.push({ field: 'status', message: 'invalid' });
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, data: { status: body.status } };
}

export function validateNotify(body: any): ValidationResult<{ type: 'new_article' | 'update'; recipients: string[]; subject?: string }> {
  const errors: ValidationErrorDetail[] = [];

  const type = body?.type === 'update' ? 'update' : body?.type === 'new_article' ? 'new_article' : null;

  const recipients = Array.isArray(body?.recipients)
    ? body.recipients.filter((r: unknown) => typeof r === 'string' && r.includes('@'))
    : [];

  if (!recipients.length) errors.push({ field: 'recipients', message: 'min_1' });

  if (!type) errors.push({ field: 'type', message: 'invalid' });

  if (errors.length) return { ok: false, errors };

  // At this point, type is non-null.
  const safeType = type as 'new_article' | 'update';

  return {
    ok: true,
    data: {
      recipients,
      type: safeType,
      subject: typeof body?.subject === 'string' ? body.subject : undefined,
    },
  };
}
