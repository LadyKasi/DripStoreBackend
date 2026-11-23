const { Category } = require('../models');

class CategoryService {
  /**
   * Pesquisa categorias com filtros, paginação e projeção de campos
   * @param {object} queryParams 
   * @returns {Promise<object>}
   */
  async pesquisar(queryParams = {}) {
    let { limit = 12, page = 1, fields, use_in_menu } = queryParams;

    limit = parseInt(limit, 10);
    page = parseInt(page, 10);

    if (isNaN(page) || page < 1) {
      page = 1;
    }

    const where = {};
    if (use_in_menu !== undefined) {
      where.use_in_menu = use_in_menu === 'true' || use_in_menu === true || use_in_menu === '1' || use_in_menu === 1;
    }

    let attributes;
    if (fields && typeof fields === 'string') {
      const fieldList = fields.split(',').map(f => f.trim()).filter(Boolean);
      if (fieldList.length > 0) {
        // Garantir inclusão do ID caso não tenha sido especificado
        if (!fieldList.includes('id')) {
          fieldList.unshift('id');
        }
        attributes = fieldList;
      }
    }

    const queryOptions = {
      where,
      ...(attributes && { attributes })
    };

    if (limit === -1) {
      // Retorna todos os registros
      const { count, rows } = await Category.findAndCountAll(queryOptions);
      return {
        data: rows,
        total: count,
        limit: -1,
        page: 1
      };
    }

    if (isNaN(limit) || limit < 1) {
      limit = 12;
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Category.findAndCountAll({
      ...queryOptions,
      limit,
      offset
    });

    return {
      data: rows,
      total: count,
      limit,
      page
    };
  }

  /**
   * Obtém categoria por ID
   * @param {number|string} id 
   * @returns {Promise<object|null>}
   */
  async obterPorId(id) {
    const categoria = await Category.findByPk(id, {
      attributes: ['id', 'name', 'slug', 'use_in_menu']
    });
    return categoria;
  }

  /**
   * Cria uma nova categoria
   * @param {object} dados 
   * @returns {Promise<object>}
   */
  async criar(dados) {
    const { name, slug, use_in_menu } = dados;

    if (!name || !slug) {
      const error = new Error('Nome e slug da categoria são obrigatórios');
      error.statusCode = 400;
      throw error;
    }

    const categoria = await Category.create({
      name,
      slug,
      use_in_menu: use_in_menu !== undefined ? Boolean(use_in_menu) : false
    });

    return {
      id: categoria.id,
      name: categoria.name,
      slug: categoria.slug,
      use_in_menu: categoria.use_in_menu
    };
  }

  /**
   * Atualiza uma categoria existente
   * @param {number|string} id 
   * @param {object} dados 
   * @returns {Promise<void>}
   */
  async atualizar(id, dados) {
    const { name, slug, use_in_menu } = dados;

    if (!name && !slug && use_in_menu === undefined) {
      const error = new Error('Ao menos um campo deve ser fornecido para atualização');
      error.statusCode = 400;
      throw error;
    }

    const categoria = await Category.findByPk(id);
    if (!categoria) {
      const error = new Error('Categoria não encontrada');
      error.statusCode = 404;
      throw error;
    }

    await categoria.update({
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(use_in_menu !== undefined && { use_in_menu: Boolean(use_in_menu) })
    });
  }

  /**
   * Deleta uma categoria pelo ID
   * @param {number|string} id 
   * @returns {Promise<void>}
   */
  async deletar(id) {
    const categoria = await Category.findByPk(id);
    if (!categoria) {
      const error = new Error('Categoria não encontrada');
      error.statusCode = 404;
      throw error;
    }

    await categoria.destroy();
  }
}

module.exports = new CategoryService();

