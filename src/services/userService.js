const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class UserService {
  /**
   * Busca um usuário pelo ID
   * @param {number|string} id 
   * @returns {Promise<object|null>}
   */
  async obterPorId(id) {
    const usuario = await User.findByPk(id, {
      attributes: ['id', 'firstname', 'surname', 'email']
    });
    return usuario;
  }

  /**
   * Cadastra um novo usuário
   * @param {object} dados 
   * @returns {Promise<object>}
   */
  async criar(dados) {
    const { firstname, surname, email, password, confirmPassword } = dados;

    if (!firstname || !surname || !email || !password || !confirmPassword) {
      const error = new Error('Todos os campos obrigatórios devem ser preenchidos');
      error.statusCode = 400;
      throw error;
    }

    if (password !== confirmPassword) {
      const error = new Error('A confirmação de senha não confere com a senha');
      error.statusCode = 400;
      throw error;
    }

    // Verificar se o e-mail já está cadastrado
    const emailExistente = await User.findOne({ where: { email } });
    if (emailExistente) {
      const error = new Error('O e-mail informado já está em uso');
      error.statusCode = 400;
      throw error;
    }

    // Gerar hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const novoUsuario = await User.create({
      firstname,
      surname,
      email,
      password: passwordHash
    });

    return {
      id: novoUsuario.id,
      firstname: novoUsuario.firstname,
      surname: novoUsuario.surname,
      email: novoUsuario.email
    };
  }

  /**
   * Atualiza as informações de um usuário
   * @param {number|string} id 
   * @param {object} dados 
   * @returns {Promise<void>}
   */
  async atualizar(id, dados) {
    const { firstname, surname, email } = dados;

    if (!firstname && !surname && !email) {
      const error = new Error('Ao menos um campo deve ser fornecido para atualização');
      error.statusCode = 400;
      throw error;
    }

    const usuario = await User.findByPk(id);
    if (!usuario) {
      const error = new Error('Usuário não encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Se estiver atualizando o e-mail, verificar se outro usuário já usa
    if (email && email !== usuario.email) {
      const emailEmUso = await User.findOne({ where: { email } });
      if (emailEmUso) {
        const error = new Error('O e-mail informado já está em uso por outro usuário');
        error.statusCode = 400;
        throw error;
      }
    }

    await usuario.update({
      ...(firstname !== undefined && { firstname }),
      ...(surname !== undefined && { surname }),
      ...(email !== undefined && { email })
    });
  }

  /**
   * Deleta um usuário pelo ID
   * @param {number|string} id 
   * @returns {Promise<void>}
   */
  async deletar(id) {
    const usuario = await User.findByPk(id);
    if (!usuario) {
      const error = new Error('Usuário não encontrado');
      error.statusCode = 404;
      throw error;
    }

    await usuario.destroy();
  }

  /**
   * Realiza login e gera token JWT
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<string>}
   */
  async gerarToken(email, password) {
    if (!email || !password) {
      const error = new Error('E-mail e senha são obrigatórios');
      error.statusCode = 400;
      throw error;
    }

    const usuario = await User.findOne({ where: { email } });
    if (!usuario) {
      const error = new Error('Credenciais inválidas');
      error.statusCode = 400;
      throw error;
    }

    const senhaValida = await bcrypt.compare(password, usuario.password);
    if (!senhaValida) {
      const error = new Error('Credenciais inválidas');
      error.statusCode = 400;
      throw error;
    }

    const payload = {
      id: usuario.id,
      email: usuario.email,
      firstname: usuario.firstname,
      surname: usuario.surname
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'dripstore_super_secret_jwt_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return token;
  }
}

module.exports = new UserService();

