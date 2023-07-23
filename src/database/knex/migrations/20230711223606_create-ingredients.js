exports.up = (knex) =>
  knex.schema.createTable("ingredients", (table) => {
    table.increments("id");
    table.text("name").unique().notNullable();

    //COMO BOA PRATICA CRIARIA CREATED E UPDATED
    // table.timestamp("created_at").default(knex.fn.now());
    // table.timestamp("updated_at").default(knex.fn.now());
  });

exports.down = (knex) => knex.schema.dropTable("ingredients");
