exports.up = (knex) =>
  knex.schema.createTable("products_ingredients", (table) => {
    table.increments("id");
    table.integer("product_id").references("id").inTable("products");
    table.integer("ingredient_id").references("id").inTable("ingredients");

    //COMO BOA PRATICA CRIARIA CREATED E UPDATED
    // table.timestamp("created_at").default(knex.fn.now());
    // table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("products_ingredients");
