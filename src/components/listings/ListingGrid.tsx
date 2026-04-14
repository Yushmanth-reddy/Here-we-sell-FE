import { useEffect, useRef, useCallback } from 'react';
import { Loader2, PackageOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ListingCard } from './ListingCard';
import type { Listing } from '@/types/listing';

interface ListingGridProps {
  listings: Listing[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/50">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  );
}

export function ListingGrid({
  listings,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: ListingGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '200px', // Trigger 200px before reaching bottom
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Initial loading state — skeleton grid
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <PackageOpen className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold text-foreground">
          No listings found
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing, index) => (
          <ListingCard key={listing.id} listing={listing} index={index} />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="flex justify-center py-8">
        {isFetchingNextPage && (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        )}
      </div>
    </>
  );
}
