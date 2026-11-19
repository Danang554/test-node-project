const config = require('./config');
const logger = require('./infrastructure/logger/logger');
const { db, checkDatabaseConnection } = require('./infrastructure/database/mysql');

const MySQLUserRepository = require('./infrastructure/repositories/MySQLUserRepository');
const MySQLRevokedTokenRepository = require('./infrastructure/repositories/MySQLRevokedTokenRepository');
const MySQLCategoryRepository = require('./infrastructure/repositories/MySQLCategoryRepository');
const MySQLTodoRepository = require('./infrastructure/repositories/MySQLTodoRepository');

const AuthService = require('./application/services/AuthService');
const UserService = require('./application/services/UserService');
const CategoryService = require('./application/services/CategoryService');
const TodoService = require('./application/services/TodoService');

const AuthController = require('./interfaces/http/controllers/AuthController');
const UserController = require('./interfaces/http/controllers/UserController');
const CategoryController = require('./interfaces/http/controllers/CategoryController');
const TodoController = require('./interfaces/http/controllers/TodoController');

const createRouter = require('./interfaces/http/routes');
const createApp = require('./interfaces/http/app');

async function bootstrap() {
  logger.info(`Starting ${config.app.name} in ${config.app.env} mode...`);

  // Check MySQL connection
  const isDbConnected = await checkDatabaseConnection();
  if (isDbConnected) {
    logger.info('Database connection established successfully');
  } else {
    logger.warn('Could not connect to MySQL. Server will run for health checks. Start MySQL and run migrations.');
  }

  // Dependency Injection assembly
  const userRepository = new MySQLUserRepository(db);
  const revokedTokenRepository = new MySQLRevokedTokenRepository(db);
  const categoryRepository = new MySQLCategoryRepository(db);
  const todoRepository = new MySQLTodoRepository(db);

  const authService = new AuthService(userRepository, revokedTokenRepository);
  const userService = new UserService(userRepository);
  const categoryService = new CategoryService(categoryRepository);
  const todoService = new TodoService(todoRepository, categoryRepository);

  const authController = new AuthController(authService);
  const userController = new UserController(userService, authService);
  const categoryController = new CategoryController(categoryService);
  const todoController = new TodoController(todoService);

  const router = createRouter({
    config,
    checkDbConnection: checkDatabaseConnection,
    authController,
    userController,
    categoryController,
    todoController,
    revokedTokenRepository
  });

  const app = createApp(router);

  const server = app.listen(config.app.port, config.app.host, () => {
    logger.info(`Server running at http://${config.app.host}:${config.app.port}`);
    logger.info(`Health check available at http://${config.app.host}:${config.app.port}/health`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      if (db) {
        try {
          await db.destroy();
          logger.info('Database connections closed.');
        } catch (err) {
          logger.error('Error closing database connections', { error: err.message });
        }
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  return { app, server };
}

if (require.main === module) {
  bootstrap().catch((err) => {
    logger.error('Bootstrap failure', { error: err.message, stack: err.stack });
    process.exit(1);
  });
}

module.exports = { bootstrap };
