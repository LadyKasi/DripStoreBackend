const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');
const jwt = require('jsonwebtoken');

let authToken = '';

beforeAll(async () => {
  await sequelize.sync({ force: true });

  authToken = jwt.sign(
    { id: 1, email: 'admin@teste.com' },
    process.env.JWT_SECRET || 'dripstore_super_secret_jwt_key_2026',
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  await sequelize.close();
});

describe('Módulo de Categorias (/v1/category)', () => {
  let categoryId = null;

  it('deve cadastrar uma categoria com sucesso (POST /v1/category)', async () => {
    const response = await request(app)
      .post('/v1/category')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Tênis e Calçados',
        slug: 'tenis-e-calcados',
        use_in_menu: true
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Tênis e Calçados');
    expect(response.body.slug).toBe('tenis-e-calcados');
    expect(response.body.use_in_menu).toBe(true);

    categoryId = response.body.id;
  });

  it('deve rejeitar criação de categoria sem token (POST /v1/category)', async () => {
    const response = await request(app)
      .post('/v1/category')
      .send({
        name: 'Camisetas',
        slug: 'camisetas'
      });

    expect(response.status).toBe(401);
  });

  it('deve pesquisar categorias com paginação e busca (GET /v1/category/search)', async () => {
    const response = await request(app)
      .get('/v1/category/search?limit=10&page=1&use_in_menu=true');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('limit', 10);
    expect(response.body).toHaveProperty('page', 1);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('deve obter categoria pelo ID (GET /v1/category/:id)', async () => {
    const response = await request(app)
      .get(`/v1/category/${categoryId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(categoryId);
    expect(response.body.slug).toBe('tenis-e-calcados');
  });

  it('deve atualizar categoria com sucesso (PUT /v1/category/:id)', async () => {
    const response = await request(app)
      .put(`/v1/category/${categoryId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Tênis Esportivos'
      });

    expect(response.status).toBe(204);
  });

  it('deve deletar categoria com sucesso (DELETE /v1/category/:id)', async () => {
    const response = await request(app)
      .delete(`/v1/category/${categoryId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(204);
  });
});

