import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100),
  description: z.string().trim().max(500).optional().nullable(),
  visible: z.union([z.boolean(), z.number()]).optional(),
  sort_order: z.number().int().optional(),
});

export const dishSchema = z.object({
  name: z.string().trim().min(1, 'Dish name is required').max(150),
  description: z.string().trim().max(1000).optional().nullable(),
  category_id: z.string().min(1, 'Category ID is required'),
  scope: z.enum(['main', 'special', 'both']).default('both'),
  price_type: z.enum(['single', 'variant']).default('single'),
  base_price: z.number().min(0).optional().nullable(),
  special_price: z.number().min(0).optional().nullable(),
  special_price_override: z.number().min(0).optional().nullable(),
  is_available: z.union([z.boolean(), z.number()]).optional(),
  is_recommended: z.union([z.boolean(), z.number()]).optional(),
  is_vegetarian: z.union([z.boolean(), z.number()]).optional(),
  spice_level: z.string().optional().nullable(),
  variants: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        base_price: z.number().min(0),
        special_price: z.number().min(0).optional().nullable(),
        special_price_override: z.number().min(0).optional().nullable(),
        sort_order: z.number().optional(),
      })
    )
    .optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt_text: z.string().optional().nullable(),
        is_primary: z.union([z.boolean(), z.number()]).optional(),
        sort_order: z.number().optional(),
      })
    )
    .optional(),
});

export const qrUpdateSchema = z.object({
  destination: z.string().trim().min(1, 'Destination is required'),
  is_enabled: z.union([z.boolean(), z.number()]).optional(),
});

export const settingsUpdateSchema = z.object({
  special_markup_percent: z.number().min(0).max(100).optional(),
  rounding_step: z.number().min(1).max(50).optional(),
  currency_symbol: z.string().max(5).optional(),
  restaurant_name: z.string().max(100).optional(),
  contact_phone: z.string().max(30).optional(),
  contact_email: z.string().email().optional(),
  address: z.string().max(300).optional(),
});

export const reorderBatchSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      sort_order: z.number().int(),
    })
  ),
});

export const generateReviewSchema = z.object({
  stars: z.coerce.number().int().min(1).max(5),
  options: z.array(z.string()).max(14).optional(),
  selectedIds: z.array(z.string()).max(14).optional(),
  seed: z.coerce.number(),
  previousReview: z.string().max(400).optional().nullable(),
});
