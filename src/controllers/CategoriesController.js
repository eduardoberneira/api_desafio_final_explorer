const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const { CheckCategoryName } = require("../utils");

class CategoriesController {
  async create(request, response) {
    const { name } = request.body;

    if (!name) {
      throw new AppError("Envie o nome da categoria");
    }

    //ADAPTEI PARA O TEU CONTEXTO , EU NAO FARIA ASSIM, MASSSS
    //COMO TU VAI USAR ESSE "check" la no produto, CRIEI UMA FUNÇÃO, PARA
    //NÃO FICAR REPETINDO O CÓDIGO, E COMO A CATEGORIA É UNICA EU POSSO USAR O .first()
    //E TROQUEI O NOME DA VARIAVEL TBM, QUESTÃO PESSOAL MESMO
    const checkCategoryName = await CheckCategoryName(name);

    //ENTÃO NÃO IRÁ MAIS RETORNAR UM ARRAY, POR ISSO NAO PRECISO DO .lenght > 0
    if (checkCategoryName) {
      throw new AppError("Está categoria já existe");
    }

    //NO NOME DA COLUNA NO BANCO DE DADOS, EU TERIA USADO name AO INVÉS DE category.. MAS ISSO É SO OPINÃO MESMO
    await knex("categories").insert({ category: name });

    //STATUS 201 É O STATUS CORRETO DE CRIAÇÃO
    return response.status(201).json();
  }
}

//CADE O UPDATE?

//CADE O DELETE?

module.exports = CategoriesController;
