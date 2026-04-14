import { Heart } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Listing } from '@/types/listing';
import { formatPrice } from '@/lib/utils/formatPrice';
import { useAuthStore } from '@/lib/store/authStore';
import { useToggleFavorite } from '@/lib/hooks/useFavorites';
import { CONDITIONS } from '@/lib/utils/constants';

interface ListingCardProps {
  listing: Listing;
  index?: number;
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const { isAuthenticated } = useAuthStore();
  const toggleFavorite = useToggleFavorite();

  const conditionLabel =
    CONDITIONS.find((c) => c.value === listing.condition)?.label ?? listing.condition;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Don't navigate when clicking heart
    e.stopPropagation();
    if (!isAuthenticated) return;
    toggleFavorite.mutate(listing.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/listings/${listing.id}`}>
        <Card className="group cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={listing.image_urls?.[0] ?? '/placeholder.svg'}
              alt={listing.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Sold overlay */}
            {listing.status === 'sold' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Badge className="bg-destructive text-white text-sm px-4 py-1">
                  SOLD
                </Badge>
              </div>
            )}
            {/* Favorite button */}
            {isAuthenticated && (
              <button
                onClick={handleFavorite}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
                aria-label="Toggle favorite"
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    toggleFavorite.isPending
                      ? 'text-muted-foreground'
                      : 'text-foreground hover:text-destructive'
                  }`}
                />
              </button>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-sm font-semibold leading-tight text-foreground">
                {listing.title}
              </h3>
              <span className="shrink-0 text-sm font-bold text-primary">
                {formatPrice(listing.price_cents)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs capitalize">
                {listing.category}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {conditionLabel}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
