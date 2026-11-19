const AuthService = require('../../src/application/services/AuthService');
const AppError = require('../../src/interfaces/http/utils/AppError');
const User = require('../../src/domain/entities/User');
const HashUtil = require('../../src/infrastructure/security/hash');
const JwtUtil = require('../../src/infrastructure/security/jwt');

describe('AuthService (Unit Tests)', () => {
  let authService;
  let mockUserRepo;
  let mockRevokedTokenRepo;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    };
    mockRevokedTokenRepo = {
      create: jest.fn(),
      isRevoked: jest.fn()
    };
    authService = new AuthService(mockUserRepo, mockRevokedTokenRepo);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      const hashedPassword = await HashUtil.hashPassword('password123');
      const newUser = new User({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        is_admin: false,
        created_at: new Date()
      });
      mockUserRepo.create.mockResolvedValue(newUser);

      const result = await authService.register({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(result.id).toBe(1);
      expect(result.email).toBe('john@example.com');
      expect(result.password).toBeUndefined(); // password should be omitted in toJSON
    });

    it('should throw conflict error if email already exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(new User({
        id: 1,
        email: 'existing@example.com'
      }));

      await expect(
        authService.register({
          name: 'Jane Doe',
          email: 'existing@example.com',
          password: 'password123'
        })
      ).rejects.toThrow(AppError);

      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully login and return token and user info', async () => {
      const hashedPassword = await HashUtil.hashPassword('secret123');
      const existingUser = new User({
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: hashedPassword,
        is_admin: true
      });
      mockUserRepo.findByEmail.mockResolvedValue(existingUser);

      const result = await authService.login({
        email: 'jane@example.com',
        password: 'secret123'
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('jane@example.com');
      expect(result.user.is_admin).toBe(true);

      const decoded = JwtUtil.verify(result.token);
      expect(decoded.sub).toBe(2);
      expect(decoded.email).toBe('jane@example.com');
    });

    it('should throw unauthorized error if email not found', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'notfound@example.com',
          password: 'secret123'
        })
      ).rejects.toThrow(AppError);
    });

    it('should throw unauthorized error if password does not match', async () => {
      const hashedPassword = await HashUtil.hashPassword('correctPassword');
      mockUserRepo.findByEmail.mockResolvedValue(new User({
        id: 3,
        email: 'test@example.com',
        password: hashedPassword
      }));

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongPassword'
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('logout', () => {
    it('should hash token and record in revoked tokens', async () => {
      const token = JwtUtil.sign({ sub: 1, email: 'test@example.com' });
      mockRevokedTokenRepo.create.mockResolvedValue(true);

      const result = await authService.logout({ token, userId: 1 });

      expect(result).toBe(true);
      expect(mockRevokedTokenRepo.create).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile if found', async () => {
      mockUserRepo.findById.mockResolvedValue(new User({
        id: 1,
        name: 'Alice',
        email: 'alice@example.com'
      }));

      const profile = await authService.getProfile(1);
      expect(profile.name).toBe('Alice');
      expect(profile.email).toBe('alice@example.com');
    });

    it('should throw not found error if user does not exist', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(authService.getProfile(999)).rejects.toThrow(AppError);
    });
  });
});
