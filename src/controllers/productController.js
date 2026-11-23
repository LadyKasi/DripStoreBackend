const productService = require('../services/productService');

class ProductController {
  /**
   * GET /v1/product/search
   */
  async pesquisar(req, res, next) {
    try {
      const resultado = await productService.pesquisar(req.query);
      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /v1/product/:id
   */
  async obterPorId(req, res, next) {
    try {
      const { id } = req.params;
      const produto = await productService.obterPorId(id);

      if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }

      return res.status(200).json(produto);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /v1/product
   */
  async criar(req, res, next) {
    try {
      const novoProduto = await productService.criar(req.body);
      return res.status(201).json(novoProduto);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT /v1/product/:id
   */
  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      await productService.atualizar(id, req.body);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /v1/product/:id
   */
  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      await productService.deletar(id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new ProductController();

