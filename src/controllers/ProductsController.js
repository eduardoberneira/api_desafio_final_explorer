const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const {
  CheckCategoryName,
  CheckProductName,
  MakeProductdWithIngredients,
} = require("../utils");

class ProductsController {
  async create(request, response) {
    const { name, description, price, ingredients, category } = request.body;

    //NA MESMA LINHA DO CADSATRO DE USUARIOS, FIZ ESSA VALIDAÇÃO TAMBEM EM PRODUTOS
    //COMO INGREDIENTE É OBRIGATÓRIO TAMBEM FAÇO A VALIDAÇÃO

    //NÃO VALIDEI DESCRIPTION, PORQUE NÃO É OBRIGATÓRIO NO BANCO
    if (!name || !price || !category || !ingredients.length) {
      throw new AppError(
        "Dados inválidos, nome, preço, categoria e ingredients são obrigatórios para o cadastro"
      );
    }

    //TAMBEM CRIEI UMA FUNCAO PARA NAO REPETIR CODIGO
    const checkNameProduct = await CheckProductName(name);

    //REMOVIDO VALIDACAO DE ARRAY
    if (checkNameProduct) {
      //corrigi o texto 'cadastrado'
      throw new AppError("Este prato ja está cadastrado.");
    }

    //AQUI SUBSTITUI PELA FUNÇÃO CRIADA
    const checkNameCategory = await CheckCategoryName(category);
    //NÃO ENTENDI PORQUE USOU LET?
    // VOU COMENTAR ESSA VARIÁVEL AQUI E DECLARAR ELA, DEPOIS DE VERIFICAR SE A CATEGORIA EXISTE
    //let category_id;

    //REFORÇANDO , ESTOU USANDO .first NA FUNÇÃO, PORQUE CATEGORIA É UNICA, POR ISSO REMOVI TUDO RELACIONADO A ARRAY
    //COMO BOA PRÁTICA, SE POSSIVEL EVITAMOS USO DE "ELSE", ENTÃO EU FAÇO  PRIMEIRO A CONDIÇÃO NEGANDO,, PORQUE DAÍ NÃO PRECISA DE ELSE.
    if (!checkNameCategory) {
      //SE A CATEGORIA NÃO EXISTIR NAO DEVERIA CRIAR?
      //DAI FARIA SENTIDO USAR O LET
      throw new AppError("Está categoria não existe");
    }

    //AGORA AQUI EU DECLARO A VARIAVEL, LEMBRANDO QUE NO MESMO PADRAO DE TODO CÓDIGO
    const categoryId = checkNameCategory.id;

    //ALTEREI PARA O NOME PADRAO
    const [productId] = await knex("products").insert({
      name,
      description,
      price,
      category_id: categoryId,
    });

    //EU PESSOALMENTE, FARIA UM CONTROLLER PARA OS INGREDIENTES TAMBÉM

    //PREFIRO USAR ESSA ABORDAGEM, PARA EVITAR ERROS FUTUROS
    //O MAP NÃO SUPORTA ASYNC AWAIT,, MESMO QUE TU COLOQUE , ELE NÃO VAI "ESPERAR/await", E ISSO PODE GERAR ERROS É COMO SE NAO TIVESSE USANDO. POR ISSO EU SUBSTITUI POR UM 'FOR OF'  E PARA ISSO EU CRIO UMA FUNÇÃO

    // //DEIXEI COMENTADO PARA COMPARAÇÃO
    //     const getIdsProductsAndIngredients = ingredients.map(async (ingredient) => {
    //       const checkIngredient = await knex("ingredients").whereRaw(
    //         "LOWER(name) = LOWER(?)",
    //         [ingredient]
    //       );

    //       if (checkIngredient.length > 0) {
    //         ingredient_id = checkIngredient[0].id;
    //       } else {
    //         const [newIngredient_id] = await knex("ingredients").insert({
    //           name: ingredient,
    //         });
    //         ingredient_id = newIngredient_id;
    //       }

    //       return {
    //         product_id,
    //         ingredient_id,
    //       };
    //     });

    //NÃO PRECISO DISSO
    // const insertIdsProductsAndIngredients = await Promise.all(
    //   getIdsProductsAndIngredients
    // );

    //AQUI EU CHAMO A FUNÇÃO QUE EU CRIEI, TROQUEI NOME, MAS TAMBÉM NAO SOU BOM EM NOMES
    const productdWithIngredients = await MakeProductdWithIngredients(
      ingredients,
      productId
    );

    await knex("products_ingredients").insert(productdWithIngredients);

    return response.json();
  }

  async show(request, response) {
    const { id } = request.params;

    const product = await knex("products").where({ id }).first();

    if (!product) {
      throw new AppError("Produto não encontrado");
    }

    //ESSA QUERY PODERIA SER FEITA UMA UNICA VEZ LA NA PRIMEIRA CHAMADA LINHA 134, E FALTOU O JOIN DA CATEGORIA, PARA TRAZER O NOME DELA CERTINHO TAMBÉM.
    //OLHEI NO GPT PQ NAO LEMBRO DE KNEX. DEPOIS TU VAI APRENDER MAIS SOBRE "JOIN", "INNER JOIN" DENTRE OUTROS, NEM ESQUENTA AGORA (TA FUNCIONANDO!)
    const productWithIngredients = await knex("products")
      .select("ingredients.name as ingredient_name")
      .join(
        "products_ingredients",
        "products.id",
        "products_ingredients.product_id"
      )
      .join(
        "ingredients",
        "products_ingredients.ingredient_id",
        "ingredients.id"
      )
      .where({ "products.id": id });

    response.json({
      product,
      ingredients: productWithIngredients,
    });
  }

  //ESSE TU FALOU QUE NAO TINHA ACABADO NE, VOU ESCREVEr UMA FUNCAO COMPLETA LA EM BAIXO -DAI TU COMPARA
  async update(request, response) {
    const { id } = request.params;
    const { name, description, price, ingredients, category } = request.body;

    const category_id = await knex("categories")
      .select("id")
      .whereRaw("LOWER(category) = LOWER(?)", [category]);

    let ingredient_id;

    const checkIngredient = await Promise.all(
      ingredients.map(async (ingredient) => {
        const ingredientExist = await knex("ingredients").whereRaw(
          "LOWER(name) = LOWER(?)",
          [ingredient]
        );
        if (ingredientExist.length > 0) {
          const productContainsIngredient = await knex(
            "products_ingredients"
          ).where({
            product_id: id,
            ingredient_id: ingredientExist[0].id,
          });

          if (productContainsIngredient.length > 0) {
            throw new AppError(
              "Este ingrediente já está cadastrado para este produto"
            );
          }

          await knex("products_ingredients").insert({
            product_id: id,
            ingredient_id: ingredientExist[0].id,
          });
        }
      })
    );

    const newData = await knex("products").where({ id }).update({
      name,
      description,
      price,
      category_id: category_id[0].id,
    });

    response.json();
  }

  async refactorUpdate(request, response) {
    const { id } = request.params;

    const { name, description, price, ingredients, category } = request.body;

    //VALIDAR SE O PRODUTO EXISTE -PEGUEI DO GPT, NAO LEMBRO DE KNEX
    const getProduct = await knex
      .select(
        "products.id as product_id",
        "products.name as product_name",
        "products.description",
        "products.price",
        "products.category_id",
        "products.product_image",
        "categories.category as category_name",
        "ingredients.name as ingredient_name"
      )
      .from("products")
      .where("products.id", id)
      .leftJoin("categories", "products.category_id", "categories.id")
      .leftJoin(
        "products_ingredients",
        "products.id",
        "products_ingredients.product_id"
      )
      .leftJoin(
        "ingredients",
        "products_ingredients.ingredient_id",
        "ingredients.id"
      );

    const product = getProduct.reduce(
      (result, item) => {
        result.id = item.product_id;
        result.name = item.product_name;
        result.description = item.description;
        result.price = item.price;
        result.product_image = item.product_image;
        result.category = item.category_name;
        result.category_id = item.category_id;

        if (item.ingredient_name) {
          result.ingredients.push(item.ingredient_name);
        }

        return result;
      },
      { ingredients: [] }
    );

    if (!product.id) {
      throw new AppError("Produto não encontrado");
    }

    //VALIDAR SE O NOME JÁ EXISTE CASO TENHA SIDO INFORMADO
    //PARA NAO USAR POR EXEMPLO,,O CODIGO COMENTADO A BAIXO,
    //EU GOSTO DE USAR IF TERNARICO, MAS ISSO É PESSOAL
    // if (name) {
    //   const checkNameProduct = await CheckProductName(name);

    //   if (checkNameProduct) {
    //     throw new AppError("Este prato ja está cadastrado.");
    //   }
    // }

    //BASICAMENTE SE TIVER NAME, ELE VAI VERIFCAR SE JA EXISTE, CASO EXISTA ELE TRAS O NOME ENTAO VAI CAIR ALI NO IF DE PRATO JA EXISTE, SE NAO EXISTIR PASSA RETO, ASSIM TAMBEM COMO SE  O NAME NAO FOR INFORMADO NO UPDATE, ELE CAI DIRETO NO NULL, E PASSA RETO

    const checkNameProduct =
      name && name !== product.name ? await CheckProductName(name) : null;

    if (checkNameProduct) {
      throw new AppError("Este prato ja está cadastrado.");
    }

    //VALIDAR SE A CATEGORIA JA EXISTE CASO TENHA SIDO INFORMADA
    async function GetOrCreateCategory(category) {
      const getOrCreate = await CheckCategoryName(category).then(
        async (result) => {
          if (result) {
            return result.id;
          }

          const [categoryId] = await knex("categories").insert({ category });

          return categoryId;
        }
      );

      return getOrCreate;
    }

    const categoryId = category
      ? await GetOrCreateCategory(category)
      : product.category_id;

    if (ingredients && ingredients.length) {
      const newIngredients = ingredients.filter(
        (item) => !product.ingredients.includes(item)
      );

      const productdWithIngredients = await MakeProductdWithIngredients(
        newIngredients,
        product.id
      );

      if (productdWithIngredients.length) {
        await knex("products_ingredients").insert(productdWithIngredients);
      }
    }

    await knex("products")
      .where({ id })
      .update({
        name: name || product.name,
        description: description || product.description,
        price: price || product.price,
        category_id: categoryId || product.category_id,
      });

    response.json();
  }
}

module.exports = ProductsController;
