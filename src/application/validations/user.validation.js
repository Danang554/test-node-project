const { z } = require('zod');

const createUserSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  email: z.string({ required_error: 'Email is required' }).email('Email must be a valid email address').max(100, 'Email must not exceed 100 characters'),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters').max(100, 'Password must not exceed 100 characters'),
  is_admin: z.boolean().optional().default(false)
});

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters').optional(),
  email: z.string().email('Email must be a valid email address').max(100, 'Email must not exceed 100 characters').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must not exceed 100 characters').optional(),
  is_admin: z.boolean().optional()
});

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters').optional(),
  email: z.string().email('Email must be a valid email address').max(100, 'Email must not exceed 100 characters').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password must not exceed 100 characters').optional()
});

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional().default('')
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  paginationQuerySchema
};
