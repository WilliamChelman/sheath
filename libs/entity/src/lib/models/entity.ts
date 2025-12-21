export interface Entity {
  id: string;
  type: string;
  name: string;
  spaceId?: string;
  description?: string;
  content?: string; // markdown, for now
  image?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
