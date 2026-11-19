const RevokedToken = require('../../domain/entities/RevokedToken');

class MySQLRevokedTokenRepository {
  constructor(db) {
    this.db = db;
  }

  async create({ token_hash, user_id, expires_at }) {
    await this.db('revoked_tokens').insert({
      token_hash,
      user_id,
      expires_at
    });
    return true;
  }

  async isRevoked(token_hash) {
    const row = await this.db('revoked_tokens')
      .where({ token_hash })
      .first();
    return Boolean(row);
  }

  async deleteExpired() {
    await this.db('revoked_tokens')
      .where('expires_at', '<', this.db.fn.now())
      .del();
    return true;
  }
}

module.exports = MySQLRevokedTokenRepository;
