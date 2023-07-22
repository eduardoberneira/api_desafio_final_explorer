const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class ProductsController {
  async create(request, response) {
    const { name, description, price, ingredients, category} = request.body;
    
    switch (true) {
      case !name:
        throw new AppError('O nome do produto é obrigatório!');
      case !price:
        throw new AppError('O preço do produto é obrigatório!');
      case !category:
        throw new AppError('A categoria do produto é obrigatória!');
    };

    const checkNameProduct = await knex("products").whereRaw("LOWER(name) = LOWER(?)", [name]);

    if(checkNameProduct.length > 0){
      throw new AppError("Este prato ja está cadatrado.");
    };

    const checkCategory = await knex("categories").whereRaw("LOWER(category) = LOWER(?)", [category]);
    
    let category_id

    if(checkCategory.length > 0) {
      category_id = checkCategory[0].id

    } else {
      throw new AppError("Está categoria não existe")
    };

    const [product_id] = await knex("products").insert({
      name,
      description,
      price,
      category_id
    });

    let ingredient_id;

    const getIdsProductsAndIngredients = ingredients.map(async (ingredient) => {
      const checkIngredient = await knex("ingredients").whereRaw("LOWER(name) = LOWER(?)", [ingredient]);
    
      if(checkIngredient.length > 0){
        ingredient_id = checkIngredient[0].id;
      } else {
        const [newIngredient_id] = await knex("ingredients").insert({ name: ingredient });
        ingredient_id = newIngredient_id;
      };

      return {
        product_id,
        ingredient_id
      };
    });


    const insertIdsProductsAndIngredients = await Promise.all(getIdsProductsAndIngredients);

    await knex("products_ingredients").insert(insertIdsProductsAndIngredients);

    return response.json();
  };

  async show(request, response) {
    const {id} = request.params


    const product = await knex("products").where({ id }).first();

    if(!product) {
      throw new AppError("Produto não encontrado");
    }

    const productWithIngredients = await knex("products")
      .select("ingredients.name as ingredient_name")
      .join("products_ingredients", "products.id", "products_ingredients.product_id")
      .join("ingredients", "products_ingredients.ingredient_id", "ingredients.id")
      .where({ "products.id": id }); 

    response.json({
      product,
      ingredients: productWithIngredients
    });
  };

  async update(request, response) {
    const { id } = request.params;
    const { name, description, price, ingredients, category} = request.body;

    const category_id = await knex("categories").select("id").whereRaw("LOWER(category) = LOWER(?)", [category]);

    let ingredient_id;

    
      const checkIngredient = await Promise.all(ingredients.map(async (ingredient) => {
        const ingredientExist = await knex("ingredients").whereRaw("LOWER(name) = LOWER(?)", [ingredient]);
        if (ingredientExist.length > 0) {
          const productContainsIngredient = await knex("products_ingredients").where({
            product_id: id,
            ingredient_id: ingredientExist[0].id
          });
    
          if (productContainsIngredient.length > 0) {
            throw new AppError("Este ingrediente já está cadastrado para este produto");
          }
    
          await knex("products_ingredients").insert({
            product_id: id,
            ingredient_id: ingredientExist[0].id
          });
        }
      }));
    
      

    const newData = await knex("products").where({id}).update({
      name,
      description,
      price,
      category_id: category_id[0].id
    })


    response.json()

    

  };
};

module.exports = ProductsController;
