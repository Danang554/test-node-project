const config = require('../../src/config');
const JwtUtil = require('../../src/infrastructure/security/jwt');
const createRouter = require('../../src/interfaces/http/routes');
const createApp = require('../../src/interfaces/http/app');

function generateToken({ id = 1, email = 'user@example.com', is_admin = false } = {}) {
  return JwtUtil.sign({
    sub: id,
    email,
    is_admin
  });
}

function createTestApp({
  authController = null,
  userController = null,
  categoryController = null,
  todoController = null,
  revokedTokenRepository = null,
  checkDbConnection = async () => true
} = {}) {
  const router = createRouter({
    config,
    checkDbConnection,
    authController,
    userController,
    categoryController,
    todoController,
    revokedTokenRepository
  });

  return createApp(router);
}

module.exports = {
  generateToken,
  createTestApp
};
