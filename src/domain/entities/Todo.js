class Todo {
  constructor({ id, user_id, category_id = null, title, description = null, is_completed = false, created_at, updated_at, deleted_at = null, category_name = null }) {
    this.id = id;
    this.user_id = user_id;
    this.category_id = category_id;
    this.title = title;
    this.description = description;
    this.is_completed = Boolean(is_completed);
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.deleted_at = deleted_at;
    if (category_name !== undefined) {
      this.category_name = category_name;
    }
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      category_id: this.category_id,
      category_name: this.category_name,
      title: this.title,
      description: this.description,
      is_completed: this.is_completed,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at
    };
  }
}

module.exports = Todo;
