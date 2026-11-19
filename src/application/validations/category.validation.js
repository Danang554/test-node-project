const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string({ required_error: 'Category name is required' }).min(1, 'Category name cannot be empty').max(100, 'Category name must not exceed 100 characters'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').nullable().optional()
});

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name cannot be empty').max(100, 'Category name must not exceed 100 characters').optional(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').nullable().optional()
});

module.exports = {
  createCategorySchema,
  updateCategorySchema
};
