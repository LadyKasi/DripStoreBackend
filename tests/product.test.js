const request = require('supertest');
const app = require('../src/app');
const { sequelize, Category } = require('../src/models');
const jwt = require('jsonwebtoken');

let authToken = '';
let categoryId = null;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  authToken = jwt.sign(
    { id: 1, email: 'admin@teste.com' },
    process.env.JWT_SECRET || 'dripstore_super_secret_jwt_key_2026',
    { expiresIn: '1h' }
  );

  const cat = await Category.create({
    name: 'Sneakers',
    slug: 'sneakers',
    use_in_menu: true
  });
  categoryId = cat.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Módulo de Produtos (/v1/product)', () => {
  let productId = null;

  it('deve cadastrar um produto completo (POST /v1/product)', async () => {
    const response = await request(app)
      .post('/v1/product')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        enabled: true,
        name: 'Tênis Air Drip Retro',
        slug: 'tenis-air-drip-retro',
        stock: 30,
        description: 'Tênis de alta performance e estilo streetwear.',
        price: 349.90,
        price_with_discount: 299.90,
        category_ids: [categoryId],
        images: [
          {
            type: 'image/png',
            content: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
          }
        ],
        options: [
          {
            title: 'Tamanho',
            shape: 'square',
            radius: '4px',
            type: 'text',
            value: ['39', '40', '41']
          }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Tênis Air Drip Retro');
    expect(response.body.slug).toBe('tenis-air-drip-retro');
    expect(response.body.category_ids).toContain(categoryId);
    expect(response.body.images.length).toBeGreaterThan(0);
    expect(response.body.options.length).toBeGreaterThan(0);

    productId = response.body.id;
  });

  it('deve listar produtos com paginação e busca (GET /v1/product/search)', async () => {
    const response = await request(app)
      .get('/v1/product/search?limit=10&page=1&match=Air');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('deve obter produto por ID (GET /v1/product/:id)', async () => {
    const response = await request(app)
      .get(`/v1/product/${productId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(productId);
    expect(response.body.name).toBe('Tênis Air Drip Retro');
  });

  it('deve atualizar produto com sucesso (PUT /v1/product/:id)', async () => {
    const response = await request(app)
      .put(`/v1/product/${productId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Tênis Air Drip Retro 2.0',
        stock: 45
      });

    expect(response.status).toBe(204);

    // Verificar se foi atualizado
    const getResponse = await request(app).get(`/v1/product/${productId}`);
    expect(getResponse.body.name).toBe('Tênis Air Drip Retro 2.0');
    expect(getResponse.body.stock).toBe(45);
  });

  it('deve deletar produto com sucesso (DELETE /v1/product/:id)', async () => {
    const response = await request(app)
      .delete(`/v1/product/${productId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(204);

    const getResponse = await request(app).get(`/v1/product/${productId}`);
    expect(getResponse.status).toBe(404);
  });
});

