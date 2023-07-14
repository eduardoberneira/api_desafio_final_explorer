const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class CategoriesController {
  async create(request, response) {
    const { name } = request.body;
    
    const checkNameCategory = await knex("categories").whereRaw("LOWER(name) = LOWER(?)", [name])

    if(checkNameCategory.length > 0) {
      throw new AppError("Está categoria já existe")
    };

    await knex("categories").insert({name})

    return response.json()
  };
};

module.exports = CategoriesController;