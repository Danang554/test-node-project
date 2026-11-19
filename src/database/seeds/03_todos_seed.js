/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const users = await knex('users').select('id', 'email');
  const userMap = {};
  users.forEach((u) => {
    userMap[u.email] = u.id;
  });

  const categories = await knex('categories').select('id', 'user_id', 'name');

  for (const user of users) {
    const userCategories = categories.filter((c) => c.user_id === user.id);
    const categoryId = userCategories.length > 0 ? userCategories[0].id : null;

    const sampleTodos = [
      {
        user_id: user.id,
        category_id: categoryId,
        title: `Setup environment for ${user.email}`,
        description: 'Verify Node.js, MySQL, and migrations work as expected',
        is_completed: true
      },
      {
        user_id: user.id,
        category_id: categoryId,
        title: `Review Clean Architecture structure`,
        description: 'Check domain entities, services, repositories, and controllers',
        is_completed: false
      }
    ];

    for (const todo of sampleTodos) {
      const existing = await knex('todos')
        .where({ user_id: todo.user_id, title: todo.title })
        .first();

      if (!existing) {
        await knex('todos').insert(todo);
      }
    }
  }
};
