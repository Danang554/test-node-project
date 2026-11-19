class RevokedToken {
  constructor({ id, token_hash, user_id, expires_at, created_at }) {
    this.id = id;
    this.token_hash = token_hash;
    this.user_id = user_id;
    this.expires_at = expires_at;
    this.created_at = created_at;
  }
}

module.exports = RevokedToken;
