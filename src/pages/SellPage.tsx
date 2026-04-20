import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Upload,
  X,
  ImagePlus,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  createListing,
  updateListing,
  getListingById,
} from '@/lib/api/listings';
import { uploadImages } from '@/lib/firebase';
import { toCents } from '@/lib/utils/formatPrice';
import { CATEGORIES, CONDITIONS } from '@/lib/utils/constants';
import {
  createListingSchema,
  type CreateListingFormValues,
} from '@/lib/utils/validators';
import { toast } from 'sonner';

export function SellPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  // Fetch existing listing data in edit mode
  const { data: existingListing } = useQuery({
    queryKey: ['listing', editId],
    queryFn: () => getListingById(editId!),
    enabled: isEditMode,
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Pre-fill form in edit mode
  const defaultValues = existingListing?.data
    ? {
        title: existingListing.data.title,
        description: existingListing.data.description,
        price: existingListing.data.price_cents / 100,
        category: existingListing.data.category,
        condition: existingListing.data.condition,
      }
    : undefined;

  // Initialize existing images in edit mode
  if (
    existingListing?.data?.image_urls &&
    existingImageUrls.length === 0 &&
    imagePreviews.length === 0
  ) {
    setExistingImageUrls(existingListing.data.image_urls);
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateListingFormValues>({
    resolver: zodResolver(createListingSchema),
    values: defaultValues,
  });

  // Handle image file selection
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      const totalImages =
        imageFiles.length + existingImageUrls.length + files.length;

      if (totalImages > 5) {
        toast.error('Maximum 5 images allowed');
        return;
      }

      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setImageFiles((prev) => [...prev, ...files]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    },
    [imageFiles.length, existingImageUrls.length]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      );
      const totalImages =
        imageFiles.length + existingImageUrls.length + files.length;

      if (totalImages > 5) {
        toast.error('Maximum 5 images allowed');
        return;
      }

      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setImageFiles((prev) => [...prev, ...files]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    },
    [imageFiles.length, existingImageUrls.length]
  );

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const totalImageCount = existingImageUrls.length + imageFiles.length;

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (formData: CreateListingFormValues) => {
      // Validate image count
      if (totalImageCount === 0) {
        throw new Error('At least 1 image is required');
      }

      setIsUploading(true);

      // Upload new images to Firebase
      let newUrls: string[] = [];
      if (imageFiles.length > 0) {
        try {
          newUrls = await uploadImages(imageFiles);
        } catch  {
          throw new Error('Failed to upload images. Please try again.');
        }
      }

      const allImageUrls = [...existingImageUrls, ...newUrls];

      const payload = {
        title: formData.title,
        description: formData.description,
        price_cents: toCents(formData.price),
        category: formData.category,
        condition: formData.condition,
        image_urls: allImageUrls,
      };

      if (isEditMode) {
        return updateListing(editId!, payload);
      }
      return createListing(payload);
    },
    onSuccess: (response) => {
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success(
        isEditMode
          ? 'Listing updated successfully!'
          : 'Listing created successfully!'
      );
      navigate(`/listings/${response.data.id}`);
    },
    onError: (err: Error) => {
      setIsUploading(false);
      toast.error(err.message || 'Something went wrong');
    },
  });

  const isSubmitting = submitMutation.isPending || isUploading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl px-4 py-8 sm:px-6"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          {isEditMode ? 'Edit Listing' : 'Sell an Item'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEditMode
            ? 'Update your listing details below.'
            : 'Fill in the details below to list your item on the marketplace.'}
        </p>
      </div>

      <form onSubmit={handleSubmit((data) => submitMutation.mutate(data))}>
        <div className="space-y-6">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Photos ({totalImageCount}/5)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing images */}
              {existingImageUrls.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {existingImageUrls.map((url, i) => (
                    <div
                      key={`existing-${i}`}
                      className="relative h-24 w-24 overflow-hidden rounded-lg border border-border"
                    >
                      <img
                        src={url}
                        alt={`Existing ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white text-xs"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New image previews */}
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((url, i) => (
                    <div
                      key={`new-${i}`}
                      className="relative h-24 w-24 overflow-hidden rounded-lg border border-primary/30"
                    >
                      <img
                        src={url}
                        alt={`New ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <Badge className="absolute left-1 top-1 bg-primary text-[10px] px-1 py-0">
                        New
                      </Badge>
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white text-xs"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Drop zone */}
              {totalImageCount < 5 && (
                <label
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
                >
                  <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Drop images here or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG, WebP • Max 5 images
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              )}

              {totalImageCount === 0 && (
                <p className="text-xs text-destructive">
                  At least 1 image is required
                </p>
              )}
            </CardContent>
          </Card>

          {/* Listing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Title *
                </label>
                <Input
                  id="title"
                  placeholder="e.g. Calculus Textbook, MacBook Pro M1"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Describe the item condition, what's included, reason for selling..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Price (₹) *
                </label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="e.g. 500"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Category & Condition row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Category *
                  </label>
                  <select
                    id="category"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    {...register('category')}
                  >
                    <option value="">Select...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="condition"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Condition *
                  </label>
                  <select
                    id="condition"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    {...register('condition')}
                  >
                    <option value="">Select...</option>
                    {CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {errors.condition && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.condition.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 text-base gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isUploading ? 'Uploading images...' : 'Saving...'}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {isEditMode ? 'Update Listing' : 'Publish Listing'}
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
