const knex = require("../database/knex");

async function CheckCategoryName(name) {
  const checkCategoryName = await knex("categories")
    .whereRaw("LOWER(category) = LOWER(?)", [name])
    .first();

  return checkCategoryName;
}

async function CheckProductName(name) {
  const checkProductName = await knex("products")
    .whereRaw("LOWER(name) = LOWER(?)", [name])
    .first();

  return checkProductName;
}

async function MakeProductdWithIngredients(ingredients, productId) {
  const result = [];

  for (const ingredient of ingredients) {
    //TAMBÉM ESTOU USANDO O FIRST, POIS O INGREDIENTE É UNICO,
    const checkIngredient = await knex("ingredients")
      .whereRaw("LOWER(name) = LOWER(?)", [ingredient])
      .first();

    //AQUI FAZ SENTIDO SER LET, APENAS TROQUEI O NOME PARA DEIXAR NO PADRAO
    let ingredientId;

    //COMO É FIRST, EU REMOVI TUDO RELACIONADO AO ARRAY
    if (checkIngredient) {
      ingredientId = checkIngredient.id;
    } else {
      //ALTEREI O NOME DA VARIAVEL PARA DEIXAR NO PADRAO
      const [newIngredientId] = await knex("ingredients").insert({
        name: ingredient,
      });
      ingredientId = newIngredientId;
    }

    result.push({
      product_id: productId,
      ingredient_id: ingredientId,
    });
  }

  return result;
}

module.exports = {
  CheckCategoryName,
  CheckProductName,
  MakeProductdWithIngredients,
};
