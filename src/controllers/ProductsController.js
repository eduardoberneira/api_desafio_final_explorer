const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class ProductsController {
  async Create(request, response) {
    let { name, description, price, ingredients, category} = request.body;
    
    switch (true) {
      case !name:
        throw new AppError('O nome do produto é obrigatório!');
      case !price:
        throw new AppError('O preço do produto é obrigatório!');
      case !category:
        throw new AppError('A categoria do produto é obrigatória!');
    };

    const checkNameProduct = knex("products").whereRaw("LOWER(name) = LOWER(?)", [name]).first();

    if(checkNameProduct){
      throw new AppError("Este prato ja esta cadatrado")
    }

    const checkCategory = await knex("categories").where({ category: category }).first();

    let category_id

    if(checkCategory) {
      category_id = checkCategory.id

    } else {
        const [newCategory_id] = await knex("categories").insert({category})
        category_id = newCategory_id;
    };

    const [product_id] = await knex("products").insert({
      name,
      description,
      price,
      category_id
    });

    let ingredient_id

    const catchProduct_idAndIngredient_id = ingredients.map(async (ingredient) => {
      const checkIngredient = await knex("ingredients").where({name: ingredient}).first();
      console.log(checkIngredient)
      
      if(checkIngredient){
        ingredient_id = checkIngredient.id
      }else {

        const [newIngredient_id] = await knex("ingredients").insert({ name: ingredient });
        ingredient_id = newIngredient_id
      }

      return {
        product_id,
        ingredient_id
      }
    });


    const insertProduct_idAndIngredient_id = await Promise.all(catchProduct_idAndIngredient_id);

    await knex("products_ingredients").insert(insertProduct_idAndIngredient_id);

    return response.json();
  }
}

module.exports = ProductsController;
