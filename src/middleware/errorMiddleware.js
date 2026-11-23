/**
 * Middleware centralizado de tratamento de erros
 */
const errorMiddleware = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Erro na aplicação]:', err);
  }

  // Erros de validação do Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'Erro de validação nos dados fornecidos',
      errors: err.errors ? err.errors.map(e => e.message) : [err.message]
    });
  }

  // Erros de sintaxe JSON no body da requisição
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      message: 'JSON malformado no corpo da requisição'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno no servidor';

  return res.status(statusCode).json({
    message
  });
};

module.exports = errorMiddleware;
