import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { FilterBar, type FilterState } from '@/components/listings/FilterBar';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { useListings } from '@/lib/hooks/useListings';
import { toCents } from '@/lib/utils/formatPrice';

export function HomePage() {
  const [filters, setFilters] = useState<FilterState>({
    q: '',
    category: '',
    condition: '',
    sort: 'newest',
  });

  // Build query params from filter state
  const queryParams = useMemo(() => {
    return {
      q: filters.q || undefined,
      category: filters.category || undefined,
      condition: filters.condition || undefined,
      min_price: filters.min_price,
      max_price: filters.max_price,
      sort: filters.sort,
      limit: 20,
    };
  }, [filters]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useListings(queryParams);

  // Flatten all pages of listings into a single array
  const allListings = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              IIITM Gwalior's Campus Marketplace
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Buy & Sell Within
              <span className="block text-primary">Your Campus</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Find great deals on textbooks, electronics, furniture, and more from
              fellow students. List your items in seconds.
            </p>
          </motion.div>
        </div>
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
      </section>

      {/* Filter + Listings */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <FilterBar onFilterChange={setFilters} />

        <div className="mt-8">
          <ListingGrid
            listings={allListings}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage ?? false}
            fetchNextPage={fetchNextPage}
          />
        </div>
      </section>
    </div>
  );
}
