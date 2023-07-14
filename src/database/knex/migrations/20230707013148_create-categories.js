exports.up = knex => knex.schema.createTable("categories", table => {
  table.increments("id");
  table.text("category").unique().notNullable();
});

exports.down = knex => knex.schema.dropTable("categories");
