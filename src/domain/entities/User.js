class User {
  constructor({ id, name, email, password, is_admin = false, created_at, updated_at, deleted_at = null }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.is_admin = Boolean(is_admin);
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      is_admin: this.is_admin,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at
    };
  }
}

module.exports = User;
