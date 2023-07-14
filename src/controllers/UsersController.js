const knex = require("../database/knex")
const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

class UsersController {
  async create(request, response){
    const { name, email, password, is_admin = false } = request.body;

    switch (true) {
      case !name:
        throw new AppError('O nome é obrigatório!');
      case !email:
        throw new AppError('O email é obrigatório!');
      case !password:
        throw new AppError('A senha é obrigatória!');
    };
    
    try {
      const passwordHash = await hash(password, 8);
      
      const checkUser = await knex("users").where({email}).first()
     
      if(checkUser) {
        throw new AppError("Este email já está cadastrado", 429);
      };

      await knex("users").insert({
        name,
        email,
        password: passwordHash,
        is_admin
      });

    } catch (error) {
      throw new AppError(error.message, error.statusCode)     
    };

    return response.status(201).json(); 

  };

  async update(request, response){
    const { name, email, password, old_password, is_admin} = request.body;
    const user_id = request.user.id;

    const user = await knex("users").where({ id: user_id }).first();

    if(!user) {
      throw new AppError("Usuário não encontrado!");
    }

    const checkUserEmailUpdated = await knex("users").where({email}).first();
    
    if(checkUserEmailUpdated && checkUserEmailUpdated.id !== user.id){
      throw new AppError("Este email já está em uso.");
    };

    user.name = name || user.name;
    user.email = email || user.email;

    if(password && old_password) {
      const checkOldPassword = compare(old_password, user.password);

      if(!checkOldPassword){
        throw new AppError("A senha antiga não confere.");
      };

      user.password = await hash(password, 8);
    };

    await knex("users").where({id: user_id}).first().update({ name: user.name, email: user.email, password: user.password, is_admin })

    return response.json()
  };

  async delete(request, response) {
    const { id } = request.params;

    await knex("users").where({id}).delete();

    return response.json();
  }
};

module.exports = UsersController;