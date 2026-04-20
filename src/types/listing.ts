export interface ListingImage {
  id: string;
  listing_id: string;
  url: string;
  position: number;
  created_at: string;
}

export interface Seller {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  role: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price_cents: number;
  category: 'textbooks' | 'electronics' | 'furniture' | 'clothing' | 'other';
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  images: ListingImage[];
  seller?: Seller;
  status: 'active' | 'sold' | 'deleted';
  created_at: string;
  updated_at: string;
}

/**
 * Helper to get plain image URL strings from a listing.
 */
export function getImageUrls(listing: Listing): string[] {
  if (listing.images && listing.images.length > 0) {
    return listing.images.map((img) => img.url);
  }
  return [];
}

export interface CreateListingInput {
  title: string;
  description: string;
  price_cents: number;
  category: string;
  condition: string;
  image_urls: string[];
}
