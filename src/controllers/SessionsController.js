const knex = require("../database/knex");
const AppError = require("../utils/AppError");

const authConfig = require("../config/auth");
const { compare } = require("bcryptjs");
const { sign } = require("jsonwebtoken");

class SessionsController {
  async create(request, response) {
    const { email, password } = request.body;

    //AQUI COLOQUEI O TRATAMENTO DE ERRO CASO NAO EXISTA EMAIL OU PASSWORD
    if (!email || !password) {
      throw new AppError(
        "Dados inválidos, informe email e password para logar no sistema"
      );
    }

    const user = await knex("users").where({ email }).first();

    if (!user) {
      throw new AppError("Email ou senha incorreta!", 401);
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError("Email ou senha incorreta!", 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({}, secret, {
      subject: String(user.id),
      expiresIn,
    });

    return response.json({ user, token });
  }
}

module.exports = SessionsController;
