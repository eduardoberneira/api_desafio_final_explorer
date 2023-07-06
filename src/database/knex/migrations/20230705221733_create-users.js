exports.up = knex => knex.schema.createTable("users", table => {
  table.increments("id");
  table.text("name");
  table.text("email").unique();
  table.text("password");
  table.boolean("is_admin").default(false);
});

exports.down = knex => knex.schema.dropTable("users");
