const express = require('express');
const ApiResponse = require('../utils/ApiResponse');
const validate = require('../middlewares/validate.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const createAuthMiddleware = require('../middlewares/auth.middleware');

const { registerSchema, loginSchema } = require('../../../application/validations/auth.validation');
const {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  paginationQuerySchema
} = require('../../../application/validations/user.validation');
const {
  createCategorySchema,
  updateCategorySchema
} = require('../../../application/validations/category.validation');
const {
  createTodoSchema,
  updateTodoSchema,
  todoQuerySchema
} = require('../../../application/validations/todo.validation');

function createRouter({
  config,
  checkDbConnection,
  authController,
  userController,
  categoryController,
  todoController,
  revokedTokenRepository
}) {
  const router = express.Router();
  const authMiddleware = createAuthMiddleware(revokedTokenRepository);

  // 1. Health check route: GET /health
  router.get('/health', async (req, res) => {
    const isDbConnected = checkDbConnection ? await checkDbConnection() : false;
    return ApiResponse.success(res, 200, 'Service is running healthy', {
      app_name: config.app.name,
      database: isDbConnected ? 'connected' : 'disconnected'
    });
  });

  // 2. API Routes Group: /api
  const api = express.Router();

  // Public Auth Routes: /api/auth
  const auth = express.Router();
  if (authController) {
    auth.post('/register', validate(registerSchema), authController.register);
    auth.post('/login', validate(loginSchema), authController.login);
    auth.post('/logout', authMiddleware, authController.logout);
  }
  api.use('/auth', auth);

  // Protected User Profile Routes: /api/profile
  if (userController) {
    api.get('/profile', authMiddleware, userController.getProfile);
    api.patch('/profile', authMiddleware, validate(updateProfileSchema), userController.updateProfile);
  }

  // Admin User Management Routes: /api/user
  if (userController) {
    const user = express.Router();
    user.use(authMiddleware, adminMiddleware);

    user.get('/', validate(paginationQuerySchema, 'query'), userController.getUsers);
    user.post('/', validate(createUserSchema), userController.createUser);
    user.get('/deleted', validate(paginationQuerySchema, 'query'), userController.getDeletedUsers);
    user.get('/:id', userController.getUserById);
    user.patch('/:id', validate(updateUserSchema), userController.updateUser);
    user.delete('/:id', userController.deleteUser);
    user.patch('/:id/restore', userController.restoreUser);
    user.delete('/:id/permanent', userController.forceDeleteUser);

    api.use('/user', user);
  }

  // Category Routes: /api/category
  if (categoryController) {
    const category = express.Router();
    category.use(authMiddleware);

    category.get('/', validate(paginationQuerySchema, 'query'), categoryController.getCategories);
    category.post('/', validate(createCategorySchema), categoryController.create);
    category.get('/deleted', validate(paginationQuerySchema, 'query'), categoryController.getDeleted);
    category.get('/:id', categoryController.getById);
    category.patch('/:id', validate(updateCategorySchema), categoryController.update);
    category.delete('/:id', categoryController.delete);
    category.patch('/:id/restore', categoryController.restore);
    category.delete('/:id/permanent', categoryController.forceDelete);

    api.use('/category', category);
  }

  // Todo Routes: /api/todo
  if (todoController) {
    const todo = express.Router();
    todo.use(authMiddleware);

    todo.get('/', validate(todoQuerySchema, 'query'), todoController.getTodos);
    todo.post('/', validate(createTodoSchema), todoController.create);
    todo.get('/deleted', validate(paginationQuerySchema, 'query'), todoController.getDeleted);
    todo.get('/:id', todoController.getById);
    todo.patch('/:id', validate(updateTodoSchema), todoController.update);
    todo.delete('/:id', todoController.delete);
    todo.patch('/:id/restore', todoController.restore);
    todo.delete('/:id/permanent', todoController.forceDelete);

    api.use('/todo', todo);
  }

  router.use('/api', api);

  return router;
}

module.exports = createRouter;
