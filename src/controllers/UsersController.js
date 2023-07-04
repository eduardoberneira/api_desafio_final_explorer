const AppError = require("../utils/AppError");

class UsersController {
  create(request, response){
    const { name } = request.body;

    if(!name){
      throw new AppError("O nome é obrigatório!");
    };

    response.json({name});
  };
};

module.exports = UsersController;