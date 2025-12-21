export interface Entity {
  id: string;
  type: string;
  name: string;
  description?: string;
  content?: string;
  contentType?: 'markdown' | 'html';
  image?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  [other: string]: unknown;
}
