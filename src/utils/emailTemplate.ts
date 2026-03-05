import type { Article } from '../models/article';

export function renderArticleNotificationHtml(params: { article: Article; subject: string }): string {
  const { article, subject } = params;

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background:#f6f7fb; padding:24px;">
    <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <div style="padding:16px 20px;background:#0b5fff;color:#ffffff;">
        <h1 style="margin:0;font-size:18px;">${escapeHtml(subject)}</h1>
      </div>
      <div style="padding:20px;">
        <h2 style="margin:0 0 8px 0;font-size:16px;">${escapeHtml(article.title)}</h2>
        <p style="margin:0 0 16px 0;color:#374151;font-size:14px;line-height:1.5;">
          ${escapeHtml(preview(article.content, 300))}
        </p>
        <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;">
          Article #${article.id} • Réseau ${article.networkId} • Status ${article.status}
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function preview(content: string, max: number) {
  const clean = content.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
