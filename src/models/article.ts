export type ArticleStatus = 'draft' | 'published' | 'archived';

export type Article = {
  id: number;
  title: string;
  content: string;
  status: ArticleStatus;
  featured: boolean;
  publishedAt?: Date;
  networkId: number;
  authorId: number;
  categoryIds: number[];
};

export type CreateArticleInput = {
  title: string;
  content: string;
  status?: ArticleStatus;
  featured?: boolean;
  publishedAt?: Date | null;
  networkId: number;
  authorId: number;
  categoryIds: number[];
};

export type UpdateArticleInput = {
  title?: string;
  content?: string;
  status?: ArticleStatus;
  featured?: boolean;
  publishedAt?: Date | null;
  networkId?: number;
  authorId?: number;
  categoryIds?: number[];
};
