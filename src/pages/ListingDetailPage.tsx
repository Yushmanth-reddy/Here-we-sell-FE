import { useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Heart,
  Share2,
  Mail,
  ArrowLeft,
  Calendar,
  Tag,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageCarousel } from '@/components/listings/ImageCarousel';
import { ListingCard } from '@/components/listings/ListingCard';
import { getListingById, getListings } from '@/lib/api/listings';
import { useToggleFavorite } from '@/lib/hooks/useFavorites';
import { useAuthStore } from '@/lib/store/authStore';
import { formatPrice } from '@/lib/utils/formatPrice';
import { CONDITIONS } from '@/lib/utils/constants';
import { getImageUrls } from '@/types/listing';
import { toast } from 'sonner';

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const toggleFavorite = useToggleFavorite();

  const {
    data: listingResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListingById(id!),
    enabled: !!id,
  });

  const listing = listingResponse?.data;

  // Fetch related listings (same category)
  const { data: relatedResponse } = useQuery({
    queryKey: ['listings', 'related', listing?.category],
    queryFn: () =>
      getListings({ category: listing!.category, limit: 4 }),
    enabled: !!listing?.category,
  });

  const relatedListings =
    relatedResponse?.data?.filter((l) => l.id !== id) ?? [];

  // Update page title
  useEffect(() => {
    if (listing) {
      document.title = `${listing.title} — Here We Sell`;
    }
    return () => {
      document.title = 'Here We Sell';
    };
  }, [listing]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: listing?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to favorite items.');
      return;
    }
    if (id) toggleFavorite.mutate(id);
  };

  const conditionLabel =
    CONDITIONS.find((c) => c.value === listing?.condition)?.label ??
    listing?.condition;

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error / not found
  if (error || !listing) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold">Listing not found</h2>
        <p className="mt-2 text-muted-foreground">
          This listing may have been removed or doesn't exist.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Browse Listings</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
    >
      {/* Back link */}
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left — Images */}
        <ImageCarousel images={getImageUrls(listing)} alt={listing.title} />

        {/* Right — Info */}
        <div className="space-y-6">
          {/* Title & Price */}
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {listing.title}
            </h1>
            <p className="mt-2 text-3xl font-bold text-primary">
              {formatPrice(listing.price_cents)}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1 capitalize">
              <Tag className="h-3 w-3" />
              {listing.category}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Package className="h-3 w-3" />
              {conditionLabel}
            </Badge>
            {listing.status === 'sold' && (
              <Badge className="bg-destructive text-white">Sold</Badge>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Description
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {listing.description}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Listed {new Date(listing.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleFavorite} variant="outline" className="gap-2">
              <Heart
                className={`h-4 w-4 ${
                  toggleFavorite.isPending ? 'animate-pulse' : ''
                }`}
              />
              Favorite
            </Button>
            <Button onClick={handleShare} variant="outline" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="secondary" className="gap-2" asChild>
              <a href={`mailto:seller@iiitm.ac.in?subject=Inquiry about: ${listing.title}`}>
                <Mail className="h-4 w-4" />
                Contact Seller
              </a>
            </Button>
          </div>

          {/* Seller Info Card */}
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Seller
            </h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={listing.seller?.avatar_url ?? ''} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {listing.seller?.first_name?.[0] ?? 'S'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {listing.seller
                    ? `${listing.seller.first_name} ${listing.seller.last_name}`
                    : 'Campus Seller'}
                </p>
                <p className="text-xs text-muted-foreground">IIITM Gwalior</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Listings */}
      {relatedListings.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-foreground">
            Similar Listings
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedListings.slice(0, 4).map((item, i) => (
              <ListingCard key={item.id} listing={item} index={i} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
