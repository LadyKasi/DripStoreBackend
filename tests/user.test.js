const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Módulo de Usuários e Autenticação (/v1/user)', () => {
  let authToken = '';
  let userId = null;

  it('deve cadastrar um novo usuário com sucesso (POST /v1/user)', async () => {
    const response = await request(app)
      .post('/v1/user')
      .send({
        firstname: 'Carlos',
        surname: 'Eduardo',
        email: 'carlos@teste.com',
        password: 'senhaSegura123@',
        confirmPassword: 'senhaSegura123@'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.firstname).toBe('Carlos');
    expect(response.body.surname).toBe('Eduardo');
    expect(response.body.email).toBe('carlos@teste.com');
    expect(response.body).not.toHaveProperty('password');

    userId = response.body.id;
  });

  it('deve rejeitar cadastro se confirmação de senha não bater (POST /v1/user)', async () => {
    const response = await request(app)
      .post('/v1/user')
      .send({
        firstname: 'Carlos',
        surname: 'Eduardo',
        email: 'carlos2@teste.com',
        password: 'senha1',
        confirmPassword: 'senhaDiferente'
      });

    expect(response.status).toBe(400);
  });

  it('deve gerar token JWT para usuário válido (POST /v1/user/token)', async () => {
    const response = await request(app)
      .post('/v1/user/token')
      .send({
        email: 'carlos@teste.com',
        password: 'senhaSegura123@'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    authToken = response.body.token;
  });

  it('deve rejeitar geração de token com credenciais inválidas (POST /v1/user/token)', async () => {
    const response = await request(app)
      .post('/v1/user/token')
      .send({
        email: 'carlos@teste.com',
        password: 'senhaErrada'
      });

    expect(response.status).toBe(400);
  });

  it('deve obter usuário pelo ID (GET /v1/user/:id)', async () => {
    const response = await request(app)
      .get(`/v1/user/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(userId);
    expect(response.body.email).toBe('carlos@teste.com');
  });

  it('deve retornar 404 para usuário inexistente (GET /v1/user/:id)', async () => {
    const response = await request(app)
      .get('/v1/user/9999');

    expect(response.status).toBe(404);
  });

  it('deve rejeitar atualização sem token JWT (PUT /v1/user/:id)', async () => {
    const response = await request(app)
      .put(`/v1/user/${userId}`)
      .send({ firstname: 'NovoNome' });

    expect(response.status).toBe(401);
  });

  it('deve atualizar usuário com token JWT (PUT /v1/user/:id)', async () => {
    const response = await request(app)
      .put(`/v1/user/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstname: 'Carlos Atualizado'
      });

    expect(response.status).toBe(204);
  });

  it('deve deletar usuário com token JWT (DELETE /v1/user/:id)', async () => {
    const response = await request(app)
      .delete(`/v1/user/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(204);
  });
});

