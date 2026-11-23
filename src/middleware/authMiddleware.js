const jwt = require('jsonwebtoken');

/**
 * Middleware para validação de token JWT em rotas protegidas.
 * Conforme o escopo do projeto:
 * - Se o cabeçalho Authorization não estiver presente ou for mal formatado: 400 ou 401.
 * - Se o token for inválido ou expirado: 401 Unauthorized.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: 'Token de autorização não foi enviado'
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(400).json({
      message: 'Cabeçalho Authorization inválido. Formato esperado: Bearer <token>'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dripstore_super_secret_jwt_key_2026'
    );
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token de autorização inválido ou expirado'
    });
  }
};

module.exports = authMiddleware;

