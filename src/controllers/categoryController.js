const categoryService = require('../services/categoryService');

class CategoryController {
  /**
   * GET /v1/category/search
   */
  async pesquisar(req, res, next) {
    try {
      const resultado = await categoryService.pesquisar(req.query);
      return res.status(200).json(resultado);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /v1/category/:id
   */
  async obterPorId(req, res, next) {
    try {
      const { id } = req.params;
      const categoria = await categoryService.obterPorId(id);

      if (!categoria) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }

      return res.status(200).json(categoria);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /v1/category
   */
  async criar(req, res, next) {
    try {
      const novaCategoria = await categoryService.criar(req.body);
      return res.status(201).json(novaCategoria);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT /v1/category/:id
   */
  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      await categoryService.atualizar(id, req.body);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /v1/category/:id
   */
  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      await categoryService.deletar(id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new CategoryController();

