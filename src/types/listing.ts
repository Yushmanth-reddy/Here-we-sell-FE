export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price_cents: number;
  category: 'textbooks' | 'electronics' | 'furniture' | 'clothing' | 'other';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  image_urls: string[];
  status: 'active' | 'sold' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface CreateListingInput {
  title: string;
  description: string;
  price_cents: number;
  category: string;
  condition: string;
  image_urls: string[];
}
