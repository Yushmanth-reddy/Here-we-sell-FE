import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { ListingCard } from '@/components/listings/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyFavorites } from '@/lib/hooks/useFavorites';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

export function FavoritesPage() {
  const { data, isLoading } = useMyFavorites();
  const favorites = data?.data ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          My Favorites
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Items you've saved for later.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border/50">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold text-foreground">
            No favorites yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse the marketplace and heart items you love!
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Browse Listings</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
