const { Router } = require("express");

const UsersController = require("../controllers/UsersController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const usersRoutes = Router();

const usersController = new UsersController();

usersRoutes.post("/", usersController.create);

//ASSIM TODAS ROTAS ABAIXO DO MIDDLEWARE EXIGEM AUTENTICAÇÃO
usersRoutes.use(ensureAuthenticated);

usersRoutes.put("/", usersController.update);
usersRoutes.delete("/", usersController.delete);

module.exports = usersRoutes;
