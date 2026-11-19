/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('revoked_tokens', (table) => {
    table.bigIncrements('id').unsigned().primary();
    table.string('token_hash', 64).notNullable().unique().index();
    table.bigInteger('user_id').unsigned().notNullable();
    table.timestamp('expires_at').notNullable().index();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('revoked_tokens');
};
