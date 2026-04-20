import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Loader2,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getMyListings, updateListing, deleteListing } from '@/lib/api/listings';
import { getImageUrls } from '@/types/listing';
import { formatPrice } from '@/lib/utils/formatPrice';
import { CONDITIONS } from '@/lib/utils/constants';
import { toast } from 'sonner';
import type { Listing } from '@/types/listing';

type TabKey = 'active' | 'sold' | 'deleted';

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: getMyListings,
  });

  const allListings: Listing[] = data?.data ?? [];

  const filteredListings = useMemo(
    () => allListings.filter((l) => l.status === activeTab),
    [allListings, activeTab]
  );

  const counts = useMemo(
    () => ({
      active: allListings.filter((l) => l.status === 'active').length,
      sold: allListings.filter((l) => l.status === 'sold').length,
      deleted: allListings.filter((l) => l.status === 'deleted').length,
    }),
    [allListings]
  );

  // Mark as sold mutation
  const markSold = useMutation({
    mutationFn: (id: string) => updateListing(id, { status: 'sold' } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      toast.success('Listing marked as sold!');
    },
    onError: () => toast.error('Failed to update listing'),
  });

  // Delete mutation
  const deleteListingMutation = useMutation({
    mutationFn: (id: string) => deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      setDeleteTarget(null);
      toast.success('Listing deleted.');
    },
    onError: () => toast.error('Failed to delete listing'),
  });

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'active', label: 'Active', count: counts.active },
    { key: 'sold', label: 'Sold', count: counts.sold },
    { key: 'deleted', label: 'Deleted', count: counts.deleted },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6"
    >
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            My Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your listings
          </p>
        </div>
        <Button onClick={() => navigate('/sell')} className="gap-2">
          <Plus className="h-4 w-4" />
          New Listing
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-muted-foreground">
              ({tab.count})
            </span>
          </button>
        ))}
      </div>

      {/* Listings */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold text-foreground">
            {activeTab === 'active'
              ? 'No active listings'
              : activeTab === 'sold'
              ? 'No sold listings yet'
              : 'No deleted listings'}
          </h3>
          {activeTab === 'active' && (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                Start selling items to your campus!
              </p>
              <Button
                onClick={() => navigate('/sell')}
                className="mt-4 gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                Create Listing
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredListings.map((listing) => {
            const imageUrl = getImageUrls(listing)[0];
            const conditionLabel =
              CONDITIONS.find((c) => c.value === listing.condition)?.label ??
              listing.condition;

            return (
              <Card
                key={listing.id}
                className="overflow-hidden border-border/50 transition-all hover:shadow-sm"
              >
                <CardContent className="flex gap-4 p-4">
                  {/* Thumbnail */}
                  <Link to={`/listings/${listing.id}`} className="shrink-0">
                    <div className="h-24 w-24 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={imageUrl ?? '/placeholder.svg'}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <Link
                        to={`/listings/${listing.id}`}
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {listing.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-primary">
                          {formatPrice(listing.price_cents)}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {listing.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {conditionLabel}
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Listed{' '}
                      {new Date(listing.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  {activeTab === 'active' && (
                    <div className="flex shrink-0 flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => navigate(`/sell?edit=${listing.id}`)}
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs"
                        onClick={() => markSold.mutate(listing.id)}
                        disabled={markSold.isPending}
                      >
                        <CheckCircle className="h-3 w-3" />
                        Sold
                      </Button>

                      {/* Delete with confirmation */}
                      <Dialog
                        open={deleteTarget === listing.id}
                        onOpenChange={(open) =>
                          setDeleteTarget(open ? listing.id : null)
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Listing</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "
                              {listing.title}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDeleteTarget(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                deleteListingMutation.mutate(listing.id)
                              }
                              disabled={deleteListingMutation.isPending}
                            >
                              {deleteListingMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
