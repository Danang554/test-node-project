const { z } = require('zod');

const createTodoSchema = z.object({
  category_id: z.coerce.number().int().positive().nullable().optional(),
  title: z.string({ required_error: 'Title is required' }).min(1, 'Title cannot be empty').max(255, 'Title must not exceed 255 characters'),
  description: z.string().nullable().optional(),
  is_completed: z.boolean().optional().default(false)
});

const updateTodoSchema = z.object({
  category_id: z.coerce.number().int().positive().nullable().optional(),
  title: z.string().min(1, 'Title cannot be empty').max(255, 'Title must not exceed 255 characters').optional(),
  description: z.string().nullable().optional(),
  is_completed: z.boolean().optional()
});

const todoQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional().default(''),
  category_id: z.coerce.number().int().positive().optional(),
  is_completed: z.enum(['true', 'false', '1', '0']).transform(v => v === 'true' || v === '1').optional()
});

module.exports = {
  createTodoSchema,
  updateTodoSchema,
  todoQuerySchema
};
