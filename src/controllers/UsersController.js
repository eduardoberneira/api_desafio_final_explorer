const knex = require("../database/knex");
const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");

class UsersController {
  async create(request, response) {
    //DEVEMOS SEMPRE USAR UM PADRAO NAS VARIAVESS, POR ISSO ALTEREI PARA isAdmi>
    //ISSO NA TEM NADA QUE VER COM BANCO!
    const { name, email, password, isAdmin = false } = request.body;

    //TEM MILHOES DE FORMAS DE FAZER, REMOVI AQUELE SWITCH FEIO POR ISSO. MAS É OPNIAO PESSOAL NESSE CONTEXTO
    if (!name || !email || !password) {
      throw new AppError(
        "Nome, email e password são dados obrigatórios para o cadastro"
      );
    }

    try {
      const passwordHash = await hash(password, 8);

      const checkUser = await knex("users").where({ email }).first();

      if (checkUser) {
        //TINHA TE PASSADO O CODIGO ERRADO,, O CERTO É 409
        throw new AppError("Este email já está cadastrado", 409);
      }

      //PERCEBE QUE AQUI SEGUE NORMAL O NOME DA COLUNA NO BANCO,, E ENTAO EU EN>
      await knex("users").insert({
        name,
        email,
        password: passwordHash,
        is_admin: isAdmin,
      });
    } catch (error) {
      throw new AppError(error.message, error.statusCode);
    }

    return response.status(201).json();
  }

  async update(request, response) {
    const { name, email, password, oldPassword, isAdmin } = request.body;

    //AQUI POSSO DESESTRUTURAR DIRETO, NAO PRECISO DA VARIAVEL user_id
    const { id } = request.user;

    //AGORA POSSO USER DIRETO id SEM PRECISAR PASSAR AQUELA VARIAVEL user_id
    const user = await knex("users").where({ id }).first();

    if (!user) {
      throw new AppError("Usuário não encontrado!");
    }

    //ESTOU USANDO IF TERNÁRIO: "SE FOR ENVIANDO ALGUM EMAIL ? PROCURE NOS EMAI>
    //PRECISA VALIDAR ,PORQUE SE NAO FOR ENVIADO UM EMAIL NO UPDATE,
    //ELE VAI ENTRAR NA QUERY 'await knex("users").where({ email }).first()' E >
    const checkUserEmailUpdated = email
      ? await knex("users").where({ email }).first()
      : null;

    if (checkUserEmailUpdated && checkUserEmailUpdated.id !== user.id) {
      throw new AppError("Este email já está em uso.");
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.is_admin = isAdmin || user.is_admin;

    //PRECISO VALIDAR CASO SEJA ENVIANDO O PASSWORD MAS NÃO A SENHA ANTIGA
    if (password && !oldPassword) {
      throw new AppError("A senha antiga deve ser informada.");
    }

    //COMO JÁ VALIDEI EM CIMA NAO PRECISO USAR AQUI O oldPassword
    if (password) {
      //AQUI PRECISA USAR await ANTES DO compare, POIS É UMA FUNÇÃO ASSINCRONA, OU SEJA, SEM await, NUNCA VAI FAZER A COMPARAÇÃO
      const checkOldPassword = await compare(oldPassword, user.password);

      if (!checkOldPassword) {
        throw new AppError("A senha antiga não confere.");
      }

      user.password = await hash(password, 8);
    }

    //DE NOVO POSSO USAR DIRETO O id
    await knex("users").where({ id }).update({
      name: user.name,
      email: user.email,
      password: user.password,
      is_admin: isAdmin,
    });

    return response.json();
  }

  async delete(request, response) {
    //COMO  DEVERIA SER UMA ROTA AUTENTICADA, E DAI NAO PRECISA PASSAR O id POR PARAMETRO
    //PEGA O id DO PRÓPRIO TOKEN QUE NEM NO UPDATE, E COMO BOA PRÁTICA
    //DEVE VALIDAR SE O id AINDA EXISTE
    //LEMBRAR DE TIRAR O PARAMETRO  DA ROTA
    const { id } = request.user;

    const user = await knex("users").where({ id }).first();

    if (!user) {
      throw new AppError("Usuário não encontrado!");
    }

    await knex("users").where({ id }).delete();

    return response.json();
  }
}

module.exports = UsersController;
