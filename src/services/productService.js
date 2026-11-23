const { Op } = require('sequelize');
const { Product, ProductImage, ProductOption, Category, ProductCategory } = require('../models');
const { salvarImagemBase64 } = require('../utils/imageHandler');

class ProductService {
  /**
   * Formata a entidade de produto para a estrutura de resposta esperada pelo contrato
   * @param {object} produto 
   * @param {string[]} camposDesejados 
   * @returns {object}
   */
  formatarProduto(produto, camposDesejados = null) {
    const raw = produto.toJSON ? produto.toJSON() : produto;

    const categoryIds = raw.categories ? raw.categories.map(c => c.id) : [];

    const images = raw.images
      ? raw.images.map(img => ({
          id: img.id,
          content: img.path
        }))
      : [];

    const options = raw.options
      ? raw.options.map(opt => ({
          id: opt.id,
          title: opt.title,
          shape: opt.shape,
          radius: typeof opt.radius === 'number' ? `${opt.radius}px` : opt.radius,
          type: opt.type,
          values: opt.values ? opt.values.split(',').map(v => v.trim()) : []
        }))
      : [];

    const produtoFormatado = {
      id: raw.id,
      enabled: Boolean(raw.enabled),
      name: raw.name,
      slug: raw.slug,
      stock: raw.stock,
      description: raw.description,
      price: raw.price,
      price_with_discount: raw.price_with_discount,
      category_ids: categoryIds,
      images,
      options
    };

    if (camposDesejados && camposDesejados.length > 0) {
      const filtrado = { id: produtoFormatado.id };
      camposDesejados.forEach(campo => {
        if (produtoFormatado[campo] !== undefined) {
          filtrado[campo] = produtoFormatado[campo];
        }
      });
      return filtrado;
    }

    return produtoFormatado;
  }

  /**
   * Pesquisa produtos com filtros avançados, busca textual e paginação
   * @param {object} queryParams 
   * @returns {Promise<object>}
   */
  async pesquisar(queryParams = {}) {
    let {
      limit = 12,
      page = 1,
      fields,
      match,
      category_ids,
      'price-range': priceRange
    } = queryParams;

    limit = parseInt(limit, 10);
    page = parseInt(page, 10);

    if (isNaN(page) || page < 1) {
      page = 1;
    }

    const where = {};

    // Filtro por match (nome ou descrição)
    if (match) {
      where[Op.or] = [
        { name: { [Op.like]: `%${match}%` } },
        { description: { [Op.like]: `%${match}%` } }
      ];
    }

    // Filtro por faixa de preço
    if (priceRange) {
      const [precoMin, precoMax] = priceRange.split('-').map(p => parseFloat(p));
      if (!isNaN(precoMin) && !isNaN(precoMax)) {
        where.price = { [Op.between]: [precoMin, precoMax] };
      } else if (!isNaN(precoMin)) {
        where.price = { [Op.gte]: precoMin };
      }
    }

    const include = [
      {
        model: ProductImage,
        as: 'images',
        required: false
      },
      {
        model: ProductOption,
        as: 'options',
        required: false
      },
      {
        model: Category,
        as: 'categories',
        through: { attributes: [] },
        required: false
      }
    ];

    // Filtro por categorias específicas
    if (category_ids) {
      const ids = category_ids.split(',').map(id => parseInt(id.trim(), 10)).filter(Boolean);
      if (ids.length > 0) {
        include[2].where = { id: { [Op.in]: ids } };
        include[2].required = true;
      }
    }

    // Filtro por opções dinâmicas: option[id]=val1,val2
    const optionKeys = Object.keys(queryParams).filter(k => /^option\[\d+\]$/.test(k));
    if (optionKeys.length > 0) {
      for (const optKey of optionKeys) {
        const optionId = optKey.match(/\d+/)[0];
        const valores = queryParams[optKey].split(',').map(v => v.trim());
        include[1].where = {
          id: optionId,
          [Op.or]: valores.map(val => ({
            values: { [Op.like]: `%${val}%` }
          }))
        };
        include[1].required = true;
      }
    }

    let camposDesejados = null;
    if (fields && typeof fields === 'string') {
      camposDesejados = fields.split(',').map(f => f.trim()).filter(Boolean);
    }

    const queryOptions = {
      where,
      include,
      distinct: true
    };

    if (limit === -1) {
      const { count, rows } = await Product.findAndCountAll(queryOptions);
      return {
        data: rows.map(prod => this.formatarProduto(prod, camposDesejados)),
        total: count,
        limit: -1,
        page: 1
      };
    }

    if (isNaN(limit) || limit < 1) {
      limit = 12;
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await Product.findAndCountAll({
      ...queryOptions,
      limit,
      offset
    });

    return {
      data: rows.map(prod => this.formatarProduto(prod, camposDesejados)),
      total: count,
      limit,
      page
    };
  }

  /**
   * Obtém detalhes de um produto por ID
   * @param {number|string} id 
   * @returns {Promise<object|null>}
   */
  async obterPorId(id) {
    const produto = await Product.findByPk(id, {
      include: [
        { model: ProductImage, as: 'images' },
        { model: ProductOption, as: 'options' },
        { model: Category, as: 'categories', through: { attributes: [] } }
      ]
    });

    if (!produto) return null;
    return this.formatarProduto(produto);
  }

  /**
   * Cria um novo produto com imagens, opções e categorias associadas
   * @param {object} dados 
   * @returns {Promise<object>}
   */
  async criar(dados) {
    const {
      enabled = false,
      name,
      slug,
      stock = 0,
      description,
      price,
      price_with_discount,
      category_ids = [],
      images = [],
      options = []
    } = dados;

    if (!name || !slug || price === undefined || price_with_discount === undefined) {
      const error = new Error('Campos obrigatórios do produto não informados');
      error.statusCode = 400;
      throw error;
    }

    const novoProduto = await Product.create({
      enabled: Boolean(enabled),
      name,
      slug,
      stock: parseInt(stock, 10) || 0,
      description,
      price: parseFloat(price),
      price_with_discount: parseFloat(price_with_discount)
    });

    // Associar categorias
    if (Array.isArray(category_ids) && category_ids.length > 0) {
      await novoProduto.setCategories(category_ids);
    }

    // Salvar imagens
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        const caminhoSalvo = salvarImagemBase64(img.content, img.type);
        await ProductImage.create({
          product_id: novoProduto.id,
          enabled: img.enabled !== undefined ? Boolean(img.enabled) : true,
          path: caminhoSalvo
        });
      }
    }

    // Salvar opções
    if (Array.isArray(options) && options.length > 0) {
      for (const opt of options) {
        const raioNumerico = opt.radius ? parseInt(opt.radius, 10) || 0 : 0;
        const valoresArray = opt.value || opt.values || [];
        const valoresString = Array.isArray(valoresArray) ? valoresArray.join(',') : String(valoresArray);

        await ProductOption.create({
          product_id: novoProduto.id,
          title: opt.title || '',
          shape: opt.shape || 'square',
          radius: raioNumerico,
          type: opt.type || 'text',
          values: valoresString
        });
      }
    }

    return await this.obterPorId(novoProduto.id);
  }

  /**
   * Atualiza um produto existente e sincroniza imagens e opções
   * @param {number|string} id 
   * @param {object} dados 
   * @returns {Promise<void>}
   */
  async atualizar(id, dados) {
    const produto = await Product.findByPk(id);
    if (!produto) {
      const error = new Error('Produto não encontrado');
      error.statusCode = 404;
      throw error;
    }

    const {
      enabled,
      name,
      slug,
      stock,
      description,
      price,
      price_with_discount,
      category_ids,
      images,
      options
    } = dados;

    // Atualizar dados básicos
    await produto.update({
      ...(enabled !== undefined && { enabled: Boolean(enabled) }),
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(stock !== undefined && { stock: parseInt(stock, 10) }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(price_with_discount !== undefined && { price_with_discount: parseFloat(price_with_discount) })
    });

    // Atualizar categorias se fornecidas
    if (Array.isArray(category_ids)) {
      await produto.setCategories(category_ids);
    }

    // Atualizar/remover imagens
    if (Array.isArray(images)) {
      for (const img of images) {
        if (img.id && img.deleted) {
          await ProductImage.destroy({
            where: { id: img.id, product_id: produto.id }
          });
        } else if (img.id) {
          const caminhoSalvo = img.content ? salvarImagemBase64(img.content, img.type) : undefined;
          await ProductImage.update(
            {
              ...(caminhoSalvo && { path: caminhoSalvo }),
              ...(img.enabled !== undefined && { enabled: Boolean(img.enabled) })
            },
            { where: { id: img.id, product_id: produto.id } }
          );
        } else {
          // Nova imagem
          const caminhoSalvo = salvarImagemBase64(img.content, img.type);
          await ProductImage.create({
            product_id: produto.id,
            enabled: img.enabled !== undefined ? Boolean(img.enabled) : true,
            path: caminhoSalvo
          });
        }
      }
    }

    // Atualizar/remover opções
    if (Array.isArray(options)) {
      for (const opt of options) {
        if (opt.id && opt.deleted) {
          await ProductOption.destroy({
            where: { id: opt.id, product_id: produto.id }
          });
        } else if (opt.id) {
          const updateData = {};
          if (opt.title) updateData.title = opt.title;
          if (opt.shape) updateData.shape = opt.shape;
          if (opt.radius !== undefined) updateData.radius = parseInt(opt.radius, 10) || 0;
          if (opt.type) updateData.type = opt.type;

          const valores = opt.value || opt.values;
          if (valores !== undefined) {
            updateData.values = Array.isArray(valores) ? valores.join(',') : String(valores);
          }

          await ProductOption.update(updateData, {
            where: { id: opt.id, product_id: produto.id }
          });
        } else {
          // Nova opção
          const raioNumerico = opt.radius ? parseInt(opt.radius, 10) || 0 : 0;
          const valoresArray = opt.value || opt.values || [];
          const valoresString = Array.isArray(valoresArray) ? valoresArray.join(',') : String(valoresArray);

          await ProductOption.create({
            product_id: produto.id,
            title: opt.title || '',
            shape: opt.shape || 'square',
            radius: raioNumerico,
            type: opt.type || 'text',
            values: valoresString
          });
        }
      }
    }
  }

  /**
   * Deleta um produto por ID
   * @param {number|string} id 
   * @returns {Promise<void>}
   */
  async deletar(id) {
    const produto = await Product.findByPk(id);
    if (!produto) {
      const error = new Error('Produto não encontrado');
      error.statusCode = 404;
      throw error;
    }

    await produto.destroy();
  }
}

module.exports = new ProductService();

