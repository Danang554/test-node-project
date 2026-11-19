const AppError = require('../../interfaces/http/utils/AppError');
const HashUtil = require('../../infrastructure/security/hash');
const JwtUtil = require('../../infrastructure/security/jwt');

class AuthService {
  constructor(userRepository, revokedTokenRepository) {
    this.userRepository = userRepository;
    this.revokedTokenRepository = revokedTokenRepository;
  }

  async register({ name, email, password }) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw AppError.conflict('Email is already registered');
    }

    const hashedPassword = await HashUtil.hashPassword(password);
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      is_admin: false
    });

    return user.toJSON();
  }

  async login({ email, password }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isMatch = await HashUtil.comparePassword(password, user.password);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const token = JwtUtil.sign({
      sub: user.id,
      email: user.email,
      is_admin: user.is_admin
    });

    return {
      token,
      user: user.toJSON()
    };
  }

  async logout({ token, userId }) {
    if (!this.revokedTokenRepository) {
      return true;
    }

    const decoded = JwtUtil.decode(token);
    const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const tokenHash = HashUtil.hashToken(token);

    await this.revokedTokenRepository.create({
      token_hash: tokenHash,
      user_id: userId,
      expires_at: expiresAt
    });

    return true;
  }

  async getProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user.toJSON();
  }

  async updateProfile(userId, { name, email, password }) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const updateData = {};
    if (name) updateData.name = name;

    if (email && email !== user.email) {
      const existing = await this.userRepository.findByEmail(email);
      if (existing && existing.id !== user.id) {
        throw AppError.conflict('Email is already used by another account');
      }
      updateData.email = email;
    }

    if (password) {
      updateData.password = await HashUtil.hashPassword(password);
    }

    if (Object.keys(updateData).length === 0) {
      return user.toJSON();
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    return updatedUser.toJSON();
  }
}

module.exports = AuthService;
