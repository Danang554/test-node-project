const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  const defaultPassword = 'password';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const users = [
    {
      name: 'Administrator',
      email: 'admin@example.com',
      password: hashedPassword,
      is_admin: true
    },
    {
      name: 'Test User',
      email: 'user@example.com',
      password: hashedPassword,
      is_admin: false
    },
    {
      name: 'Nao',
      email: 'nao@example.com',
      password: hashedPassword,
      is_admin: false
    },
    {
      name: 'Shin',
      email: 'shin@example.com',
      password: hashedPassword,
      is_admin: true
    }
  ];

  for (const user of users) {
    const existing = await knex('users').where({ email: user.email }).first();
    if (!existing) {
      await knex('users').insert(user);
    }
  }
};
