const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class CategoriesController {
  async create(request, response) {
    const { name } = request.body;

    if(!name) {
      throw new AppError("Envie o nome da categoria");
    };
    
    const checkNameCategory = await knex("categories").whereRaw("LOWER(category) = LOWER(?)", [name])

    if(checkNameCategory.length > 0) {
      throw new AppError("Está categoria já existe")
    };

    await knex("categories").insert({category: name})

    return response.json()
  };
};

module.exports = CategoriesController;