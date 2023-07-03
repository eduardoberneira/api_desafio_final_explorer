class UsersController {
  create(request, response){
    const { name } = request.body

    response.json({name})
  };
};

module.exports = UsersController;