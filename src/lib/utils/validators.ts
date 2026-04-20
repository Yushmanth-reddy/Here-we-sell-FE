import { z } from 'zod';

export const createListingSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be under 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be under 2000 characters'),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .positive('Price must be greater than 0'),
  category: z.enum(['textbooks', 'electronics', 'furniture', 'clothing', 'other'], {
    errorMap: () => ({ message: 'Please select a category' }),
  }),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor'], {
    errorMap: () => ({ message: 'Please select a condition' }),
  }),
});

export type CreateListingFormValues = z.infer<typeof createListingSchema>;

export const updateBioSchema = z.object({
  bio: z
    .string()
    .max(500, 'Bio must be under 500 characters')
    .optional(),
});

export type UpdateBioFormValues = z.infer<typeof updateBioSchema>;
