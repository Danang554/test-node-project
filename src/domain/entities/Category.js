class Category {
  constructor({ id, user_id, name, description = null, created_at, updated_at, deleted_at = null }) {
    this.id = id;
    this.user_id = user_id;
    this.name = name;
    this.description = description;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      name: this.name,
      description: this.description,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at
    };
  }
}

module.exports = Category;
