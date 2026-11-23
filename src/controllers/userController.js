const userService = require('../services/userService');

class UserController {
  /**
   * GET /v1/user/:id
   */
  async obterPorId(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await userService.obterPorId(id);

      if (!usuario) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      return res.status(200).json(usuario);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /v1/user
   */
  async criar(req, res, next) {
    try {
      const novoUsuario = await userService.criar(req.body);
      return res.status(201).json(novoUsuario);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT /v1/user/:id
   */
  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      await userService.atualizar(id, req.body);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /v1/user/:id
   */
  async deletar(req, res, next) {
    try {
      const { id } = req.params;
      await userService.deletar(id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /v1/user/token
   */
  async gerarToken(req, res, next) {
    try {
      const { email, password } = req.body;
      const token = await userService.gerarToken(email, password);
      return res.status(200).json({ token });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new UserController();

