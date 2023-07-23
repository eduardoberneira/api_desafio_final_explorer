const { Router } = require("express");

const ProductsController = require("../controllers/ProductsController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const productsRoutes = Router();
const productsController = new ProductsController();

productsRoutes.use(ensureAuthenticated);

productsRoutes.post("/", productsController.create);
productsRoutes.get("/:id", productsController.show);
productsRoutes.put("/:id", productsController.refactorUpdate);

module.exports = productsRoutes;
