exports.up = knex => knex.schema.createTable("products", table => {
  table.increments("id");
  table.text("name");
  table.text("description");
  table.decimal("price", 10, 2);
  table.text("product_image");
  table.integer("category_id").references("id").inTable("categories");

  table.timestamp("created_at").default(knex.fn.now());
  table.timestamp("updated_at").default(knex.fn.now());
});

exports.down = knex => knex.schema.dropTable("products");
