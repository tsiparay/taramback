export enum Status {
  DRAFT = 'draft',
  PUBLISHED = 'published'
}

export interface Article {
  id: number;
  title: string;
  content: string;
  status: Status;
  featured: boolean;
  publishedAt?: Date;
  categoryId: number;
  networkId: number;
  authorId: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  networkId: number;
}

export interface Network {
  id: number;
  name: string;
  description: string;
}

export interface EmailNotification {
  id: number;
  userId: number;
  articleId: number;
  type: 'new_article' | 'update';
  sentAt: Date;
}
